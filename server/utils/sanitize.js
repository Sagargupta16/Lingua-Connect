// Request bodies are parsed JSON, so any field can arrive as an object such
// as { "$gt": "" } instead of the scalar the schema expects. These helpers
// keep only plain strings, numbers and booleans, which Mongoose then casts
// against the schema, so no query or update operator reaches the database.

const scalar = (value) => {
   if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
   )
      return value;
   return undefined;
};

// Copy the named fields from body, dropping missing and non-scalar values.
const pickScalars = (body, fields) => {
   const picked = {};
   if (body === null || typeof body !== "object") return picked;
   for (const field of fields) {
      const value = scalar(body[field]);
      if (value !== undefined) picked[field] = value;
   }
   return picked;
};

// Array of scalars (e.g. languages); undefined when the value is not an array.
const scalarArray = (value) =>
   Array.isArray(value)
      ? value.map(scalar).filter((item) => item !== undefined)
      : undefined;

// Array of sub-documents, each reduced to the named scalar fields.
const objectArray = (value, fields) =>
   Array.isArray(value)
      ? value.map((item) => pickScalars(item, fields))
      : undefined;

module.exports = { pickScalars, scalarArray, objectArray };
