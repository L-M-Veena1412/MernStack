// src/pages/Checkout.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { PayPalButtons } from '@paypal/react-paypal-js';

export default function Checkout() {
  const { user } = useAuth();
  const { items, clear } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return <p>Please sign in to checkout.</p>;
  if (items.length === 0) return <p>Your cart is empty.</p>;

  const INR_RATE = 83;

  const totalPrice = items.reduce(
    (sum, it) => sum + (it.product.price ?? 0) * INR_RATE * it.qty,
    0
  );

  const placeOrder = async () => {
    if (!address.trim()) {
      setMsg('Please enter delivery address.');
      return;
    }

    setLoading(true);
    setMsg('');
    try {
      const res = await api.post('/api/checkout/fake/pay', {
        address,
        items,
      });
      if (res.data.ok) {
        clear();
        navigate(`/order-success/${res.data.orderId}`);
      }
    } catch (e) {
      setMsg(e.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '40px auto', fontFamily: 'sans-serif', padding: 20 }}>
      <h1 style={{ color: '#d63384', marginBottom: 25 }}>Checkout</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#444', marginBottom: 15 }}>Order Summary</h2>

            {items.map((it, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid #f0d0e0',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{it.product.name}</div>
                  <div style={{ color: '#6b7280' }}>Qty: {it.qty}</div>
                  <div style={{ fontWeight: 600, color: '#d63384', marginTop: 4 }}>
                    ₹{Math.round((it.product.price ?? 0) * INR_RATE * it.qty).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: 18, marginTop: 15 }}>
              <span>Total</span>
              <span style={{ color: '#d63384' }}>
                ₹{Math.round(totalPrice).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginTop: 20 }}>
            <h2 style={{ color: '#444', marginBottom: 10 }}>Delivery Address</h2>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your delivery address"
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 8,
                border: '1px solid #ddd',
                resize: 'vertical',
                minHeight: 80,
              }}
            />
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#444', marginBottom: 20 }}>Payment</h2>

          {/* COD / Fake Pay */}
          <button
            onClick={placeOrder}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 0',
              borderRadius: 8,
              border: 'none',
              background: '#28a745',
              color: 'white',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              opacity: loading ? 0.6 : 1,
              marginBottom: 20,
            }}
          >
            {loading ? 'Placing Order...' : 'Cash on Delivery / Pay'}
          </button>

          {/* PayPal Button */}
          <PayPalButtons
  style={{ layout: 'vertical' }}
  createOrder={async (data, actions) => {
    if (!address.trim()) {
      setMsg('Please enter delivery address.');
      return;
    }

    try {
      // Call backend to create order
      const res = await api.post('/api/checkout/paypal/create-order');
      return res.data.id; // orderID for PayPal
    } catch (err) {
      console.error(err);
      setMsg('Failed to create PayPal order.');
    }
  }}
  onApprove={async (data, actions) => {
    try {
      // Capture payment on backend
      const res = await api.post('/api/checkout/paypal/capture', {
        orderID: data.orderID,
      });

      if (res.data.ok) {
        clear();
        navigate(`/order-success/${res.data.orderId}`);
      } else {
        setMsg('Failed to capture order.');
      }
    } catch (err) {
      console.error(err);
      setMsg('PayPal payment or order capture failed.');
    }
  }}
  onError={(err) => {
    console.error(err);
    setMsg('PayPal payment failed.');
  }}
/>


          {msg && (
            <p style={{ marginTop: 15, color: '#d63384', fontWeight: 600 }}>{msg}</p>
          )}
        </div>
      </div>
    </div>
  );
}
