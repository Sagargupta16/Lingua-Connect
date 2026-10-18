// Shared setup: an in-memory MongoDB per test file, the real Express app,
// and helpers to create users and sign their JWTs.
const { randomBytes, randomUUID } = require("node:crypto");

// Secrets and passwords are generated per run, never written in the source.
process.env.JWT_SECRET ??= randomBytes(32).toString("hex");
process.env.JWT_SALT_ROUNDS ??= "4";
process.env.CLIENT_URL ??= "http://localhost:3000";
process.env.STRIPE_WEBHOOK_SECRET ??= randomBytes(24).toString("base64url");

// Signup needs a lower and an upper case letter and a digit.
const randomPassword = () => randomUUID() + "Aa1";
const TEST_PASSWORD = randomPassword();

const { after, before, beforeEach } = require("node:test");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const app = require("../app");
const logger = require("../utils/logger");
const Student = require("../models/Student");
const Tutor = require("../models/Tutor");

logger.silent = true;

const setupDatabase = () => {
   let mongo;
   before(async () => {
      mongo = await MongoMemoryServer.create();
      await mongoose.connect(mongo.getUri());
      // Build unique indexes now; the booking idempotency test relies on them.
      await Promise.all(
         mongoose.modelNames().map((name) => mongoose.model(name).init()),
      );
   });
   beforeEach(async () => {
      const collections = await mongoose.connection.db.collections();
      await Promise.all(collections.map((c) => c.deleteMany({})));
   });
   after(async () => {
      await mongoose.disconnect();
      await mongo.stop();
   });
};

const token = (user) =>
   jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
   );

let counter = 0;
const createStudent = async (fields = {}) => {
   counter += 1;
   const student = await Student.create({
      name: `Student ${counter}`,
      email: `student${counter}@example.test`,
      password: await bcrypt.hash(TEST_PASSWORD, 4),
      ...fields,
   });
   return { user: student, auth: `Bearer ${token(student)}` };
};

const createTutor = async (fields = {}) => {
   counter += 1;
   const tutor = await Tutor.create({
      name: `Tutor ${counter}`,
      email: `tutor${counter}@example.test`,
      password: await bcrypt.hash(TEST_PASSWORD, 4),
      languages: ["French"],
      yearsOfExperience: 3,
      ...fields,
   });
   return { user: tutor, auth: `Bearer ${token(tutor)}` };
};

const api = () => request(app);

module.exports = {
   setupDatabase,
   createStudent,
   createTutor,
   api,
   randomPassword,
   TEST_PASSWORD,
};
