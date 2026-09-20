import { useState } from 'react'
import { apiRequest } from './api/api'

function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSignup(e) {
    e.preventDefault()

    setMessage('')
    setError('')

    try {
      const data = await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      setMessage(data.message)
      setName('')
      setEmail('')
      setPassword('')
    } catch (error) {
      setError(error.message)
    }
  }

  return (
  <div className="auth-form-content">

    <div className="auth-form-heading">
      <span className="form-eyebrow">GET STARTED</span>

      <h2>Create your account</h2>

      <p>
        Start splitting expenses without the headache.
      </p>
    </div>

    <form onSubmit={handleSignup}>

      <label>Name</label>

      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

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
        placeholder="Create a password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit" className="auth-submit">
        Create account
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

export default Signup