const Group = require("../models/Group");
const Expense = require("../models/Expense");


const calculateBalances = (groupMembers, expenses) => {
   // 1. balances initialize
   const balances = {};

   groupMembers.forEach(member => {
    balances[member.toString()] = 0;
    });

   // 2. expenses process

   expenses.forEach(expense =>{
    balances[expense.paidBy.toString()] += expense.amount;
        expense.splitAmong.forEach(split => {
            balances[split.user.toString()] -= split.share ;

        });
   })

   // 3. return balances
   return balances;
};


const simplifyDebts = (balances) => {
    const creditors = [];
    const debtors = [];
    const transactions = [];
    const EPSILON = 0.000001;

    Object.entries(balances).forEach(([user,balance]) =>{
        if(balance > 0){
            creditors.push({
                user: user,
                balance: balance
            });
        }
        else if (balance < 0){
            debtors.push({
                user: user,
                balance: balance
            });
        }

    });

    creditors.sort((a,b) => {
        return b.balance - a.balance;
    });
    debtors.sort((a,b) =>{
        return a.balance - b.balance;
    })

    while(creditors.length > 0 && debtors.length > 0 ){
        const creditor = creditors[0];
        const debtor = debtors[0];
        const amount = Math.min(creditor.balance,Math.abs(debtor.balance));

        transactions.push({
            from: debtor.user,
            to: creditor.user,
            amount: amount
        })

        creditor.balance -= amount;
        debtor.balance += amount;

        if(Math.abs(creditor.balance) < EPSILON){
            creditors.shift();
        }
        if(Math.abs(debtor.balance) < EPSILON){
            debtors.shift();
        }

    }

   

 return transactions;



};

const getGroupSettlement = async ( groupId , requestingUserId) => {
        // Step 1: Verify group and membership
    const group = await Group.findOne({
        _id: groupId,
        members: {$in: [requestingUserId]}
    });
    
    
    if(!group){
        return { error: "GROUP_NOT_FOUND_OR_NOT_MEMBER" };
    }
    // Step 2: Get all expenses
    const expenses = await Expense.find({
        group : groupId
    });
        // Step 3: Calculate balances
    const balances = calculateBalances(group.members , expenses);
    
    // Step 4: Simplify debts
    const transactions = simplifyDebts(balances);

    // Step 5: Return transactions
    return {transactions};


}

module.exports = {getGroupSettlement}



