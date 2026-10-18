import { createCheckoutSession } from "../../api/studentApi";

// Stripe.js removed redirectToCheckout in the 2025-09-30 (clover) release, so
// the server returns the hosted Checkout URL and the browser navigates to it.
const Stripe = async ({ price, description }) => {
   const course = {
      price: price,
      currency: "INR",
      quantity: 1,
      description: description,
   };

   try {
      const { data: session } = await createCheckoutSession(course);
      window.location.assign(session.url);
      return session;
   } catch (error) {
      console.error(error.message);
      return null;
   }
};

export default Stripe;
