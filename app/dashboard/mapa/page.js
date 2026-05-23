'use client';

import { useEffect, useRef, useState } from 'react';
import { BARRIOS_POR_COMUNA, HORARIOS_POR_COMUNA, PUNTOS_ACOPIO, NEIVA_CENTER } from '../../../lib/data';

const ZONE_COLORS = {
  '01': { fill: '#c8e6c9', border: '#4caf50', comunas: ['1','2'], label: 'Lun · Mié · Vie  7AM–1PM' },
  '02': { fill: '#ef9a9a', border: '#f44336', comunas: ['5','7','10'], label: 'Mar · Jue · Sáb  7AM–1PM' },
  '03': { fill: '#80cbc4', border: '#009688', comunas: ['3','4'], label: 'Lun · Mié · Vie  1PM–7PM' },
  '04': { fill: '#a5d6a7', border: '#388e3c', comunas: ['6','8'], label: 'Mar · Jue · Sáb  1PM–7PM' },
  '05': { fill: '#b2dfdb', border: '#00897b', comunas: ['9'], label: 'Lun a Sáb  7AM–3PM' },
};

// Approximate polygon coordinates for each zone based on the map image
const ZONE_POLYGONS = {
  '01': [
    [2.9550, -75.3100], [2.9650, -75.2900], [2.9600, -75.2700],
    [2.9500, -75.2650], [2.9400, -75.2700], [2.9380, -75.2900],
    [2.9430, -75.3050],
  ],
  '02': [
    [2.9500, -75.2650], [2.9600, -75.2700], [2.9550, -75.2450],
    [2.9400, -75.2300], [2.9200, -75.2350], [2.9150, -75.2500],
    [2.9300, -75.2600],
  ],
  '03': [
    [2.9380, -75.2900], [2.9400, -75.2700], [2.9300, -75.2600],
    [2.9200, -75.2700], [2.9180, -75.2850], [2.9250, -75.3000],
    [2.9320, -75.3000],
  ],
  '04': [
    [2.9180, -75.2850], [2.9200, -75.2700], [2.9150, -75.2500],
    [2.9000, -75.2600], [2.8950, -75.2800], [2.9050, -75.3000],
    [2.9130, -75.2950],
  ],
  '05': [
    [2.9430, -75.3050], [2.9380, -75.2900], [2.9320, -75.3000],
    [2.9250, -75.3000], [2.9180, -75.2850], [2.9130, -75.2950],
    [2.9050, -75.3000], [2.9000, -75.3200], [2.9150, -75.3350],
    [2.9350, -75.3300],
  ],
};

