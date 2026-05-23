'use client';

import { useState, useEffect, useRef } from 'react';

const TIPOS = [
  { value: 'acumulacion', label: 'Acumulación de residuos', icon: '🗑️' },
  { value: 'basurero', label: 'Basurero clandestino', icon: '⚠️' },
  { value: 'escombros', label: 'Escombros o restos', icon: '🧱' },
  { value: 'bloqueo', label: 'Bloqueo de vía', icon: '🚧' },
  { value: 'taponamiento', label: 'Taponamiento alcantarilla', icon: '🌊' },
  { value: 'otro', label: 'Otro problema', icon: '📌' },
];

export default function ReportesPage() {
  const [tab, setTab] = useState('nuevo');
  const [form, setForm] = useState({ tipo: '', descripcion: '', ubicacion: '', imagen: null });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reportes, setReportes] = useState([]);
  const [user, setUser] = useState(null);
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    const s = localStorage.getItem('trankas_session');
    if (s) {
      const u = JSON.parse(s);
      setUser(u);
      const saved = JSON.parse(localStorage.getItem(`trankas_reportes_${u.id}`) || '[]');
      setReportes(saved);
    }
  }, []);

  useEffect(() => {
    if (tab !== 'nuevo' || typeof window === 'undefined' || leafletMap.current) return;
    setTimeout(async () => {
      if (!mapRef.current) return;
      const L = (await import('leaflet')).default;
      const map = L.map(mapRef.current, { center: [2.9376, -75.2818], zoom: 14, zoomControl: true });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '© CARTO', subdomains: 'abcd' }).addTo(map);

      const pinIcon = L.divIcon({
        html: `<div style="width:26px;height:26px;background:#ff6b35;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>`,
        className: '', iconSize: [26, 26], iconAnchor: [13, 26],
      });

      markerRef.current = L.marker([2.9376, -75.2818], { icon: pinIcon, draggable: true }).addTo(map);

      markerRef.current.on('dragend', e => {
        const { lat, lng } = e.target.getLatLng();
        setForm(p => ({ ...p, ubicacion: `${lat.toFixed(6)}, ${lng.toFixed(6)}` }));
      });

      map.on('click', e => {
        const { lat, lng } = e.latlng;
        markerRef.current.setLatLng([lat, lng]);
        setForm(p => ({ ...p, ubicacion: `${lat.toFixed(6)}, ${lng.toFixed(6)}` }));
      });

      leafletMap.current = map;
    }, 200);
  }, [tab]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setPreview(ev.target.result); setForm(p => ({ ...p, imagen: ev.target.result })); };
    reader.readAsDataURL(file);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      setForm(p => ({ ...p, ubicacion: `${lat.toFixed(6)}, ${lng.toFixed(6)}` }));
      if (leafletMap.current && markerRef.current) {
        leafletMap.current.setView([lat, lng], 16);
        markerRef.current.setLatLng([lat, lng]);
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.tipo) return;
    setLoading(true);
    setTimeout(() => {
      const reporte = {
        id: Date.now(),
        ...form,
        fecha: new Date().toISOString(),
        status: 'pendiente',
        userId: user?.id,
      };
      const updated = [reporte, ...reportes];
      setReportes(updated);
      if (user) localStorage.setItem(`trankas_reportes_${user.id}`, JSON.stringify(updated));
      setForm({ tipo: '', descripcion: '', ubicacion: '', imagen: null });
      setPreview(null);
      setSuccess(true);
      setLoading(false);
      setTimeout(() => { setSuccess(false); setTab('historial'); }, 1800);
    }, 1000);
  };

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      <div className="section-header">
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.5rem,3vw,2rem)' }}>
          📍 Reportar <span className="gradient-text">Problema</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
          Reporta acumulaciones, basureros o fallas en el servicio
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0' }}>
        {['nuevo', 'historial'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '10px 20px',
              background: 'none',
              border: 'none',
              borderBottom: tab === t ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: tab === t ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              marginBottom: '-1px',
              transition: 'all 0.2s',
            }}
          >
            {t === 'nuevo' ? '➕ Nuevo Reporte' : `📋 Mis Reportes (${reportes.length})`}
          </button>
        ))}
      </div>

      {tab === 'nuevo' && (
        <form onSubmit={handleSubmit}>
          {success && (
            <div className="glass-card mb-5 text-center" style={{ padding: '20px', background: 'rgba(46,204,113,0.1)', borderColor: 'rgba(46,204,113,0.3)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
              <p style={{ color: 'var(--accent-bright)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>¡Reporte enviado exitosamente!</p>
            </div>
          )}

          {/* Tipo */}
          <div className="form-group">
            <label className="form-label">Tipo de problema *</label>
            <div className="grid grid-cols-2 gap-3">
              {TIPOS.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => update('tipo', t.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: form.tipo === t.value ? '1px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                    background: form.tipo === t.value ? 'rgba(46,204,113,0.1)' : 'rgba(10,22,11,0.5)',
                    cursor: 'pointer',
                    color: form.tipo === t.value ? 'var(--text-primary)' : 'var(--text-muted)',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{t.icon}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, fontFamily: 'var(--font-display)' }}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Describe brevemente la situación..."
              value={form.descripcion}
              onChange={e => update('descripcion', e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Photo */}
          <div className="form-group">
            <label className="form-label">Foto (opcional)</label>
            <div
              className="glass-card"
              style={{ padding: '20px', textAlign: 'center', cursor: 'pointer', borderStyle: 'dashed', minHeight: '100px', position: 'relative' }}
              onClick={() => document.getElementById('foto-input').click()}
            >
              {preview ? (
                <img src={preview} alt="preview" style={{ maxHeight: '180px', borderRadius: '10px', objectFit: 'cover', width: '100%' }} />
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📷</div>
                  Toca para subir foto
                </div>
              )}
              <input id="foto-input" type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleImage} />
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">Ubicación *</label>
            <div className="flex gap-2 mb-3">
              <input
                className="form-input"
                style={{ flex: 1 }}
                placeholder="Haz clic en el mapa o usa tu ubicación"
                value={form.ubicacion}
                onChange={e => update('ubicacion', e.target.value)}
              />
              <button type="button" className="btn-outline" style={{ padding: '10px 14px', whiteSpace: 'nowrap' }} onClick={getCurrentLocation}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4"/></svg>
                GPS
              </button>
            </div>
            <div className="map-wrap" style={{ height: '220px' }}>
              <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
              Haz clic en el mapa o arrastra el pin para ajustar la ubicación
            </p>
          </div>

          <button
            type="submit"
            className="btn-primary w-full justify-center"
            style={{ fontSize: '0.95rem', padding: '14px' }}
            disabled={loading || !form.tipo}
          >
            {loading ? (
              <><div className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Enviando...</>
            ) : (
              <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Enviar Reporte</>
            )}
          </button>
        </form>
      )}

      {tab === 'historial' && (
        <div>
          {reportes.length === 0 ? (
            <div className="glass-card text-center" style={{ padding: '48px 20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📋</div>
              <p style={{ color: 'var(--text-muted)' }}>No has enviado reportes todavía</p>
              <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => setTab('nuevo')}>
                Crear primer reporte
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {reportes.map(r => (
                <div key={r.id} className="glass-card" style={{ padding: '16px 20px' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{ fontSize: '1.1rem' }}>{TIPOS.find(t => t.value === r.tipo)?.icon || '📌'}</span>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {TIPOS.find(t => t.value === r.tipo)?.label || r.tipo}
                        </span>
                      </div>
                      {r.descripcion && <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>{r.descripcion}</p>}
                      {r.ubicacion && <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>📍 {r.ubicacion}</p>}
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                        {new Date(r.fecha).toLocaleString('es-CO')}
                      </p>
                    </div>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-display)',
                      background: r.status === 'resuelto' ? 'rgba(46,204,113,0.15)' : 'rgba(201,168,76,0.15)',
                      color: r.status === 'resuelto' ? 'var(--accent-bright)' : 'var(--accent-gold)',
                      border: `1px solid ${r.status === 'resuelto' ? 'rgba(46,204,113,0.3)' : 'rgba(201,168,76,0.3)'}`,
                    }}>
                      {r.status === 'resuelto' ? '✓ Resuelto' : '⏳ Pendiente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
