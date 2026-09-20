import { useState } from 'react'
import { apiRequest } from './api/api'

function AddExpense({ groupId, members, onExpenseAdded, onClose }) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState('')
  const [splitType, setSplitType] = useState('equal')
  const [customMode, setCustomMode] = useState('amount')
  const [selectedMembers, setSelectedMembers] = useState([])
  const [customShares, setCustomShares] = useState({})
  const [error, setError] = useState('')
  const [receiptError, setReceiptError] = useState('')
  const [saving, setSaving] = useState(false)

  const [receipt, setReceipt] = useState(null)
  const [extractedReceipt, setExtractedReceipt] = useState(null)
  const [isExtracting, setIsExtracting] = useState(false)

  function getMemberId(member) {
    return typeof member === 'object' ? member._id : member
  }

  function getMemberName(member) {
    if (typeof member === 'object') {
      return member.name || member.email || 'Member'
    }

    return member
  }

  function toggleMember(memberId) {
    setSelectedMembers((current) => {
      if (current.includes(memberId)) {
        const updated = current.filter((id) => id !== memberId)

        setCustomShares((shares) => {
          const updatedShares = { ...shares }
          delete updatedShares[memberId]
          return updatedShares
        })

        return updated
      }

      return [...current, memberId]
    })
  }

  function handleCustomShareChange(memberId, value) {
    setCustomShares((current) => ({
      ...current,
      [memberId]: value,
    }))
  }

  function getAutoShare(memberId) {
    if (selectedMembers.length <= 1) {
      return customMode === 'percentage'
        ? 100
        : Number(amount || 0)
    }

    const lastMember =
      selectedMembers[selectedMembers.length - 1]

    if (memberId !== lastMember) {
      return customShares[memberId] || ''
    }

    const enteredMembers =
      selectedMembers.slice(0, -1)

    const enteredTotal = enteredMembers.reduce(
      (total, id) =>
        total + Number(customShares[id] || 0),
      0
    )

    if (customMode === 'percentage') {
      return Math.max(0, 100 - enteredTotal)
    }

    return Math.max(
      0,
      Number(amount || 0) - enteredTotal
    )
  }

  async function handleReceiptUpload(e) {
    const file = e.target.files[0]

    if (!file) {
      return
    }

    setReceipt(file)
    setIsExtracting(true)
    setError('')
    setReceiptError('')

    try {
      const formData = new FormData()

      formData.append('receipt', file)

      const data = await apiRequest('/receipts/extract', {
        method: 'POST',
        body: formData,
      })

      console.log('Receipt extracted:', data)

        const extractedReceiptData = data.receipt

        if (extractedReceiptData) {
            setExtractedReceipt(extractedReceiptData)
            setDescription(extractedReceiptData.merchant || '')
            setAmount(extractedReceiptData.total?.toString() || '')
        }
    } catch (error) {
        setReceiptError(error.message)
    } finally {
      setIsExtracting(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const numericAmount = Number(amount)

    if (!description.trim()) {
      setError('Please enter an expense description')
      return
    }

    if (!numericAmount || numericAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (!paidBy) {
      setError('Please select who paid')
      return
    }

    if (selectedMembers.length === 0) {
      setError('Select at least one member for the split')
      return
    }

    let splitAmong

    if (splitType === 'equal') {
      splitAmong = selectedMembers.map((memberId) => ({
        user: memberId,
      }))
    } else {
      splitAmong = selectedMembers.map((memberId) => {
        const enteredValue = Number(
          getAutoShare(memberId)
        )

        const share =
          customMode === 'percentage'
            ? (numericAmount * enteredValue) / 100
            : enteredValue

        return {
          user: memberId,
          share: Number(share.toFixed(2)),
        }
      })

      const totalShares = splitAmong.reduce(
        (total, item) => total + item.share,
        0
      )

      if (splitAmong.some((item) => item.share <= 0)) {
        setError(
          'Every selected member must have a share greater than 0'
        )
        return
      }

      if (Math.abs(totalShares - numericAmount) > 0.01) {
        setError(
          `Custom shares must add up to ₹${numericAmount.toFixed(2)}`
        )
        return
      }
    }

    try {
      setSaving(true)

      const data = await apiRequest('/expenses', {
        method: 'POST',
        body: JSON.stringify({
          groupId,
          paidBy,
          amount: numericAmount,
          description: description.trim(),
          splitType,
          splitAmong,
        }),
      })

      onExpenseAdded(data.expense)
      onClose()
    } catch (error) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="create-group-modal add-expense-modal">

        <div className="expense-modal-topbar">
          <div className="modal-icon">₹</div>

          <button
            className="modal-close"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <h2>Add Expense</h2>

        <p>
          Record an expense and decide how it should be split.
        </p>

        {error && (
          <p className="groups-error expense-form-error">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>

          <label>Description</label>

          <input
            type="text"
            placeholder="e.g. Dinner, Hotel, Taxi"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
          />

          <label>Amount</label>

          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="₹0.00"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
          />

                  <label>Upload Receipt</label>

                  <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleReceiptUpload}
                  />

                  {receipt && (
                      <p>
                          Selected: {receipt.name}
                      </p>
                  )}

                  {isExtracting && (
                      <div className="receipt-status">
                          <span className="spinner"></span>
                          <span>Reading receipt... Please wait.</span>
                      </div>
                  )}

                  {!isExtracting && receiptError && (
                      <div className="receipt-error">
                          ⚠️ {receiptError}
                      </div>
                  )}

                  {!isExtracting && extractedReceipt && !receiptError && (
                      <div className="receipt-preview">
                          <strong>✓ Receipt details extracted</strong>

                          {extractedReceipt.items?.length > 0 && (
                              <div className="receipt-items">
                                  {extractedReceipt.items.map((item, index) => (
                                      <div key={index} className="receipt-item">
                                          <span>{item.name}</span>
                                          <span>₹{item.amount}</span>
                                      </div>
                                  ))}
                              </div>
                          )}

                          {extractedReceipt.subtotal !== null && (
                              <p>Subtotal: ₹{extractedReceipt.subtotal}</p>
                          )}

                          {extractedReceipt.tax !== null && (
                              <p>Tax: ₹{extractedReceipt.tax}</p>
                          )}

                          <p>
                              <strong>Total: ₹{extractedReceipt.total}</strong>
                          </p>
                      </div>
                  )}

          <label>Paid by</label>

          <select
            value={paidBy}
            onChange={(e) =>
              setPaidBy(e.target.value)
            }
          >
            <option value="">Select member</option>

            {members.map((member) => {
              const memberId = getMemberId(member)

              return (
                <option
                  key={memberId}
                  value={memberId}
                >
                  {getMemberName(member)}
                </option>
              )
            })}
          </select>

          <label>Split type</label>

          <div className="split-type-options">
            <button
              type="button"
              className={
                splitType === 'equal'
                  ? 'split-type-button active'
                  : 'split-type-button'
              }
              onClick={() =>
                setSplitType('equal')
              }
            >
              Equal
            </button>

            <button
              type="button"
              className={
                splitType === 'custom'
                  ? 'split-type-button active'
                  : 'split-type-button'
              }
              onClick={() =>
                setSplitType('custom')
              }
            >
              Custom
            </button>
          </div>

          {splitType === 'custom' && (
            <>
              <label>Custom split mode</label>

              <div className="split-type-options">
                <button
                  type="button"
                  className={
                    customMode === 'amount'
                      ? 'split-type-button active'
                      : 'split-type-button'
                  }
                  onClick={() =>
                    setCustomMode('amount')
                  }
                >
                  Amount ₹
                </button>

                <button
                  type="button"
                  className={
                    customMode === 'percentage'
                      ? 'split-type-button active'
                      : 'split-type-button'
                  }
                  onClick={() =>
                    setCustomMode('percentage')
                  }
                >
                  Percentage %
                </button>
              </div>
            </>
          )}

          <label>Split between</label>

          <div className="expense-members-list">
            {members.map((member) => {
              const memberId = getMemberId(member)

              const selected =
                selectedMembers.includes(memberId)

              return (
                <div
                  className="expense-member-option"
                  key={memberId}
                >
                  <label className="expense-member-checkbox">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() =>
                        toggleMember(memberId)
                      }
                    />

                    <span>
                      {getMemberName(member)}
                    </span>
                  </label>

                  {splitType === 'custom' &&
                    selected && (
                      <input
                        className="custom-share-input"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder={
                          customMode === 'percentage'
                            ? '%'
                            : '₹ share'
                        }
                        value={getAutoShare(memberId)}
                        readOnly={
                          selectedMembers[
                            selectedMembers.length - 1
                          ] === memberId
                        }
                        onChange={(e) =>
                          handleCustomShareChange(
                            memberId,
                            e.target.value
                          )
                        }
                      />
                    )}
                </div>
              )
            })}
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={saving || isExtracting}
          >
            {saving
              ? 'Saving...'
              : 'Add Expense'}
          </button>

        </form>
      </div>
    </div>
  )
}

export default AddExpense