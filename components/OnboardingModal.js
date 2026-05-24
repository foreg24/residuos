'use client';

import { useState } from 'react';
import { BARRIOS_POR_COMUNA, HORARIOS_POR_COMUNA, getBarrioComuna } from '../lib/data';

const ALL_BARRIOS = Object.values(BARRIOS_POR_COMUNA).flat().sort();

export default function OnboardingModal({ onComplete }) {
  const [step, setStep] = useState(1); // 1=barrio, 2=done
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [comunaInfo, setComunaInfo] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSearch = (val) => {
    setSearch(val);
    setSelected(null);
    setComunaInfo(null);
    if (val.length < 2) { setSuggestions([]); return; }
    const q = val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const results = ALL_BARRIOS.filter(b =>
      b.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q)
    ).slice(0, 7);
    setSuggestions(results);
  };

  const selectBarrio = (barrio) => {
    setSearch(barrio);
    setSelected(barrio);
    setSuggestions([]);
    const c = getBarrioComuna(barrio);
    if (c) setComunaInfo({ comuna: c, ...HORARIOS_POR_COMUNA[c] });
  };

  const handleSave = async () => {
    if (!selected || !comunaInfo) return;
    setSaving(true);
    try {
      await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: { barrio: selected, comuna: comunaInfo.comuna },
          onboardingDone: true,
        }),
      });
      setStep(2);
      setTimeout(() => onComplete({ barrio: selected, comuna: comunaInfo.comuna }), 1200);
    } catch {
      setSaving(false);
    }
  };

  const skip = async () => {
    await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ onboardingDone: true }),
    });
    onComplete(null);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      style={{ background: 'rgba(2,9,4,0.9)', backdropFilter: 'blur(16px)' }}>
      <div style={{
        width: '100%', maxWidth: '440px',
        background: 'rgba(8,18,9,0.97)',
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 60px rgba(46,204,113,0.1)',
        backdropFilter: 'blur(40px)',
        overflow: 'hidden',
        animation: 'fadeUp 0.4s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Top glow */}
        <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, var(--accent-primary), var(--accent-bright), var(--accent-primary), transparent)' }} />

        <div style={{ padding: '32px' }}>
          {step === 1 && (
            <>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{ fontSize: '2.8rem', marginBottom: '12px' }}>🏘️</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  ¿En qué barrio vives?
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  Esto nos permite mostrarte el horario exacto de recolección de basuras en tu sector.
                </p>
              </div>

              {/* Search */}
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <input
                  className="form-input"
                  placeholder="Busca tu barrio... ej: El Centro, Kennedy"
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                  autoFocus
                  style={{ paddingLeft: '40px' }}
                />
                <svg style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                {suggestions.length > 0 && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                    marginTop: '4px', background: 'rgba(8,18,9,0.98)',
                    border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)',
                    backdropFilter: 'blur(20px)', overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  }}>
                    {suggestions.map(b => (
                      <button key={b} onClick={() => selectBarrio(b)}
                        style={{ width: '100%', padding: '11px 14px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.88rem', transition: 'background 0.15s', borderBottom: '1px solid var(--border-glass)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(46,204,113,0.07)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected result */}
              {comunaInfo && selected && (
                <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.25)', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '1.2rem' }}>🚛</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {selected}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--accent-primary)', marginBottom: '2px' }}>
                    📅 {comunaInfo.dias}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    ⏰ {comunaInfo.horario} · Zona {comunaInfo.zona} · {comunaInfo.nombreZona}
                  </div>
                </div>
              )}

              <button
                className="btn-primary w-full justify-center"
                style={{ padding: '14px', fontSize: '0.95rem', opacity: !selected ? 0.45 : 1 }}
                onClick={handleSave}
                disabled={!selected || saving}
              >
                {saving
                  ? <><div className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Guardando...</>
                  : <>Confirmar mi barrio →</>
                }
              </button>

              <button onClick={skip} style={{ display: 'block', width: '100%', marginTop: '12px', padding: '10px', background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline' }}>
                Omitir por ahora
              </button>
            </>
          )}

          {step === 2 && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>✅</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--accent-bright)', marginBottom: '8px' }}>
                ¡Listo!
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Ya tienes todo configurado. Entrando al dashboard...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
