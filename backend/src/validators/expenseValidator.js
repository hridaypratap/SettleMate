const {z} = require("zod");

const splitUserSchema = z.object({
    user: z.string().min(1,"User ID is required"),
    share: z.number().positive("Share must be greater than zero").optional()
});

const createExpenseSchema = z.object({
    groupId: z.string().min(1, "Group ID is required"),

    paidBy: z.string().min(1, "Paid by user ID is required"),

    amount: z.number().positive("Amount must be greater than 0"),

    description: z.string().min(1, "Description is required"),

    splitType: z.enum(["equal", "custom"]),

    splitAmong: z.array(splitUserSchema).min(1, "At least one member is required")
});

module.exports = {createExpenseSchema}