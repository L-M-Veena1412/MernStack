import { Link, useParams } from 'react-router-dom';

export default function OrderSuccess() {
  const { id } = useParams();

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      marginTop: 50,
      padding: 20
    }}>
      <div style={{
        width: 420,
        background: 'white',
        borderRadius: 12,
        padding: '30px 25px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        border: '1px solid #ffd2e8'
      }}>

        <h2 style={{
          textAlign: 'center',
          color: '#e0006c',
          marginBottom: 15,
        }}>🎉 Order Placed Successfully!</h2>

        <p style={{ textAlign: 'center', fontSize: 16, marginBottom: 8 }}>
          Thank you for shopping with <b>Shopease</b> 💗
        </p>

        <p style={{
          textAlign: 'center',
          background: '#ffe4ef',
          padding: 10,
          borderRadius: 10,
          fontSize: 15,
          border: '1px solid #ffb3d9',
          marginBottom: 25
        }}>
          Your Order ID: <b>{id}</b>
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* 🔥 FIXED ROUTE */}
          <Link to="/my-orders">
            <button style={btnPink}>View My Orders</button>
          </Link>

          <Link to="/">
            <button style={btnOutline}>Back to Home</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

const btnPink = {
  width: '100%',
  background: '#e0006c',
  color: 'white',
  border: 'none',
  padding: '12px 0',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 16,
  fontWeight: 600,
  transition: '0.2s',
};

const btnOutline = {
  width: '100%',
  background: 'white',
  color: '#e0006c',
  border: '2px solid #e0006c',
  padding: '12px 0',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 16,
  fontWeight: 600,
};
