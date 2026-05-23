'use client';

import { useState, useEffect } from 'react';

const TIPOS = {
  acumulacion: { label: 'Acumulación', icon: '🗑️', color: '#f39c12' },
  basurero: { label: 'Basurero clandestino', icon: '⚠️', color: '#e74c3c' },
  escombros: { label: 'Escombros', icon: '🧱', color: '#95a5a6' },
  bloqueo: { label: 'Bloqueo de vía', icon: '🚧', color: '#e67e22' },
  taponamiento: { label: 'Taponamiento', icon: '🌊', color: '#3498db' },
  otro: { label: 'Otro', icon: '📌', color: '#9b59b6' },
};

const DEMO_ALERTAS = [
  { id: 1, categoria: 'acumulacion', descripcion: 'Acumulación grande de basura en el separador de la Av. 26', ubicacion: 'Avenida 26 con Carrera 8', fecha: new Date(Date.now() - 3600000).toISOString(), votosSi: 14, votosNo: 2, resuelta: false, userId: 'demo1' },
  { id: 2, categoria: 'basurero', descripcion: 'Basurero clandestino detrás del mercado nuevo', ubicacion: 'Carrera 5 # 12-30', fecha: new Date(Date.now() - 86400000).toISOString(), votosSi: 8, votosNo: 1, resuelta: false, userId: 'demo2' },
  { id: 3, categoria: 'bloqueo', descripcion: 'Escombros bloqueando carril en calle 10', ubicacion: 'Calle 10 entre Carrera 6 y 7', fecha: new Date(Date.now() - 172800000).toISOString(), votosSi: 22, votosNo: 0, resuelta: true, userId: 'demo3' },
];

