const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
    {
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true
        },

        paidBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        splitType: {
            type: String,
            enum: ["equal", "custom"],
            required: true
        },

        splitAmong: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },

                share: {
                    type: Number,
                    required: true,
                    min: 0
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

// Index used by group expense and balance queries
ExpenseSchema.index({ group: 1 });

module.exports = mongoose.model("Expense", ExpenseSchema);