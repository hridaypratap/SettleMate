import { useState } from 'react'
import { apiRequest } from './api/api'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()

    setMessage('')
    setError('')

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      })

     localStorage.setItem('accessToken', data.accessToken)

        const user = await apiRequest('/auth/me')

        onLogin(user)

        setMessage(data.message)

        setEmail('')
        setPassword('')
    } catch (error) {
      setError(error.message)
    }
  }

  return (
  <div className="auth-form-content">

    <div className="auth-form-heading">
      <span className="form-eyebrow">WELCOME BACK</span>

      <h2>Sign in to Settlemate</h2>

      <p>
        Continue managing your shared expenses.
      </p>
    </div>

    <form onSubmit={handleLogin}>

      <label>Email</label>

      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label>Password</label>

      <input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit" className="auth-submit">
        Sign in
      </button>

      {message && (
        <p className="auth-success">{message}</p>
      )}

      {error && (
        <p className="auth-error">{error}</p>
      )}

    </form>

  </div>
)
}

export default Login