// Demo data: one student, six tutors with open slots, booked classes, a
// tutor-written test and flashcards in three languages.
//
//   node scripts/seed.js            wipe and reseed the database in DB_CONNECTION_STRING
//   node scripts/seed.js --if-empty seed only when there are no tutors yet
//
// It refuses to touch a database that is not on localhost or the docker
// compose "mongo" host unless --force is passed, so a production
// connection string in .env cannot be wiped by accident.
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Class = require("../models/Class");
const Flashcard = require("../models/Flashcard");
const Student = require("../models/Student");
const Test = require("../models/Test");
const Tutor = require("../models/Tutor");

const DEMO_PASSWORD = "Demo1234";
const STUDENT_EMAIL = "student@demo.lingua.dev";
const TUTOR_EMAIL = "tutor@demo.lingua.dev";

const TUTORS = [
   {
      name: "Camille Laurent",
      email: TUTOR_EMAIL,
      languages: ["French", "English"],
      yearsOfExperience: 8,
      rating: 5,
      slots: [
         ["French", 1, 9, 60, 900],
         ["French", 2, 18, 45, 700],
         ["English", 4, 11, 90, 1300],
      ],
   },
   {
      name: "Hiroshi Tanaka",
      email: "hiroshi@demo.lingua.dev",
      languages: ["Japanese"],
      yearsOfExperience: 12,
      rating: 5,
      slots: [
         ["Japanese", 1, 7, 60, 1500],
         ["Japanese", 3, 7, 90, 2100],
      ],
   },
   {
      name: "Lucia Romero",
      email: "lucia@demo.lingua.dev",
      languages: ["Spanish", "Portuguese"],
      yearsOfExperience: 5,
      rating: 4,
      slots: [
         ["Spanish", 1, 17, 45, 600],
         ["Portuguese", 2, 17, 60, 800],
      ],
   },
   {
      name: "Jonas Becker",
      email: "jonas@demo.lingua.dev",
      languages: ["German", "Dutch"],
      yearsOfExperience: 3,
      rating: 4,
      slots: [["German", 2, 10, 60, 750]],
   },
   {
      name: "Min-ji Park",
      email: "minji@demo.lingua.dev",
      languages: ["Korean", "English"],
      yearsOfExperience: 2,
      rating: 3,
      slots: [
         ["Korean", 3, 19, 45, 450],
         ["English", 5, 19, 45, 450],
      ],
   },
   {
      name: "Layla Haddad",
      email: "layla@demo.lingua.dev",
      languages: ["Arabic", "French"],
      yearsOfExperience: 10,
      rating: 5,
      slots: [["Arabic", 2, 14, 90, 1800]],
   },
];

const FLASHCARDS = [
   ["Spanish", "¿Dónde está la estación?", "Where is the station?"],
   ["Spanish", "Tengo hambre", "I am hungry"],
   ["Spanish", "Mañana", "Tomorrow"],
   ["French", "Je voudrais un café", "I would like a coffee"],
   ["French", "À bientôt", "See you soon"],
   ["Japanese", "ありがとう", "Thank you"],
   ["Japanese", "おはよう", "Good morning"],
];

// A date `days` from today at `hour`:00 local time.
const at = (days, hour) => {
   const date = new Date();
   date.setDate(date.getDate() + days);
   date.setHours(hour, 0, 0, 0);
   return date;
};

const seed = async () => {
   await Promise.all(
      [Class, Flashcard, Student, Test, Tutor].map((model) =>
         model.deleteMany({}),
      ),
   );
   const password = await bcrypt.hash(DEMO_PASSWORD, 10);

   const tutors = [];
   for (const { slots, ...fields } of TUTORS) {
      tutors.push(
         await Tutor.create({
            ...fields,
            password,
            slotsAvailability: slots.map(
               ([language, days, hour, duration, price]) => ({
                  id: crypto.randomUUID(),
                  date: at(days, 0),
                  startTime: at(days, hour),
                  duration,
                  price,
                  language,
               }),
            ),
         }),
      );
   }
   const [camille, hiroshi] = tutors;

   const student = await Student.create({
      name: "Aarav Sharma",
      email: STUDENT_EMAIL,
      password,
   });

   // Two classes the student has already paid for.
   const classes = await Class.create([
      {
         language: "French",
         tutor: camille._id,
         startTime: at(1, 20),
         duration: 60,
         price: 900,
         level: "beginner",
         videoId: crypto.randomUUID(),
      },
      {
         language: "Japanese",
         tutor: hiroshi._id,
         startTime: at(3, 18),
         duration: 45,
         price: 1200,
         level: "beginner",
         videoId: crypto.randomUUID(),
      },
   ]);
   for (const class_ of classes)
      await Tutor.updateOne(
         { _id: class_.tutor },
         { $addToSet: { classes: class_._id } },
      );

   const test = await Test.create({
      language: "French",
      level: "Beginner",
      tutor: camille._id,
      questions: [
         { question: "Translate: good evening", answer: "Bonsoir" },
         {
            question: "Translate: thank you very much",
            answer: "Merci beaucoup",
         },
      ],
   });

   const flashcards = await Flashcard.create(
      FLASHCARDS.map(([language, question, answer]) => ({
         language,
         question,
         answer,
         owner: student._id,
      })),
   );

   student.classes = classes.map((c) => c._id);
   student.tests = [test._id];
   student.flashcards = flashcards.map((f) => f._id);
   await student.save();

   return {
      tutors: tutors.length,
      slots: tutors.reduce((n, t) => n + t.slotsAvailability.length, 0),
      classes: classes.length,
      flashcards: flashcards.length,
   };
};

const isLocal = (uri) =>
   /^mongodb(\+srv)?:\/\/([^@/]*@)?(localhost|127\.0\.0\.1|mongo)(:\d+)?\//.test(
      uri,
   );

const main = async () => {
   require("dotenv").config();
   const uri = process.env.DB_CONNECTION_STRING;
   const args = process.argv.slice(2);
   if (!uri) throw new Error("DB_CONNECTION_STRING is not set");
   if (!isLocal(uri) && !args.includes("--force"))
      throw new Error(
         "Refusing to wipe a non-local database; pass --force if you mean it",
      );

   await mongoose.connect(uri);
   try {
      if (args.includes("--if-empty") && (await Tutor.estimatedDocumentCount()))
         console.log("Database already has tutors; skipping seed");
      else {
         const counts = await seed();
         console.log("Seeded demo data:", counts);
         console.log(
            `Log in as ${STUDENT_EMAIL} or ${TUTOR_EMAIL} / ${DEMO_PASSWORD}`,
         );
      }
   } finally {
      await mongoose.disconnect();
   }
};

if (require.main === module)
   main().catch((error) => {
      console.error(error.message);
      process.exit(1);
   });

module.exports = { seed, DEMO_PASSWORD, STUDENT_EMAIL, TUTOR_EMAIL };
