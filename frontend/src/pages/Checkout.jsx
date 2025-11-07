import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Checkout() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [rate, setRate] = useState(83)
  const navigate = useNavigate()

  useEffect(() => {
    const run = async () => {
      try {
        const res = await api.get('/api/checkout/summary')
        setItems(res.data.items || [])
        setTotal(res.data.total || 0)
        if (res.data.rate) setRate(res.data.rate)
      } catch {
        setItems([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const startStripe = async () => {
    setMsg('')
    try {
      const res = await api.post('/api/checkout/stripe/create-intent')
      if (res.data?.clientSecret) {
        setMsg('Stripe intent created. For demo, complete payment in test UI and then click Confirm.')
      } else {
        setMsg('Stripe not configured')
      }
    } catch (e) {
      setMsg(e.response?.data?.message || 'Stripe error')
    }
  }

  const confirmStripe = async () => {
    const id = prompt('Enter paymentIntentId (from Stripe test) to confirm:')
    if (!id) return
    try {
      const res = await api.post('/api/checkout/stripe/confirm', { paymentIntentId: id })
      if (res.data?.ok) setMsg('Payment captured. Order created!')
      else setMsg('Payment not successful')
    } catch (e) {
      setMsg(e.response?.data?.message || 'Stripe confirm error')
    }
  }

  const startPayPal = async () => {
    setMsg('')
    try {
      const res = await api.post('/api/checkout/paypal/create-order')
      if (res.data?.id) {
        setMsg(`PayPal order created: ${res.data.id}. Enter this ID to capture.`)
      } else {
        setMsg('PayPal not configured')
      }
    } catch (e) {
      setMsg(e.response?.data?.message || 'PayPal error')
    }
  }

  const capturePayPal = async () => {
    const orderID = prompt('Enter PayPal orderID to capture:')
    if (!orderID) return
    try {
      const res = await api.post('/api/checkout/paypal/capture', { orderID })
      if (res.data?.ok) setMsg('PayPal payment captured. Order created!')
      else setMsg('Capture not completed')
    } catch (e) {
      setMsg(e.response?.data?.message || 'PayPal capture error')
    }
  }

  const dummyPay = async () => {
    setMsg('')
    try {
      const res = await api.post('/api/checkout/fake/pay')
      if (res.data?.ok && res.data.order?._id) {
        navigate(`/order-success/${res.data.order._id}`)
      } else {
        setMsg('Dummy payment failed')
      }
    } catch (e) {
      setMsg(e.response?.data?.message || 'Dummy payment failed')
    }
  }

  if (!user) {
    return <p>Please sign in to checkout.</p>
  }

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h1>Checkout</h1>
      {items.length === 0 ? (
        <p>No items in cart.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <div>
            {items.map((it, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{it.name}</div>
                  <div style={{ color: '#6b7280' }}>Qty: {it.qty}</div>
                </div>
                <div>{`₹${Math.round(it.price * it.qty * rate).toLocaleString('en-IN')}`}</div>
              </div>
            ))}
          </div>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>Total</span>
              <span>{`₹${Math.round(total).toLocaleString('en-IN')}`}</span>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              <button onClick={startStripe}>Pay with Stripe (demo)</button>
              <button onClick={confirmStripe}>Confirm Stripe (demo)</button>
              <button onClick={startPayPal}>Pay with PayPal (demo)</button>
              <button onClick={capturePayPal}>Capture PayPal (demo)</button>
              <button onClick={dummyPay}>Dummy Payment (no keys)</button>
            </div>
            {msg && <p style={{ marginTop: 8 }}>{msg}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
