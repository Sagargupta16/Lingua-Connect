const rateLimit = require("express-rate-limit");

// Stricter limit for auth and write routes, applied per route.
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 100, // Limit each IP to 100 requests per windowMs
});

// Looser app-wide limit. It runs before authenticateUser, which queries the
// database on every request, so no route is left without a cap.
const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 300,
});

module.exports = limiter;
module.exports.apiLimiter = apiLimiter;
