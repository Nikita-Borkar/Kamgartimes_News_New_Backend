const z = require("zod");

const loginUser = z.object({
  email: z.email().nonempty(),
  password: z.string().nonempty(),
});

const registerUser = z.object({
  name: z.string().nonempty().max(100),
  email: z.email().nonempty().max(80),
  password: z.string().nonempty().min(8),
});

module.exports = { loginUser, registerUser };
