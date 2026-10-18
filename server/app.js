// app.js builds the Express app without connecting to MongoDB or listening,
// so tests and the demo script can mount it on their own database.
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes.js");
const studentRoutes = require("./routes/studentRoutes.js");
const tutorRoutes = require("./routes/tutorRoutes.js");
const classRoutes = require("./routes/classRoutes.js");
const flashcardRoutes = require("./routes/flashcardRoutes.js");
const testRoutes = require("./routes/testRoutes.js");
const stripeRoutes = require("./routes/stripeRoutes.js");
const { authenticateUser } = require("./middleware/authMiddleware.js");
const { apiLimiter } = require("./utils/limiter.js");

// Mount table, exported so the OpenAPI test can check every route is documented.
const mounts = [
   ["/auth", authRoutes],
   ["/student", studentRoutes],
   ["/tutor", tutorRoutes],
   ["/class", classRoutes],
   ["/flashcard", flashcardRoutes],
   ["/test", testRoutes],
];

const app = express();

// Middleware to hide version information
app.disable("x-powered-by");

// Only the client may call the API from a browser.
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));

app.use(apiLimiter);

// Stripe signs the raw request body, so the webhook router parses its own
// body and must be mounted before express.json().
app.use("/stripe", stripeRoutes);

app.use(express.json());

for (const [prefix, router] of mounts) app.use(prefix, router);

app.get("/token-check", authenticateUser, (req, res) => {
   try {
      res.status(200).json({ isAuthenticated: true });
   } catch (error) {
      res.status(401).json({ isAuthenticated: false });
   }
});

module.exports = app;
module.exports.mounts = [...mounts, ["/stripe", stripeRoutes]];
