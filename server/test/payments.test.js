const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const Stripe = require("stripe");
const Class = require("../models/Class");
const Student = require("../models/Student");
const Tutor = require("../models/Tutor");
const { setStripe } = require("../utils/stripe");
const { setupDatabase, createStudent, createTutor, api } = require("./helpers");

setupDatabase();

// A stand-in for the Stripe client that records what the server sent.
let sessions;
let refunds;
beforeEach(() => {
   sessions = [];
   refunds = [];
   setStripe({
      checkout: {
         sessions: {
            create: async (params) => {
               const session = {
                  id: `cs_test_${sessions.length + 1}`,
                  url: `https://checkout.stripe.test/${sessions.length + 1}`,
                  ...params,
               };
               sessions.push(session);
               return session;
            },
         },
      },
      refunds: {
         create: async (params, options) =>
            refunds.push({
               ...params,
               idempotencyKey: options?.idempotencyKey,
            }),
      },
   });
});

// Deliver a webhook signed exactly the way Stripe signs it.
const deliver = (event) => {
   const payload = JSON.stringify(event);
   const signature = Stripe.webhooks.generateTestHeaderString({
      payload,
      secret: process.env.STRIPE_WEBHOOK_SECRET,
   });
   return api()
      .post("/stripe/webhook")
      .set("Content-Type", "application/json")
      .set("Stripe-Signature", signature)
      .send(payload);
};

const completed = (session, eventId = `evt_${session.id}`) => ({
   id: eventId,
   type: "checkout.session.completed",
   data: {
      object: {
         id: session.id,
         payment_status: "paid",
         payment_intent: `pi_${session.id}`,
         metadata: session.metadata,
      },
   },
});

const tutorWithSlot = async (price = 750) => {
   const tutor = await createTutor({
      slotsAvailability: [
         {
            id: "slot-1",
            date: new Date("2030-02-01"),
            startTime: new Date("2030-02-01T09:00:00Z"),
            duration: 60,
            price,
            language: "French",
         },
      ],
   });
   return { ...tutor, slotId: String(tutor.user.slotsAvailability[0]._id) };
};

const checkout = (auth, body) =>
   api()
      .post("/student/create-checkout-session")
      .set("Authorization", auth)
      .send(body);

