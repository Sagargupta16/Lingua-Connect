import { toast } from "react-toastify";
import { createCheckoutSession } from "../../api/studentApi";

// Stripe.js removed redirectToCheckout in the 2025-09-30 (clover) release, so
// the server returns the hosted Checkout URL and the browser navigates to it.
// The purchase is { tutorId, slotId } or { classId }; the server looks up the
// price and books the class only after Stripe confirms the payment.
const Stripe = async (purchase) => {
   try {
      const { data: session } = await createCheckoutSession(purchase);
      window.location.assign(session.url);
      return session;
   } catch (error) {
      toast.error(
         error.response?.data?.errors?.[0] ?? "Could not start the checkout",
      );
      return null;
   }
};

export default Stripe;
