import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../lib/api'
import { useCart } from '../context/CartContext'

export default function Products() {
  const [items, setItems] = useState([])
  const [searchParams, setSearchParams] = useSearchParams()
  const qParam = searchParams.get('q') || ''
  const catParam = searchParams.get('category') || ''
  const stockParam = searchParams.get('inStock') === 'true'
  const [q, setQ] = useState(qParam)
  const [category, setCategory] = useState(catParam)
  const [inStock, setInStock] = useState(stockParam)
  const [loading, setLoading] = useState(false)
  const { addItem } = useCart()

  const INR_RATE = 83
  const formatInr = (usd) => `₹${Math.round((usd ?? 0) * INR_RATE).toLocaleString('en-IN')}`

  const fetchProducts = async (query = '', category = '', inStock = false) => {
    setLoading(true)
    try {
      const params = { q: query, limit: 20 }
      if (category) params.category = category
      if (inStock) params.inStock = true
      const res = await api.get('/api/products', { params })
      setItems(res.data.items || [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // react to URL changes
    const currentQ = searchParams.get('q') || ''
    const currentCat = searchParams.get('category') || ''
    const currentStock = searchParams.get('inStock') === 'true'
    setQ(currentQ)
    setCategory(currentCat)
    setInStock(currentStock)
    fetchProducts(currentQ, currentCat, currentStock)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const onSearch = (e) => {
    e.preventDefault()
    const next = {}
    if (q) next.q = q
    if (category) next.category = category
    if (inStock) next.inStock = true
    setSearchParams(next)
  }

  return (
    <div>
      <h1>Products</h1>
      <form onSubmit={onSearch} style={{ margin: '12px 0', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products..." />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing-men">Clothing (Men)</option>
          <option value="clothing-women">Clothing (Women)</option>
          <option value="accessories-men">Accessories (Men)</option>
          <option value="accessories-women">Accessories (Women)</option>
          <option value="beauty">Beauty</option>
        </select>
        <label style={{ display:'flex', alignItems:'center', gap:6 }}>
          <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} /> In Stock
        </label>
        <button type="submit">Apply</button>
      </form>
      {loading && <p>Loading...</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {items.map(p => (
          <div key={p._id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
            {p.imageUrl ? (
              <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 6 }} onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src=`https://placehold.co/600x400?text=${encodeURIComponent(p.name)}` }} />
            ) : (
              <div style={{ width: '100%', height: 140, background: '#f3f4f6', borderRadius: 6 }} />
            )}
            <h3 style={{ margin: '8px 0' }}>
              <Link to={`/products/${p._id}`}>{p.name}</Link>
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{formatInr(p.price)}</span>
              <button onClick={() => addItem(p, 1)}>Add to cart</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
