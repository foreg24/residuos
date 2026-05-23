'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV_ITEMS = [
  { id: 'inicio', label: 'Inicio', href: '/dashboard', icon: HomeIcon },
  { id: 'horario', label: 'Mi Horario', href: '/dashboard/horario', icon: CalendarIcon },
  { id: 'mapa', label: 'Mapa de Rutas', href: '/dashboard/mapa', icon: MapIcon },
  { id: 'asistente', label: 'Asistente IA', href: '/dashboard/asistente', icon: BotIcon },
  { id: 'reportes', label: 'Reportar', href: '/dashboard/reportes', icon: AlertIcon },
  { id: 'solicitud', label: 'Recolección Especial', href: '/dashboard/solicitud', icon: TruckIcon },
  { id: 'puntos', label: 'Puntos de Acopio', href: '/dashboard/puntos', icon: PinIcon },
  { id: 'alertas', label: 'Alertas', href: '/dashboard/alertas', icon: BellIcon },
];

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const session = localStorage.getItem('trankas_session');
    if (!session) { router.push('/'); return; }
    setUser(JSON.parse(session));
  }, []);

  const logout = () => {
    localStorage.removeItem('trankas_session');
    router.push('/');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'TK';

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-void)', display: 'flex', flexDirection: 'column' }}>
      {/* ===== TOP NAV ===== */}
      <nav className="glass-nav fixed top-0 left-0 right-0 z-50" style={{ height: '60px' }}>
        <div className="flex items-center justify-between px-4 h-full">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="btn-ghost"
              style={{ padding: '8px', borderRadius: '10px', display: 'flex' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <Link href="/dashboard" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[#27ae60] flex items-center justify-center">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2a10 10 0 0 0-7.5 16.5"/><path d="M12 2c2 4 4 8 0 14"/><path d="M12 2c-2 4-4 8 0 14"/></svg>
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Trankas</span>
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button className="btn-ghost" style={{ padding: '8px', borderRadius: '10px' }} onClick={() => { setNotifOpen(v => !v); setUserMenuOpen(false); }}>
                <BellIcon size={18} />
                <span className="badge" style={{ position: 'absolute', top: '4px', right: '4px', width: '16px', height: '16px', fontSize: '0.6rem' }}>3</span>
              </button>
              {notifOpen && (
                <div className="glass-card" style={{ position: 'absolute', top: '46px', right: 0, width: '300px', padding: 0, overflow: 'hidden', zIndex: 100 }}>
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>Notificaciones</span>
                    <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--accent-primary)' }}>Marcar todas</button>
                  </div>
                  {[
                    { title: 'Recolección mañana', desc: 'El camión pasará por tu sector', time: 'Hace 2h', type: 'info' },
                    { title: 'Reporte resuelto', desc: 'Tu reporte ha sido atendido', time: 'Hace 5h', type: 'success' },
                    { title: 'Nueva alerta cerca', desc: 'Acumulación reportada a 200m', time: 'Hace 1d', type: 'warning' },
                  ].map((n, i) => (
                    <div key={i} className="notification-item">
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.type === 'info' ? '#3498db' : n.type === 'success' ? 'var(--accent-primary)' : '#f39c12', flexShrink: 0, marginTop: '6px' }} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{n.title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{n.desc}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>{n.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User menu */}
            <div style={{ position: 'relative' }}>
              <button
                className="flex items-center gap-2 btn-ghost"
                style={{ padding: '4px 8px 4px 4px', borderRadius: '20px' }}
                onClick={() => { setUserMenuOpen(v => !v); setNotifOpen(false); }}
              >
                <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>{initials}</div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name?.split(' ')[0] || 'Usuario'}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {userMenuOpen && (
                <div className="glass-card" style={{ position: 'absolute', top: '44px', right: 0, width: '180px', padding: '6px', zIndex: 100 }}>
                  <Link href="/dashboard/cuenta" className="sidebar-link" style={{ borderRadius: '10px' }} onClick={() => setUserMenuOpen(false)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Mi Cuenta
                  </Link>
                  <button className="sidebar-link w-full" style={{ borderRadius: '10px', color: '#ff6b35' }} onClick={logout}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex" style={{ paddingTop: '60px', minHeight: '100dvh' }}>
        {/* ===== SIDEBAR ===== */}
        <>
          {/* Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <aside
            className="fixed left-0 z-40 flex flex-col"
            style={{
              top: '60px',
              bottom: 0,
              width: '240px',
              background: 'rgba(6,14,7,0.95)',
              borderRight: '1px solid var(--border-glass)',
              backdropFilter: 'blur(30px)',
              transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
              padding: '16px 12px',
              overflowY: 'auto',
            }}
          >
            {/* User info */}
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="user-avatar">{initials}</div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name || 'Usuario'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                  {user?.isReciclador ? 'Reciclador' : 'Ciudadano'}
                </div>
              </div>
            </div>

            <div style={{ height: '1px', background: 'var(--border-glass)', marginBottom: '12px' }} />

            {/* Nav items */}
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                    style={{ textDecoration: 'none' }}
                  >
                    <Icon size={17} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div style={{ flex: 1 }} />
            <div style={{ height: '1px', background: 'var(--border-glass)', margin: '12px 0' }} />

            <button className="sidebar-link w-full" style={{ color: '#ff6b35' }} onClick={logout}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Cerrar sesión
            </button>
          </aside>
        </>

        {/* ===== MAIN CONTENT ===== */}
        <main style={{ flex: 1, padding: '24px', paddingBottom: '90px', maxWidth: '100%' }}>
          {children}
        </main>
      </div>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <nav className="mobile-bottom-nav">
        {NAV_ITEMS.slice(0, 5).map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              <Icon size={22} />
              <span>{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>

      {/* ===== FAB ===== */}
      <div className="fab" style={{ bottom: '80px' }}>
        <div className={`fab-actions ${fabOpen ? 'open' : ''}`}>
          <Link href="/dashboard/asistente" className="fab-action-btn" style={{ textDecoration: 'none' }} onClick={() => setFabOpen(false)}>
            <BotIcon size={16} />
            <span>Asistente IA</span>
          </Link>
          <Link href="/dashboard/reportes" className="fab-action-btn" style={{ textDecoration: 'none' }} onClick={() => setFabOpen(false)}>
            <AlertIcon size={16} />
            <span>Reportar</span>
          </Link>
        </div>
        <button className="fab-main-btn" onClick={() => setFabOpen(v => !v)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{ transition: 'transform 0.3s', transform: fabOpen ? 'rotate(45deg)' : 'rotate(0)' }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>

      {/* Click outside to close menus */}
      {(notifOpen || userMenuOpen) && (
        <div className="fixed inset-0 z-30" onClick={() => { setNotifOpen(false); setUserMenuOpen(false); }} />
      )}
    </div>
  );
}

// ===== ICONS =====
function HomeIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
function CalendarIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function MapIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
}
function BotIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>;
}
function AlertIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}
function TruckIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
}
function PinIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}
function BellIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}
