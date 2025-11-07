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

function App() {
  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <Header />
      <main style={{ padding: '16px', maxWidth: 1200, margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/support" element={<AdminSupport />} />
          <Route path="/order-success/:id" element={<OrderSuccess />} />
        </Routes>
      </main>
      <Chatbot />
    </div>
  )
}

export default App
