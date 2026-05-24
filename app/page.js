'use client';

import { useEffect, useRef, useState } from 'react';
import AuthModal from '../components/AuthModal';

export default function LandingPage() {
  const canvasRef = useRef(null);
  const heroRef = useRef(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [framesLoaded, setFramesLoaded] = useState(false);

  useEffect(() => {
    let ScrollTrigger;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // =====================================================
    // FRAME SEQUENCE — pon tus imágenes en /public/frames/
    // Nombra los archivos: 0001.jpg, 0002.jpg, ... 00NN.jpg
    // O cualquier formato que uses (jpg, png, webp)
    // =====================================================
    const FRAME_COUNT = 36; // ← cambia este número al total de tus frames
    const FRAME_PATH = (i) => `/frames/${String(i + 1).padStart(4, '0')}.png`; // ← ajusta la extensión si usas .png o .webp

    const images = [];
    let loadedCount = 0;
    let gsapInstance;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Redraw current frame on resize
      const frameObj = { frame: 0 };
      if (images[0]) drawFrame(0);
    }

    function drawFrame(index) {
      const img = images[Math.min(index, images.length - 1)];
      if (!img || !img.complete) return;
      const cw = canvas.width, ch = canvas.height;
      const iw = img.naturalWidth, ih = img.naturalHeight;
      // Cover mode — fill canvas, centered
      const scale = Math.max(cw / iw, ch / ih);
      const sw = iw * scale, sh = ih * scale;
      const ox = (cw - sw) / 2, oy = (ch - sh) / 2;
      ctx.drawImage(img, ox, oy, sw, sh);
    }

    function preloadFrames() {
      for (let i = 0; i < FRAME_COUNT; i++) {
        const img = new Image();
        img.src = FRAME_PATH(i);
        img.onload = () => {
          loadedCount++;
          if (i === 0) { resize(); drawFrame(0); } // draw first frame immediately
          if (loadedCount === FRAME_COUNT) {
            setFramesLoaded(true);
            initGSAP();
          }
        };
        img.onerror = () => {
          // Frame missing — count it anyway so we don't hang forever
          loadedCount++;
          if (loadedCount === FRAME_COUNT) initGSAP();
        };
        images[i] = img;
      }
    }

    async function initGSAP() {
      const g = await import('gsap');
      const { ScrollTrigger: ST } = await import('gsap/ScrollTrigger');
      const gsap = g.gsap;
      ScrollTrigger = ST;
      gsap.registerPlugin(ScrollTrigger);
      gsapInstance = gsap;

      const hero = heroRef.current;
      if (!hero) return;

      const frameObj = { frame: 0 };
      gsap.to(frameObj, {
        frame: FRAME_COUNT - 1,
        snap: 'frame',
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: '+=250%',
          scrub: 0.5,
          pin: true,
        },
        onUpdate: () => drawFrame(Math.round(frameObj.frame)),
      });

      // Content animations
      gsap.fromTo('.hero-badge-el', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: 'power3.out' });
      gsap.fromTo('.hero-title-el', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, delay: 0.4, ease: 'power3.out' });
      gsap.fromTo('.hero-sub-el', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9, delay: 0.6, ease: 'power3.out' });
      gsap.fromTo('.hero-btns-el', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.8, ease: 'power3.out' });
      gsap.fromTo('.hero-stats-el', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 1.0, ease: 'power3.out' });

      gsap.to('.hero-content-wrap', {
        y: -80, opacity: 0,
        scrollTrigger: { trigger: hero, start: 'top top', end: '+=60%', scrub: 1 },
      });

      gsap.utils.toArray('.feature-reveal').forEach((el, i) => {
        gsap.fromTo(el, { opacity: 0, y: 60 }, {
          opacity: 1, y: 0, duration: 0.8, delay: i * 0.08,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      });
    }

    resize();
    preloadFrames();

    window.addEventListener('resize', resize);
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', handleScroll);
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger?.getAll()?.forEach(t => t.kill());
    };
  }, []);

  const openAuth = (mode) => { setAuthMode(mode); setAuthOpen(true); };

  return (
    <>
      {/* ===== NAVBAR ===== */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass-nav' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[#27ae60] flex items-center justify-center animate-glow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 0 0-7.5 16.5"/><path d="M12 2c2 4 4 8 0 14"/><path d="M12 2c-2 4-4 8 0 14"/><path d="M2 12h20"/>
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'white' }}>Trankas</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['#features', '#how', '#rutas'].map((href, i) => (
              <a key={href} href={href} style={{ fontSize: '0.88rem', color: 'var(--text-muted)', textDecoration: 'none', fontFamily: 'var(--font-body)', fontWeight: 500, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
              >
                {['Funciones', '¿Cómo funciona?', 'Rutas'][i]}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button className="btn-ghost text-sm" onClick={() => openAuth('login')}>Ingresar</button>
            <button className="btn-primary text-sm" onClick={() => openAuth('register')}>Comenzar gratis</button>
          </div>

          <button className="md:hidden text-[var(--text-muted)] p-2" onClick={() => setMobileMenuOpen(v => !v)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden glass-nav px-6 py-4 flex flex-col gap-3">
            <a href="#features" className="btn-ghost" onClick={() => setMobileMenuOpen(false)}>Funciones</a>
            <a href="#how" className="btn-ghost" onClick={() => setMobileMenuOpen(false)}>¿Cómo funciona?</a>
            <button className="btn-primary w-full" onClick={() => { openAuth('register'); setMobileMenuOpen(false); }}>Comenzar gratis</button>
            <button className="btn-outline w-full" onClick={() => { openAuth('login'); setMobileMenuOpen(false); }}>Ingresar</button>
          </div>
        )}
      </nav>

      {/* ===== HERO ===== */}
      <section ref={heroRef} className="relative w-full h-screen overflow-hidden">
        {/* Real frame canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ objectFit: 'cover' }} />

        {/* Dark overlay so text is readable */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(2,9,4,0.45)' }} />

        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at center, transparent 35%, rgba(2,9,4,0.65) 100%)',
        }} />

        {/* Bottom fade to sections */}
        <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none" style={{
          background: 'linear-gradient(to bottom, transparent, var(--bg-void))',
        }} />

        {/* Noise grain */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          opacity: 0.5, mixBlendMode: 'overlay',
        }} />

        {/* Hero content */}
        <div className="hero-content-wrap absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <div className="hero-badge-el mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: 'rgba(46,204,113,0.12)', border: '1px solid rgba(46,204,113,0.3)', opacity: 0 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)', display: 'inline-block', animation: 'glowPulse 2s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.72rem', color: 'var(--accent-bright)', letterSpacing: '2.5px', textTransform: 'uppercase' }}>
              NEIVA, HUILA · COLOMBIA
            </span>
          </div>

          <h1 className="hero-title-el mb-5" style={{ opacity: 0 }}>
            <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(4.5rem, 11vw, 10rem)', lineHeight: 0.95, background: 'linear-gradient(135deg, #fff 0%, var(--accent-bright) 50%, var(--accent-primary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Trankas
            </span>
            <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 'clamp(0.9rem, 2vw, 1.3rem)', color: 'rgba(255,255,255,0.7)', marginTop: '10px', letterSpacing: '4px', textTransform: 'uppercase' }}>
              Gestión inteligente de residuos
            </span>
          </h1>

          <p className="hero-sub-el max-w-lg mx-auto mb-10" style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(0.9rem, 2vw, 1.05rem)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, opacity: 0 }}>
            Conoce cuándo pasa el camión por tu barrio, reporta problemas y conecta con recicladores de Neiva.
          </p>

          <div className="hero-btns-el flex flex-wrap gap-4 justify-center mb-14" style={{ opacity: 0 }}>
            <button className="btn-primary" style={{ fontSize: '1rem', padding: '15px 38px' }} onClick={() => openAuth('register')}>
              Comenzar gratis
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <a href="#features" className="btn-outline" style={{ fontSize: '1rem', padding: '14px 32px' }}>
              Ver funciones
            </a>
          </div>

          <div className="hero-stats-el flex gap-10 md:gap-20 justify-center" style={{ opacity: 0 }}>
            {[{ value: 10, suffix: '', label: 'Comunas' }, { value: 200, suffix: '+', label: 'Barrios' }, { value: 5, suffix: '', label: 'Zonas de recolección' }].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', color: '#fff', lineHeight: 1 }}>
                  {s.value}{s.suffix}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginTop: '4px', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ color: 'rgba(255,255,255,0.3)', animation: 'float 3s ease-in-out infinite' }}>
          <span style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>Scroll</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-28 px-6" style={{ background: 'var(--bg-void)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 feature-reveal">
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '3px', color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '14px' }}>
              Funcionalidades
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.2rem)', lineHeight: 1.1 }}>
              Todo lo que necesitas<br /><span className="gradient-text">en un solo lugar</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '🗺️', title: 'Mapa Interactivo', desc: '5 zonas de recolección de Neiva en tiempo real. Haz clic en tu barrio para ver el horario exacto.', color: 'rgba(46,204,113,0.07)', border: 'rgba(46,204,113,0.18)' },
              { icon: '🤖', title: 'Asistente IA (Groq)', desc: 'Pregúntale qué hacer con cualquier residuo. Clasificación inteligente con Llama 3.3 en tiempo real.', color: 'rgba(79,255,176,0.05)', border: 'rgba(79,255,176,0.15)' },
              { icon: '📍', title: 'Reportes Comunitarios', desc: 'Reporta basureros clandestinos o fallas con foto y GPS. La comunidad te respalda.', color: 'rgba(201,168,76,0.05)', border: 'rgba(201,168,76,0.15)' },
              { icon: '♻️', title: 'Puntos de Acopio', desc: 'Encuentra el punto verde más cercano para plástico, vidrio, papel o electrónicos.', color: 'rgba(46,204,113,0.05)', border: 'rgba(46,204,113,0.12)' },
              { icon: '🚛', title: 'Recolección Especial', desc: 'Solicita recogida de escombros o muebles. Conectamos con recicladores independientes.', color: 'rgba(52,152,219,0.05)', border: 'rgba(52,152,219,0.15)' },
              { icon: '🔔', title: 'Alertas y Recordatorios', desc: 'Recibe notificaciones antes del día de recolección y alertas comunitarias de tu zona.', color: 'rgba(255,107,53,0.05)', border: 'rgba(255,107,53,0.12)' },
            ].map((f, i) => (
              <div key={i} className="glass-card feature-reveal p-7 flex flex-col gap-4" style={{ background: f.color, borderColor: f.border }}>
                <div style={{ fontSize: '2rem' }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW ===== */}
      <section id="how" className="py-28 px-6" style={{ background: 'linear-gradient(180deg, var(--bg-void) 0%, var(--bg-deep) 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20 feature-reveal">
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '3px', color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '14px' }}>¿Cómo funciona?</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.1 }}>
              Simple. Rápido. <span className="gradient-text">Efectivo.</span>
            </h2>
          </div>
          <div className="flex flex-col gap-5">
            {[
              { num: '01', icon: '👤', title: 'Crea tu cuenta', desc: 'Regístrate con Google, Apple o tu correo en 30 segundos.' },
              { num: '02', icon: '📍', title: 'Configura tu barrio', desc: 'Selecciona tu barrio y te mostramos el horario de recolección exacto de tu zona.' },
              { num: '03', icon: '✨', title: 'Úsala', desc: 'Consulta el mapa, usa el asistente IA, reporta problemas o solicita recolección especial.' },
            ].map((s, i) => (
              <div key={i} className="glass-card feature-reveal flex gap-6 items-start p-7">
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 800, color: 'rgba(46,204,113,0.12)', lineHeight: 1, minWidth: '56px', flexShrink: 0 }}>{s.num}</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '1.3rem' }}>{s.icon}</span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{s.title}</h3>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== RUTAS ===== */}
      <section id="rutas" className="py-28 px-6" style={{ background: 'var(--bg-void)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 feature-reveal">
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '3px', color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '14px' }}>Rutas oficiales</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.1 }}>
              Horarios de <span className="gradient-text">recolección</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 feature-reveal">
            {[
              { zona: '01', nombre: 'Norte — Aeropuerto', comunas: '1, 2', dias: 'Lun / Mié / Vie', horario: '7AM – 1PM', color: '#c8e6c9' },
              { zona: '02', nombre: 'Oriente', comunas: '5, 7, 10', dias: 'Mar / Jue / Sáb', horario: '7AM – 1PM', color: '#ef9a9a' },
              { zona: '03', nombre: 'Centro — Entre Ríos', comunas: '3, 4', dias: 'Lun / Mié / Vie', horario: '1PM – 7PM', color: '#80cbc4' },
              { zona: '04', nombre: 'Sur', comunas: '6, 8', dias: 'Mar / Jue / Sáb', horario: '1PM – 7PM', color: '#a5d6a7' },
              { zona: '05', nombre: 'Norte — Galindo', comunas: '9', dias: 'Lun a Sáb', horario: '7AM – 3PM', color: '#b2dfdb' },
            ].map((z, i) => (
              <div key={i} className="glass-card p-5">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '3px', background: z.color, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '2px', textTransform: 'uppercase' }}>Zona {z.zona}</span>
                </div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '2px' }}>{z.nombre}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Comunas {z.comunas}</p>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>📅 {z.dias}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--accent-primary)', marginTop: '2px' }}>⏰ {z.horario}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10 feature-reveal">
            <button className="btn-primary" onClick={() => openAuth('register')}>
              Ver mapa interactivo completo →
            </button>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-28 px-6" style={{ background: 'var(--bg-deep)' }}>
        <div className="max-w-2xl mx-auto text-center feature-reveal">
          <div className="glass-card p-12 md:p-16" style={{ background: 'rgba(46,204,113,0.04)', borderColor: 'rgba(46,204,113,0.2)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🌱</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', lineHeight: 1.1, marginBottom: '14px' }}>
              Únete a la comunidad<br /><span className="gradient-text">Trankas</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '28px' }}>
              Haz parte del cambio en Neiva. Gestiona tus residuos de forma inteligente.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              <button className="btn-primary" style={{ fontSize: '1rem', padding: '14px 36px' }} onClick={() => openAuth('register')}>Crear cuenta gratis</button>
              <button className="btn-outline" onClick={() => openAuth('login')}>Ya tengo cuenta</button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-10 px-6" style={{ background: 'var(--bg-void)', borderTop: '1px solid var(--border-glass)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-5">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 28, height: 28, borderRadius: '8px', background: 'linear-gradient(135deg, var(--accent-primary), #27ae60)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2a10 10 0 0 0-7.5 16.5"/><path d="M12 2c2 4 4 8 0 14"/><path d="M12 2c-2 4-4 8 0 14"/></svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>Trankas</span>
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>© 2025 Trankas — Gestión de residuos para Neiva, Huila</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            {['Términos', 'Privacidad', 'Contacto'].map(l => (
              <a key={l} href="#" style={{ color: 'var(--text-dim)', fontSize: '0.8rem', textDecoration: 'none' }}
                onMouseEnter={e => e.target.style.color = 'var(--text-muted)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-dim)'}>{l}</a>
            ))}
          </div>
        </div>
      </footer>

      <AuthModal isOpen={authOpen} mode={authMode} onClose={() => setAuthOpen(false)} onModeChange={setAuthMode} />
    </>
  );
}
