const z = require("zod");

const RANGE_DAYS = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

const dashboardQuerySchema = z.object({
  range: z.enum(["7d", "30d", "90d"]).optional().default("30d"),
});

module.exports = { dashboardQuerySchema, RANGE_DAYS };
