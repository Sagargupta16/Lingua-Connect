// index.js
// Load .env before anything reads process.env.
require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app.js");

const PORT = process.env.PORT || 5000;

const uri = process.env.DB_CONNECTION_STRING;

mongoose
   .connect(uri)
   .then(() => console.log("Database connected!"))
   .catch((err) => console.log(err));

app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});
