import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function Admin() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    price: '',
    imageUrl: '',
    category: '',
    description: '',
    inStock: true,
    stockQty: 0,
  })
  const [editingId, setEditingId] = useState(null)
  const [msg, setMsg] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  const INR_RATE = 83
  const formatInr = (usd) =>
    `₹${Math.round((usd ?? 0) * INR_RATE).toLocaleString('en-IN')}`

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
      const payload = {
        ...form,
        price: Number(form.price),
        stockQty: Number(form.stockQty),
      }
      if (editingId) {
        await api.put(`/api/products/${editingId}`, payload)
      } else {
        await api.post('/api/products', payload)
      }
      setForm({
        name: '',
        price: '',
        imageUrl: '',
        category: '',
        description: '',
        inStock: true,
        stockQty: 0,
      })
      setEditingId(null)
      await load()
      setMsg('Saved!')
    } catch (e) {
      setMsg(e.response?.data?.message || 'Save failed')
    }
  }

  const onEdit = (p) => {
    setEditingId(p._id)
    setForm({
      name: p.name,
      price: p.price,
      imageUrl: p.imageUrl,
      category: p.category || '',
      description: p.description || '',
      inStock: p.inStock,
      stockQty: p.stockQty || 0,
    })
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
    <div style={{ padding: 20, background: '#F6E6EF', minHeight: '100vh' }}>
      <h1 style={{ color: '#E80071' }}>Admin: Products</h1>

      {/* NAV BUTTONS */}
      <div style={{ display: 'flex', gap: 10, margin: '12px 0' }}>
        <Link to="/admin/orders">
          <button style={navBtn}>Manage Orders</button>
        </Link>
        <Link to="/admin/support">
          <button style={navBtn}>Support Tickets</button>
        </Link>
      </div>

      {/* FILTER */}
      <div style={card}>
        <label style={{ fontWeight: 600, color: '#E80071' }}>
          Filter by category:
        </label>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All</option>
          <option value="electronics">Electronics</option>
          <option value="clothing-men">Clothing (Men)</option>
          <option value="clothing-women">Clothing (Women)</option>
          <option value="accessories-men">Accessories (Men)</option>
          <option value="accessories-women">Accessories (Women)</option>
          <option value="beauty">Beauty</option>
        </select>
        <button style={primaryBtn} onClick={load}>Refresh</button>
      </div>

      {/* FORM */}
      <form onSubmit={onSubmit} style={{ ...card, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
        <input placeholder="Name" value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} />
        <input placeholder="Price" type="number" value={form.price} onChange={(e)=>setForm({ ...form, price: e.target.value })} />
        <input placeholder="Image URL" value={form.imageUrl} onChange={(e)=>setForm({ ...form, imageUrl: e.target.value })} />
        <input placeholder="Category" value={form.category} onChange={(e)=>setForm({ ...form, category: e.target.value })} />
        <input placeholder="Description" value={form.description} onChange={(e)=>setForm({ ...form, description: e.target.value })} />

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <label>
            <input type="checkbox" checked={form.inStock}
              onChange={(e)=>setForm({ ...form, inStock: e.target.checked })} />
            In stock
          </label>
          <input type="number" placeholder="Qty" value={form.stockQty}
            onChange={(e)=>setForm({ ...form, stockQty: e.target.value })} style={{ width: 80 }} />
        </div>

        <button type="submit" style={{ ...primaryBtn, gridColumn: 'span 6' }}>
          {editingId ? 'Update' : 'Create'}
        </button>
      </form>

      {msg && <p style={{ color: '#E80071' }}>{msg}</p>}
      {loading && <p>Loading...</p>}

      {/* PRODUCTS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {items.map(p => (
          <div key={p._id} style={productCard}>
            <img
              src={p.imageUrl || `https://placehold.co/600x400?text=${p.name}`}
              alt={p.name}
              style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8 }}
            />
            <div style={{ marginTop: 8, fontWeight: 600, color: '#E80071' }}>{p.name}</div>
            <div style={{ color: '#6b7280' }}>{formatInr(p.price)}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button style={editBtn} onClick={() => onEdit(p)}>Edit</button>
              <button style={deleteBtn} onClick={() => onDelete(p._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- STYLES ---------- */
const card = {
  background: '#FFF0F6',
  padding: 14,
  borderRadius: 12,
  marginBottom: 16,
  boxShadow: '0 10px 25px rgba(232,0,113,0.12)',
  display: 'flex',
  gap: 10,
  alignItems: 'center',
}

const primaryBtn = {
  background: '#E80071',
  color: '#fff',
  border: 'none',
  padding: '8px 14px',
  borderRadius: 8,
  cursor: 'pointer',
}

const navBtn = {
  background: '#F6E6EF',
  color: '#E80071',
  border: '1px solid #E80071',
  padding: '8px 14px',
  borderRadius: 8,
  cursor: 'pointer',
}

const editBtn = {
  background: '#F6E6EF',
  color: '#E80071',
  border: '1px solid #E80071',
  padding: '6px 12px',
  borderRadius: 6,
  cursor: 'pointer',
}

const deleteBtn = {
  background: '#FFE4EC',
  color: '#B0004E',
  border: '1px solid #B0004E',
  padding: '6px 12px',
  borderRadius: 6,
  cursor: 'pointer',
}

const productCard = {
  background: '#FFF0F6',
  borderRadius: 12,
  padding: 12,
  boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
}
