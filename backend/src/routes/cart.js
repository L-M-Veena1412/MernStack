const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Ensure user cart exists
async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

// Get cart (with populated products)
router.get('/', authenticate, async (req, res) => {
  const cart = await getOrCreateCart(req.user.id);
  await cart.populate('items.product');
  res.json(cart);
});

// Add item to cart: { productId, qty }
router.post('/', authenticate, async (req, res) => {
  const { productId, qty = 1 } = req.body;
  if (!productId) return res.status(400).json({ message: 'productId is required' });
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  const cart = await getOrCreateCart(req.user.id);
  const idx = cart.items.findIndex(i => String(i.product) === String(productId));
  if (idx >= 0) {
    cart.items[idx].qty += Number(qty);
  } else {
    cart.items.push({ product: productId, qty: Number(qty) });
  }
  await cart.save();
  await cart.populate('items.product');
  res.status(201).json(cart);
});

// Update qty for a product
router.put('/:productId', authenticate, async (req, res) => {
  const { qty } = req.body;
  const { productId } = req.params;
  if (qty == null || qty < 1) return res.status(400).json({ message: 'qty must be >= 1' });
  const cart = await getOrCreateCart(req.user.id);
  const idx = cart.items.findIndex(i => String(i.product) === String(productId));
  if (idx === -1) return res.status(404).json({ message: 'Item not in cart' });
  cart.items[idx].qty = Number(qty);
  await cart.save();
  await cart.populate('items.product');
  res.json(cart);
});

// Remove product from cart
router.delete('/:productId', authenticate, async (req, res) => {
  const { productId } = req.params;
  const cart = await getOrCreateCart(req.user.id);
  const before = cart.items.length;
  cart.items = cart.items.filter(i => String(i.product) !== String(productId));
  if (cart.items.length === before) return res.status(404).json({ message: 'Item not in cart' });
  await cart.save();
  await cart.populate('items.product');
  res.json(cart);
});

// Clear cart
router.delete('/', authenticate, async (req, res) => {
  const cart = await getOrCreateCart(req.user.id);
  cart.items = [];
  await cart.save();
  res.json({ ok: true });
});

module.exports = router;
