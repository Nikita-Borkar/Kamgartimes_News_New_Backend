const z = require("zod");

const tokenPayload = z.object({
  userId: z.string().min(1),
  role: z.string().min(1),
  type: z.enum(["access", "refresh"]),
});

const refreshTokenDto = z.object({
  refreshToken: z.string().nonempty({ message: "Refresh token is required" }),
});

module.exports = { tokenPayload, refreshTokenDto };
