import { useEffect, useRef, useState } from 'react'
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

  const [selectedGroupId, setSelectedGroupId] = useState(
    localStorage.getItem('selectedGroupId')
  )

  const [groupNavigationTarget, setGroupNavigationTarget] = useState(null)

  const groupsSectionRef = useRef(null)
  const expensesSectionRef = useRef(null)
  const settlementsSectionRef = useRef(null)
  const settingsSectionRef = useRef(null)

  const [dashboardStats, setDashboardStats] = useState({
    totalExpenses: 0,
    youAreOwed: 0,
    youOwe: 0,
  })

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const data = await apiRequest('/dashboard')

        const fetchedGroups = data.groups || []

        setGroups(fetchedGroups)
        setGroupCount(fetchedGroups.length)

        setDashboardStats({
          totalExpenses: Number(data.totalExpenses || 0),
          youAreOwed: Number(data.youAreOwed || 0),
          youOwe: Number(data.youOwe || 0),
        })
      } catch (error) {
        console.error('Dashboard Data Error:', error)
      }
    }

    fetchDashboardData()
  }, [user])

  function goToDashboard() {
    localStorage.removeItem('selectedGroupId')
    setSelectedGroupId(null)
    setGroupNavigationTarget(null)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function goToGroups() {
    localStorage.removeItem('selectedGroupId')
    setSelectedGroupId(null)

    setTimeout(() => {
      groupsSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 0)
  }

  function goToDashboardSection(ref) {
    ref.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  // =========================
  // GROUP DETAILS VIEW
  // =========================

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
              onClick={goToDashboard}
            >
              <span>⌂</span>
              Dashboard
            </button>

            <button
              className="nav-item"
              onClick={goToGroups}
            >
              <span>◫</span>
              Groups
            </button>

            <button
              className="nav-item"
              onClick={() => {
                setGroupNavigationTarget('expenses')
              }}
            >
              <span>₹</span>
              Expenses
            </button>

            <button
              className="nav-item"
              onClick={() => {
                setGroupNavigationTarget('settlements')
              }}
            >
              <span>⇄</span>
              Settlements
            </button>

          </nav>

          <div className="sidebar-bottom">

            <button
              className="nav-item"
              onClick={() => {
                setGroupNavigationTarget('settings')
              }}
            >
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
          navigationTarget={groupNavigationTarget}
          onNavigationHandled={() => {
            setGroupNavigationTarget(null)
          }}
          onBack={() => {
            localStorage.removeItem('selectedGroupId')
            setSelectedGroupId(null)
            setGroupNavigationTarget(null)
          }}
        />

      </div>
    )
  }

  // =========================
  // DASHBOARD VIEW
  // =========================

  return (
    <div className="dashboard">

      <aside className="sidebar">

        <div className="brand">
          <div className="brand-logo">₹</div>
          <span>Settlemate</span>
        </div>

        <nav className="sidebar-nav">

          <button
            className="nav-item active"
            onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              })
            }}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className="nav-item"
            onClick={goToGroups}
          >
            <span>◫</span>
            Groups
          </button>

          <button
            className="nav-item"
            onClick={() => {
              goToDashboardSection(expensesSectionRef)
            }}
          >
            <span>₹</span>
            Expenses
          </button>

          <button
            className="nav-item"
            onClick={() => {
              goToDashboardSection(settlementsSectionRef)
            }}
          >
            <span>⇄</span>
            Settlements
          </button>

        </nav>

        <div className="sidebar-bottom">

          <button
            className="nav-item"
            onClick={() => {
              goToDashboardSection(settingsSectionRef)
            }}
          >
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

        <header
          className="dashboard-header"
          ref={settingsSectionRef}
        >

          <div>

            <p className="header-label">
              DASHBOARD
            </p>

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

            <div className="stat-icon">
              👥
            </div>

            <div>
              <p>Total Groups</p>
              <h2>{groupCount}</h2>
            </div>

          </div>

          <div
            className="stat-card"
            ref={expensesSectionRef}
          >

            <div className="stat-icon">
              ₹
            </div>

            <div>
              <p>Total Expenses</p>
              <h2>
                ₹{dashboardStats.totalExpenses.toFixed(2)}
              </h2>
            </div>

          </div>

          <div
            className="stat-card"
            ref={settlementsSectionRef}
          >

            <div className="stat-icon">
              ↑
            </div>

            <div>
              <p>You Are Owed</p>
              <h2>
                ₹{dashboardStats.youAreOwed.toFixed(2)}
              </h2>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon">
              ↓
            </div>

            <div>
              <p>You Owe</p>
              <h2>
                ₹{dashboardStats.youOwe.toFixed(2)}
              </h2>
            </div>

          </div>

        </section>

        <div ref={groupsSectionRef}>
          <Groups
            groups={groups}
            onGroupsChange={setGroupCount}
            onGroupsUpdate={setGroups}
            onOpenGroup={(groupId) => {
              localStorage.setItem('selectedGroupId', groupId)
              setSelectedGroupId(groupId)
            }}
          />
        </div>

      </main>

    </div>
  )
}

export default Dashboard