const express = require('express');
const Product = require('../models/Product');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// List with search/filter/pagination
router.get('/', async (req, res) => {
  try {
    const { q, category, min, max, inStock, page = 1, limit = 12 } = req.query;
    const filter = {};
    if (q) filter.name = { $regex: q, $options: 'i' };
    if (category) filter.category = category;
    if (inStock !== undefined) filter.inStock = inStock === 'true';
    if (min || max) filter.price = { ...(min ? { $gte: Number(min) } : {}), ...(max ? { $lte: Number(max) } : {}) };

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) || 1 });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get by id
router.get('/:id', async (req, res) => {
  try {
    const item = await Product.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (e) {
    res.status(400).json({ message: 'Invalid id' });
  }
});

// Admin: create
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, imageUrl, category, inStock = true, stockQty = 0 } = req.body;
    const created = await Product.create({ name, description, price, imageUrl, category, inStock, stockQty });
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ message: 'Invalid payload' });
  }
});

// Admin: update
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ message: 'Invalid payload or id' });
  }
});

// Admin: delete
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ message: 'Invalid id' });
  }
});

module.exports = router;
