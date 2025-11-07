const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, default: '' },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [orderItemSchema],
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'inr' },
    paymentProvider: { type: String, enum: ['stripe', 'paypal', 'fake'], required: true },
    paymentStatus: { type: String, enum: ['created', 'paid', 'failed', 'refunded'], default: 'created' },
    stripePaymentIntentId: { type: String },
    paypalOrderId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