export default function MapaPage() {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedPunto, setSelectedPunto] = useState(null);
  const [showPuntos, setShowPuntos] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [searchVal, setSearchVal] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined' || leafletMap.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      const map = L.map(mapRef.current, {
        center: NEIVA_CENTER,
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Dark tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      leafletMap.current = map;

      // Draw zone polygons
      Object.entries(ZONE_POLYGONS).forEach(([zone, coords]) => {
        const info = ZONE_COLORS[zone];
        const polygon = L.polygon(coords, {
          color: info.border,
          fillColor: info.fill,
          fillOpacity: 0.25,
          weight: 1.5,
          opacity: 0.7,
        }).addTo(map);

        polygon.on('click', () => setSelectedZone(zone));
        polygon.on('mouseover', function() {
          this.setStyle({ fillOpacity: 0.4, weight: 2.5 });
        });
        polygon.on('mouseout', function() {
          this.setStyle({ fillOpacity: 0.25, weight: 1.5 });
        });

        // Zone label
        const center = polygon.getBounds().getCenter();
        L.marker(center, {
          icon: L.divIcon({
            html: `<div style="background:rgba(6,14,7,0.85);border:1px solid ${info.border};color:#e8f5e9;padding:4px 8px;border-radius:6px;font-size:11px;font-weight:700;white-space:nowrap;backdrop-filter:blur(8px)">Zona ${zone}</div>`,
            className: '',
            iconAnchor: [30, 12],
          }),
        }).addTo(map);
      });

      // Puntos de acopio markers
      const ecoIcon = L.divIcon({
        html: `<div style="width:28px;height:28px;background:linear-gradient(135deg,#2ecc71,#27ae60);border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid rgba(79,255,176,0.6);box-shadow:0 0 12px rgba(46,204,113,0.5);font-size:13px">♻️</div>`,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      PUNTOS_ACOPIO.forEach(p => {
        const marker = L.marker([p.lat, p.lng], { icon: ecoIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family:'DM Sans',sans-serif;min-width:180px">
            <strong style="font-size:0.9rem;color:#e8f5e9">${p.nombre}</strong><br/>
            <span style="font-size:0.78rem;color:#a5c8a8">${p.direccion}</span><br/>
            <div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:4px">
              ${p.tipos.map(t => `<span style="background:rgba(46,204,113,0.2);border:1px solid rgba(46,204,113,0.3);padding:2px 6px;border-radius:4px;font-size:0.7rem;color:#4fffb0">${t}</span>`).join('')}
            </div>
          </div>
        `, { maxWidth: 220 });
        marker.on('click', () => setSelectedPunto(p));
      });

      // User location from session
      const session = localStorage.getItem('trankas_session');
      if (session) {
        const user = JSON.parse(session);
        if (user?.location?.lat && user?.location?.lng) {
          const userIcon = L.divIcon({
            html: `<div style="width:24px;height:24px;background:#2ecc71;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 4px rgba(46,204,113,0.3),0 4px 12px rgba(0,0,0,0.4)"></div>`,
            className: '',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });
          L.marker([user.location.lat, user.location.lng], { icon: userIcon })
            .addTo(map)
            .bindPopup(`<strong style="color:#e8f5e9">Tu ubicación</strong><br/><span style="color:#a5c8a8;font-size:0.8rem">${user.location.barrio || ''}</span>`);
          map.setView([user.location.lat, user.location.lng], 14);
          setUserLocation({ lat: user.location.lat, lng: user.location.lng });
        }
      }
    };

    initMap();

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  const handleSearch = async () => {
    if (!searchVal.trim()) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchVal + ', Neiva, Huila, Colombia')}&limit=1`);
      const data = await res.json();
      if (data.length > 0 && leafletMap.current) {
        const { lat, lon } = data[0];
        leafletMap.current.setView([parseFloat(lat), parseFloat(lon)], 16);
        setSearchResult({ lat: parseFloat(lat), lng: parseFloat(lon), name: data[0].display_name });
      }
    } catch {}
  };

  const flyToUser = () => {
    if (!leafletMap.current) return;
    navigator.geolocation.getCurrentPosition(pos => {
      leafletMap.current.setView([pos.coords.latitude, pos.coords.longitude], 16);
    });
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div className="section-header">
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
          🗺️ Mapa de <span className="gradient-text">Rutas</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
          5 zonas de recolección domiciliaria en Neiva
        </p>
      </div>

      <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
        {/* Map */}
        <div style={{ flex: '1 1 500px', minWidth: 0 }}>
          {/* Search bar */}
          <div className="glass-card mb-3" style={{ padding: '10px 14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              className="form-input"
              style={{ flex: 1, background: 'transparent', border: 'none', padding: '4px 0', fontSize: '0.9rem', boxShadow: 'none' }}
              placeholder="Buscar barrio o dirección..."
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button className="btn-primary" style={{ padding: '7px 14px', fontSize: '0.82rem' }} onClick={handleSearch}>
              Buscar
            </button>
            <button className="btn-ghost" style={{ padding: '7px', borderRadius: '8px' }} onClick={flyToUser} title="Mi ubicación">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
            </button>
          </div>

          {/* Map container */}
          <div className="map-wrap" style={{ height: '500px' }}>
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ flex: '0 0 240px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Legend */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
              Leyenda
            </h3>
            {Object.entries(ZONE_COLORS).map(([zone, info]) => (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone === selectedZone ? null : zone)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: selectedZone === zone ? `1px solid ${info.border}` : '1px solid transparent',
                  background: selectedZone === zone ? `${info.fill}22` : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginBottom: '4px',
                  textAlign: 'left',
                }}
              >
                <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: info.fill, border: `2px solid ${info.border}`, flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                    Zona {zone}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1px' }}>{info.label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '1px' }}>Comunas {info.comunas.join(', ')}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Selected zone detail */}
          {selectedZone && (
            <div className="glass-card" style={{ padding: '16px', borderColor: ZONE_COLORS[selectedZone].border, background: `${ZONE_COLORS[selectedZone].fill}11` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  Zona {selectedZone}
                </h3>
                <button className="btn-ghost" style={{ padding: '4px', borderRadius: '50%' }} onClick={() => setSelectedZone(null)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              {ZONE_COLORS[selectedZone].comunas.map(c => {
                const h = HORARIOS_POR_COMUNA[c];
                return (
                  <div key={c} style={{ marginBottom: '8px', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      Comuna {c} · {h?.nombreZona}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{h?.dias}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: '2px' }}>{h?.horario}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Puntos de acopio toggle */}
          <div className="glass-card" style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>♻️ Puntos de acopio</span>
            <button
              onClick={() => setShowPuntos(v => !v)}
              style={{
                width: '44px', height: '24px',
                borderRadius: '12px',
                background: showPuntos ? 'var(--accent-primary)' : 'var(--border-glass)',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s',
              }}
            >
              <div style={{
                position: 'absolute',
                top: '3px',
                left: showPuntos ? '22px' : '3px',
                width: '18px', height: '18px',
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.2s',
              }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
