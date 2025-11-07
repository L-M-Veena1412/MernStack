require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const { connectDB } = require('../src/config/db');
const User = require('../src/models/User');
const Product = require('../src/models/Product');

async function run() {
  try {
    await connectDB();

    // Admin user
    const adminEmail = 'admin@demo.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({ name: 'Admin', email: adminEmail, password: 'Passw0rd!', role: 'admin' });
      console.log('Created admin user:', adminEmail, '(password: Passw0rd!)');
    } else if (admin.role !== 'admin') {
      admin.role = 'admin';
      await admin.save();
      console.log('Promoted existing user to admin:', adminEmail);
    } else {
      console.log('Admin user already exists:', adminEmail);
    }

    // Sample products (idempotent upsert by name) with categories
    const products = [
      // Electronics
      { name: 'Wireless Headphones', description: 'Over-ear ANC headphones.', price: 129.99, imageUrl: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=600&q=80', category: 'electronics', inStock: true, stockQty: 50 },
      { name: 'Gaming Mouse', description: 'Ergonomic RGB gaming mouse.', price: 39.99, imageUrl: 'https://images.unsplash.com/photo-1585515669873-2f3ac9b582f1?auto=format&fit=crop&w=600&q=80', category: 'electronics', inStock: true, stockQty: 120 },
      { name: '4K Monitor', description: '27-inch 4K IPS monitor.', price: 299.99, imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80', category: 'electronics', inStock: true, stockQty: 30 },
      { name: 'Bluetooth Speaker', description: 'Portable deep-bass speaker.', price: 59.99, imageUrl: 'https://images.unsplash.com/photo-1585386959984-a4155223168a?auto=format&fit=crop&w=600&q=80', category: 'electronics', inStock: true, stockQty: 80 },
      { name: 'Smartphone Case', description: 'Durable shockproof case.', price: 19.99, imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80', category: 'electronics', inStock: true, stockQty: 200 },

      // Clothing - Men
      { name: 'Men Cotton T-Shirt', description: 'Classic fit cotton tee.', price: 14.99, imageUrl: 'https://images.unsplash.com/photo-1520975922284-7b1c9a43b9a0?auto=format&fit=crop&w=600&q=80', category: 'clothing-men', inStock: true, stockQty: 150 },
      { name: 'Men Denim Jeans', description: 'Slim fit denim jeans.', price: 44.99, imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80', category: 'clothing-men', inStock: true, stockQty: 90 },

      // Clothing - Women
      { name: 'Women Summer Dress', description: 'Lightweight floral dress.', price: 34.99, imageUrl: 'https://images.unsplash.com/photo-1517637633369-bbd3c0c48246?auto=format&fit=crop&w=600&q=80', category: 'clothing-women', inStock: true, stockQty: 70 },
      { name: 'Women Yoga Leggings', description: 'High-waist stretch leggings.', price: 24.99, imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80', category: 'clothing-women', inStock: true, stockQty: 110 },

      // Accessories - Men
      { name: 'Men Leather Belt', description: 'Genuine leather belt.', price: 22.99, imageUrl: 'https://images.unsplash.com/photo-1616594039964-5a69f8f289c4?auto=format&fit=crop&w=600&q=80', category: 'accessories-men', inStock: true, stockQty: 130 },
      { name: 'Men Watch Classic', description: 'Analog wrist watch.', price: 79.99, imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=600&q=80', category: 'accessories-men', inStock: true, stockQty: 40 },

      // Accessories - Women
      { name: 'Women Scarf', description: 'Soft patterned scarf.', price: 18.99, imageUrl: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=600&q=80', category: 'accessories-women', inStock: true, stockQty: 160 },
      { name: 'Women Handbag', description: 'Crossbody leather handbag.', price: 89.99, imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80', category: 'accessories-women', inStock: true, stockQty: 35 },
      // Beauty
      { name: 'Moisturizing Cream', description: 'Hydrating face cream.', price: 24.99, imageUrl: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=600&q=80', category: 'beauty', inStock: true, stockQty: 120 },
      { name: 'Sunscreen SPF50', description: 'Broad spectrum sunscreen.', price: 17.99, imageUrl: 'https://images.unsplash.com/photo-1629198735661-6d5f7955daeb?auto=format&fit=crop&w=600&q=80', category: 'beauty', inStock: true, stockQty: 90 },
      { name: 'Lipstick Set', description: 'Matte lipstick trio.', price: 29.99, imageUrl: 'https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=600&q=80', category: 'beauty', inStock: true, stockQty: 70 },
      { name: 'Shampoo & Conditioner', description: 'Nourishing hair care duo.', price: 22.49, imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70c1a0a44?auto=format&fit=crop&w=600&q=80', category: 'beauty', inStock: true, stockQty: 110 },
    ];

    // No autogenerated items; curated images per item above

    for (const p of products) {
      await Product.findOneAndUpdate({ name: p.name }, p, { upsert: true, new: true });
    }
    const total = await Product.countDocuments();
    console.log(`Products ready. Total products: ${total}`);

    await mongoose.connection.close();
    console.log('Seed complete.');
    process.exit(0);
  } catch (e) {
    console.error('Seed error:', e);
    process.exit(1);
  }
}

run();
