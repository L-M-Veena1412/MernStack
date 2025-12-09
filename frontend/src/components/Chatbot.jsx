import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import styles from './Chatbot.module.css';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const SUPPORT_PHONE = '+91 98765 43210';
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hi! I'm ShopEase Assistant 👋\n📞 Support: " + SUPPORT_PHONE + "\nI can help you with orders, products, FAQs, and more!" }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const listRef = useRef(null);
  const navigate = useNavigate();
  const INR_RATE = 83;
  const inr = (usd) => `₹${Math.round((usd ?? 0) * INR_RATE).toLocaleString('en-IN')}`;

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open, typing]);

  const addBotMessage = (text) => {
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { from: 'bot', text }]);
      setTyping(false);
    }, 600 + Math.random() * 600); // simulate typing
  };

  const send = async (text) => {
    const t = text.trim();
    if (!t) return;
    setMessages((m) => [...m, { from: 'you', text: t }]);
    const lower = t.toLowerCase();

    // Quick help
    if (lower === 'help') {
      return addBotMessage(
        `Commands you can try:\n• orders / my orders\n• track <orderId>\n• order status <orderId>\n• search <term>\n• recommend [category]\n• faqs\n• ticket <subject> | <message>\n• go <category/page>`
      );
    }

    // Support number
    if (['phone','support number','contact number'].includes(lower)) {
      return addBotMessage(`Customer Support: ${SUPPORT_PHONE}`);
    }

    // Show orders
    if (['orders','my orders'].includes(lower)) {
      try {
        const res = await api.get('/api/orders/my');
        const items = (res.data.items || []).slice(0, 5).map(o => 
          `🆔 ${o._id}\nStatus: ${o.paymentStatus}\nTotal: ${inr(o.total)}\nPlaced: ${new Date(o.createdAt).toLocaleString()}`
        ).join('\n\n');
        addBotMessage(items || 'No orders yet.');
        // Suggest track order button
        setMessages(m => [...m, { from: 'bot', text: '💡 Quick Action: Type "track <orderId>" to track an order' }]);
      } catch (e) {
        const code = e.response?.status;
        if (code === 401) return addBotMessage('Please log in to view your orders.');
        return addBotMessage('Could not load orders.');
      }
      return;
    }

    // Track / Order status
    if (lower.startsWith('track ') || lower.startsWith('order status ')) {
      const id = lower.startsWith('track ') ? t.slice(6).trim() : t.slice(13).trim();
      if (!id) return addBotMessage('Usage: track <orderId> or order status <orderId>');
      try {
        const res = await api.get(`/api/orders/${id}`);
        const o = res.data;
        return addBotMessage(
          `Order 🆔 ${o._id}\nStatus: ${o.paymentStatus}\nTotal: ${inr(o.total)}\nPlaced: ${new Date(o.createdAt).toLocaleString()}`
        );
      } catch (e) {
        const code = e.response?.status;
        if (code === 401) return addBotMessage('Please log in to track your order.');
        if (code === 404) return addBotMessage('Order not found.');
        if (code === 403) return addBotMessage('You do not have access to that order.');
        return addBotMessage('Could not fetch order.');
      }
    }

    // FAQs
    if (['faqs','faq'].includes(lower)) {
      try {
        const res = await api.get('/api/support/faqs');
        const lines = (res.data.items || []).map((f, i) => `${i + 1}. ${f.q}\nAnswer: ${f.a}`).join('\n\n');
        return addBotMessage(lines || 'No FAQs yet.');
      } catch {
        return addBotMessage('Could not load FAQs.');
      }
    }

    // Ticket
    if (lower.startsWith('ticket ')) {
      const body = t.slice(7).split('|').map(s => s.trim()).filter(Boolean);
      const [subject,message,email] = body;
      if (!subject || !message) return addBotMessage('Usage: ticket <subject> | <message> | [email optional]');
      try {
        const res = await api.post('/api/support/tickets', { subject, message, email });
        return addBotMessage(`Ticket created (#${res.data._id}). We'll get back to you soon.`);
      } catch {
        return addBotMessage('Could not create ticket.');
      }
    }

    // Search products
    if (lower.startsWith('search ')) {
      const term = t.slice(7).trim();
      try {
        const res = await api.get('/api/products', { params: { q: term, limit: 5 } });
        const items = (res.data.items || []).map(p => `🛒 ${p.name} — ${inr(p.price)}`).join('\n');
        if (!items) return addBotMessage('No products found.');
        return addBotMessage(`Search results for "${term}":\n${items}`);
      } catch {
        return addBotMessage('Search failed.');
      }
    }

    // Recommend
    if (lower.startsWith('recommend')) {
      const key = lower === 'recommend' ? '' : lower.replace('recommend ','').trim();
      const categoryMap = {
        "electronics":"electronics",
        "men":"clothing-men",
        "women":"clothing-women",
        "men accessories":"accessories-men",
        "women accessories":"accessories-women",
        "beauty":"beauty"
      };
      const cat = categoryMap[key] || key || undefined;
      try {
        const res = await api.get('/api/products', { params: { category: cat, limit: 3, inStock: true } });
        const picks = (res.data.items || []).slice(0,3).map(p => `🛍️ ${p.name} — ${inr(p.price)}`).join('\n');
        return addBotMessage(picks || `No results in ${cat}`);
      } catch {
        return addBotMessage('Could not fetch recommendations.');
      }
    }

    // Go / navigation
    if (lower.startsWith('go ')) {
      const arg = lower.slice(3).trim();
      const phraseMap = {
        'electronics':'electronics',
        'clothing for men':'clothing-men',
        "men's clothing":'clothing-men',
        'clothing for women':'clothing-women',
        "women's clothing":'clothing-women',
        'men accessories':'accessories-men',
        'women accessories':'accessories-women',
        'beauty':'beauty',
        'beauty products':'beauty'
      };
      const cat = phraseMap[arg];
      if (cat) {
        navigate(`/products?category=${encodeURIComponent(cat)}`);
        return addBotMessage(`Showing ${arg}...`);
      }
      if (['cart','checkout','products'].includes(arg)) {
        navigate(`/${arg}`);
        return addBotMessage(`Opening ${arg}...`);
      }
    }

    // Default fallback
    return addBotMessage("I didn't understand. Type 'help' to see options.");
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
            {messages.map((m,i)=>(
              <div key={i} className={m.from==='bot'? styles.bot : styles.you}>
                {m.text.split('\n').map((line,index) => <div key={index}>{line}</div>)}
              </div>
            ))}
            {typing && <div className={styles.bot}>💬 Typing...</div>}
          </div>
          <form onSubmit={onSubmit} className={styles.inputRow}>
            <input value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Type a message..." />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
      <button className={styles.fab} onClick={()=>setOpen(v=>!v)}>{open ? '✕' : '💬'}</button>
    </div>
  );
}
