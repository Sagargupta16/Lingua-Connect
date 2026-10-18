const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Stripe calls this; it is authenticated by the Stripe-Signature header,
// which is computed over the raw body, so the body must stay unparsed.
router.post(
   "/webhook",
   express.raw({ type: "application/json" }),
   paymentController.handleWebhook,
);

module.exports = router;
