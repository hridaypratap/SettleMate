const Expense = require("../models/Expense");
const Group = require("../models/Group");

const getDashboardData = async (userId) => {
    const start = Date.now();

    console.log("📊 Dashboard request started");

    const groups = await Group.find({
        members: userId
    })
        .select("_id name members createdBy")
        .lean();

    console.log(
        "⏱️ Groups query:",
        Date.now() - start,
        "ms"
    );

    if (groups.length === 0) {
        return {
            groups: [],
            totalExpenses: 0,
            youAreOwed: 0,
            youOwe: 0
        };
    }

    const groupIds = groups.map(group => group._id);

    const expenses = await Expense.find({
        group: { $in: groupIds }
    })
        .select("group paidBy amount splitAmong")
        .lean();

    console.log(
        "⏱️ Expenses query:",
        Date.now() - start,
        "ms"
    );

    const balancesByGroup = {};

    groups.forEach(group => {
        const balances = {};

        group.members.forEach(member => {
            balances[member.toString()] = 0;
        });

        balancesByGroup[group._id.toString()] = balances;
    });

    let totalExpenses = 0;

    expenses.forEach(expense => {
        totalExpenses += Number(expense.amount || 0);

        const groupBalances =
            balancesByGroup[expense.group.toString()];

        if (!groupBalances) {
            return;
        }

        const payerId = expense.paidBy.toString();

        if (groupBalances[payerId] !== undefined) {
            groupBalances[payerId] += Number(expense.amount || 0);
        }

        expense.splitAmong.forEach(split => {
            const userId = split.user.toString();

            if (groupBalances[userId] !== undefined) {
                groupBalances[userId] -= Number(split.share || 0);
            }
        });
    });

    let youAreOwed = 0;
    let youOwe = 0;

    const currentUserId = userId.toString();

    Object.values(balancesByGroup).forEach(balances => {
        const balance = Number(
            balances[currentUserId] || 0
        );

        if (balance > 0) {
            youAreOwed += balance;
        } else if (balance < 0) {
            youOwe += Math.abs(balance);
        }
    });

    return {
        groups,
        totalExpenses,
        youAreOwed,
        youOwe
    };
};

module.exports = {
    getDashboardData
};