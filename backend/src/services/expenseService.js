const Expense = require("../models/Expense");
const Group = require("../models/Group");

const createExpense = async (
    groupId,
    paidBy,
    amount,
    description,
    splitType,
    splitAmong,
    requestingUserId
) => {

    const group = await Group.findOne({
        _id: groupId,
        members: requestingUserId
    }).lean();

    if (!group) {
        return { error: "GROUP_NOT_FOUND_OR_NOT_MEMBER" };
    }

    const isPayerMember = group.members.some(
        member => member.toString() === paidBy
    );

    if (!isPayerMember) {
        return { error: "PAYER_NOT_MEMBER" };
    }

    const allSplitUsersAreMembers = splitAmong.every(
        split =>
            group.members.some(
                member => member.toString() === split.user
            )
    );

    if (!allSplitUsersAreMembers) {
        return { error: "SPLIT_USER_NOT_MEMBER" };
    }

    let finalSplitAmong;

    if (splitType === "equal") {
        const share = amount / splitAmong.length;

        finalSplitAmong = splitAmong.map(split => ({
            user: split.user,
            share
        }));
    } else {

        const totalShares = splitAmong.reduce(
            (total, split) => total + split.share,
            0
        );

        if (Math.abs(totalShares - amount) > 0.01) {
            return {
                error: "SHARES_DO_NOT_MATCH_AMOUNT"
            };
        }

        finalSplitAmong = splitAmong;
    }

    const expense = await Expense.create({
        group: groupId,
        paidBy,
        amount,
        description,
        splitType,
        splitAmong: finalSplitAmong
    });

    return { expense };
};


const getGroupExpenses = async (
    groupId,
    requestingUserId
) => {

    const group = await Group.findOne({
        _id: groupId,
        members: requestingUserId
    }).lean();

    if (!group) {
        return {
            error: "GROUP_NOT_FOUND_OR_NOT_MEMBER"
        };
    }

    const expenses = await Expense.find({
        group: groupId
    })
        .sort({ createdAt: -1 })
        .lean();

    return { expenses };
};


const calculateBalances = (
    groupMembers,
    expenses
) => {

    const balances = {};

    groupMembers.forEach(member => {
        balances[member.toString()] = 0;
    });

    expenses.forEach(expense => {

        balances[expense.paidBy.toString()] +=
            expense.amount;

        expense.splitAmong.forEach(split => {

            balances[split.user.toString()] -=
                split.share;

        });
    });

    return balances;
};


const getGroupBalances = async (
    groupId,
    requestingUserId
) => {

    // Run both independent database queries in parallel
    const [group, expenses] = await Promise.all([
        Group.findOne({
            _id: groupId,
            members: requestingUserId
        }).select("members").lean(),

        Expense.find({
            group: groupId
        })
            .select("paidBy amount splitAmong")
            .lean()
    ]);

    if (!group) {
        return {
            error: "GROUP_NOT_FOUND_OR_NOT_MEMBER"
        };
    }

    const balances = calculateBalances(
        group.members,
        expenses
    );

    const result = Object.entries(balances).map(
        ([user, balance]) => ({
            user,
            balance
        })
    );

    return {
        balances: result
    };
};


module.exports = {
    createExpense,
    getGroupExpenses,
    getGroupBalances
};