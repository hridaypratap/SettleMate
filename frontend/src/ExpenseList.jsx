function ExpenseList({ expenses, onDeleteExpense, onEditExpense }) {
  return (
    <div className="expense-list">
      <h2>Expenses</h2>

      {expenses.length === 0 ? (
        <p className="empty-message">No expenses added yet.</p>
      ) : (
        expenses.map((expense, index) => (
          <div className="expense-card" key={index}>
            <div className="expense-info">
              <h3>{expense.title}</h3>
              <p>₹{expense.amount.toFixed(2)}</p>
            </div>

            <div className="expense-actions">
              <button onClick={() => onEditExpense(index)}>
                Edit
              </button>

              <button onClick={() => onDeleteExpense(index)}>
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default ExpenseList