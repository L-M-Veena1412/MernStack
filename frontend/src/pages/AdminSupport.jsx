import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

const STATUSES = ['open','pending','closed']
const PRIORITIES = ['low','normal','high']

export default function AdminSupport() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/support/tickets')
      setItems(res.data.items || [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (!user || user.role !== 'admin') return <p>Forbidden: admin only</p>

  const updateTicket = async (id, patch) => {
    setMsg('')
    try {
      const res = await api.put(`/api/support/tickets/${id}`, patch)
      setItems(prev => prev.map(t => t._id === id ? res.data : t))
      setMsg('Ticket updated 💖')
    } catch (e) {
      setMsg(e.response?.data?.message || 'Update failed')
    }
  }

  return (
    <div style={{ padding: 20, background: '#F6E6EF', minHeight: '100vh' }}>
      <h1 style={{ color: '#E80071' }}>Admin: Support Tickets</h1>

      <div style={{ margin:'12px 0' }}>
        <button style={primaryBtn} onClick={load}>Refresh</button>
      </div>

      {msg && <p style={{ color: '#E80071' }}>{msg}</p>}
      {loading && <p>Loading...</p>}

      <div style={{ display:'grid', gap:16 }}>
        {items.map(t => (
          <div key={t._id} style={ticketCard}>
            <div style={{ display:'flex', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
              
              {/* Ticket Info */}
              <div>
                <div style={{ fontWeight:600, color:'#E80071' }}>{t.subject}</div>
                <div style={{ color:'#6b7280', fontSize:14 }}>#{t._id}</div>
                <div style={{ marginTop:6 }}>{t.message}</div>
                <div style={{ color:'#6b7280', marginTop:6, fontSize:14 }}>
                  From: {t.email || (t.user ? 'Registered user' : 'Guest')} · {new Date(t.createdAt).toLocaleString()}
                </div>
              </div>

              {/* Controls */}
              <div style={{ minWidth:260, display:'grid', gap:8 }}>
                <label style={labelStyle}>Status
                  <select
                    value={t.status}
                    onChange={(e)=>setItems(prev=>prev.map(x=>x._id===t._id?{...x,status:e.target.value}:x))}
                    style={selectStyle}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>

                <label style={labelStyle}>Priority
                  <select
                    value={t.priority}
                    onChange={(e)=>setItems(prev=>prev.map(x=>x._id===t._id?{...x,priority:e.target.value}:x))}
                    style={selectStyle}
                  >
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </label>

                <button
                  style={saveBtn}
                  onClick={()=>updateTicket(t._id, {
                    status: items.find(x=>x._id===t._id)?.status,
                    priority: items.find(x=>x._id===t._id)?.priority
                  })}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- STYLES ---------- */

const ticketCard = {
  background: '#FFF0F6',
  padding: 16,
  borderRadius: 12,
  boxShadow: '0 8px 20px rgba(232,0,113,0.12)',
}

const labelStyle = {
  fontWeight: 500,
  color: '#E80071',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
}

const selectStyle = {
  padding: '6px 8px',
  borderRadius: 6,
  border: '1px solid #E80071',
  color: '#E80071',
  fontWeight: 500,
}

const saveBtn = {
  background: '#E80071',
  color: '#fff',
  border: 'none',
  padding: '8px 12px',
  borderRadius: 6,
  cursor: 'pointer',
}

const primaryBtn = {
  background: '#E80071',
  color: '#fff',
  border: 'none',
  padding: '8px 14px',
  borderRadius: 8,
  cursor: 'pointer',
}
