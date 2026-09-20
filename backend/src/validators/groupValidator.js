const { z } = require("zod");

const createGroupSchema = z.object({
    name: z.string().min(2, "Group name must be at least 2 characters"),
});

const addMemberSchema = z.object({
    email: z.string().email("Valid email is required")
})


module.exports = { createGroupSchema , addMemberSchema };
