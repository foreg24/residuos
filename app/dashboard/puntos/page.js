'use client';

import { useState, useEffect, useRef } from 'react';
import { PUNTOS_ACOPIO, NEIVA_CENTER } from '../../../lib/data';

const TIPO_ICONS = { plastico: '🧴', papel: '📄', vidrio: '🫙', metal: '🔩', organico: '🌿', vegetal: '🥦', electronicos: '📱' };
const TIPO_LABELS = { plastico: 'Plástico', papel: 'Papel', vidrio: 'Vidrio', metal: 'Metal', organico: 'Orgánico', vegetal: 'Vegetal', electronicos: 'Electrónicos' };

export default function PuntosPage() {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('todos');
  const markersRef = useRef([]);

  const allTypes = [...new Set(PUNTOS_ACOPIO.flatMap(p => p.tipos))];

  const filtered = filter === 'todos'
    ? PUNTOS_ACOPIO
    : PUNTOS_ACOPIO.filter(p => p.tipos.includes(filter));

  useEffect(() => {
    if (typeof window === 'undefined' || leafletMap.current) return;
    const init = async () => {
      if (!mapRef.current) return;
      const L = (await import('leaflet')).default;
      const map = L.map(mapRef.current, { center: NEIVA_CENTER, zoom: 14 });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '© CARTO', subdomains: 'abcd' }).addTo(map);
      leafletMap.current = map;
      renderMarkers(L, map, PUNTOS_ACOPIO);
    };
    init();
    return () => { if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; } };
  }, []);

  useEffect(() => {
    if (!leafletMap.current) return;
    import('leaflet').then(({ default: L }) => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      renderMarkers(L, leafletMap.current, filtered);
    });
  }, [filter]);

  const renderMarkers = (L, map, points) => {
    points.forEach(p => {
      const icon = L.divIcon({
        html: `<div style="width:34px;height:34px;background:linear-gradient(135deg,#2ecc71,#27ae60);border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid rgba(79,255,176,0.7);box-shadow:0 0 16px rgba(46,204,113,0.6);font-size:16px;cursor:pointer">♻️</div>`,
        className: '', iconSize: [34, 34], iconAnchor: [17, 17],
      });
      const m = L.marker([p.lat, p.lng], { icon }).addTo(map);
      m.on('click', () => setSelected(p));
      m.bindPopup(`<div style="font-family:'DM Sans',sans-serif"><strong style="color:#e8f5e9">${p.nombre}</strong><br/><span style="color:#a5c8a8;font-size:0.8rem">${p.direccion}</span></div>`, { maxWidth: 200 });
      markersRef.current.push(m);
    });
  };

  const flyTo = (punto) => {
    setSelected(punto);
    if (leafletMap.current) {
      leafletMap.current.flyTo([punto.lat, punto.lng], 16, { duration: 1 });
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="section-header">
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.5rem,3vw,2rem)' }}>
          ♻️ Puntos de <span className="gradient-text">Acopio</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
          Encuentra dónde llevar tus materiales aprovechables
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setFilter('todos')}
          style={{ padding: '6px 14px', borderRadius: '20px', border: `1px solid ${filter === 'todos' ? 'var(--accent-primary)' : 'var(--border-glass)'}`, background: filter === 'todos' ? 'rgba(46,204,113,0.15)' : 'transparent', color: filter === 'todos' ? 'var(--accent-bright)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'var(--font-display)', transition: 'all 0.2s' }}
        >
          Todos ({PUNTOS_ACOPIO.length})
        </button>
        {allTypes.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            style={{ padding: '6px 14px', borderRadius: '20px', border: `1px solid ${filter === t ? 'var(--accent-primary)' : 'var(--border-glass)'}`, background: filter === t ? 'rgba(46,204,113,0.15)' : 'transparent', color: filter === t ? 'var(--accent-bright)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'var(--font-display)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            {TIPO_ICONS[t]} {TIPO_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="flex gap-5" style={{ flexWrap: 'wrap' }}>
        {/* List */}
        <div style={{ flex: '0 0 260px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(p => (
            <button
              key={p.id}
              onClick={() => flyTo(p)}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                border: selected?.id === p.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                background: selected?.id === p.id ? 'rgba(46,204,113,0.1)' : 'var(--bg-card)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                ♻️ {p.nombre}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{p.direccion}</div>
              <div className="flex flex-wrap gap-1">
                {p.tipos.map(t => (
                  <span key={t} style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.2)', color: 'var(--accent-primary)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                    {TIPO_ICONS[t]} {TIPO_LABELS[t]}
                  </span>
                ))}
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Sin resultados para "{TIPO_LABELS[filter]}"
            </div>
          )}
        </div>

        {/* Map */}
        <div style={{ flex: '1 1 400px', minWidth: 0 }}>
          <div className="map-wrap" style={{ height: '480px', position: 'sticky', top: '80px' }}>
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
          </div>

          {/* Selected info */}
          {selected && (
            <div className="glass-card mt-3" style={{ padding: '14px 16px' }}>
              <div className="flex justify-between items-start">
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {selected.nombre}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '10px' }}>{selected.direccion}</div>
                  <div className="flex flex-wrap gap-1">
                    {selected.tipos.map(t => (
                      <span key={t} style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.2)', color: 'var(--accent-primary)' }}>
                        {TIPO_ICONS[t]} {TIPO_LABELS[t]}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="btn-ghost" style={{ padding: '6px' }} onClick={() => setSelected(null)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
