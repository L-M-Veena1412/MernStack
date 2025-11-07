const express = require('express');
const SupportTicket = require('../models/SupportTicket');
const Order = require('../models/Order');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/faqs', async (req, res) => {
  const faqs = [
    { q: 'How do I track my order?', a: "If you're logged in, type: order status <orderId> in the chat, or check your account orders page." },
    { q: 'What is the return policy?', a: 'Returns are accepted within 30 days of delivery in original condition.' },
    { q: 'How can I contact support?', a: 'You can create a support ticket in chat: ticket <subject> | <message>.' },
  ];
  res.json({ items: faqs });
});

router.post('/tickets', async (req, res) => {
  try {
    const { email, subject, message } = req.body;
    if (!subject || !message) return res.status(400).json({ message: 'subject and message are required' });
    const user = req.user?.id;
    const created = await SupportTicket.create({ user, email, subject, message });
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ message: 'Invalid payload' });
  }
});

// Admin: list all tickets
router.get('/tickets', authenticate, requireAdmin, async (req, res) => {
  const items = await SupportTicket.find({}).sort({ createdAt: -1 });
  res.json({ items });
});

// Admin: update a ticket (status/priority)
router.put('/tickets/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const fields = {};
    if (req.body.status) fields.status = req.body.status;
    if (req.body.priority) fields.priority = req.body.priority;
    const t = await SupportTicket.findByIdAndUpdate(req.params.id, fields, { new: true });
    if (!t) return res.status(404).json({ message: 'Not found' });
    res.json(t);
  } catch (e) {
    res.status(400).json({ message: 'Invalid ticket id' });
  }
});

router.get('/order-status', authenticate, async (req, res) => {
  try {
    const { orderId } = req.query;
    if (!orderId) return res.status(400).json({ message: 'orderId required' });
    const order = await Order.findById(orderId).select('paymentStatus total currency createdAt user');
    if (!order) return res.status(404).json({ message: 'Not found' });
    if (String(order.user) !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    res.json({
      id: order._id,
      status: order.paymentStatus,
      total: order.total,
      currency: order.currency,
      createdAt: order.createdAt,
    });
  } catch (e) {
    res.status(400).json({ message: 'Invalid order id' });
  }
});

module.exports = router;
