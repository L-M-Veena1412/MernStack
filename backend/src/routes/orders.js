const express = require('express');
const Order = require('../models/Order');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Current user's orders
router.get('/', authenticate, async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 }).select('_id total currency paymentStatus createdAt');
  res.json({ items: orders });
});

// Admin: list all orders
router.get('/admin/all', authenticate, requireAdmin, async (req, res) => {
  const orders = await Order.find({}).sort({ createdAt: -1 }).select('_id user total currency paymentStatus createdAt');
  res.json({ items: orders });
});

// Get single order (owner or admin)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const o = await Order.findById(req.params.id);
    if (!o) return res.status(404).json({ message: 'Not found' });
    if (String(o.user) !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    res.json(o);
  } catch {
    res.status(400).json({ message: 'Invalid id' });
  }
});

// Admin: update paymentStatus
router.put('/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    if (!['created','paid','failed','refunded'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const o = await Order.findByIdAndUpdate(req.params.id, { paymentStatus }, { new: true });
    if (!o) return res.status(404).json({ message: 'Not found' });
    res.json(o);
  } catch {
    res.status(400).json({ message: 'Invalid request' });
  }
});

module.exports = router;
