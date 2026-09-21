import { useEffect, useState } from 'react'
import Groups from './Groups'
import GroupDetails from './GroupDetails'
import { apiRequest } from './api/api'

function Dashboard({
  user,
  onLogout,
  theme,
  onToggleTheme,
}) {
  const [groups, setGroups] = useState([])
  const [groupCount, setGroupCount] = useState(0)
  const [selectedGroupId, setSelectedGroupId] = useState(null)

  const [dashboardStats, setDashboardStats] = useState({
    totalExpenses: 0,
    youAreOwed: 0,
    youOwe: 0,
  })

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const data = await apiRequest('/groups')
        const fetchedGroups = data.groups || []

        setGroups(fetchedGroups)
        setGroupCount(fetchedGroups.length)

        const results = await Promise.all(
          fetchedGroups.map(async (group) => {
            const [expensesData, balancesData] =
              await Promise.all([
                apiRequest(`/expenses/group/${group._id}`),
                apiRequest(
                  `/expenses/group/${group._id}/balances`
                ),
              ])

            return {
              expenses: expensesData.expenses || [],
              balances: balancesData.balances || [],
            }
          })
        )

        let totalExpenses = 0
        let youAreOwed = 0
        let youOwe = 0

        for (const result of results) {
          totalExpenses += result.expenses.reduce(
            (total, expense) =>
              total + Number(expense.amount || 0),
            0
          )

          const currentBalance = result.balances.find(
            (item) =>
              String(item.user) === String(user._id)
          )

          const balance = Number(
            currentBalance?.balance || 0
          )

          if (balance > 0) {
            youAreOwed += balance
          } else if (balance < 0) {
            youOwe += Math.abs(balance)
          }
        }

        setDashboardStats({
          totalExpenses,
          youAreOwed,
          youOwe,
        })
      } catch (error) {
        console.error(
          'Dashboard Stats Error:',
          error
        )
      }
    }

    fetchDashboardStats()
  }, [user])

  if (selectedGroupId) {
    return (
      <div className="dashboard">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-logo">₹</div>
            <span>Settlemate</span>
          </div>

          <nav className="sidebar-nav">
            <button
              className="nav-item"
              onClick={() => setSelectedGroupId(null)}
            >
              <span>⌂</span>
              Dashboard
            </button>

            <button className="nav-item active">
              <span>◫</span>
              Groups
            </button>

            <button className="nav-item">
              <span>₹</span>
              Expenses
            </button>

            <button className="nav-item">
              <span>⇄</span>
              Settlements
            </button>
          </nav>

          <div className="sidebar-bottom">
            <button className="nav-item">
              <span>⚙</span>
              Settings
            </button>

            <button
              className="logout-button"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        </aside>

        <GroupDetails
          groupId={selectedGroupId}
          user={user}
          onBack={() => setSelectedGroupId(null)}
        />
      </div>
    )
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">₹</div>
          <span>Settlemate</span>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active">
            <span>⌂</span>
            Dashboard
          </button>

          <button className="nav-item">
            <span>◫</span>
            Groups
          </button>

          <button className="nav-item">
            <span>₹</span>
            Expenses
          </button>

          <button className="nav-item">
            <span>⇄</span>
            Settlements
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item">
            <span>⚙</span>
            Settings
          </button>

          <button
            className="logout-button"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="header-label">DASHBOARD</p>

            <h1>
              Good to see you, {user.name} 👋
            </h1>

            <p className="header-subtitle">
              Keep track of your shared expenses and settlements.
            </p>
          </div>

          <div className="header-actions">
            <button
              className="theme-toggle"
              onClick={onToggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <div className="user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div>
              <p>Total Groups</p>
              <h2>{groupCount}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">₹</div>
            <div>
              <p>Total Expenses</p>
              <h2>
                ₹{dashboardStats.totalExpenses.toFixed(2)}
              </h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">↑</div>
            <div>
              <p>You Are Owed</p>
              <h2>
                ₹{dashboardStats.youAreOwed.toFixed(2)}
              </h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">↓</div>
            <div>
              <p>You Owe</p>
              <h2>
                ₹{dashboardStats.youOwe.toFixed(2)}
              </h2>
            </div>
          </div>
        </section>

        <Groups
          groups={groups}
          onGroupsChange={setGroupCount}
          onGroupsUpdate={setGroups}
          onOpenGroup={setSelectedGroupId}
        />
      </main>
    </div>
  )
}

export default Dashboard