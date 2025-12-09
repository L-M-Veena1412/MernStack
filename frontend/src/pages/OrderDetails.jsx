import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function OrderDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/api/orders/${id}`)
        setOrder(res.data)
      } catch {
        setOrder(null)
      }
    }
    load()
  }, [id])

  if (!user) return <p>Please sign in to track this order.</p>
  if (!order) return <p>Loading order...</p>

  return (
    <div>
      <h1>Order Tracking</h1>

      <p><b>Order ID:</b> {order._id}</p>
      <p><b>Status:</b> {order.paymentStatus}</p>
      <p><b>Total:</b> ₹{order.total?.toLocaleString('en-IN')}</p>

      <h3>Items</h3>
      {order.items.map((it, idx) => (
        <div key={idx} style={itemStyle}>
          {it.name} × {it.qty}
        </div>
      ))}
    </div>
  )
}

const itemStyle = {
  padding: '8px 0',
  borderBottom: '1px solid #e5e7eb'
}
