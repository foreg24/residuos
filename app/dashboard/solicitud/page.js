'use client';

import { useState, useEffect } from 'react';

const TIPOS_RESIDUO = [
  { value: 'escombros', label: 'Escombros / Construcción', icon: '🧱', desc: 'Tierra, cemento, ladrillos' },
  { value: 'muebles', label: 'Muebles / Enseres', icon: '🛋️', desc: 'Sofás, colchones, mesas' },
  { value: 'electronicos', label: 'Electrónicos', icon: '📺', desc: 'TVs, computadores, equipos' },
  { value: 'podas', label: 'Podas / Jardín', icon: '🌿', desc: 'Ramas, hojas, césped' },
  { value: 'voluminoso', label: 'Residuo Voluminoso', icon: '📦', desc: 'Cajas grandes, embalajes' },
  { value: 'otro', label: 'Otro tipo', icon: '🔄', desc: 'Especificar en descripción' },
];

const VOLUMENES = ['1–2 bolsas', '3–5 bolsas', 'Carga de camioneta', 'Carga de camión'];

export default function SolicitudPage() {
  const [tab, setTab] = useState('nuevo');
  const [form, setForm] = useState({ tipo: '', volumen: '', descripcion: '', direccion: '', fecha: '', hora: '' });
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const s = localStorage.getItem('trankas_session');
    if (s) {
      const u = JSON.parse(s);
      setUser(u);
      if (u?.location?.direccion) setForm(p => ({ ...p, direccion: u.location.direccion }));
      const saved = JSON.parse(localStorage.getItem(`trankas_solicitudes_${u.id}`) || '[]');
      setSolicitudes(saved);
    }
    // Default fecha = mañana
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    setForm(p => ({ ...p, fecha: tomorrow.toISOString().split('T')[0], hora: '08:00' }));
  }, []);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.tipo || !form.volumen || !form.direccion || !form.fecha) return;
    setLoading(true);
    setTimeout(() => {
      const sol = { id: Date.now(), ...form, status: 'buscando-reciclador', fecha_solicitud: new Date().toISOString(), userId: user?.id };
      const updated = [sol, ...solicitudes];
      setSolicitudes(updated);
      if (user) localStorage.setItem(`trankas_solicitudes_${user.id}`, JSON.stringify(updated));
      setForm(p => ({ ...p, tipo: '', volumen: '', descripcion: '' }));
      setLoading(false);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setTab('mis-solicitudes'); }, 2000);
    }, 1200);
  };

  const statusInfo = {
    'buscando-reciclador': { label: 'Buscando reciclador', color: '#f39c12', bg: 'rgba(201,168,76,0.12)', icon: '🔍' },
    'reciclador-asignado': { label: 'Reciclador asignado', color: '#3498db', bg: 'rgba(52,152,219,0.12)', icon: '👷' },
    'en-camino': { label: 'En camino', color: '#2ecc71', bg: 'rgba(46,204,113,0.12)', icon: '🚛' },
    'completado': { label: 'Completado', color: '#4fffb0', bg: 'rgba(79,255,176,0.12)', icon: '✅' },
    'cancelado': { label: 'Cancelado', color: '#e74c3c', bg: 'rgba(231,76,60,0.1)', icon: '❌' },
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div className="section-header">
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.5rem,3vw,2rem)' }}>
          🚛 Recolección <span className="gradient-text">Especial</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
          Solicita recogida de escombros, muebles o residuos especiales
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6" style={{ borderBottom: '1px solid var(--border-glass)' }}>
        {['nuevo', 'mis-solicitudes'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: tab === t ? '2px solid var(--accent-primary)' : '2px solid transparent', color: tab === t ? 'var(--accent-primary)' : 'var(--text-muted)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', marginBottom: '-1px', transition: 'all 0.2s' }}
          >
            {t === 'nuevo' ? '➕ Nueva Solicitud' : `📋 Mis Solicitudes (${solicitudes.length})`}
          </button>
        ))}
      </div>

      {tab === 'nuevo' && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {success && (
            <div className="glass-card text-center" style={{ padding: '20px', background: 'rgba(46,204,113,0.1)', borderColor: 'rgba(46,204,113,0.3)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎉</div>
              <p style={{ color: 'var(--accent-bright)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>¡Solicitud enviada!</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Te asignaremos un reciclador pronto</p>
            </div>
          )}

          {/* Tipo */}
          <div>
            <label className="form-label">Tipo de residuo *</label>
            <div className="grid grid-cols-2 gap-3">
              {TIPOS_RESIDUO.map(t => (
                <button
                  key={t.value} type="button" onClick={() => update('tipo', t.value)}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '14px', borderRadius: 'var(--radius-md)', border: form.tipo === t.value ? '1px solid var(--accent-primary)' : '1px solid var(--border-glass)', background: form.tipo === t.value ? 'rgba(46,204,113,0.08)' : 'rgba(10,22,11,0.5)', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}
                >
                  <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{t.icon}</span>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.82rem', color: form.tipo === t.value ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{t.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>{t.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Volumen */}
          <div>
            <label className="form-label">Volumen aproximado *</label>
            <div className="flex flex-wrap gap-2">
              {VOLUMENES.map(v => (
                <button
                  key={v} type="button" onClick={() => update('volumen', v)}
                  style={{ padding: '8px 16px', borderRadius: '20px', border: form.volumen === v ? '1px solid var(--accent-primary)' : '1px solid var(--border-glass)', background: form.volumen === v ? 'rgba(46,204,113,0.12)' : 'transparent', color: form.volumen === v ? 'var(--accent-bright)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'var(--font-display)', transition: 'all 0.2s' }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Descripción adicional</label>
            <textarea className="form-input" rows={2} placeholder="Describe más detalles sobre lo que necesitas recolectar..." value={form.descripcion} onChange={e => update('descripcion', e.target.value)} style={{ resize: 'vertical' }} />
          </div>

          {/* Dirección */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Dirección de recolección *</label>
            <input className="form-input" placeholder="Calle 10 # 5-20, Barrio Kennedy" value={form.direccion} onChange={e => update('direccion', e.target.value)} required />
          </div>

          {/* Fecha y hora */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Fecha preferida *</label>
              <input className="form-input" type="date" value={form.fecha} min={new Date().toISOString().split('T')[0]} onChange={e => update('fecha', e.target.value)} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Hora preferida</label>
              <input className="form-input" type="time" value={form.hora} onChange={e => update('hora', e.target.value)} />
            </div>
          </div>

          {/* Info box */}
          <div style={{ padding: '14px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(52,152,219,0.08)', border: '1px solid rgba(52,152,219,0.2)', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            ℹ️ Al enviar la solicitud, un reciclador independiente registrado en Trankas será asignado. El servicio puede tener un costo según el volumen y tipo de residuo, acordado directamente con el reciclador.
          </div>

          <button type="submit" className="btn-primary w-full justify-center" style={{ padding: '14px', fontSize: '0.95rem' }} disabled={loading || !form.tipo || !form.volumen}>
            {loading ? <><div className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Enviando solicitud...</> : <>🚛 Solicitar Recolección</>}
          </button>
        </form>
      )}

      {tab === 'mis-solicitudes' && (
        <div>
          {solicitudes.length === 0 ? (
            <div className="glass-card text-center" style={{ padding: '48px 20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🚛</div>
              <p style={{ color: 'var(--text-muted)' }}>No tienes solicitudes todavía</p>
              <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => setTab('nuevo')}>Crear solicitud</button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {solicitudes.map(sol => {
                const st = statusInfo[sol.status] || statusInfo['buscando-reciclador'];
                return (
                  <div key={sol.id} className="glass-card" style={{ padding: '18px 20px' }}>
                    <div className="flex justify-between items-start flex-wrap gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span style={{ fontSize: '1.2rem' }}>{TIPOS_RESIDUO.find(t => t.value === sol.tipo)?.icon || '🔄'}</span>
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            {TIPOS_RESIDUO.find(t => t.value === sol.tipo)?.label || sol.tipo}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2px' }}>📦 {sol.volumen}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2px' }}>📍 {sol.direccion}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>📅 {sol.fecha} {sol.hora && `• ${sol.hora}`}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          Solicitado: {new Date(sol.fecha_solicitud).toLocaleString('es-CO')}
                        </div>
                      </div>
                      <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-display)', background: st.bg, color: st.color, border: `1px solid ${st.color}44`, whiteSpace: 'nowrap' }}>
                        {st.icon} {st.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
