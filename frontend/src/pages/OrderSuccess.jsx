import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../lib/api'

export default function OrderSuccess() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    const run = async () => {
      try {
        const res = await api.get(`/api/orders/${id}`)
        setOrder(res.data)
      } catch (e) {
        setErr(e.response?.data?.message || 'Could not load order')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id])

  if (loading) return <p>Loading...</p>
  if (err) return <p>{err}</p>
  if (!order) return <p>Not found</p>

  return (
    <div>
      <h1>Order placed successfully!</h1>
      <p>Your order ID is <strong>{order._id}</strong>.</p>
      <p>Status: <strong>{order.paymentStatus}</strong></p>
      <div style={{ marginTop: 12 }}>
        <Link to="/products"><button>Continue shopping</button></Link>
        <Link to={`/`} style={{ marginLeft: 8 }}><button>Go home</button></Link>
      </div>
    </div>
  )
}
