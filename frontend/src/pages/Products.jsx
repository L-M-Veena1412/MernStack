import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../lib/api'
import { useCart } from '../context/CartContext'

export default function Products({ showToast }) {
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
    const currentQ = searchParams.get('q') || ''
    const currentCat = searchParams.get('category') || ''
    const currentStock = searchParams.get('inStock') === 'true'
    setQ(currentQ)
    setCategory(currentCat)
    setInStock(currentStock)
    fetchProducts(currentQ, currentCat, currentStock)
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

      <h1 style={{
        fontSize: 28,
        marginBottom: 14,
        fontWeight: 700,
        color: "#3d0a51"
      }}>
        Products
      </h1>

      {/* SEARCH BAR */}
      <form
        onSubmit={onSearch}
        style={{
          margin: "12px 0 24px",
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr auto",
          gap: 10
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products..."
          style={{
            padding: "10px 12px",
            border: "1px solid #ddd",
            borderRadius: 8,
            outline: "none"
          }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: 8,
            border: "1px solid #ddd"
          }}
        >
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing-men">Clothing (Men)</option>
          <option value="clothing-women">Clothing (Women)</option>
          <option value="accessories-men">Accessories (Men)</option>
          <option value="accessories-women">Accessories (Women)</option>
          <option value="beauty">Beauty</option>
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
          />
          In Stock
        </label>

        <button
          type="submit"
          style={{
            background: "#d63384",
            color: "#fff",
            border: "none",
            padding: "10px 16px",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600
          }}
        >
          Apply
        </button>
      </form>

      {loading && <p>Loading...</p>}

      {/* PRODUCT GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 18
        }}
      >
        {items.map((p) => (
          <div
            key={p._id}
            style={{
              border: "1px solid #f1e6f8",
              background: "white",
              borderRadius: 12,
              padding: 14,
              transition: "0.2s ease",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)"
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)"
              e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.05)"
            }}
          >
            {/* Product Image */}
            {p.imageUrl ? (
              <img
                src={p.imageUrl}
                alt={p.name}
                style={{
                  width: "100%",
                  height: 160,
                  objectFit: "cover",
                  borderRadius: 10
                }}
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = `https://placehold.co/600x400?text=${encodeURIComponent(
                    p.name
                  )}`
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: 160,
                  background: "#f8f0ff",
                  borderRadius: 10
                }}
              />
            )}

            {/* Name */}
            <h3
              style={{
                margin: "10px 0 6px",
                minHeight: 48,
                fontSize: 16,
                color: "#7b1488"
              }}
            >
              <Link to={`/products/${p._id}`} style={{ textDecoration: "none", color: "#7b1488" }}>
                {p.name}
              </Link>
            </h3>

            {/* Price + Add Button */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span style={{ fontWeight: 700, color: "#3d0a51" }}>
                {formatInr(p.price)}
              </span>

              <button
                onClick={() => {
                  addItem(p, 1)
                  showToast(`${p.name} added to cart`)
                }}
                style={{
                  background: "#b5179e",
                  color: "white",
                  padding: "8px 12px",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                Add
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  )
}
