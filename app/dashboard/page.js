'use client';

import { useState, useEffect } from 'react';
import { HORARIOS_POR_COMUNA } from '../../lib/data';
import Link from 'next/link';

export default function DashboardHome() {
  const [user, setUser] = useState(null);
  const [horario, setHorario] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [stats, setStats] = useState({ reportes: 0, solicitudes: 0, alertas: 0 });

  useEffect(() => {
    const session = localStorage.getItem('trankas_session');
    if (!session) return;
    const u = JSON.parse(session);
    setUser(u);
    if (u?.location?.comuna) {
      const h = HORARIOS_POR_COMUNA[u.location.comuna];
      setHorario(h);
    }
    // Load stats
    const reportes = JSON.parse(localStorage.getItem(`trankas_reportes_${u.id}`) || '[]');
    const solicitudes = JSON.parse(localStorage.getItem(`trankas_solicitudes_${u.id}`) || '[]');
    const alertas = JSON.parse(localStorage.getItem('trankas_alertas') || '[]').filter(a => a.userId === u.id);
    setStats({ reportes: reportes.length, solicitudes: solicitudes.length, alertas: alertas.length });
  }, []);

  useEffect(() => {
    if (!horario) return;
    const update = () => {
      const diasMap = { 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6, 'Domingo': 0 };
      // Parse first day from "Lun, Mié y Vie" or "Martes, Jueves y Sábado"
      const firstDay = horario.dias.split(/[,/]/)[0].trim();
      const dayKey = Object.keys(diasMap).find(k => firstDay.toLowerCase().includes(k.toLowerCase()));
      if (!dayKey) return;
      const target = diasMap[dayKey];
      const now = new Date();
      const cur = now.getDay();
      let diff = target - cur;
      if (diff < 0) diff += 7;
      if (diff === 0) setCountdown('¡Hoy es día de recolección!');
      else if (diff === 1) setCountdown('Mañana pasa el camión');
      else setCountdown(`Faltan ${diff} días`);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [horario]);

  const firstName = user?.name?.split(' ')[0] || 'Usuario';

  const quickActions = [
    { label: 'Asistente IA', icon: '🤖', href: '/dashboard/asistente', color: 'rgba(79,255,176,0.08)', border: 'rgba(79,255,176,0.2)' },
    { label: 'Mapa de Rutas', icon: '🗺️', href: '/dashboard/mapa', color: 'rgba(46,204,113,0.08)', border: 'rgba(46,204,113,0.2)' },
    { label: 'Reportar', icon: '📍', href: '/dashboard/reportes', color: 'rgba(201,168,76,0.08)', border: 'rgba(201,168,76,0.2)' },
    { label: 'Recolección Especial', icon: '🚛', href: '/dashboard/solicitud', color: 'rgba(52,152,219,0.08)', border: 'rgba(52,152,219,0.2)' },
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: 'var(--text-primary)' }}>
          Hola, <span className="gradient-text">{firstName}</span> 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '6px' }}>
          {user?.location?.barrio ? `Barrio ${user.location.barrio} • ` : ''}
          {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Próxima recolección - highlight card */}
      {horario ? (
        <div className="glass-card mb-6" style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, rgba(46,204,113,0.12), rgba(46,204,113,0.04))',
          borderColor: 'rgba(46,204,113,0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '1.4rem' }}>🚛</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.75rem', color: 'var(--accent-primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                Próxima recolección
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {horario.dias}
            </div>
            <div style={{ color: 'var(--accent-bright)', fontSize: '0.9rem', marginTop: '4px' }}>
              {horario.horario} · Zona {horario.nombreZona}
            </div>
          </div>
          <div className="text-right">
            <div style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(46,204,113,0.15)',
              border: '1px solid rgba(46,204,113,0.3)',
              color: 'var(--accent-bright)',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}>
              {countdown || '...'}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card mb-6" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📍</div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '12px', fontSize: '0.9rem' }}>
            Configura tu ubicación para ver el horario de recolección de tu barrio
          </p>
          <Link href="/dashboard/horario">
            <button className="btn-primary" style={{ fontSize: '0.9rem' }}>Configurar ubicación</button>
          </Link>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { num: stats.reportes, label: 'Reportes', icon: '📍', color: 'rgba(201,168,76,0.1)' },
          { num: stats.solicitudes, label: 'Solicitudes', icon: '🚛', color: 'rgba(52,152,219,0.1)' },
          { num: stats.alertas, label: 'Alertas', icon: '⚠️', color: 'rgba(255,107,53,0.1)' },
        ].map((s, i) => (
          <div key={i} className="glass-card stat-card" style={{ background: s.color }}>
            <div style={{ fontSize: '1.4rem' }}>{s.icon}</div>
            <div className="stat-number">{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '14px' }}>
        Acciones rápidas
      </h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {quickActions.map((a, i) => (
          <Link key={i} href={a.href} style={{ textDecoration: 'none' }}>
            <div className="glass-card" style={{ padding: '20px', cursor: 'pointer', background: a.color, borderColor: a.border }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{a.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {a.label}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Zone map preview */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
            Zonas de recolección
          </h3>
          <Link href="/dashboard/mapa">
            <button className="btn-ghost" style={{ fontSize: '0.82rem', color: 'var(--accent-primary)' }}>
              Ver mapa completo →
            </button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { zona: '01', dias: 'Lun · Mié · Vie', horario: '7AM–1PM', color: '#c8e6c9', comunas: '1, 2' },
            { zona: '02', dias: 'Mar · Jue · Sáb', horario: '7AM–1PM', color: '#ef9a9a', comunas: '5, 7, 10' },
            { zona: '03', dias: 'Lun · Mié · Vie', horario: '1PM–7PM', color: '#80cbc4', comunas: '3, 4' },
            { zona: '04', dias: 'Mar · Jue · Sáb', horario: '1PM–7PM', color: '#a5d6a7', comunas: '6, 8' },
            { zona: '05', dias: 'Lun a Sáb', horario: '7AM–3PM', color: '#b2dfdb', comunas: '9' },
          ].map(z => (
            <div key={z.zona} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: z.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.78rem', color: 'var(--text-primary)' }}>Zona {z.zona} · Comunas {z.comunas}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{z.dias} · <span style={{ color: 'var(--accent-primary)' }}>{z.horario}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
