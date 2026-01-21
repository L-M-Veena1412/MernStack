import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

const STATUS = ['created','paid','failed','refunded']

export default function AdminOrders() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const INR = (v)=> `₹${(v ?? 0).toLocaleString('en-IN')}`

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await api.get('/api/orders/admin/all')
        setItems(res.data.items || [])
      } catch {
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (!user || user.role !== 'admin') return <p>Forbidden: admin only</p>

  const updateStatus = async (id, paymentStatus) => {
    setMsg('')
    try {
      const res = await api.put(`/api/orders/${id}/status`, { paymentStatus })
      setItems(prev => prev.map(o => o._id === id ? { ...o, paymentStatus: res.data.paymentStatus } : o))
      setMsg('Status updated 💖')
    } catch (e) {
      setMsg(e.response?.data?.message || 'Update failed')
    }
  }

  return (
    <div style={{ padding: 20, background: '#FFF0F6', minHeight: '100vh' }}>
      <h1 style={{ color: '#E80071' }}>Admin: Orders</h1>
      {msg && <p style={{ color: '#E80071' }}>{msg}</p>}
      {loading && <p>Loading...</p>}

      <div style={{ overflowX: 'auto', background: '#fff', padding: 12, borderRadius: 12, boxShadow: '0 10px 25px rgba(232,0,113,0.08)' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', minWidth: 700 }}>
          <thead style={{ background: '#FDE8F2' }}>
            <tr>
              <th style={thStyle}>Order ID</th>
              <th style={thStyle}>User</th>
              <th style={thStyle}>Total</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Created</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map(o => (
              <tr key={o._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={tdStyle}>{o._id}</td>
                <td style={tdStyle}>{o.user || '-'}</td>
                <td style={tdStyle}>{INR(o.total)}</td>
                <td style={tdStyle}>
                  <select
                    value={o.paymentStatus}
                    onChange={(e)=>setItems(prev=>prev.map(x=>x._id===o._id?{...x,paymentStatus:e.target.value}:x))}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      border: '1px solid #E80071',
                      color: '#E80071',
                      fontWeight: 500,
                    }}
                  >
                    {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td style={tdStyle}>{new Date(o.createdAt).toLocaleString()}</td>
                <td style={tdStyle}>
                  <button
                    onClick={()=>updateStatus(o._id, items.find(x=>x._id===o._id)?.paymentStatus)}
                    style={saveBtn}
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ---------- STYLES ---------- */

const thStyle = {
  textAlign:'left',
  padding: 10,
  fontWeight: 600,
  color: '#E80071',
}

const tdStyle = {
  padding: 10,
  color: '#333',
}

const saveBtn = {
  background: '#E80071',
  color: '#fff',
  border: 'none',
  padding: '6px 12px',
  borderRadius: 6,
  cursor: 'pointer',
}
