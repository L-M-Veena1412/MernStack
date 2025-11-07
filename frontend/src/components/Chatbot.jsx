import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import styles from './Chatbot.module.css';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const SUPPORT_PHONE = '+91 98765 43210';
  const [messages, setMessages] = useState([{ from: 'bot', text: `Hi! Support: ${SUPPORT_PHONE}. Try: go electronics · clothing for men · accessories for men · clothing for women · accessories for women · beauty · search <term> · recommend [category] · orders · track <orderId> · faqs · ticket <subject> | <message> · order status <orderId>` }]);
  const [input, setInput] = useState('');
  const listRef = useRef(null);
  const navigate = useNavigate();
  const INR_RATE = 83;
  const inr = (usd) => `₹${Math.round((usd ?? 0) * INR_RATE).toLocaleString('en-IN')}`;

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  const send = async (text) => {
    const t = text.trim();
    if (!t) return;
    setMessages((m) => [...m, { from: 'you', text: t }]);
    // simple intents
    const lower = t.toLowerCase();
    if (lower === 'help') {
      return setMessages((m) => [...m, { from: 'bot', text: `Examples: go electronics | clothing for men | accessories for men | clothing for women | accessories for women | beauty | search <term> | recommend [category] | orders | track <orderId> | faqs | ticket <subject> | <message> | order status <orderId> | phone` }]);
    }
    if (lower === 'phone' || lower === 'support number' || lower === 'contact number') {
      return setMessages((m)=>[...m,{ from:'bot', text:`Customer Support: ${SUPPORT_PHONE}` }]);
    }
    if (lower === 'orders' || lower === 'my orders') {
      try {
        const res = await api.get('/api/orders');
        const items = (res.data.items || []).slice(0, 5).map(o => `${o._id} — ${o.paymentStatus} — ₹${(o.total ?? 0).toLocaleString('en-IN')}`).join('\n');
        return setMessages((m) => [...m, { from: 'bot', text: items || 'No orders yet.' }]);
      } catch (e) {
        const code = e.response?.status;
        if (code === 401) return setMessages((m)=>[...m,{from:'bot',text:'Please log in to view your orders.'}]);
        return setMessages((m)=>[...m,{from:'bot',text:'Could not load orders.'}]);
      }
    }
    if (lower.startsWith('track ')) {
      const id = t.slice(6).trim();
      if (!id) return setMessages((m)=>[...m,{from:'bot',text:'Usage: track <orderId>'}]);
      try {
        const res = await api.get(`/api/orders/${id}`);
        const o = res.data;
        return setMessages((m)=>[...m,{from:'bot',text:`Order ${o._id}: ${o.paymentStatus} · ₹${(o.total ?? 0).toLocaleString('en-IN')}`}]);
      } catch (e) {
        const code = e.response?.status;
        if (code === 401) return setMessages((m)=>[...m,{from:'bot',text:'Please log in to track your order.'}]);
        if (code === 404) return setMessages((m)=>[...m,{from:'bot',text:'Order not found.'}]);
        if (code === 403) return setMessages((m)=>[...m,{from:'bot',text:'You do not have access to that order.'}]);
        return setMessages((m)=>[...m,{from:'bot',text:'Could not fetch order.'}]);
      }
    }
    if (lower === 'faqs' || lower === 'faq') {
      try {
        const res = await api.get('/api/support/faqs');
        const lines = (res.data.items || []).map((f, i) => `${i + 1}. ${f.q} — ${f.a}`).join('\n');
        return setMessages((m) => [...m, { from: 'bot', text: lines || 'No FAQs yet' }]);
      } catch {
        return setMessages((m) => [...m, { from: 'bot', text: 'Could not load FAQs' }]);
      }
    }
    if (lower.startsWith('ticket ')) {
      const body = t.slice(7);
      const parts = body.split('|').map((s) => s.trim()).filter(Boolean);
      const subject = parts[0];
      const message = parts[1];
      const email = parts[2];
      if (!subject || !message) {
        return setMessages((m) => [...m, { from: 'bot', text: 'Usage: ticket <subject> | <message> | [email optional]' }]);
      }
      try {
        const res = await api.post('/api/support/tickets', { subject, message, email });
        return setMessages((m) => [...m, { from: 'bot', text: `Ticket created (#${res.data._id}). We\'ll get back to you soon.` }]);
      } catch {
        return setMessages((m) => [...m, { from: 'bot', text: 'Could not create ticket' }]);
      }
    }
    if (lower.startsWith('order status ')) {
      const orderId = t.slice('order status '.length).trim();
      if (!orderId) {
        return setMessages((m) => [...m, { from: 'bot', text: 'Usage: order status <orderId>' }]);
      }
      try {
        const res = await api.get('/api/support/order-status', { params: { orderId } });
        const { status, total, currency, createdAt } = res.data;
        return setMessages((m) => [...m, { from: 'bot', text: `Order ${orderId}: ${status} · ${total} ${currency} · placed ${new Date(createdAt).toLocaleString()}` }]);
      } catch (e) {
        const code = e.response?.status;
        if (code === 401) return setMessages((m) => [...m, { from: 'bot', text: 'Please log in to view order status.' }]);
        if (code === 404) return setMessages((m) => [...m, { from: 'bot', text: 'Order not found.' }]);
        if (code === 403) return setMessages((m) => [...m, { from: 'bot', text: 'You do not have access to that order.' }]);
        return setMessages((m) => [...m, { from: 'bot', text: 'Could not fetch order status.' }]);
      }
    }
    if (lower.startsWith('search ')) {
      const term = t.slice(7);
      try {
        const res = await api.get('/api/products', { params: { q: term, limit: 5 } });
        const names = (res.data.items || []).map((p) => p.name).join(', ');
        if (!names) {
          // Fallback: if term matches a category keyword, navigate
          const key = term.toLowerCase();
          if (categoryMap[key]) {
            const cat = categoryMap[key];
            navigate(`/products?category=${encodeURIComponent(cat)}`);
            return setMessages((m) => [...m, { from: 'bot', text: `No direct matches. Showing category: ${cat}` }]);
          }
        }
        return setMessages((m) => [...m, { from: 'bot', text: names ? `Found: ${names}` : 'No results' }]);
      } catch {
        return setMessages((m) => [...m, { from: 'bot', text: 'Search failed' }]);
      }
    }
    if (lower.startsWith('go ')) {
      const arg = lower.replace('go ','').trim();
      // page shortcuts
      if (arg === 'products') { navigate('/products'); return setMessages((m)=>[...m,{from:'bot',text:'Opening products...'}]); }
      if (arg === 'cart') { navigate('/cart'); return setMessages((m)=>[...m,{from:'bot',text:'Opening cart...'}]); }
      if (arg === 'checkout') { navigate('/checkout'); return setMessages((m)=>[...m,{from:'bot',text:'Opening checkout...'}]); }
      // category shortcuts like "go electronics" or natural phrases
      const phraseMap = {
        'electronics': 'electronics',
        'clothing for men': 'clothing-men',
        'accessories for men': 'accessories-men',
        'clothing for women': 'clothing-women',
        'accessories for women': 'accessories-women',
        'beauty': 'beauty',
        'beauty products': 'beauty',
      };
      const cat = phraseMap[arg];
      if (cat) {
        navigate(`/products?category=${encodeURIComponent(cat)}`);
        return setMessages((m) => [...m, { from: 'bot', text: `Showing ${arg}...` }]);
      }
      return setMessages((m) => [...m, { from: 'bot', text: 'Unknown destination' }]);
    }
    // Category shortcuts
    const categoryMap = {
      "electronics": "electronics",
      "men clothing": "clothing-men",
      "men's clothing": "clothing-men",
      "women clothing": "clothing-women",
      "women's clothing": "clothing-women",
      "men accessories": "accessories-men",
      "men's accessories": "accessories-men",
      "women accessories": "accessories-women",
      "women's accessories": "accessories-women",
      "beauty": "beauty",
      "beauty products": "beauty",
    };
    // Natural phrases without the 'go' prefix
    const phraseToCategory = {
      'clothing for men': 'clothing-men',
      "men's clothing": 'clothing-men',
      'clothing for women': 'clothing-women',
      "women's clothing": 'clothing-women',
      'accessories for men': 'accessories-men',
      'accessories for women': 'accessories-women',
      'beauty': 'beauty',
      'beauty products': 'beauty',
    };
    // If user types a plain category or phrase like 'electronics' or 'clothing for men'
    if (categoryMap[lower] || phraseToCategory[lower]) {
      const cat = categoryMap[lower];
      const cat2 = phraseToCategory[lower];
      const finalCat = cat || cat2;
      navigate(`/products?category=${encodeURIComponent(finalCat)}`);
      return setMessages((m) => [...m, { from: 'bot', text: `Showing category: ${finalCat}` }]);
    }
    if (lower.startsWith('category ')) {
      const key = lower.replace('category ', '').trim();
      const cat = categoryMap[key] || key;
      navigate(`/products?category=${encodeURIComponent(cat)}`);
      return setMessages((m) => [...m, { from: 'bot', text: `Showing category: ${cat}` }]);
    }
    if (lower.startsWith('show ') || lower.startsWith("browse ")) {
      const key = lower.replace('show ', '').replace('browse ', '').trim();
      const cat = categoryMap[key] || key;
      navigate(`/products?category=${encodeURIComponent(cat)}`);
      return setMessages((m) => [...m, { from: 'bot', text: `Showing category: ${cat}` }]);
    }

    if (lower === 'recommend') {
      try {
        const res = await api.get('/api/products', { params: { limit: 3 } });
        const picks = res.data.items.slice(0, 3).map((p) => `${p.name} (${inr(p.price)})`).join(', ');
        return setMessages((m) => [...m, { from: 'bot', text: picks || 'No products yet' }]);
      } catch {
        return setMessages((m) => [...m, { from: 'bot', text: 'Could not fetch products' }]);
      }
    }
    if (lower.startsWith('recommend ')) {
      const key = lower.replace('recommend ', '').trim();
      const categoryMap2 = {
        "electronics": "electronics",
        "men": "clothing-men",
        "women": "clothing-women",
        "men accessories": "accessories-men",
        "women accessories": "accessories-women",
        "beauty": "beauty",
        "beauty products": "beauty",
      };
      const cat = categoryMap2[key] || key;
      try {
        const res = await api.get('/api/products', { params: { category: cat, limit: 3, inStock: true } });
        const picks = (res.data.items || []).slice(0, 3).map((p) => `${p.name} (${inr(p.price)})`).join(', ');
        return setMessages((m) => [...m, { from: 'bot', text: picks || `No results in ${cat}` }]);
      } catch {
        return setMessages((m) => [...m, { from: 'bot', text: 'Could not fetch recommendations' }]);
      }
    }
    return setMessages((m) => [...m, { from: 'bot', text: "I didn't understand. Type 'help'" }]);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const t = input;
    setInput('');
    send(t);
  };

  return (
    <div className={styles.root}>
      {open && (
        <div className={styles.panel}>
          <div className={styles.header}>ShopEase Assistant</div>
          <div className={styles.list} ref={listRef}>
            {messages.map((m, i) => (
              <div key={i} className={m.from === 'bot' ? styles.bot : styles.you}>{m.text}</div>
            ))}
          </div>
          <form onSubmit={onSubmit} className={styles.inputRow}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
      <button className={styles.fab} onClick={() => setOpen((v) => !v)}>{open ? '✕' : '💬'}</button>
    </div>
  );
}
