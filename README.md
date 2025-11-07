# ShopEase

A modern e-commerce demo running locally with a React (Vite) frontend and a Node/Express + MongoDB backend, plus a built-in live chatbot.

## Tech Stack
- Frontend: React + Vite, React Router, Axios, CSS Modules
- Backend: Node.js, Express, Mongoose, JWT, bcrypt, CORS, morgan
- DB: MongoDB Atlas (recommended) or local MongoDB
- Payments: Stripe + PayPal (sandbox)

## Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas connection string (or local MongoDB)

## Project Structure
- frontend/ (Vite React app)
- backend/ (Express API)

## Environment Setup

### Backend
Create `backend/.env` (a sample is in `backend/.env.example`):

```
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
MONGODB_URI=your_mongodb_uri

# JWT (replace with secure secrets in production)
JWT_SECRET=dev_secret_change_me
JWT_REFRESH_SECRET=dev_refresh_secret_change_me
JWT_EXPIRES_IN=15m
REFRESH_EXPIRES_IN=7d

# Stripe (optional until you enable real checkout UI)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# PayPal (optional until you enable real checkout UI)
PAYPAL_CLIENT_ID=
PAYPAL_SECRET=
```

### Frontend
Create `frontend/.env` (sample at `frontend/.env.example`):

```
VITE_API_URL=http://localhost:5000
# When enabling real payment UI integrations
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_PAYPAL_CLIENT_ID=
```

## Running Locally

### Start backend
```
cd backend
npm run dev
```
- Health: http://localhost:5000/api/health

### Start frontend
```
cd frontend
npm run dev
```
- Open: http://localhost:5173

## Seed Sample Data
Inserts 5 sample products and ensures a demo admin user.
```
cd backend
npm run seed
```
- Admin user: `admin@demo.com` / `Passw0rd!`

## Auth
- Endpoints: `/api/auth/signup`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`
- Access token is returned by login/signup; refresh token is httpOnly cookie

## Products
- List/search/filter: `GET /api/products?q=&category=&min=&max=&inStock=&page=&limit=`
- Detail: `GET /api/products/:id`
- Admin CRUD: `POST/PUT/DELETE /api/products` (requires admin role)

## Cart & Checkout
- Cart endpoints: `GET/POST/PUT/DELETE /api/cart`
- Checkout summary: `GET /api/checkout/summary`
- Stripe demo: `POST /api/checkout/stripe/create-intent`, `POST /api/checkout/stripe/confirm`
- PayPal demo: `POST /api/checkout/paypal/create-order`, `POST /api/checkout/paypal/capture`

## Enabling Real Payments (optional)
- Stripe: add `STRIPE_SECRET_KEY` (backend) and `VITE_STRIPE_PUBLISHABLE_KEY` (frontend), then replace demo Confirm prompts with Stripe Elements UI.
- PayPal: add `PAYPAL_CLIENT_ID` and `PAYPAL_SECRET` (backend) and `VITE_PAYPAL_CLIENT_ID` (frontend), then use PayPal JS Buttons.

## Live Chatbot
- Floating assistant with simple intents:
  - `help`
  - `search <term>`
  - `go products|cart|checkout`
  - `recommend`

## Admin Panel
- Route: `/admin` (frontend)
- Must be logged in as admin to create/update/delete products.

## Notes
- This demo is for local use; secure secrets and production hardening are required for deployment.
