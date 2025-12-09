import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Chatbot from './components/Chatbot'
import Home from './pages/Home'
import Products from './pages/Products'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Auth from './pages/Auth'
import Admin from './pages/Admin'
import OrderSuccess from './pages/OrderSuccess'
import AdminOrders from './pages/AdminOrders'
import AdminSupport from './pages/AdminSupport'
import OrderHistory from './pages/OrderHistory'
import OrderDetails from './pages/OrderDetails'


function App() {
  const [toast, setToast] = useState('')

  // ✅ Function to show toast for 3 seconds
  const showToast = (message) => {
    setToast(message)
    setTimeout(() => {
      setToast('')
    }, 3000)
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <Header />

      <main style={{ padding: '16px', maxWidth: 1200, margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* ✅ Pass showToast to Products */}
          <Route
            path="/products"
            element={<Products showToast={showToast} />}
          />

          <Route path="/products/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/support" element={<AdminSupport />} />
          <Route path="/order-success/:id" element={<OrderSuccess />} />
          <Route path="/my-orders" element={<OrderHistory />} />
          <Route path="/my-orders/:id" element={<OrderDetails />} />

        </Routes>
      </main>

      <Chatbot />

      {/* ✅ Toast Message UI */}
      {toast && (
        <div style={toastStyle}>
          ✅ {toast}
        </div>
      )}
    </div>
  )
}

const toastStyle = {
  position: 'fixed',
  bottom: 20,
  right: 20,
  background: '#111',
  color: '#fff',
  padding: '12px 20px',
  borderRadius: 8,
  fontSize: 14,
  zIndex: 1000,
  boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
}

export default App
