const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const Class = require("../models/Class");
const Flashcard = require("../models/Flashcard");
const Test = require("../models/Test");
const Tutor = require("../models/Tutor");
const { setupDatabase, createStudent, createTutor, api } = require("./helpers");

setupDatabase();

const classBody = {
   language: "French",
   startTime: "2030-01-01T10:00:00Z",
   duration: 60,
   price: 800,
   level: "beginner",
   videoId: "room-1",
};

describe("student and tutor accounts", () => {
   it("lets a student edit their own record but not someone else's", async () => {
      const a = await createStudent();
      const b = await createStudent();

      const own = await api()
         .put(`/student/update/${a.user._id}`)
         .set("Authorization", a.auth)
         .send({ name: "Renamed", role: "tutor" });
      assert.equal(own.status, 200);
      assert.equal(own.body.name, "Renamed");
      assert.equal(own.body.role, "student");

      const other = await api()
         .delete(`/student/delete/${b.user._id}`)
         .set("Authorization", a.auth);
      assert.equal(other.status, 403);
   });

   it("lets a tutor manage only their own slots", async () => {
      const t1 = await createTutor();
      const t2 = await createTutor();
      const slot = { date: "2030-01-01", duration: 60, price: 500 };

      const foreign = await api()
         .post(`/tutor/add-slot/${t2.user._id}`)
         .set("Authorization", t1.auth)
         .send(slot);
      assert.equal(foreign.status, 403);

      const own = await api()
         .post(`/tutor/add-slot/${t1.user._id}`)
         .set("Authorization", t1.auth)
         .send({ ...slot, price: { $gt: 0 } });
      assert.equal(own.status, 200);
      const [saved] = own.body.slotsAvailability;
      assert.equal(saved.price, undefined, "non-scalar price is dropped");
      assert.ok(saved.id, "server assigns the slot id");

      const removeForeign = await api()
         .delete(`/tutor/delete-slot/${t1.user._id}/${saved._id}`)
         .set("Authorization", t2.auth);
      assert.equal(removeForeign.status, 403);
      const still = await Tutor.findById(t1.user._id);
      assert.equal(still.slotsAvailability.length, 1);
   });
});

describe("classes", () => {
   it("only tutors create classes, and the caller becomes the tutor", async () => {
      const student = await createStudent();
      const tutor = await createTutor();
      const other = await createTutor();

      const byStudent = await api()
         .post("/class/create")
         .set("Authorization", student.auth)
         .send({ ...classBody, tutor: tutor.user._id });
      assert.equal(byStudent.status, 403);

      const res = await api()
         .post("/class/create")
         .set("Authorization", tutor.auth)
         .send({ ...classBody, tutor: other.user._id });
      assert.equal(res.status, 200);
      assert.equal(res.body.tutor, String(tutor.user._id));
      const linked = await Tutor.findById(tutor.user._id);
      assert.equal(linked.classes.length, 1);
   });

   it("returns 403 when another tutor edits or deletes a class", async () => {
      const owner = await createTutor();
      const other = await createTutor();
      const class_ = await Class.create({
         ...classBody,
         tutor: owner.user._id,
      });

      const edit = await api()
         .put(`/class/update/${class_._id}`)
         .set("Authorization", other.auth)
         .send({ price: 1 });
      assert.equal(edit.status, 403);

      const remove = await api()
         .delete(`/class/delete/${class_._id}`)
         .set("Authorization", other.auth);
      assert.equal(remove.status, 403);

      const ownEdit = await api()
         .put(`/class/update/${class_._id}`)
         .set("Authorization", owner.auth)
         .send({ price: 900 });
      assert.equal(ownEdit.status, 200);
      assert.equal(ownEdit.body.price, 900);
   });
});

describe("tests", () => {
   it("only the tutor who wrote a test can change it", async () => {
      const student = await createStudent();
      const owner = await createTutor();
      const other = await createTutor();
      const body = {
         language: "French",
         level: "Beginner",
         questions: [{ question: "Bonjour?", answer: "Hello" }],
      };

      const byStudent = await api()
         .post("/test/create")
         .set("Authorization", student.auth)
         .send(body);
      assert.equal(byStudent.status, 403);

      const created = await api()
         .post("/test/create")
         .set("Authorization", owner.auth)
         .send(body);
      assert.equal(created.status, 200);
      assert.equal(created.body.tutor, String(owner.user._id));
      const id = created.body._id;
      const questionId = created.body.questions[0]._id;

      for (const [method, path] of [
         ["put", `/test/update/${id}`],
         ["post", `/test/add-question/${id}`],
         ["delete", `/test/delete-question/${id}/${questionId}`],
         ["delete", `/test/delete/${id}`],
      ]) {
         const res = await api()
            [method](path)
            .set("Authorization", other.auth)
            .send({ question: "x", answer: "y" });
         assert.equal(res.status, 403, `${method} ${path}`);
      }

      const removed = await api()
         .delete(`/test/delete-question/${id}/${questionId}`)
         .set("Authorization", owner.auth);
      assert.equal(removed.status, 200);
      const test = await Test.findById(id);
      assert.equal(test.questions.length, 0);
   });
});

describe("flashcards", () => {
   it("keeps each student's cards private", async () => {
      const a = await createStudent();
      const b = await createStudent();
      const card = { language: "Spanish", question: "Hola", answer: "Hello" };

      const created = await api()
         .post(`/flashcard/create/${a.user._id}`)
         .set("Authorization", a.auth)
         .send(card);
      assert.equal(created.status, 200);
      assert.equal(created.body.owner, String(a.user._id));

      const forOther = await api()
         .post(`/flashcard/create/${a.user._id}`)
         .set("Authorization", b.auth)
         .send(card);
      assert.equal(forOther.status, 403);

      await api()
         .post("/flashcard/create")
         .set("Authorization", b.auth)
         .send({ ...card, question: "Adios" });

      const listA = await api()
         .get("/flashcard/view")
         .set("Authorization", a.auth);
      assert.deepEqual(
         listA.body.map((c) => c.question),
         ["Hola"],
      );

      const id = created.body._id;
      for (const [method, path] of [
         ["get", `/flashcard/view/${id}`],
         ["put", `/flashcard/update/${id}`],
         ["delete", `/flashcard/delete/${id}`],
         ["post", `/flashcard/get/${a.user._id}`],
      ]) {
         const res = await api()
            [method](path)
            .set("Authorization", b.auth)
            .send({ language: "Spanish" });
         assert.equal(res.status, 403, `${method} ${path}`);
      }
      assert.equal(await Flashcard.countDocuments(), 2);

      const byLanguage = await api()
         .post(`/flashcard/get/${a.user._id}`)
         .set("Authorization", a.auth)
         .send({ language: "Spanish" });
      assert.equal(byLanguage.body.length, 1);
   });

   it("is closed to tutors", async () => {
      const tutor = await createTutor();
      const res = await api()
         .get("/flashcard/view")
         .set("Authorization", tutor.auth);
      assert.equal(res.status, 403);
   });
});
