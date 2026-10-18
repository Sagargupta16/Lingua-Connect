const { randomUUID } = require("node:crypto");
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const Tutor = require("../models/Tutor");
const { setupDatabase, createStudent, api } = require("./helpers");

setupDatabase();

// Generated per run; signup needs a lower, an upper case letter and a digit.
const PASSWORD = `Pw1-${randomUUID()}`;

describe("auth", () => {
   it("signs up a student and logs in with the same password", async () => {
      const signup = await api().post("/auth/signup").send({
         name: "Asha",
         email: "asha@example.test",
         password: PASSWORD,
         role: "student",
      });
      assert.equal(signup.status, 201);

      const login = await api()
         .post("/auth/login")
         .send({ email: "asha@example.test", password: PASSWORD });
      assert.equal(login.status, 200);
      assert.ok(login.body.data.token);

      const check = await api()
         .get("/token-check")
         .set("Authorization", `Bearer ${login.body.data.token}`);
      assert.deepEqual(check.body, { isAuthenticated: true });
   });

   it("rejects a wrong password", async () => {
      await createStudent({ email: "ravi@example.test" });
      const res = await api()
         .post("/auth/login")
         .send({ email: "ravi@example.test", password: "Wrong1234" });
      assert.equal(res.status, 401);
   });

   it("rejects a MongoDB operator in place of the email", async () => {
      await createStudent();
      const signup = await api()
         .post("/auth/signup")
         .send({ name: "x", email: { $ne: null }, password: PASSWORD });
      assert.equal(signup.status, 400);

      const reset = await api()
         .post("/auth/reset-password")
         .send({ email: { $ne: null }, otp: "1", newPassword: PASSWORD });
      assert.equal(reset.status, 400);

      const login = await api()
         .post("/auth/login")
         .send({ email: { $ne: null }, password: PASSWORD });
      assert.equal(login.status, 401);
   });

   it("ignores server-owned fields such as rating on tutor signup", async () => {
      const res = await api()
         .post("/auth/signup")
         .send({
            name: "Meera",
            email: "meera@example.test",
            password: PASSWORD,
            role: "tutor",
            languages: ["Hindi", { $gt: "" }],
            yearsOfExperience: 4,
            rating: 5,
            classes: ["000000000000000000000000"],
         });
      assert.equal(res.status, 201);
      const tutor = await Tutor.findOne({ email: "meera@example.test" });
      assert.equal(tutor.rating, 0);
      assert.deepEqual([...tutor.languages], ["Hindi"]);
      assert.equal(tutor.classes.length, 0);
   });

   it("requires at least one language for a tutor", async () => {
      const res = await api().post("/auth/signup").send({
         name: "Noor",
         email: "noor@example.test",
         password: PASSWORD,
         role: "tutor",
         yearsOfExperience: 2,
      });
      assert.equal(res.status, 400);
   });

   it("never returns the password hash", async () => {
      const { user, auth } = await createStudent();
      const res = await api()
         .get(`/student/view/${user._id}`)
         .set("Authorization", auth);
      assert.equal(res.status, 200);
      assert.equal(res.body.password, undefined);
   });

   it("returns 401 without a token", async () => {
      const res = await api().get("/tutor/view");
      assert.equal(res.status, 401);
   });
});
