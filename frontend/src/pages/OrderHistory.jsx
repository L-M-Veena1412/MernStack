// src/pages/OrderHistory.jsx
import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const INR_RATE = 83;
  const toINR = (usd) =>
    `₹${Math.round((usd ?? 0) * INR_RATE).toLocaleString("en-IN")}`;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/orders/my");
        // Keep only orders that have at least one item
        const validOrders = (res.data.items || []).filter(
          (o) => o && o.items && o.items.length > 0
        );
        setOrders(validOrders);
      } catch (e) {
        console.log(e);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
  }, [user]);

  if (!user) return <p>Please login to see your orders.</p>;
  if (loading) return <p>Loading your orders...</p>;

  return (
    <div className="container" style={{ marginTop: 24 }}>
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <p>No orders placed yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {orders.map((o) => {
            const orderDate = new Date(o.createdAt).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
            });

            return (
              <div key={o._id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>Order ID: {o._id}</div>
                    <div className="kicker">Date: {orderDate}</div>
                  </div>
                </div>

                <hr style={{ margin: "12px 0" }} />

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {o.items.map((it, idx) => (
                    <div
                      key={idx}
                      style={{
                        minWidth: 160,
                        border: "1px solid #f7e6ee",
                        borderRadius: 10,
                        padding: 8,
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>{it.name}</div>
                      <div className="kicker">Qty: {it.qty}</div>
                      <div className="price">{toINR(it.price)}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
