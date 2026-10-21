const z = require("zod");

// Multipart form fields arrive as strings, and empty strings usually mean
// "not provided" — normalize before the real schema runs.
const emptyToUndefined = (val) => (val === "" || val === null ? undefined : val);

const booleanish = z.preprocess((val) => {
  if (val === "" || val === null || val === undefined) return undefined;
  if (val === "true") return true;
  if (val === "false") return false;
  return val;
}, z.boolean().optional());

const intish = (min, max) =>
  z.preprocess(emptyToUndefined, z.coerce.number().int().min(min).max(max).optional());

const intRequired = (min, max) =>
  z.preprocess(emptyToUndefined, z.coerce.number().int().min(min).max(max));

const enumish = (values) => z.preprocess(emptyToUndefined, z.enum(values).optional());

// Empty string from the admin UI means "no date set"
const dateField = z.preprocess(
  (val) => (val === "" ? null : val),
  z.coerce.date().nullable(),
);

module.exports = { emptyToUndefined, booleanish, intish, intRequired, enumish, dateField };
