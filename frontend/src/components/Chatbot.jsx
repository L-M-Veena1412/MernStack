import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import styles from './Chatbot.module.css';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const SUPPORT_PHONE = '+91 98765 43210';

  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text:
        "Hi! I'm ShopEase Assistant 👋\n" +
        `📞 Support: ${SUPPORT_PHONE}\n` +
        'I can help you with orders, products, FAQs, and more!'
    }
  ]);

  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const listRef = useRef(null);
  const navigate = useNavigate();

  // ✅ USD value but Rupees symbol (NO conversion)
  const displayAmount = (amount) => `₹${Number(amount ?? 0).toFixed(2)}`;

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open, typing]);

  const addBotMessage = (text) => {
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { from: 'bot', text }]);
      setTyping(false);
    }, 600);
  };

  const send = async (text) => {
    const t = text.trim();
    if (!t) return;

    setMessages((m) => [...m, { from: 'you', text: t }]);
    const lower = t.toLowerCase();

    // HELP
    if (lower === 'help') {
      return addBotMessage(
        `Commands:\n` +
        `• orders / my orders\n` +
        `• track <orderId>\n` +
        `• search <product>\n` +
        `• recommend <category>\n` +
        `• faqs\n` +
        `• go <page>`
      );
    }

    // SUPPORT NUMBER
    if (['phone', 'support number', 'contact number'].includes(lower)) {
      return addBotMessage(`Customer Support: ${SUPPORT_PHONE}`);
    }

    // MY ORDERS
    if (['orders', 'my orders'].includes(lower)) {
      try {
        const res = await api.get('/api/orders/my');
        const items = (res.data.items || [])
          .slice(0, 5)
          .map(
            (o) =>
              `🆔 ${o._id}\n` +
              `Status: ${o.paymentStatus}\n` +
              `Total: ${displayAmount(o.total)}\n` +
              `Placed: ${new Date(o.createdAt).toLocaleString()}`
          )
          .join('\n\n');

        addBotMessage(items || 'No orders found.');
        return;
      } catch (e) {
        if (e.response?.status === 401)
          return addBotMessage('Please login to view orders.');
        return addBotMessage('Unable to load orders.');
      }
    }

    // TRACK ORDER
    if (lower.startsWith('track ')) {
      const id = t.slice(6).trim();
      if (!id) return addBotMessage('Usage: track <orderId>');

      try {
        const res = await api.get(`/api/orders/${id}`);
        const o = res.data;

        return addBotMessage(
          `🆔 ${o._id}\n` +
          `Status: ${o.paymentStatus}\n` +
          `Total: ${displayAmount(o.total)}\n` +
          `Placed: ${new Date(o.createdAt).toLocaleString()}`
        );
      } catch {
        return addBotMessage('Order not found or access denied.');
      }
    }

    // FAQS
    if (['faq', 'faqs'].includes(lower)) {
      try {
        const res = await api.get('/api/support/faqs');
        const lines = (res.data.items || [])
          .map((f, i) => `${i + 1}. ${f.q}\n${f.a}`)
          .join('\n\n');

        return addBotMessage(lines || 'No FAQs available.');
      } catch {
        return addBotMessage('Unable to load FAQs.');
      }
    }

    // SEARCH PRODUCT
    if (lower.startsWith('search ')) {
      const term = t.slice(7).trim();
      try {
        const res = await api.get('/api/products', {
          params: { q: term, limit: 5 }
        });

        const items = (res.data.items || [])
          .map((p) => `🛒 ${p.name} — ${displayAmount(p.price)}`)
          .join('\n');

        return addBotMessage(items || 'No products found.');
      } catch {
        return addBotMessage('Search failed.');
      }
    }

    // NAVIGATION
    if (lower.startsWith('go ')) {
      const page = lower.slice(3).trim();
      navigate(`/${page}`);
      return addBotMessage(`Opening ${page}...`);
    }

    // DEFAULT
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
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.from === 'bot' ? styles.bot : styles.you}
              >
                {m.text.split('\n').map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </div>
            ))}
            {typing && <div className={styles.bot}>💬 Typing...</div>}
          </div>

          <form onSubmit={onSubmit} className={styles.inputRow}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}

      <button className={styles.fab} onClick={() => setOpen((v) => !v)}>
        {open ? '✕' : '💬'}
      </button>
    </div>
  );
}
