// Payments: the server prices every checkout from the database and books
// only after Stripe confirms the payment through a signed webhook.
//
// 1. POST /student/create-checkout-session takes { tutorId, slotId } or
//    { classId }. The price comes from the stored slot or class, never from
//    the request body, and the slot stays open while the student pays.
// 2. POST /stripe/webhook verifies the Stripe-Signature header, then on
//    checkout.session.completed creates the class, links it to both users
//    and removes the slot. The Checkout Session id is a unique key on Class,
//    so a replayed or duplicated event cannot book twice.
// 3. If two students pay for the same slot, the second payment finds the
//    slot gone and is refunded instead of double-booking the tutor.
const crypto = require("crypto");
const mongoose = require("mongoose");
const Class = require("../models/Class");
const Student = require("../models/Student");
const Tutor = require("../models/Tutor");
const logger = require("../utils/logger");
const { getStripe, constructWebhookEvent } = require("../utils/stripe");

const isId = (value) =>
   typeof value === "string" && mongoose.isValidObjectId(value);

// Stripe Checkout Sessions must stay open for at least 30 minutes.
const CHECKOUT_TTL_SECONDS = 30 * 60;

// Resolve what the student is buying and its server-side price.
const resolvePurchase = async (body, student) => {
   const { tutorId, slotId, classId } = body ?? {};

   if (classId !== undefined) {
      if (!isId(classId)) return { status: 400, error: "Invalid classId" };
      const class_ = await Class.findById(classId);
      if (!class_ || class_.isCancelled)
         return { status: 404, error: "Class not found" };
      if (student.classes.some((id) => id.equals(class_._id)))
         return { status: 409, error: "Class already booked" };
      const tutor = await Tutor.findById(class_.tutor);
      return {
         price: class_.price,
         name: `${class_.language} class${tutor ? ` with ${tutor.name}` : ""}`,
         metadata: { kind: "class", classId: String(class_._id) },
      };
   }

   if (!isId(tutorId) || !isId(slotId))
      return { status: 400, error: "tutorId and slotId required" };
   const tutor = await Tutor.findById(tutorId);
   const slot = tutor?.slotsAvailability.id(slotId);
   if (!slot) return { status: 404, error: "Slot not available" };
   return {
      price: slot.price,
      name: `${slot.language} lesson with ${tutor.name} (${slot.duration} min)`,
      metadata: {
         kind: "slot",
         tutorId: String(tutor._id),
         slotId: String(slot._id),
      },
   };
};

exports.createCheckoutSession = async (req, res) => {
   try {
      const stripe = getStripe();
      if (!stripe)
         return res
            .status(503)
            .json({ errors: ["Payments are not configured on this server"] });

      const purchase = await resolvePurchase(req.body, req.user);
      if (purchase.error)
         return res.status(purchase.status).json({ errors: [purchase.error] });
      if (!(purchase.price > 0))
         return res.status(400).json({ errors: ["This slot has no price"] });

      const session = await stripe.checkout.sessions.create({
         mode: "payment",
         line_items: [
            {
               price_data: {
                  currency: "inr",
                  product_data: { name: purchase.name },
                  unit_amount: Math.round(purchase.price * 100),
               },
               quantity: 1,
            },
         ],
         customer_email: req.user.email,
         client_reference_id: String(req.user._id),
         metadata: { ...purchase.metadata, studentId: String(req.user._id) },
         expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_TTL_SECONDS,
         success_url: `${process.env.CLIENT_URL}/profile?checkout=success`,
         cancel_url: `${process.env.CLIENT_URL}/payment-failed`,
      });
      res.json({ id: session.id, url: session.url });
   } catch (error) {
      logger.error(error);
      res.status(500).json({ errors: ["Internal server error"] });
   }
};

const refund = async (session, reason) => {
   logger.warn(`Refunding checkout ${session.id}: ${reason}`);
   const stripe = getStripe();
   if (stripe && session.payment_intent)
      await stripe.refunds.create(
         { payment_intent: session.payment_intent },
         { idempotencyKey: `refund-${session.id}` },
      );
   return "refunded";
};

// Book a paid slot. Returns "booked", "duplicate" or "refunded".
const fulfillSlot = async (session) => {
   const { studentId, tutorId, slotId } = session.metadata;
   const link = async (classId) => {
      await Student.updateOne(
         { _id: studentId },
         { $addToSet: { classes: classId } },
      );
      await Tutor.updateOne(
         { _id: tutorId },
         { $addToSet: { classes: classId } },
      );
   };

   const already = await Class.findOne({ stripeSessionId: session.id });
   if (already) {
      await link(already._id);
      return "duplicate";
   }

   const tutor = await Tutor.findById(tutorId);
   const slot = tutor?.slotsAvailability.id(slotId);
   if (!slot) return refund(session, "slot no longer available");

   // The unique stripeSessionId claims this payment, so a concurrent
   // delivery of the same event fails here instead of booking twice.
   let class_;
   try {
      class_ = await Class.create({
         language: slot.language,
         tutor: tutorId,
         startTime: slot.startTime ?? slot.date,
         duration: slot.duration,
         price: slot.price,
         level: "beginner",
         videoId: crypto.randomUUID(),
         stripeSessionId: session.id,
      });
   } catch (error) {
      if (error.code === 11000) return "duplicate";
      throw error;
   }

   // Remove the slot atomically. If another payment took it first, undo
   // this class and refund rather than double-book the tutor.
   const claimed = await Tutor.updateOne(
      { _id: tutorId, "slotsAvailability._id": slotId },
      { $pull: { slotsAvailability: { _id: slotId } } },
   );
   if (claimed.modifiedCount === 0) {
      await Class.deleteOne({ _id: class_._id });
      return refund(session, "slot booked by another payment");
   }

   await link(class_._id);
   return "booked";
};

// Join an existing class. $addToSet makes a replay harmless.
const fulfillClass = async (session) => {
   const { studentId, classId } = session.metadata;
   const result = await Student.updateOne(
      { _id: studentId },
      { $addToSet: { classes: classId } },
   );
   return result.modifiedCount === 1 ? "booked" : "duplicate";
};

const fulfill = (session) =>
   session.metadata?.kind === "class"
      ? fulfillClass(session)
      : fulfillSlot(session);

exports.handleWebhook = async (req, res) => {
   let event;
   try {
      event = constructWebhookEvent(req.body, req.headers["stripe-signature"]);
   } catch (error) {
      logger.warn(`Rejected Stripe webhook: ${error.message}`);
      return res.status(400).json({ errors: ["Invalid signature"] });
   }

   try {
      const session = event.data.object;
      let result = "ignored";
      if (
         (event.type === "checkout.session.completed" &&
            session.payment_status === "paid") ||
         event.type === "checkout.session.async_payment_succeeded"
      )
         result = await fulfill(session);
      logger.info(`Stripe ${event.type} ${event.id}: ${result}`);
      res.json({ received: true, result });
   } catch (error) {
      // A 500 makes Stripe retry the delivery later.
      logger.error(error);
      res.status(500).json({ errors: ["Internal server error"] });
   }
};
