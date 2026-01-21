import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Auth() {
  const { login, signup, loading } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setMsg('')
    if (mode === 'login') {
      const res = await login(email, password)
      if (res.ok) navigate('/')
      else setMsg(res.message)
    } else {
      const res = await signup(name, email, password)
      if (res.ok) navigate('/')
      else setMsg(res.message)
    }
  }

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          padding: 24,
          borderRadius: 8,
          background: '#ffffff',
          boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
        }}
      >
        <h1 style={{ marginBottom: 12 }}>
          {mode === 'login' ? 'Sign In' : 'Sign Up'}
        </h1>

        {/* MODE SWITCH */}
        <div style={{ marginBottom: 16 }}>
          <button
            disabled={mode === 'login'}
            onClick={() => setMode('login')}
            style={{
              marginRight: 8,
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #e5e7eb',
              background: mode === 'login' ? '#e5e7eb' : '#ffffff',
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>

          <button
            disabled={mode === 'signup'}
            onClick={() => setMode('signup')}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #e5e7eb',
              background: mode === 'signup' ? '#e5e7eb' : '#ffffff',
              cursor: 'pointer',
            }}
          >
            Sign Up
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={onSubmit}
          style={{ display: 'grid', gap: 12 }}
        >
          {mode === 'signup' && (
            <input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                padding: 10,
                borderRadius: 6,
                border: '1px solid #d1d5db',
              }}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: 10,
              borderRadius: 6,
              border: '1px solid #d1d5db',
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: 10,
              borderRadius: 6,
              border: '1px solid #d1d5db',
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 6,
              padding: '10px 0',
              borderRadius: 6,
              border: 'none',
              background: '#111827',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            {loading
              ? 'Please wait...'
              : mode === 'login'
              ? 'Sign In'
              : 'Sign Up'}
          </button>

          {msg && (
            <p style={{ color: '#dc2626', fontSize: 14 }}>
              {msg}
            </p>
          )}
        </form>

        {mode === 'login' && (
          <div style={{ marginTop: 16, color: '#6b7280', fontSize: 14 }}>
            Demo admin: <br />
            <strong>admin@demo.com</strong> / <strong>Passw0rd!</strong>
          </div>
        )}
      </div>
    </div>
  )
}
