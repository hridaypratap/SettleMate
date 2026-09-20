// import { useState } from 'react'
// import ExpenseForm from './ExpenseForm'
// import ExpenseList from './ExpenseList'

// function App() {
//   const [expenses, setExpenses] = useState([])
//     const totalExpenses = expenses.reduce(
//     (total, expense) => total + expense.amount,
//     0
//   )

//   const expenseCount = expenses.length

//   function addExpense(newExpense) {
//     setExpenses([...expenses, newExpense])
//   }

//   function deleteExpense(index) {
//   setExpenses(expenses.filter((_, i) => i !== index))
//   }

//   function editExpense(index) {
//   const newTitle = prompt('Enter new title')
//   const newAmount = prompt('Enter new amount')

//   if (newTitle === null || newAmount === null) {
//     return
//   }

//   if (newTitle.trim() === '' || newAmount === '') {
//     alert('Title and amount are required')
//     return
//   }

//   const updatedExpenses = [...expenses]

//   updatedExpenses[index] = {
//     title: newTitle.trim(),
//     amount: Number(newAmount)
//   }

//   setExpenses(updatedExpenses)
// }

//   return (
//     <div>
//       <h1>Expense Splitter</h1>
//       <div className="summary">
//             <div className="summary-card">
//               <span>Total Expenses</span>
//               <strong>₹{totalExpenses.toFixed(2)}</strong>
//            </div>

//             <div className="summary-card">
//               <span>Number of Expenses</span>
//               <strong>{expenseCount}</strong>
//            </div>
//      </div>

//       <ExpenseForm onAddExpense={addExpense} />

//       <ExpenseList 
//       expenses={expenses}
//       onDeleteExpense={deleteExpense}
//       onEditExpense={editExpense}
//        />
//     </div>
//   )
// }

// export default App





// import Login from './Login'

// function App() {
//   return <Login />
// }

// export default App

import Auth from './Auth'

function App() {
  return <Auth />
}

export default App