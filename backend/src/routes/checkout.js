const express = require('express');
const Stripe = require('stripe');
const paypal = require('@paypal/checkout-server-sdk');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const INR_RATE = Number(process.env.INR_RATE || 83);

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Stripe not configured');
  return new Stripe(key);
}

function getPayPalClient() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_SECRET;
  if (!clientId || !clientSecret) throw new Error('PayPal not configured');
  const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
  return new paypal.core.PayPalHttpClient(environment);
}

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

router.get('/summary', authenticate, async (req, res) => {
  try {
    const { items, total } = await loadCartWithProducts(req.user.id);
    const totalInInr = Math.round(total * INR_RATE);
    res.json({ items, total: totalInInr, currency: 'inr', rate: INR_RATE });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/stripe/create-intent', authenticate, async (req, res) => {
  try {
    const stripe = getStripe();
    const { items, total } = await loadCartWithProducts(req.user.id);
    const amount = Math.round(total * 100); // cents
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: { userId: req.user.id },
      automatic_payment_methods: { enabled: true },
    });
    // Create a pending order record
    const order = await Order.create({
      user: req.user.id,
      items,
      total,
      currency: 'usd',
      paymentProvider: 'stripe',
      paymentStatus: 'created',
      stripePaymentIntentId: intent.id,
    });
    res.json({ clientSecret: intent.client_secret, amount, orderId: order._id });
  } catch (e) {
    res.status(400).json({ message: e.message || 'Stripe error' });
  }
});

router.post('/stripe/confirm', authenticate, async (req, res) => {
  // For demo, client can notify server with paymentIntentId after success to mark order paid
  try {
    const { paymentIntentId } = req.body;
    if (!paymentIntentId) return res.status(400).json({ message: 'paymentIntentId required' });
    const stripe = getStripe();
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status === 'succeeded') {
      const order = await Order.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntentId, user: req.user.id },
        { paymentStatus: 'paid' },
        { new: true }
      );
      // Clear cart after successful payment
      await Cart.updateOne({ user: req.user.id }, { $set: { items: [] } });
      return res.json({ ok: true, order });
    }
    return res.status(400).json({ message: 'Payment not successful' });
  } catch (e) {
    res.status(400).json({ message: e.message || 'Stripe confirm error' });
  }
});

router.post('/paypal/create-order', authenticate, async (req, res) => {
  try {
    const { items, total } = await loadCartWithProducts(req.user.id);
    const client = getPayPalClient();
    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: total.toFixed(2),
          },
        },
      ],
    });
    const response = await client.execute(request);
    const order = await Order.create({
      user: req.user.id,
      items,
      total,
      currency: 'usd',
      paymentProvider: 'paypal',
      paymentStatus: 'created',
      paypalOrderId: response.result.id,
    });
    res.json({ id: response.result.id, orderId: order._id });
  } catch (e) {
    res.status(400).json({ message: e.message || 'PayPal error' });
  }
});

router.post('/paypal/capture', authenticate, async (req, res) => {
  try {
    const { orderID } = req.body;
    if (!orderID) return res.status(400).json({ message: 'orderID required' });
    const client = getPayPalClient();
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    const capture = await client.execute(request);
    if (capture.result.status === 'COMPLETED') {
      const order = await Order.findOneAndUpdate(
        { paypalOrderId: orderID, user: req.user.id },
        { paymentStatus: 'paid' },
        { new: true }
      );
      await Cart.updateOne({ user: req.user.id }, { $set: { items: [] } });
      return res.json({ ok: true, order });
    }
    return res.status(400).json({ message: 'Capture not completed' });
  } catch (e) {
    res.status(400).json({ message: e.message || 'PayPal capture error' });
  }
});

// Demo-only fake payment: marks order as paid and clears cart
router.post('/fake/pay', authenticate, async (req, res) => {
  try {
    const { items, total } = await loadCartWithProducts(req.user.id);
    const totalInInr = Math.round(total * INR_RATE);
    if (items.length === 0) return res.status(400).json({ message: 'Cart is empty' });
    const order = await Order.create({
      user: req.user.id,
      items,
      total: totalInInr,
      currency: 'inr',
      paymentProvider: 'fake',
      paymentStatus: 'paid',
    });
    await Cart.updateOne({ user: req.user.id }, { $set: { items: [] } });
    res.json({ ok: true, order });
  } catch (e) {
    res.status(400).json({ message: 'Fake payment failed' });
  }
});

module.exports = router;
