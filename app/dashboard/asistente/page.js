'use client';

import { useState, useRef, useEffect } from 'react';

const SUGGESTIONS = [
  '¿Qué hago con pilas usadas?',
  '¿Cómo reciclo plástico PET?',
  '¿Dónde llevo chatarra metálica?',
  '¿El aceite de cocina se puede reciclar?',
  '¿Cómo separo residuos orgánicos?',
  '¿Qué es un residuo peligroso?',
];

export default function AsistentePage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '¡Hola! Soy el asistente de Trankas 🌿 Estoy aquí para ayudarte con todo lo relacionado a gestión de residuos en Neiva. Puedo clasificar materiales, darte consejos de reciclaje y orientarte sobre cómo disponer correctamente tus residuos. ¿En qué te ayudo?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');

    const newMessages = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: newMessages.slice(-8) }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response || 'Lo siento, hubo un error. Intenta de nuevo.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error de conexión. Verifica tu internet e intenta de nuevo.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', height: 'calc(100dvh - 130px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: '16px', flexShrink: 0 }}>
        <div className="flex items-center gap-3">
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(79,255,176,0.2), rgba(46,204,113,0.1))', border: '1px solid rgba(79,255,176,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
            🤖
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)' }}>
              Asistente <span className="gradient-text">IA</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Clasificación de residuos · Consejos de reciclaje · Neiva, Huila
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        className="glass-card scrollbar-thin"
        style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0 }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
            {/* Avatar */}
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
              background: m.role === 'user' ? 'linear-gradient(135deg, var(--accent-primary), #27ae60)' : 'rgba(79,255,176,0.1)',
              border: m.role === 'assistant' ? '1px solid rgba(79,255,176,0.25)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
            }}>
              {m.role === 'user' ? '👤' : '🤖'}
            </div>
            {/* Bubble */}
            <div className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{m.content}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(79,255,176,0.1)', border: '1px solid rgba(79,255,176,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>🤖</div>
            <div className="chat-bubble-ai">
              <div style={{ display: 'flex', gap: '5px', alignItems: 'center', padding: '4px 0' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent-primary)', animation: 'glowPulse 1.4s ease-in-out infinite', animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div style={{ flexShrink: 0, marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => send(s)}
              className="btn-ghost"
              style={{ fontSize: '0.78rem', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--border-glass)', color: 'var(--text-muted)', background: 'var(--bg-card)' }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="glass-card" style={{ flexShrink: 0, marginTop: '12px', padding: '10px 14px', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Pregunta sobre cualquier residuo..."
          rows={1}
          disabled={loading}
          style={{
            flex: 1,
            resize: 'none',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.92rem',
            lineHeight: 1.5,
            maxHeight: '120px',
            overflowY: 'auto',
          }}
          onInput={e => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
          }}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="btn-primary"
          style={{ padding: '10px 16px', fontSize: '0.88rem', flexShrink: 0, opacity: (!input.trim() || loading) ? 0.5 : 1 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  );
}
