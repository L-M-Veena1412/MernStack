const express = require('express');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const INR_RATE = 83;

// ---------- Load Cart ----------
async function loadCartWithProducts(userId) {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) cart = await Cart.create({ user: userId, items: [] });

  const items = cart.items.map(i => ({
    product: i.product._id,
    name: i.product.name,
    price: i.product.price,
    imageUrl: i.product.imageUrl,
    qty: i.qty,
  }));

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  return { cart, items, total };
}

// ---------- Summary ----------
router.get('/summary', authenticate, async (req, res) => {
  try {
    const { items, total } = await loadCartWithProducts(req.user.id);
    const totalInInr = Math.round(total * INR_RATE);
    res.json({ items, total: totalInInr, currency: 'inr', rate: INR_RATE });
  } catch {
    res.status(500).json({ message: 'Checkout summary error' });
  }
});

// ---------- Dummy Payment ----------
router.post('/fake/pay', authenticate, async (req, res) => {
  try {
    const { items, total } = await loadCartWithProducts(req.user.id);
    if (!items.length) return res.status(400).json({ message: 'Cart is empty' });

    const order = await Order.create({
      user: req.user.id,
      items,
      total: Math.round(total * INR_RATE),
      currency: 'inr',
      paymentProvider: 'fake',
      paymentStatus: 'paid'
    });

    await Cart.updateOne({ user: req.user.id }, { $set: { items: [] } });

    res.json({ ok: true, orderId: order._id });
  } catch {
    res.status(400).json({ message: 'Fake payment failed' });
  }
});

// ---------- STRIPE DEMO ----------
router.post('/stripe/create-intent', authenticate, async (req, res) => {
  try {
    const paymentIntentId = 'pi_demo_' + Math.random().toString(36).slice(2);

    res.json({
      ok: true,
      clientSecret: 'demo_secret_' + Math.random().toString(36).slice(2),
      paymentIntentId
    });
  } catch {
    res.status(400).json({ message: 'Stripe demo error' });
  }
});

router.post('/stripe/confirm', authenticate, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    if (!paymentIntentId) return res.status(400).json({ message: 'Missing paymentIntentId' });

    const { items, total } = await loadCartWithProducts(req.user.id);
    if (!items.length) return res.status(400).json({ message: 'Cart empty' });

    const order = await Order.create({
      user: req.user.id,
      items,
      total: Math.round(total * INR_RATE),
      currency: 'inr',
      paymentProvider: 'stripe-demo',
      paymentStatus: 'paid',
      paymentId: paymentIntentId
    });

    await Cart.updateOne({ user: req.user.id }, { $set: { items: [] } });

    res.json({ ok: true, orderId: order._id });
  } catch {
    res.status(400).json({ message: 'Stripe confirm failed' });
  }
});

// ---------- PAYPAL DEMO ----------
router.post('/paypal/create-order', authenticate, async (req, res) => {
  try {
    const orderID = 'paypal_demo_' + Math.random().toString(36).slice(2);
    res.json({ ok: true, id: orderID });
  } catch {
    res.status(400).json({ message: 'PayPal demo error' });
  }
});

router.post('/paypal/capture', authenticate, async (req, res) => {
  try {
    const { orderID } = req.body;
    if (!orderID) return res.status(400).json({ message: 'Missing orderID' });

    const { items, total } = await loadCartWithProducts(req.user.id);
    if (!items.length) return res.status(400).json({ message: 'Cart empty' });

    const order = await Order.create({
      user: req.user.id,
      items,
      total: Math.round(total * INR_RATE),
      currency: 'inr',
      paymentProvider: 'paypal-demo',
      paymentStatus: 'paid',
      paymentId: orderID
    });

    await Cart.updateOne({ user: req.user.id }, { $set: { items: [] } });

    res.json({ ok: true, orderId: order._id });
  } catch {
    res.status(400).json({ message: 'PayPal capture failed' });
  }
});

// ---------- CASH ON DELIVERY ----------
router.post('/cod', authenticate, async (req, res) => {
  try {
    const { items, total } = await loadCartWithProducts(req.user.id);
    if (!items.length) return res.status(400).json({ message: 'Cart empty' });

    const order = await Order.create({
      user: req.user.id,
      items,
      total: Math.round(total * INR_RATE),
      currency: 'inr',
      paymentProvider: 'cod',
      paymentStatus: 'pending'
    });

    await Cart.updateOne({ user: req.user.id }, { $set: { items: [] } });

    res.json({ ok: true, orderId: order._id });
  } catch {
    res.status(400).json({ message: 'COD failed' });
  }
});

module.exports = router;
