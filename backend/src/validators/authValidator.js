const { z } = require("zod");

const signupSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

const loginSchema = z.object({
    email: z.email("Invalid Email"),
    password: z.string().min(1,"Password is Required")
});

module.exports = { signupSchema , loginSchema };
