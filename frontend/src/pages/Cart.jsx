import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { items, total, updateQty, removeItem, clear } = useCart()
  const INR_RATE = 83
  const inr = (usd) => `₹${Math.round((usd ?? 0) * INR_RATE).toLocaleString('en-IN')}`

  return (
    <div>
      <h1>Your Cart</h1>
      {items.length === 0 ? (
        <p>Your cart is empty. <Link to="/products">Browse products</Link></p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <div>
            {items.map(({ product, qty }) => (
              <div key={product._id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto auto', gap: 12, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6 }} />
                ) : (
                  <div style={{ width: 80, height: 80, background: '#f3f4f6', borderRadius: 6 }} />
                )}
                <div>
                  <div style={{ fontWeight: 600 }}>{product.name}</div>
                  <div style={{ color: '#6b7280' }}>{inr(product.price)}</div>
                </div>
                <input type="number" min={1} value={qty} onChange={(e) => updateQty(product._id, Number(e.target.value))} style={{ width: 70 }} />
                <button onClick={() => removeItem(product._id)}>Remove</button>
              </div>
            ))}
            <button onClick={clear} style={{ marginTop: 12 }}>Clear cart</button>
          </div>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>Subtotal</span>
              <span>{inr(total)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <Link to="/checkout"><button style={{ width: '100%' }}>Proceed to Checkout</button></Link>
          </div>
        </div>
      )}
    </div>
  )
}
