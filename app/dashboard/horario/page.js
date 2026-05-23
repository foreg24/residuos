'use client';

import { useState, useEffect } from 'react';
import { BARRIOS_POR_COMUNA, HORARIOS_POR_COMUNA, getBarrioComuna } from '../../../lib/data';

const ALL_BARRIOS = Object.values(BARRIOS_POR_COMUNA).flat().sort();

export default function HorarioPage() {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [selectedBarrio, setSelectedBarrio] = useState('');
  const [comunaInfo, setComunaInfo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem('trankas_session');
    if (s) {
      const u = JSON.parse(s);
      setUser(u);
      if (u?.location?.barrio) {
        setSearch(u.location.barrio);
        setSelectedBarrio(u.location.barrio);
        const c = getBarrioComuna(u.location.barrio);
        if (c) setComunaInfo({ comuna: c, ...HORARIOS_POR_COMUNA[c] });
      }
    }
  }, []);

  const handleSearch = (val) => {
    setSearch(val);
    setSelectedBarrio('');
    setComunaInfo(null);
    if (val.length < 2) { setSuggestions([]); setShowSuggest(false); return; }
    const filtered = ALL_BARRIOS.filter(b =>
      b.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(
        val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      )
    ).slice(0, 8);
    setSuggestions(filtered);
    setShowSuggest(true);
  };

  const selectBarrio = (barrio) => {
    setSearch(barrio);
    setSelectedBarrio(barrio);
    setSuggestions([]);
    setShowSuggest(false);
    const c = getBarrioComuna(barrio);
    if (c) setComunaInfo({ comuna: c, ...HORARIOS_POR_COMUNA[c] });
  };

  const saveLocation = () => {
    if (!selectedBarrio || !comunaInfo) return;
    setSaving(true);
    setTimeout(() => {
      const s = localStorage.getItem('trankas_session');
      if (s) {
        const u = JSON.parse(s);
        u.location = { ...u.location, barrio: selectedBarrio, comuna: comunaInfo.comuna };
        localStorage.setItem('trankas_session', JSON.stringify(u));
        setUser(u);
        const users = JSON.parse(localStorage.getItem('trankas_users') || '[]');
        const idx = users.findIndex(x => x.id === u.id);
        if (idx >= 0) { users[idx] = u; localStorage.setItem('trankas_users', JSON.stringify(users)); }
      }
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 600);
  };

  const getDaysUntil = (diasStr) => {
    const map = { 'lunes': 1, 'martes': 2, 'miercoles': 3, 'jueves': 4, 'viernes': 5, 'sabado': 6, 'domingo': 0 };
    const days = diasStr.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/[,·\s]+/).filter(d => map[d] !== undefined);
    const now = new Date();
    const today = now.getDay();
    const results = days.map(d => {
      let diff = map[d] - today;
      if (diff < 0) diff += 7;
      if (diff === 0) return 'Hoy';
      if (diff === 1) return 'Mañana';
      return `En ${diff} días`;
    });
    return results;
  };

  const WEEK_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const today = new Date().getDay();

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div className="section-header">
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.5rem,3vw,2rem)' }}>
          📅 Mi <span className="gradient-text">Horario</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
          Consulta los días de recolección de tu barrio
        </p>
      </div>

      {/* Current location highlight */}
      {user?.location?.barrio && (
        <div className="glass-card mb-6" style={{ padding: '16px 20px', background: 'rgba(46,204,113,0.05)', borderColor: 'rgba(46,204,113,0.2)' }}>
          <div className="flex items-center gap-2 mb-1">
            <span style={{ fontSize: '1rem' }}>📍</span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Tu ubicación actual
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
            {user.location.barrio} · Comuna {user.location.comuna}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="glass-card mb-6" style={{ padding: '20px 22px' }}>
        <label className="form-label">Busca tu barrio</label>
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                className="form-input"
                placeholder="Ej: Santa Inés, El Centro, Las Américas..."
                value={search}
                onChange={e => handleSearch(e.target.value)}
                onFocus={() => suggestions.length && setShowSuggest(true)}
                autoComplete="off"
              />
              {showSuggest && suggestions.length > 0 && (
                <div className="glass-card" style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, marginTop: '4px', padding: '6px', maxHeight: '220px', overflowY: 'auto',
                }}>
                  {suggestions.map(b => (
                    <button
                      key={b}
                      onClick={() => selectBarrio(b)}
                      style={{ width: '100%', padding: '10px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.88rem', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass-light)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Result */}
      {comunaInfo && (
        <div className="flex flex-col gap-4">
          {/* Main info card */}
          <div className="glass-card" style={{ padding: '24px 26px', background: 'linear-gradient(135deg, rgba(46,204,113,0.1), rgba(46,204,113,0.03))', borderColor: 'rgba(46,204,113,0.3)' }}>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.75rem', color: 'var(--accent-primary)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>
                  {selectedBarrio} · Zona {comunaInfo.zona}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.4rem,3vw,1.9rem)', color: 'var(--text-primary)', lineHeight: 1.15 }}>
                  {comunaInfo.dias}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', color: 'var(--accent-bright)', fontSize: '0.95rem' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {comunaInfo.horario}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>
                  Zona {comunaInfo.zona} · {comunaInfo.nombreZona} · Comuna {comunaInfo.comuna}
                </div>
              </div>
            </div>

            {/* Countdown badges */}
            <div className="flex flex-wrap gap-2 mt-5">
              {getDaysUntil(comunaInfo.dias).map((d, i) => (
                <span key={i} style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  background: d === 'Hoy' ? 'rgba(46,204,113,0.2)' : 'rgba(46,204,113,0.06)',
                  border: `1px solid ${d === 'Hoy' ? 'rgba(46,204,113,0.4)' : 'rgba(46,204,113,0.15)'}`,
                  color: d === 'Hoy' ? 'var(--accent-bright)' : 'var(--text-muted)',
                }}>
                  {d === 'Hoy' ? '🚛 ' : ''}{d}
                </span>
              ))}
            </div>
          </div>

          {/* Week calendar */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '14px' }}>
              Esta semana
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {WEEK_DAYS.map((day, i) => {
                const isToday = i === today;
                const diasLower = comunaInfo.dias.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                const dayMap = { 0: 'domingo', 1: 'lunes', 2: 'martes', 3: 'miercoles', 4: 'jueves', 5: 'viernes', 6: 'sabado' };
                const isCollection = diasLower.includes(dayMap[i]) || (comunaInfo.dias.toLowerCase().includes('lunes a') && i >= 1 && i <= 6);
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                      padding: '10px 6px',
                      borderRadius: '10px',
                      background: isToday ? 'rgba(46,204,113,0.12)' : 'transparent',
                      border: isToday ? '1px solid rgba(46,204,113,0.25)' : '1px solid transparent',
                    }}
                  >
                    <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: isToday ? 'var(--accent-primary)' : 'var(--text-dim)', textTransform: 'uppercase' }}>
                      {day}
                    </span>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: isCollection ? 'linear-gradient(135deg,var(--accent-primary),#27ae60)' : 'var(--border-glass)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: isCollection ? '0.85rem' : '0',
                      boxShadow: isCollection ? '0 0 12px rgba(46,204,113,0.4)' : 'none',
                    }}>
                      {isCollection && '🚛'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips */}
          <div className="glass-card" style={{ padding: '18px 20px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
              💡 Consejos de presentación
            </h3>
            <div className="flex flex-col gap-3">
              {[
                { icon: '⏰', text: 'Saca las bolsas 30 minutos antes del horario de recolección' },
                { icon: '♻️', text: 'Separa aprovechables (plástico, vidrio, papel) del resto' },
                { icon: '🌿', text: 'Los residuos orgánicos en bolsa cerrada, separados' },
                { icon: '🔋', text: 'Pilas y electrónicos en punto de acopio, no en la bolsa regular' },
              ].map((tip, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  <span style={{ flexShrink: 0 }}>{tip.icon}</span>
                  {tip.text}
                </div>
              ))}
            </div>
          </div>

          {/* Save button */}
          {selectedBarrio !== user?.location?.barrio && (
            <button
              className="btn-primary w-full justify-center"
              style={{ padding: '14px' }}
              onClick={saveLocation}
              disabled={saving}
            >
              {saving ? (
                <><div className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Guardando...</>
              ) : saved ? (
                <>✅ ¡Guardado!</>
              ) : (
                <>💾 Guardar como mi barrio</>
              )}
            </button>
          )}
        </div>
      )}

      {!comunaInfo && !search && (
        <div className="glass-card text-center" style={{ padding: '48px 20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏘️</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Busca tu barrio para ver el horario</p>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Hay {ALL_BARRIOS.length}+ barrios registrados en Neiva</p>
        </div>
      )}
    </div>
  );
}
