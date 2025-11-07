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
    <div>
      <h1>{mode === 'login' ? 'Sign In' : 'Sign Up'}</h1>
      <div style={{ margin: '8px 0' }}>
        <button disabled={mode==='login'} onClick={() => setMode('login')}>Sign In</button>{' '}
        <button disabled={mode==='signup'} onClick={() => setMode('signup')}>Sign Up</button>
      </div>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10, maxWidth: 420 }}>
        {mode === 'signup' && (
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        )}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}</button>
        {msg && <p>{msg}</p>}
      </form>
      {mode === 'login' && (
        <div style={{ marginTop: 16, color: '#6b7280' }}>
          Demo admin: admin@demo.com / Passw0rd!
        </div>
      )}
    </div>
  )
}
