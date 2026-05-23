'use client';

import { useState, useEffect } from 'react';
import { BARRIOS_POR_COMUNA, HORARIOS_POR_COMUNA, getBarrioComuna } from '../../../lib/data';

export default function CuentaPage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('perfil');

  useEffect(() => {
    const s = localStorage.getItem('trankas_session');
    if (s) {
      const u = JSON.parse(s);
      setUser(u);
      setForm({ name: u.name || '', email: u.email || '', phone: u.phone || '' });
    }
  }, []);

  const saveProfile = () => {
    setSaving(true);
    setTimeout(() => {
      const updated = { ...user, ...form };
      localStorage.setItem('trankas_session', JSON.stringify(updated));
      setUser(updated);
      const users = JSON.parse(localStorage.getItem('trankas_users') || '[]');
      const idx = users.findIndex(u => u.id === updated.id);
      if (idx >= 0) { users[idx] = updated; localStorage.setItem('trankas_users', JSON.stringify(users)); }
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 700);
  };

  const initials = user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'TK';
  const reportes = user ? JSON.parse(localStorage.getItem(`trankas_reportes_${user.id}`) || '[]') : [];
  const solicitudes = user ? JSON.parse(localStorage.getItem(`trankas_solicitudes_${user.id}`) || '[]') : [];

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div className="section-header">
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.5rem,3vw,2rem)' }}>
          👤 Mi <span className="gradient-text">Cuenta</span>
        </h1>
      </div>

      {/* Avatar + stats */}
      <div className="glass-card mb-6" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent-primary),#27ae60)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color: '#fff', border: '3px solid rgba(79,255,176,0.3)', boxShadow: '0 0 30px rgba(46,204,113,0.3)', flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{user?.name || 'Usuario'}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user?.email}</div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '10px', flexWrap: 'wrap' }}>
            {[
              { num: reportes.length, label: 'Reportes' },
              { num: solicitudes.length, label: 'Solicitudes' },
              { num: user?.isReciclador ? '✓' : '—', label: 'Reciclador' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>{s.num}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6" style={{ borderBottom: '1px solid var(--border-glass)' }}>
        {[['perfil', '👤 Perfil'], ['ubicacion', '📍 Ubicación'], ['reciclador', '♻️ Ser Reciclador']].map(([k, l]) => (
          <button key={k} onClick={() => setActiveTab(k)}
            style={{ padding: '10px 16px', background: 'none', border: 'none', borderBottom: activeTab === k ? '2px solid var(--accent-primary)' : '2px solid transparent', color: activeTab === k ? 'var(--accent-primary)' : 'var(--text-muted)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', marginBottom: '-1px', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
            {l}
          </button>
        ))}
      </div>

      {/* Perfil tab */}
      {activeTab === 'perfil' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          {saved && <div className="mb-4 px-4 py-3 rounded-xl text-center" style={{ background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.25)', color: 'var(--accent-bright)', fontSize: '0.88rem' }}>✅ Cambios guardados</div>}
          <div className="form-group">
            <label className="form-label">Nombre completo</label>
            <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Tu nombre" />
          </div>
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input className="form-input" type="email" value={form.email} disabled style={{ opacity: 0.6 }} />
            <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>El correo no se puede cambiar</p>
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input className="form-input" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="300 123 4567" />
          </div>
          <div className="form-group">
            <label className="form-label">Proveedor de autenticación</label>
            <div className="form-input" style={{ opacity: 0.7, pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {user?.provider === 'google' ? '🔵 Google' : user?.provider === 'apple' ? '⚫ Apple' : '📧 Email / Contraseña'}
            </div>
          </div>
          <button className="btn-primary w-full justify-center" style={{ padding: '13px' }} onClick={saveProfile} disabled={saving}>
            {saving ? <><div className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Guardando...</> : '💾 Guardar cambios'}
          </button>
        </div>
      )}

      {/* Ubicación tab */}
      {activeTab === 'ubicacion' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          {user?.location ? (
            <div>
              <div className="flex flex-col gap-3 mb-5">
                {[
                  { label: 'Barrio', value: user.location.barrio, icon: '🏘️' },
                  { label: 'Comuna', value: user.location.comuna ? `${user.location.comuna} — ${HORARIOS_POR_COMUNA[user.location.comuna]?.nombreZona || ''}` : '—', icon: '🏙️' },
                  { label: 'Dirección', value: user.location.direccion || '—', icon: '📍' },
                  { label: 'Días de recolección', value: user.location.comuna ? HORARIOS_POR_COMUNA[user.location.comuna]?.dias : '—', icon: '📅' },
                  { label: 'Horario', value: user.location.comuna ? HORARIOS_POR_COMUNA[user.location.comuna]?.horario : '—', icon: '⏰' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)' }}>
                    <span>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'var(--font-display)', fontWeight: 600 }}>{item.label}</div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginTop: '2px' }}>{item.value || '—'}</div>
                    </div>
                  </div>
                ))}
              </div>
              <a href="/dashboard/horario">
                <button className="btn-outline w-full justify-center">✏️ Cambiar barrio</button>
              </a>
            </div>
          ) : (
            <div className="text-center" style={{ padding: '24px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📍</div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No has configurado tu ubicación todavía</p>
              <a href="/dashboard/horario">
                <button className="btn-primary">Configurar ubicación</button>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Reciclador tab */}
      {activeTab === 'reciclador' && (
        <div>
          {user?.isReciclador ? (
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center', background: 'rgba(46,204,113,0.06)', borderColor: 'rgba(46,204,113,0.25)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>♻️</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--accent-bright)', marginBottom: '8px' }}>¡Eres reciclador registrado!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Accede a tu panel de reciclador desde el menú lateral</p>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🤝</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Únete como reciclador</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  Recibe solicitudes de recolección especial en tu zona y genera ingresos ayudando a Neiva.
                </p>
              </div>
              <div className="flex flex-col gap-3 mb-5">
                {['Recibe solicitudes de recolección especial', 'Define tu zona de trabajo y horario', 'Cobra directamente con cada usuario', 'Accede a estadísticas de servicio'].map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--accent-primary)', fontSize: '1rem' }}>✓</span>
                    {b}
                  </div>
                ))}
              </div>
              <a href="/dashboard/solicitud#reciclador">
                <button className="btn-primary w-full justify-center" style={{ padding: '13px' }}>
                  Aplicar como reciclador →
                </button>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
