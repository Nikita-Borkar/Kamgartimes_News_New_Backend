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

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

// The admin date inputs send YYYY-MM-DD. An end date must include the whole
// selected day, otherwise a same-day campaign/placement expires at midnight
// before it can serve.
const normalizeDate = (val, endOfDay) => {
  if (val === "" || val === null || val === undefined) return null;
  if (typeof val === "string" && DATE_ONLY.test(val)) {
    return new Date(`${val}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`);
  }
  return val;
};

// Empty string from the admin UI means "no date set"
const dateField = z.preprocess(
  (val) => (val === "" ? null : val),
  z.coerce.date().nullable(),
);

const startDateField = z.preprocess(
  (val) => normalizeDate(val, false),
  z.coerce.date().nullable(),
);

const endDateField = z.preprocess(
  (val) => normalizeDate(val, true),
  z.coerce.date().nullable(),
);

module.exports = {
  emptyToUndefined,
  booleanish,
  intish,
  intRequired,
  enumish,
  dateField,
  startDateField,
  endDateField,
};
