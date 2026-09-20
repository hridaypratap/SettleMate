const Expense = require("../models/Expense");
const Group = require("../models/Group");

const createExpense = async(
    groupId,
    paidBy,
    amount,
    description,
    splitType,
    splitAmong,
    requestingUserId 
) => {

    // 1. Check that group exists AND requesting user is a member
        const group = await Group.findOne({
            _id:groupId,
            members: requestingUserId
        });

        if (!group){
            return{ error : "GROUP_NOT_FOUND_OR_NOT_MEMBER" }
        }
    // 2. Check that payer is a member of the group
        const isPayerMember = group.members.some(member => member.toString() === paidBy)
        
        if(!isPayerMember){
            return {error: "PAYER_NOT_MEMBER"}
        }
    // 3. Check that every person in splitAmong is a group member
        const allSplitUsersAreMembers = splitAmong.every(split => group.members.some(member => member.toString() === split.user));

         if (!allSplitUsersAreMembers) {
        return { error: "SPLIT_USER_NOT_MEMBER" };
        }
    // 4. Calculate / validate shares
        let finalSplitAmong;
        if(splitType === "equal"){
            const share = amount/splitAmong.length;

            finalSplitAmong = splitAmong.map(split => ({
                user: split.user,
                share
            }));
        }else{
            const totalShares = splitAmong.reduce(
                (total,split) => total + split.share,
                0
            );
            if (Math.abs(totalShares - amount) > 0.01) {
                return { error: "SHARES_DO_NOT_MATCH_AMOUNT" };
            }
            finalSplitAmong = splitAmong;
        }

        //Create Expense
        const expense = await Expense.create({
            group: groupId,
            paidBy,
            amount,
            description,
            splitType,
            splitAmong: finalSplitAmong

        });
        return {expense};

}

const getGroupExpenses = async (groupId, requestingUserId) => {

    // Only group members can see expenses
    const group = await Group.findOne({
        _id: groupId,
        members: requestingUserId
    });

    if (!group) {
        return { error: "GROUP_NOT_FOUND_OR_NOT_MEMBER" };
    }

    const expenses = await Expense.find({
        group: groupId
    }).sort({ createdAt: -1 });

    return { expenses };
};


const calculateBalances = (groupMembers, expenses) => {
   // 1. balances initialize
   const balances = {};

   groupMembers.forEach(member => {
    balances[member.toString()] = 0;
    });

   // 2. expenses process

   expenses.forEach(expense =>{
    balances[expense.paidBy] += expense.amount;
        expense.splitAmong.forEach(split => {
            balances[split.user] -= split.share ;

        });
   })

   // 3. return balances
   return balances;
};

const getGroupBalances = async (groupId, requestingUserId) => {

    
    // 1. verify requester is a group member
    
    const group = await Group.findOne({
    _id: groupId,
    members: { $in: [requestingUserId] }
    });
    
    
    if (!group) {
        return { error: "GROUP_NOT_FOUND_OR_NOT_MEMBER" }
    }

    // 2. Get all expenses
    const expenses = await Expense.find({ group: groupId })

    const balances = calculateBalances(group.members , expenses);

    // 5.

    const result = Object.entries(balances).map(
        ([user,balance]) =>({user,balance})

    )

    return{balances: result}


}





module.exports = {createExpense,getGroupExpenses,getGroupBalances};