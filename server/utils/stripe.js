const Stripe = require("stripe");

// The Stripe client is created on first use, not at require time. index.js
// loads dotenv after the route modules, and `new Stripe(undefined)` throws,
// so an eager client crashed the server on boot whenever the key came from
// a .env file. Tests swap in a fake with setStripe().
let client = null;

const getStripe = () => {
   if (client) return client;
   if (!process.env.STRIPE_SECRET_KEY) return null;
   client = new Stripe(process.env.STRIPE_SECRET_KEY);
   return client;
};

const setStripe = (fake) => {
   client = fake;
};

// Signature verification needs no API key, so it uses the static helper.
const constructWebhookEvent = (payload, signature) =>
   Stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
   );

module.exports = { getStripe, setStripe, constructWebhookEvent };
