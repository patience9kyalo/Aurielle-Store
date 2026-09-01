'use client';

import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function ChatWidget() {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I can help with order tracking, product availability, shipping, returns, or payment questions." },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);
  if (!user) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setSending(true);

    try {
      const { reply } = await api.post('/support/chat', { message: text });
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `Sorry, something went wrong: ${err.message}` },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 flex h-96 w-80 flex-col overflow-hidden rounded-sm bg-white shadow-xl">
          <div className="flex items-center justify-between bg-white px-4 py-3">
            <span className="font-display text-sm bg-white text-gold">Aurielle Support</span>
            <button onClick={() => setOpen(false)} className="text-parchment/70 hover:text-gold">
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] whitespace-pre-line rounded-sm px-3 py-2 text-sm ${
                  m.role === 'user'
                    ? 'self-end bg-black text-parchment'
                    : 'self-start bg-parchment-dark text-charcoal'
                }`}
              >
                {m.text}
              </div>
            ))}
            {sending && (
              <div className="self-start rounded-sm bg-parchment-dark px-3 py-2 text-sm text-charcoal/50">
                Typing…
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="flex gap-2 border-t border-charcoal/10 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              className="flex-1 rounded-sm border border-charcoal/15 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald"
            />
            <button
              type="submit"
              disabled={sending}
              className="rounded-sm bg-black px-3 py-2 text-sm text-parchment hover:bg-emerald-light transition-colors disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-emerald-dark shadow-lg hover:bg-gold-dark transition-colors"
        aria-label="Open support chat"
      >
        {open ? '✕' : '💬'}
      </button>
    </div>
  );
}