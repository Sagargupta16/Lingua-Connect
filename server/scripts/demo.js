// Demo mode: run the real API against a throwaway in-memory MongoDB filled
// with the seed data, so the app can be tried without installing MongoDB or
// creating any account. Nothing is persisted; stop the process to reset.
//
//   npm run demo   (from server/, or from the root to start the client too)
//
// Stripe and email keep working only if their keys are in server/.env;
// without STRIPE_SECRET_KEY the Book button answers 503.
const { MongoMemoryServer } = require("mongodb-memory-server");

const start = async () => {
   const mongo = await MongoMemoryServer.create();
   // Set before dotenv loads, so a DB_CONNECTION_STRING in .env is ignored.
   process.env.DB_CONNECTION_STRING = mongo.getUri("lingua-demo");
   require("dotenv").config();
   process.env.JWT_SECRET ||= require("crypto").randomBytes(32).toString("hex");
   process.env.JWT_SALT_ROUNDS ||= "10";
   process.env.CLIENT_URL ||= "http://localhost:3000";

   const mongoose = require("mongoose");
   const {
      seed,
      STUDENT_EMAIL,
      TUTOR_EMAIL,
   } = require("./seed");
   await mongoose.connect(process.env.DB_CONNECTION_STRING);
   const counts = await seed();

   const app = require("../app");
   const port = process.env.PORT || 5000;
   const server = app.listen(port, () => {
      console.log(`Demo API on http://localhost:${port} (in-memory MongoDB)`);
      console.log("Seeded:", counts);
      console.log(`Student: ${STUDENT_EMAIL}`);
      console.log(`Tutor:   ${TUTOR_EMAIL}`);
      console.log("Password for both: see the demo section of the README");
   });

   const stop = async () => {
      server.close();
      await mongoose.disconnect();
      await mongo.stop();
      process.exit(0);
   };
   process.on("SIGINT", stop);
   process.on("SIGTERM", stop);
};

start().catch((error) => {
   console.error(error);
   process.exit(1);
});
