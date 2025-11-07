import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/api'
import { useCart } from '../context/CartContext'

export default function Product() {
  const { id } = useParams()
  const [p, setP] = useState(null)
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  const INR_RATE = 83
  const formatInr = (usd) => `₹${Math.round((usd ?? 0) * INR_RATE).toLocaleString('en-IN')}`

  useEffect(() => {
    const run = async () => {
      try {
        const res = await api.get(`/api/products/${id}`)
        setP(res.data)
      } catch {
        setP(null)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id])

  if (loading) return <p>Loading...</p>
  if (!p) return <p>Not found</p>

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div>
        {p.imageUrl ? (
          <img src={p.imageUrl} alt={p.name} style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 8 }} onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src=`https://placehold.co/800x400?text=${encodeURIComponent(p.name)}` }} />
        ) : (
          <div style={{ width: '100%', height: 300, background: '#f3f4f6', borderRadius: 8 }} />
        )}
      </div>
      <div>
        <h1>{p.name}</h1>
        <p style={{ color: '#6b7280' }}>{p.category}</p>
        <h2 style={{ margin: '8px 0' }}>{formatInr(p.price)}</h2>
        <p style={{ margin: '12px 0' }}>{p.description}</p>
        <button onClick={() => addItem(p, 1)}>Add to cart</button>
      </div>
    </div>
  )
}
