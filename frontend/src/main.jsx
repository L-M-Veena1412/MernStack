import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <PayPalScriptProvider options={{
  "client-id": "AWumF9PF7IxpxLTs5KB7UqssgW8wdn2qZ131BLpPFHu8qpJf0Gv-Kea3ZVrDmpNfyKDIv1KX_Pp4Fmex",
  currency: "USD"
}}>
  <App />
</PayPalScriptProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
