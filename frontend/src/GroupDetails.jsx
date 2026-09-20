import { useEffect, useState } from 'react'
import { apiRequest } from './api/api'
import AddExpense from './AddExpense'

function GroupDetails({ groupId, user ,onBack }) {
    const [group, setGroup] = useState(null)
    const [expenses, setExpenses] = useState([])
    const [balances, setBalances] = useState([])
    const [settlements, setSettlements] = useState([])
    const [settlementsLoading, setSettlementsLoading] = useState(true)
    const [balancesLoading, setBalancesLoading] = useState(true)
    const [loading, setLoading] = useState(true)
    const [expensesLoading, setExpensesLoading] = useState(true)
    const [error, setError] = useState('')
    const [showAddMember, setShowAddMember] = useState(false)
    const [showAddExpense, setShowAddExpense] = useState(false)
    const [showDeleteGroup, setShowDeleteGroup] = useState(false)

    const [email, setEmail] = useState('')
    const [addingMember, setAddingMember] = useState(false)
    const [memberToRemove, setMemberToRemove] = useState(null)

    async function fetchGroup() {
        try {
            setLoading(true)
            setError('')

            const data = await apiRequest(`/groups/${groupId}`)

            setGroup(data.group)
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    async function fetchExpenses() {
        try {
            setExpensesLoading(true)

            const data = await apiRequest(
                `/expenses/group/${groupId}`
            )

            setExpenses(data.expenses || [])
        } catch (error) {
            setError(error.message)
        } finally {
            setExpensesLoading(false)
        }
    }

    async function fetchBalances() {
        try {
            setBalancesLoading(true)

            const data = await apiRequest(
                `/expenses/group/${groupId}/balances`
            )

            setBalances(data.balances || [])
        } catch (error) {
            setError(error.message)
        } finally {
            setBalancesLoading(false)
        }
    }

    async function fetchSettlements() {
    try {
        setSettlementsLoading(true)

        const data = await apiRequest(
            `/settlements/group/${groupId}/settlement`
        )

        setSettlements(data.transactions ||  [])
    } catch (error) {
        setError(error.message)
    } finally {
        setSettlementsLoading(false)
    }
    }

    useEffect(() => {
        fetchGroup()
        fetchExpenses()
        fetchBalances()
        fetchSettlements()
    }, [groupId])

    async function handleAddMember(e) {
        e.preventDefault()

        if (email.trim() === '') {
            setError('Please enter an email address')
            return
        }

        try {
            setAddingMember(true)
            setError('')

            const data = await apiRequest(
                `/groups/${groupId}/members`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        email: email.trim(),
                    }),
                }
            )

            setGroup(data.group)
            setEmail('')
            setShowAddMember(false)
        } catch (error) {
            setError(error.message)
        } finally {
            setAddingMember(false)
        }
    }

    async function handleRemoveMember(memberId) {
    setMemberToRemove(memberId)
    }

    async function handleDeleteGroup() {
    try {
        setError('')

        await apiRequest(`/groups/${groupId}`, {
            method: 'DELETE',
        })

        onBack()
    } catch (error) {
        setError(error.message)
    }
    }

    function handleExpenseAdded(newExpense) {
        setExpenses((current) => [
            newExpense,
            ...current,
        ])
    }

    function getMemberId(member) {
        return typeof member === 'object'
            ? member._id
            : member
    }

    function getMemberName(member) {
        if (typeof member === 'object') {
            return member.name || member.email || 'Member'
        }

        return member
    }

    function getUserId() {
    const currentUser = group?.members?.find(
        (member) => member.email === user?.email
    )

    return currentUser?._id
    }

    function getPaidByName(paidBy) {
        const paidById =
            typeof paidBy === 'object'
                ? paidBy._id
                : paidBy

        const member = group?.members?.find(
            (item) => getMemberId(item) === paidById
        )

        return member ? getMemberName(member) : 'Member'
    }

    function getExpenseTotal() {
        return expenses.reduce(
            (total, expense) => total + Number(expense.amount || 0),
            0
        )
    }

    if (loading) {
        return (
            <main className="dashboard-main">
                <p>Loading group...</p>
            </main>
        )
    }

    if (error && !group) {
        return (
            <main className="dashboard-main">
                <button
                    className="back-button"
                    onClick={onBack}
                >
                    ← Back to Dashboard
                </button>

                <p className="groups-error">{error}</p>
            </main>
        )
    }

    return (
        <main className="dashboard-main">
            <button
                className="back-button"
                onClick={onBack}
            >
                ← Back to Dashboard
            </button>

            <header className="group-details-header">
                <div>
                    <span className="section-eyebrow">
                        GROUP
                    </span>

                    <h1>{group.name}</h1>

                    <p>
                        {group.members?.length || 0} members
                    </p>
                </div>

                <div className="group-header-actions">

                {user._id === group.createdBy && (
                    <button
                        className="danger-outline-button"
                        onClick={() => setShowDeleteGroup(true)}
                    >
                        Delete Group
                    </button>
                )}

                
                    <button
                        className="secondary-button"
                        onClick={() => setShowAddMember(true)}
                    >
                        + Add Member
                    </button>

                    <button
                        className="primary-button"
                        onClick={() => setShowAddExpense(true)}
                    >
                        + Add Expense
                    </button>
                </div>
            </header>

            {error && (
                <p className="groups-error">{error}</p>
            )}

            <section className="group-details-grid">
                <div className="dashboard-section">
                    <div className="section-header">
                        <div>
                            <h2>Members</h2>
                            <p>People in this group.</p>
                        </div>
                    </div>

                    <div className="members-list">
                        {group.members?.map((member) => {
                            const memberId = getMemberId(member)
                            const memberName = getMemberName(member)

                            return (
                                <div
                                    className="member-row"
                                    key={memberId}
                                >
                                    <div className="member-avatar">
                                        {memberName
                                            ? memberName
                                                .charAt(0)
                                                .toUpperCase()
                                            : '?'}
                                    </div>

                                    <div className="member-info">
                                        <strong>{memberName}</strong>
                                    </div>

                                    {user._id !== memberId && user._id === group.createdBy && (
                                        <button
                                            className="remove-member-button"
                                            onClick={() => handleRemoveMember(memberId)}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="dashboard-section">
                    <div className="section-header">
                        <div>
                            <h2>Group Summary</h2>
                            <p>Expense overview.</p>
                        </div>
                    </div>

                    <div className="group-summary-placeholder">
                        <div>
                            <span>Total Expenses</span>
                            <strong>
                                ₹{getExpenseTotal().toFixed(2)}
                            </strong>
                        </div>

                        <div>
                            <span>Expenses Count</span>
                            <strong>
                                {expenses.length}
                            </strong>
                        </div>

                        <div>
                            <span>Members</span>
                            <strong>
                                {group.members?.length || 0}
                            </strong>
                        </div>
                    </div>
                </div>

                <div className="dashboard-section">
                    <div className="section-header">
                        <div>
                            <h2>Balances</h2>
                            <p>Who owes and who is owed.</p>
                        </div>
                    </div>

                    {balancesLoading ? (
                        <p>Loading balances...</p>
                    ) : (
                        <div className="members-list">
                            {balances.map((item) => {
                                const isCurrentUser = item.user === getUserId()

                                const member = group.members?.find(
                                    (member) =>
                                        getMemberId(member) === item.user
                                )

                                const name = member
                                    ? getMemberName(member)
                                    : 'Member'

                                const balance = Number(item.balance || 0)

                                return (
                                    <div
                                        className="member-row"
                                        key={item.user}
                                    >
                                        <div className="member-avatar">
                                            {name.charAt(0).toUpperCase()}
                                        </div>

                                        <div className="member-info">
                                            <strong>{name}</strong>

                                            <span
                                                style={{
                                                    color:
                                                        !isCurrentUser
                                                            ? '#64748b'
                                                            : balance > 0
                                                                ? '#16a34a'
                                                                : balance < 0
                                                                    ? '#dc2626'
                                                                    : '#64748b',
                                                    fontWeight: 600
                                                }}
                                            >
                                                {isCurrentUser
                                                    ? balance > 0
                                                        ? `You are owed ₹${balance.toFixed(2)}`
                                                        : balance < 0
                                                            ? `You owe ₹${Math.abs(balance).toFixed(2)}`
                                                            : 'You are settled'
                                                    : balance > 0
                                                        ? `Receives ₹${balance.toFixed(2)}`
                                                        : balance < 0
                                                            ? `Pays ₹${Math.abs(balance).toFixed(2)}`
                                                            : 'Settled'}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

            </section>

            <section className="dashboard-section">
                <div className="section-header">
                    <div>
                        <h3>💸 Settlements</h3>
                        <p>Minimum transactions needed to settle the group.</p>
                    </div>
                </div>

                {settlementsLoading ? (
                    <p>Loading settlements...</p>
                ) : settlements.length === 0 ? (
                    <p>Everyone is settled up 🎉</p>
                ) : (
                    <div className="settlement-list">
                        {settlements.map((settlement, index) => (
                            <div className="member-row" key={index}>
                                <div className="member-avatar">₹</div>

                                <div className="member-info">
                                    <strong>
                                        {getMemberName(
                                            group.members.find(
                                                (member) =>
                                                    getMemberId(member) === settlement.from
                                            )
                                        )}
                                        {' → '}
                                        {getMemberName(
                                            group.members.find(
                                                (member) =>
                                                    getMemberId(member) === settlement.to
                                            )
                                        )}
                                    </strong>

                                    <span>
                                        Pay ₹{Number(settlement.amount).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="dashboard-section group-expenses-section">
                <div className="section-header">
                    <div>
                        <h2>Recent Expenses</h2>

                        <p>
                            Expenses shared within this group.
                        </p>
                    </div>

                    <button
                        className="primary-button"
                        onClick={() => setShowAddExpense(true)}
                    >
                        + Add Expense
                    </button>
                </div>

                {expensesLoading ? (
                    <div className="empty-groups">
                        <p>Loading expenses...</p>
                    </div>
                ) : expenses.length === 0 ? (
                    <div className="empty-groups">
                        <div className="empty-icon">₹</div>

                        <h3>No expenses yet</h3>

                        <p>
                            Add your first expense to start
                            tracking who owes whom.
                        </p>
                    </div>
                ) : (
                    <div className="expense-list">
                        {expenses.map((expense) => (
                            <div
                                className="expense-card"
                                key={expense._id}
                            >
                                <div className="expense-card-main">
                                    <div className="expense-icon">
                                        ₹
                                    </div>

                                    <div>
                                        <h3>
                                            {expense.description}
                                        </h3>

                                        <p>
                                            Paid by{' '}
                                            <strong>
                                                {getPaidByName(
                                                    expense.paidBy
                                                )}
                                            </strong>
                                        </p>
                                    </div>
                                </div>

                                <div className="expense-card-right">
                                    <strong>
                                        ₹{Number(
                                            expense.amount
                                        ).toFixed(2)}
                                    </strong>

                                    <span>
                                        {expense.splitType ===
                                            'equal'
                                            ? 'Equal split'
                                            : 'Custom split'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {showAddExpense && (
                <AddExpense
                    groupId={groupId}
                    members={group.members || []}
                    onExpenseAdded={handleExpenseAdded}
                    onClose={() =>
                        setShowAddExpense(false)
                    }
                />
            )}

            {showAddMember && (
                <div className="modal-overlay">
                    <div className="create-group-modal">
                        <button
                            className="modal-close"
                            onClick={() =>
                                setShowAddMember(false)
                            }
                            type="button"
                        >
                            ×
                        </button>

                        <div className="modal-icon">+</div>

                        <h2>Add a member</h2>

                        <p>
                            Enter the user's email to add them
                            to this group.
                        </p>

                        <form onSubmit={handleAddMember}>
                            <label>Email Address</label>

                            <input
                                type="email"
                                placeholder="Enter user's email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                            />

                            <button
                                type="submit"
                                className="auth-submit"
                                disabled={addingMember}
                            >
                                {addingMember
                                    ? 'Adding...'
                                    : 'Add Member'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {memberToRemove && (
                <div className="modal-overlay">
                    <div className="create-group-modal">
                        <div className="modal-icon">!</div>

                        <h2>Remove Member?</h2>

                        <p>
                            Are you sure you want to remove this member
                            from the group?
                        </p>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() => setMemberToRemove(null)}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="danger-button"
                                onClick={async () => {
                                    try {
                                        setError('')

                                        const data = await apiRequest(
                                            `/groups/${groupId}/members/${memberToRemove}`,
                                            {
                                                method: 'DELETE',
                                            }
                                        )

                                        setGroup(data.group)
                                        setMemberToRemove(null)
                                    } catch (error) {
                                        setError(error.message)
                                    }
                                }}
                            >
                                Remove Member
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteGroup && (
                <div className="modal-overlay">
                    <div className="create-group-modal">
                        <div className="modal-icon">!</div>

                        <h2>Delete Group?</h2>

                        <p>
                            This will permanently delete the group and all
                            its expenses. This action cannot be undone.
                        </p>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() => setShowDeleteGroup(false)}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="danger-button"
                                onClick={async () => {
                                    await handleDeleteGroup()
                                    setShowDeleteGroup(false)
                                }}
                            >
                                Delete Group
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </main>
    )
}

export default GroupDetails