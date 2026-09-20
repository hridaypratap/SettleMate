import { useState } from 'react'
import { apiRequest } from './api/api'

function ExpenseForm({ onAddExpense }) {
  const [amount, setAmount] = useState('')
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState(null)
  const [isExtracting, setIsExtracting] = useState(false)

  async function handleReceiptUpload(e) {
    const file = e.target.files[0]

    if (!file) return

    setReceipt(file)
    setIsExtracting(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('receipt', file)

      const data = await apiRequest('/receipts/extract', {
        method: 'POST',
        body: formData,
      })

      console.log('Receipt extracted:', data)

    } catch (error) {
      setError(error.message)
    } finally {
      setIsExtracting(false)
    }
  }


  function handleAddExpense(e) {
    e.preventDefault()

    setError('')

    if (title.trim() === '') {
      setError('Please enter expense title')
      return
    }

    if (amount === '') {
      setError('Please enter expense amount')
      return
    }

    if (Number(amount) <= 0) {
      setError('Amount must be greater than 0')
      return
    }

    onAddExpense({
      title: title.trim(),
      amount: Number(amount)
    })

    setTitle('')
    setAmount('')
  }

  return (
    <form onSubmit={handleAddExpense}>
      <h2>Add New Expense</h2>

      <div>
        <label>Upload Receipt</label>

        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleReceiptUpload}
        />

        {isExtracting && <p>Reading receipt...</p>}
      </div>

      <div className="form-fields">
        <input
          type="text"
          placeholder="Enter expense title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <button type="submit">
          Add Expense
        </button>
      </div>

      {error && (
        <p>{error}</p>
      )}
    </form>
  )
}

export default ExpenseForm