export default function AlertasPage() {
  const [alertas, setAlertas] = useState([]);
  const [filter, setFilter] = useState('activas');
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newAlerta, setNewAlerta] = useState({ categoria: '', descripcion: '', ubicacion: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem('trankas_session');
    if (s) setUser(JSON.parse(s));
    const stored = JSON.parse(localStorage.getItem('trankas_alertas') || '[]');
    setAlertas([...DEMO_ALERTAS, ...stored]);
  }, []);

  const vote = (id, vote) => {
    setAlertas(prev => prev.map(a => {
      if (a.id !== id) return a;
      const hadVote = a.miVoto;
      if (hadVote === vote) return { ...a, miVoto: null, [`votos${vote === 'si' ? 'Si' : 'No'}`]: a[`votos${vote === 'si' ? 'Si' : 'No'}`] - 1 };
      const updated = { ...a, miVoto: vote };
      if (vote === 'si') { updated.votosSi = a.votosSi + 1; if (hadVote === 'no') updated.votosNo = Math.max(0, a.votosNo - 1); }
      else { updated.votosNo = a.votosNo + 1; if (hadVote === 'si') updated.votosSi = Math.max(0, a.votosSi - 1); }
      return updated;
    }));
  };

  const submitAlerta = (e) => {
    e.preventDefault();
    if (!newAlerta.categoria || !newAlerta.ubicacion) return;
    setSubmitting(true);
    setTimeout(() => {
      const alerta = { id: Date.now(), ...newAlerta, fecha: new Date().toISOString(), votosSi: 1, votosNo: 0, resuelta: false, userId: user?.id };
      const updated = [alerta, ...alertas];
      setAlertas(updated);
      const stored = updated.filter(a => a.userId === user?.id);
      localStorage.setItem('trankas_alertas', JSON.stringify(stored));
      setNewAlerta({ categoria: '', descripcion: '', ubicacion: '' });
      setShowForm(false);
      setSubmitting(false);
    }, 800);
  };

  const displayed = alertas.filter(a => filter === 'activas' ? !a.resuelta : a.resuelta);

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 3600) return `Hace ${Math.round(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.round(diff / 3600)}h`;
    return `Hace ${Math.round(diff / 86400)}d`;
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.5rem,3vw,2rem)', color: 'var(--text-primary)' }}>
            🔔 Alertas <span className="gradient-text">Comunitarias</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            Reportes de la comunidad de Neiva
          </p>
        </div>
        <button className="btn-primary" style={{ fontSize: '0.88rem' }} onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Cancelar' : '+ Nueva alerta'}
        </button>
      </div>

      {/* New alert form */}
      {showForm && (
        <div className="glass-card mb-6" style={{ padding: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: '16px', color: 'var(--text-primary)' }}>
            Reportar nueva alerta
          </h3>
          <form onSubmit={submitAlerta} className="flex flex-col gap-4">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Categoría *</label>
              <select className="form-input" value={newAlerta.categoria} onChange={e => setNewAlerta(p => ({ ...p, categoria: e.target.value }))} required>
                <option value="">Selecciona...</option>
                {Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Descripción</label>
              <textarea className="form-input" rows={2} placeholder="Describe la situación brevemente..." value={newAlerta.descripcion} onChange={e => setNewAlerta(p => ({ ...p, descripcion: e.target.value }))} style={{ resize: 'none' }} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Ubicación *</label>
              <input className="form-input" placeholder="Calle o dirección aproximada" value={newAlerta.ubicacion} onChange={e => setNewAlerta(p => ({ ...p, ubicacion: e.target.value }))} required />
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? '⏳ Enviando...' : '📤 Enviar Alerta'}
            </button>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-5" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0' }}>
        {[['activas', `Activas (${alertas.filter(a=>!a.resuelta).length})`], ['resueltas', `Resueltas (${alertas.filter(a=>a.resuelta).length})`]].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)}
            style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: filter === k ? '2px solid var(--accent-primary)' : '2px solid transparent', color: filter === k ? 'var(--accent-primary)' : 'var(--text-muted)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', marginBottom: '-1px', transition: 'all 0.2s' }}>
            {l}
          </button>
        ))}
      </div>

      {/* Alerts list */}
      <div className="flex flex-col gap-4">
        {displayed.length === 0 ? (
          <div className="glass-card text-center" style={{ padding: '48px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔕</div>
            <p style={{ color: 'var(--text-muted)' }}>No hay alertas {filter === 'activas' ? 'activas' : 'resueltas'}</p>
          </div>
        ) : displayed.map(a => {
          const tipo = TIPOS[a.categoria] || TIPOS.otro;
          const total = a.votosSi + a.votosNo;
          const pct = total > 0 ? Math.round((a.votosSi / total) * 100) : 100;
          return (
            <div key={a.id} className="glass-card" style={{ padding: '18px 20px' }}>
              <div className="flex items-start gap-3">
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${tipo.color}22`, border: `1px solid ${tipo.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                  {tipo.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{tipo.label}</span>
                    {a.resuelta && <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.2)', color: 'var(--accent-primary)', fontWeight: 700 }}>✓ Resuelto</span>}
                  </div>
                  {a.descripcion && <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '4px', lineHeight: 1.5 }}>{a.descripcion}</p>}
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>📍 {a.ubicacion} · {timeAgo(a.fecha)}</p>

                  {/* Votes */}
                  <div className="flex items-center gap-3">
                    <div style={{ flex: 1, height: '4px', background: 'var(--border-glass)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: '2px', transition: 'width 0.3s' }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>{a.votosSi} confirmaron</span>
                    {!a.resuelta && (
                      <div className="flex gap-2">
                        <button onClick={() => vote(a.id, 'si')} style={{ padding: '4px 10px', borderRadius: '8px', background: a.miVoto === 'si' ? 'rgba(46,204,113,0.2)' : 'transparent', border: `1px solid ${a.miVoto === 'si' ? 'rgba(46,204,113,0.4)' : 'var(--border-glass)'}`, color: a.miVoto === 'si' ? 'var(--accent-primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.2s' }}>
                          👍 Confirmar
                        </button>
                        <button onClick={() => vote(a.id, 'no')} style={{ padding: '4px 10px', borderRadius: '8px', background: a.miVoto === 'no' ? 'rgba(255,107,53,0.15)' : 'transparent', border: `1px solid ${a.miVoto === 'no' ? 'rgba(255,107,53,0.3)' : 'var(--border-glass)'}`, color: a.miVoto === 'no' ? '#ff6b35' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.2s' }}>
                          👎
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
