const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const Student = require("../models/Student");
const Tutor = require("../models/Tutor");

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) throw new Error("Invalid or missing Authorization header");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.exp * 1000 < Date.now()) throw new Error("Token has expired");

    let user;
    try {
      // toString() keeps a token payload value from reaching the query as an
      // operator object.
      const id = decoded.id.toString();
      user =
        (await Student.findOne({ _id: id })) ||
        (await Tutor.findOne({ _id: id }));
    } catch (error) {
      console.error("User lookup error:", error.message);
      throw new Error("Error looking up user");
    }

    if (!user) throw new Error("User not found");

    req.token = token;
    req.user = user;
    logger.info(`User ${user.email} authenticated`);
    next();
  } catch (error) {
    logger.error(error.message);
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      res
        .status(401)
        .json({ message: "Unauthorized: Invalid or expired token" });
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  }
};

const checkUserRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user.role;

      logger.info(`User ${req.user.email} has role ${userRole}`);

      if (allowedRoles.includes(userRole)) {
        logger.info(`User ${req.user.email} authorized`);
        next();
      } else {
        logger.info(`User ${req.user.email} forbidden`);
        res.status(403).json({ message: "Forbidden" });
      }
    } catch (error) {
      logger.error(error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  };
};
module.exports = { authenticateUser, checkUserRole };
