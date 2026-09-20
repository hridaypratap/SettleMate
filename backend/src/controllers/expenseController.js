const {createExpense,getGroupExpenses,getGroupBalances} = require("../services/expenseService");

const { createExpenseSchema} = require("../validators/expenseValidator");


const createExpenseController = async (req, res) => {

    try {

        const validation = createExpenseSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                message: "Invalid Expense Data",
                errors: validation.error.issues
            });
        }

        const {
            groupId,
            paidBy,
            amount,
            description,
            splitType,
            splitAmong
        } = validation.data;

        const result = await createExpense(
            groupId,
            paidBy,
            amount,
            description,
            splitType,
            splitAmong,
            req.userId
        );

        if (result.error === "GROUP_NOT_FOUND_OR_NOT_MEMBER") {
            return res.status(404).json({
                message: "Group not found or you are not a member"
            });
        }

        if (result.error === "PAYER_NOT_MEMBER") {
            return res.status(403).json({
                message: "Payer is not a member of this group"
            });
        }

        if (result.error === "SPLIT_USER_NOT_MEMBER") {
            return res.status(403).json({
                message: "One or more split users are not group members"
            });
        }

        if (result.error === "SHARES_DO_NOT_MATCH_AMOUNT") {
            return res.status(400).json({
                message: "Custom shares must equal the total expense amount"
            });
        }

        return res.status(201).json({
            message: "Expense created successfully",
            expense: result.expense
        });

    } catch (error) {

        console.error("Create Expense Error", error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};


const getGroupExpensesController = async (req, res) => {

    try {

        const { groupId } = req.params;

        const result = await getGroupExpenses(
            groupId,
            req.userId
        );

        if (result.error === "GROUP_NOT_FOUND_OR_NOT_MEMBER") {
            return res.status(404).json({
                message: "Group not found or you are not a member"
            });
        }

        return res.status(200).json({
            message: "Expenses fetched successfully",
            expenses: result.expenses
        });

    } catch (error) {

        console.error("Get Group Expenses Error", error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

const getGroupBalancesController = async (req, res) =>{
    try {
        const {groupId} =req.params;

        const result = await getGroupBalances(groupId,req.userId);

        if (result.error === "GROUP_NOT_FOUND_OR_NOT_MEMBER") {
            return res.status(404).json({
                message: "Group not found or you are not a member"
            });
        }

        return res.status(200).json({
            message: "Balances calculated successfully",
            balances: result.balances
        });
        
    } catch (error) {
        
        console.error("Get Group Balances Error", error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}


module.exports = {createExpenseController,getGroupExpensesController , getGroupBalancesController};