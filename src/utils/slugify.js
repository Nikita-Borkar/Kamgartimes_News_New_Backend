// Unicode-aware slugify — keeps Devanagari/Latin letters and digits so Hindi
// titles (e.g. "न्यूनतम वेतन अधिनियम") generate valid slugs instead of "".
const slugify = (text) =>
  text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

module.exports = slugify;
