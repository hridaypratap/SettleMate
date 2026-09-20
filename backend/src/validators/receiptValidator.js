const { z } = require("zod");

const receiptSchema = z.object({
    merchant: z.string().nullable(),
    date: z.string().nullable(),

    items: z.array(
        z.object({
            name: z.string(),
            amount: z.number().nonnegative()
        })
    ),

    subtotal: z.number().nonnegative().nullable(),
    tax: z.number().nonnegative().nullable(),
    total: z.number().nonnegative()
});

module.exports = { receiptSchema };