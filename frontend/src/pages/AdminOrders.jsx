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
      setMsg('Status updated')
    } catch (e) {
      setMsg(e.response?.data?.message || 'Update failed')
    }
  }

  return (
    <div>
      <h1>Admin: Orders</h1>
      {msg && <p>{msg}</p>}
      {loading && <p>Loading...</p>}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width:'100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign:'left', borderBottom:'1px solid #e5e7eb', padding:8 }}>Order ID</th>
              <th style={{ textAlign:'left', borderBottom:'1px solid #e5e7eb', padding:8 }}>User</th>
              <th style={{ textAlign:'left', borderBottom:'1px solid #e5e7eb', padding:8 }}>Total</th>
              <th style={{ textAlign:'left', borderBottom:'1px solid #e5e7eb', padding:8 }}>Status</th>
              <th style={{ textAlign:'left', borderBottom:'1px solid #e5e7eb', padding:8 }}>Created</th>
              <th style={{ textAlign:'left', borderBottom:'1px solid #e5e7eb', padding:8 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map(o => (
              <tr key={o._id}>
                <td style={{ padding:8, borderBottom:'1px solid #f3f4f6' }}>{o._id}</td>
                <td style={{ padding:8, borderBottom:'1px solid #f3f4f6' }}>{o.user || '-'}</td>
                <td style={{ padding:8, borderBottom:'1px solid #f3f4f6' }}>{INR(o.total)}</td>
                <td style={{ padding:8, borderBottom:'1px solid #f3f4f6' }}>
                  <select value={o.paymentStatus} onChange={(e)=>setItems(prev=>prev.map(x=>x._id===o._id?{...x,paymentStatus:e.target.value}:x))}>
                    {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td style={{ padding:8, borderBottom:'1px solid #f3f4f6' }}>{new Date(o.createdAt).toLocaleString()}</td>
                <td style={{ padding:8, borderBottom:'1px solid #f3f4f6' }}>
                  <button onClick={()=>updateStatus(o._id, items.find(x=>x._id===o._id)?.paymentStatus)}>Save</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
