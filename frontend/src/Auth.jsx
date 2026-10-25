import { useEffect, useState } from 'react'
import Login from './Login'
import Signup from './Signup'
import { apiRequest } from './api/api'
import Dashboard from './Dashboard'
import AuthLayout from './AuthLayout'


function Auth() {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'dark'
  )
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(true)

  function toggleTheme() {
  const newTheme = theme === 'dark' ? 'light' : 'dark'

  setTheme(newTheme)
  localStorage.setItem('theme', newTheme)
}

function handleLogout() {
  localStorage.removeItem('accessToken')
  setUser(null)
}


    useEffect(() => {
        document.body.className = theme
        }, [theme])

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem('accessToken')

      if (!token) {
        setLoading(false)
        return
      }

      try {
        const data = await apiRequest('/auth/me')
        setUser(data)
      } catch (error) {
        localStorage.removeItem('accessToken')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return <p>Checking authentication...</p>
  }

  if (user) {
    return (
        <Dashboard
        user={user}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
        />
    )
  }

    return (
        <AuthLayout
            showLogin={showLogin}
            onToggleAuth={() => setShowLogin(!showLogin)}
            theme={theme}
            onToggleTheme={toggleTheme}
        >
            {showLogin ? (
            <Login onLogin={setUser} />
            ) : (
            <Signup />
            )}
        </AuthLayout>
    )
}

export default Auth
