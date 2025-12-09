import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, total, updateQty, removeItem, clear } = useCart();
  const INR_RATE = 83;
  const inr = (usd) => `₹${Math.round((usd ?? 0) * INR_RATE).toLocaleString('en-IN')}`;

  return (
    <div style={{ marginTop: 24, padding: "10px" }}>
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          marginBottom: 20,
          color: "#3d0a51"
        }}
      >
        Your Cart
      </h1>

      {items.length === 0 ? (
        <p
          style={{
            padding: 18,
            background: "white",
            borderRadius: 12,
            border: "1px solid #f1e6f8",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}
        >
          Your cart is empty. <Link to="/products">Browse products</Link>
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 360px",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* LEFT SIDE — ITEMS */}
          <div>
            {items.map(({ product, qty }) => (
              <div
                key={product._id}
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                  marginBottom: 14,
                  background: "white",
                  borderRadius: 12,
                  border: "1px solid #f1e6f8",
                  padding: 12,
                  boxShadow: "0 2px 5px rgba(0,0,0,0.06)",
                }}
              >
                {/* PRODUCT IMAGE */}
                <img
                  src={
                    product.imageUrl ||
                    `https://placehold.co/200x200?text=${encodeURIComponent(
                      product.name
                    )}`
                  }
                  alt={product.name}
                  style={{
                    width: 110,
                    height: 110,
                    objectFit: "cover",
                    borderRadius: 10,
                  }}
                />

                {/* PRODUCT INFO */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 16,
                      color: "#6a117c",
                    }}
                  >
                    {product.name}
                  </div>

                  <div style={{ color: "#555", marginTop: 2 }}>
                    {inr(product.price)}
                  </div>

                  {/* QTY + REMOVE */}
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center" }}>
                    <input
                      type="number"
                      min={1}
                      value={qty}
                      onChange={(e) => updateQty(product._id, Number(e.target.value))}
                      style={{
                        width: 70,
                        padding: "6px",
                        borderRadius: 8,
                        border: "1px solid #ddd",
                        outline: "none",
                      }}
                    />

                    <button
                      onClick={() => removeItem(product._id)}
                      style={{
                        marginLeft: 12,
                        background: "#ff4d6d",
                        color: "white",
                        border: "none",
                        padding: "7px 12px",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* CLEAR CART BUTTON */}
            <button
              onClick={clear}
              style={{
                background: "#b5179e",
                color: "white",
                padding: "10px 16px",
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 600,
                marginTop: 8,
              }}
            >
              Clear Cart
            </button>
          </div>

          {/* RIGHT SIDE — SUMMARY BOX */}
          <div>
            <div
              style={{
                background: "white",
                padding: 20,
                borderRadius: 12,
                border: "1px solid #f1e6f8",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              }}
            >
              <h3
                style={{
                  marginBottom: 14,
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#3d0a51",
                }}
              >
                Order Summary
              </h3>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 10,
                  fontSize: 16,
                }}
              >
                <span>Subtotal</span>
                <span style={{ fontWeight: 700 }}>{inr(total)}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 14,
                  fontSize: 15,
                  color: "#777",
                }}
              >
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>

              <Link to="/checkout">
                <button
                  style={{
                    background: "#d63384",
                    color: "white",
                    padding: "12px 0",
                    width: "100%",
                    border: "none",
                    borderRadius: 10,
                    cursor: "pointer",
                    marginTop: 8,
                    fontWeight: 700,
                  }}
                >
                  Proceed to Checkout
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
