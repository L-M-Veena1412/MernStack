const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { authenticate, requireAdmin } = require('../middleware/auth');

// --- USER ORDERS ---
router.get('/my', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ items: orders });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load orders' });
  }
});

// --- GET SINGLE ORDER BY ID ---
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Only owner or admin can view
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: 'Could not load order' });
  }
});

// --- ADMIN: ALL ORDERS ---
router.get('/admin/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ items: orders });
  } catch {
    res.status(500).json({ message: 'Failed to load all orders' });
  }
});

// --- ADMIN: UPDATE STATUS ---
router.put('/:id/status', authenticate, requireAdmin, async (req, res) => {
  const { paymentStatus } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.paymentStatus = paymentStatus;
    await order.save();
    res.json({ paymentStatus: order.paymentStatus });
  } catch {
    res.status(500).json({ message: 'Status update failed' });
  }
});

module.exports = router;
