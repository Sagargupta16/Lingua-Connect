const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { seed, DEMO_PASSWORD, STUDENT_EMAIL } = require("../scripts/seed");
const { setupDatabase, api } = require("./helpers");

setupDatabase();

describe("demo seed", () => {
   it("creates data the demo student can log in and browse", async () => {
      const counts = await seed();
      assert.deepEqual(counts, {
         tutors: 6,
         slots: 11,
         classes: 2,
         flashcards: 7,
      });

      const login = await api()
         .post("/auth/login")
         .send({ email: STUDENT_EMAIL, password: DEMO_PASSWORD });
      assert.equal(login.status, 200);
      const auth = `Bearer ${login.body.data.token}`;

      const tutors = await api().get("/tutor/view").set("Authorization", auth);
      assert.equal(tutors.body.length, 6);

      const cards = await api()
         .get("/flashcard/view")
         .set("Authorization", auth);
      assert.equal(cards.body.length, 7);
   });

   it("is safe to run twice", async () => {
      await seed();
      const counts = await seed();
      assert.equal(counts.tutors, 6);
   });
});
