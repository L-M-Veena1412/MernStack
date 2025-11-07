import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function Admin() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', price: '', imageUrl: '', category: '', description: '', inStock: true, stockQty: 0 })
  const [editingId, setEditingId] = useState(null)
  const [msg, setMsg] = useState('')
  const INR_RATE = 83
  const formatInr = (usd) => `₹${Math.round((usd ?? 0) * INR_RATE).toLocaleString('en-IN')}`
  const [filterCategory, setFilterCategory] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const params = { limit: 500 }
      if (filterCategory) params.category = filterCategory
      const res = await api.get('/api/products', { params })
      setItems(res.data.items || [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filterCategory])

  if (!user || user.role !== 'admin') return <p>Forbidden: admin only</p>

  const onSubmit = async (e) => {
    e.preventDefault()
    setMsg('')
    try {
      const payload = { ...form, price: Number(form.price), stockQty: Number(form.stockQty) }
      if (editingId) {
        await api.put(`/api/products/${editingId}`, payload)
      } else {
        await api.post('/api/products', payload)
      }
      setForm({ name: '', price: '', imageUrl: '', category: '', description: '', inStock: true, stockQty: 0 })
      setEditingId(null)
      await load()
      setMsg('Saved!')
    } catch (e) {
      setMsg(e.response?.data?.message || 'Save failed')
    }
  }

  const onEdit = (p) => {
    setEditingId(p._id)
    setForm({ name: p.name, price: p.price, imageUrl: p.imageUrl, category: p.category || '', description: p.description || '', inStock: p.inStock, stockQty: p.stockQty || 0 })
  }

  const onDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    setMsg('')
    try {
      await api.delete(`/api/products/${id}`)
      await load()
    } catch (e) {
      setMsg(e.response?.data?.message || 'Delete failed')
    }
  }

  return (
    <div>
      <h1>Admin: Products</h1>
      <div style={{ display:'flex', gap:8, margin:'8px 0' }}>
        <Link to="/admin/orders"><button>Manage Orders</button></Link>
        <Link to="/admin/support"><button>Support Tickets</button></Link>
      </div>
      <div style={{ display:'flex', gap:8, alignItems:'center', margin:'8px 0' }}>
        <label>Filter by category:</label>
        <select value={filterCategory} onChange={(e)=>setFilterCategory(e.target.value)}>
          <option value="">All</option>
          <option value="electronics">Electronics</option>
          <option value="clothing-men">Clothing (Men)</option>
          <option value="clothing-women">Clothing (Women)</option>
          <option value="accessories-men">Accessories (Men)</option>
          <option value="accessories-women">Accessories (Women)</option>
          <option value="beauty">Beauty</option>
        </select>
        <button onClick={load}>Refresh</button>
      </div>
      <form onSubmit={onSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 12 }}>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
        <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <label><input type="checkbox" checked={form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.checked })} /> In stock</label>
          <input placeholder="Stock Qty" type="number" value={form.stockQty} onChange={(e) => setForm({ ...form, stockQty: e.target.value })} style={{ width: 90 }} />
        </div>
        <button type="submit" style={{ gridColumn: 'span 6' }}>{editingId ? 'Update' : 'Create'}</button>
      </form>
      {msg && <p>{msg}</p>}
      {loading && <p>Loading...</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {items.map(p => (
          <div key={p._id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
            {p.imageUrl ? (
              <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 6 }} onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src=`https://placehold.co/600x400?text=${encodeURIComponent(p.name)}` }} />
            ) : (
              <div style={{ width: '100%', height: 140, background: '#f3f4f6', borderRadius: 6 }} />
            )}
            <div style={{ marginTop: 8, fontWeight: 600 }}>{p.name}</div>
            <div style={{ color: '#6b7280' }}>{formatInr(p.price)}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={() => onEdit(p)}>Edit</button>
              <button onClick={() => onDelete(p._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