describe("checkout session", () => {
   it("prices the slot from the database, not from the request", async () => {
      const student = await createStudent();
      const tutor = await tutorWithSlot(750);

      const res = await checkout(student.auth, {
         tutorId: String(tutor.user._id),
         slotId: tutor.slotId,
         price: 1,
         quantity: 100,
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.url, "https://checkout.stripe.test/1");

      const [sent] = sessions;
      assert.equal(sent.line_items[0].price_data.unit_amount, 75000);
      assert.equal(sent.line_items[0].quantity, 1);
      assert.equal(sent.customer_email, student.user.email);
      assert.equal(sent.metadata.studentId, String(student.user._id));
      assert.equal(sent.metadata.slotId, tutor.slotId);
   });

   it("keeps the slot open until payment succeeds", async () => {
      const student = await createStudent();
      const tutor = await tutorWithSlot();
      await checkout(student.auth, {
         tutorId: String(tutor.user._id),
         slotId: tutor.slotId,
      });
      const fresh = await Tutor.findById(tutor.user._id);
      assert.equal(fresh.slotsAvailability.length, 1);
      assert.equal(await Class.countDocuments(), 0);
   });

   it("rejects tutors, unknown slots and malformed ids", async () => {
      const student = await createStudent();
      const tutor = await tutorWithSlot();

      const asTutor = await checkout(tutor.auth, {
         tutorId: String(tutor.user._id),
         slotId: tutor.slotId,
      });
      assert.equal(asTutor.status, 403);

      const missing = await checkout(student.auth, {
         tutorId: String(tutor.user._id),
         slotId: "000000000000000000000000",
      });
      assert.equal(missing.status, 404);

      const injected = await checkout(student.auth, {
         tutorId: { $ne: null },
         slotId: tutor.slotId,
      });
      assert.equal(injected.status, 400);
      assert.equal(sessions.length, 0);
   });

   it("answers 503 when Stripe is not configured", async () => {
      setStripe(null);
      const previous = process.env.STRIPE_SECRET_KEY;
      delete process.env.STRIPE_SECRET_KEY;
      const student = await createStudent();
      const tutor = await tutorWithSlot();
      const res = await checkout(student.auth, {
         tutorId: String(tutor.user._id),
         slotId: tutor.slotId,
      });
      if (previous !== undefined) process.env.STRIPE_SECRET_KEY = previous;
      assert.equal(res.status, 503);
   });
});

describe("stripe webhook", () => {
   it("rejects a payload without a valid signature", async () => {
      const res = await api()
         .post("/stripe/webhook")
         .set("Content-Type", "application/json")
         .set("Stripe-Signature", "t=1,v1=forged")
         .send(JSON.stringify({ type: "checkout.session.completed" }));
      assert.equal(res.status, 400);
   });

   it("books the slot once payment completes", async () => {
      const student = await createStudent();
      const tutor = await tutorWithSlot();
      await checkout(student.auth, {
         tutorId: String(tutor.user._id),
         slotId: tutor.slotId,
      });

      const res = await deliver(completed(sessions[0]));
      assert.equal(res.status, 200);
      assert.equal(res.body.result, "booked");

      const [class_] = await Class.find();
      assert.equal(class_.price, 750);
      assert.equal(class_.stripeSessionId, sessions[0].id);
      const freshTutor = await Tutor.findById(tutor.user._id);
      const freshStudent = await Student.findById(student.user._id);
      assert.equal(freshTutor.slotsAvailability.length, 0);
      assert.deepEqual(freshTutor.classes.map(String), [String(class_._id)]);
      assert.deepEqual(freshStudent.classes.map(String), [String(class_._id)]);
   });

   it("is idempotent when Stripe delivers the same event twice", async () => {
      const student = await createStudent();
      const tutor = await tutorWithSlot();
      await checkout(student.auth, {
         tutorId: String(tutor.user._id),
         slotId: tutor.slotId,
      });

      const event = completed(sessions[0]);
      const results = await Promise.all([deliver(event), deliver(event)]);
      const replay = await deliver(event);

      assert.deepEqual(results.map((r) => r.body.result).sort(), [
         "booked",
         "duplicate",
      ]);
      assert.equal(replay.body.result, "duplicate");
      assert.equal(await Class.countDocuments(), 1);
      const freshStudent = await Student.findById(student.user._id);
      assert.equal(freshStudent.classes.length, 1);
      assert.equal(refunds.length, 0);
   });

   it("refunds the second payment when two students paid for one slot", async () => {
      const first = await createStudent();
      const second = await createStudent();
      const tutor = await tutorWithSlot();
      const body = { tutorId: String(tutor.user._id), slotId: tutor.slotId };
      await checkout(first.auth, body);
      await checkout(second.auth, body);

      const a = await deliver(completed(sessions[0]));
      const b = await deliver(completed(sessions[1]));

      assert.equal(a.body.result, "booked");
      assert.equal(b.body.result, "refunded");
      assert.deepEqual(refunds, [
         {
            payment_intent: `pi_${sessions[1].id}`,
            idempotencyKey: `refund-${sessions[1].id}`,
         },
      ]);
      assert.equal(await Class.countDocuments(), 1);
      const loser = await Student.findById(second.user._id);
      assert.equal(loser.classes.length, 0);
   });

   it("books one of two concurrent payments for the same slot and refunds the other", async () => {
      const students = [await createStudent(), await createStudent()];
      const tutor = await tutorWithSlot();
      const body = { tutorId: String(tutor.user._id), slotId: tutor.slotId };
      for (const s of students) await checkout(s.auth, body);

      const results = await Promise.all(
         sessions.map((session) => deliver(completed(session))),
      );

      assert.deepEqual(
         results.map((r) => r.body.result).sort(),
         ["booked", "refunded"],
      );
      assert.equal(refunds.length, 1);
      assert.equal(await Class.countDocuments(), 1);
      const fresh = await Tutor.findById(tutor.user._id);
      assert.equal(fresh.classes.length, 1);
   });

   it("ignores sessions that are not paid yet", async () => {
      const student = await createStudent();
      const tutor = await tutorWithSlot();
      await checkout(student.auth, {
         tutorId: String(tutor.user._id),
         slotId: tutor.slotId,
      });
      const event = completed(sessions[0]);
      event.data.object.payment_status = "unpaid";
      const res = await deliver(event);
      assert.equal(res.body.result, "ignored");
      assert.equal(await Class.countDocuments(), 0);
   });

   it("adds a student to an existing class after payment", async () => {
      const student = await createStudent();
      const tutor = await createTutor();
      const class_ = await Class.create({
         language: "French",
         tutor: tutor.user._id,
         startTime: new Date("2030-03-01T10:00:00Z"),
         duration: 90,
         price: 1200,
         level: "intermediate",
         videoId: "room-2",
      });

      const res = await checkout(student.auth, { classId: String(class_._id) });
      assert.equal(res.status, 200);
      assert.equal(sessions[0].line_items[0].price_data.unit_amount, 120000);

      const hook = await deliver(completed(sessions[0]));
      assert.equal(hook.body.result, "booked");
      const fresh = await Student.findById(student.user._id);
      assert.deepEqual(fresh.classes.map(String), [String(class_._id)]);

      const again = await checkout(student.auth, {
         classId: String(class_._id),
      });
      assert.equal(again.status, 409);
   });
});
