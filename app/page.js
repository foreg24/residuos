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

  // ===== FRAME-SCRUBBING VIDEO EFFECT =====
  useEffect(() => {
    let gsap, ScrollTrigger;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Generate synthetic "nature/city" frames using canvas drawing
    // In production, replace with actual PNG sequence from Neiva aerial footage
    const TOTAL_FRAMES = 90;
    const frames = [];
    let gsapInstance;

    function generateFrame(index, w, h) {
      const offscreen = document.createElement('canvas');
      offscreen.width = w;
      offscreen.height = h;
      const c = offscreen.getContext('2d');
      const t = index / TOTAL_FRAMES;

      // Sky gradient shifts from day to golden hour to night
      const skyColors = [
        { r: 2, g: 8, b: 4 },     // deep dark forest
        { r: 4, g: 14, b: 6 },    // dark green
        { r: 8, g: 20, b: 10 },   // emerald dark
        { r: 14, g: 30, b: 16 },  // midway
        { r: 6, g: 16, b: 8 },    // back dark
      ];

      const ci = Math.floor(t * (skyColors.length - 1));
      const ct = (t * (skyColors.length - 1)) % 1;
      const c1 = skyColors[Math.min(ci, skyColors.length - 1)];
      const c2 = skyColors[Math.min(ci + 1, skyColors.length - 1)];
      const R = Math.round(c1.r + (c2.r - c1.r) * ct);
      const G = Math.round(c1.g + (c2.g - c1.g) * ct);
      const B = Math.round(c1.b + (c2.b - c1.b) * ct);

      // Background
      const grad = c.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, `rgb(${R},${G},${B})`);
      grad.addColorStop(0.4, `rgb(${Math.round(R*0.6)},${Math.round(G*0.7)},${Math.round(B*0.6)})`);
      grad.addColorStop(1, `rgb(2,8,4)`);
      c.fillStyle = grad;
      c.fillRect(0, 0, w, h);

      // Glowing orb (Neiva sun / green glow)
      const orbX = w * (0.3 + t * 0.4);
      const orbY = h * (0.6 - Math.sin(t * Math.PI) * 0.3);
      const orbRad = w * (0.12 + t * 0.06);
      const glow = c.createRadialGradient(orbX, orbY, 0, orbX, orbY, orbRad);
      glow.addColorStop(0, `rgba(46,204,113,${0.2 + t * 0.15})`);
      glow.addColorStop(0.4, `rgba(39,174,96,${0.08 + t * 0.05})`);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = glow;
      c.fillRect(0, 0, w, h);

      // Horizon line grid (city-scape silhouette)
      const buildingCount = 18;
      c.fillStyle = `rgba(2,8,4,0.95)`;
      for (let b = 0; b < buildingCount; b++) {
        const bx = (b / buildingCount) * w;
        const bw = (w / buildingCount) * 0.8;
        const bh = (30 + Math.sin(b * 1.7 + t * 2) * 20 + Math.cos(b * 0.9) * 15) * (h / 800);
        c.fillRect(bx, h - bh, bw, bh);
      }

      // Green particles / bokeh
      for (let p = 0; p < 40; p++) {
        const px = ((p * 137.5 + t * 50) % 1) * w;
        const py = ((p * 0.618 + t * 0.3) % 1) * h * 0.8;
        const pr = 0.5 + Math.sin(p + t * 3) * 0.5;
        const alpha = 0.1 + Math.sin(p * 2.3 + t * 5) * 0.08;
        c.beginPath();
        c.arc(px, py, pr * (w / 1200), 0, Math.PI * 2);
        c.fillStyle = `rgba(79,255,176,${Math.max(0, alpha)})`;
        c.fill();
      }

      // Grid lines (tech feel)
      c.strokeStyle = `rgba(46,204,113,${0.03 + t * 0.02})`;
      c.lineWidth = 0.5;
      for (let i = 0; i < 8; i++) {
        const y = (i / 8) * h;
        c.beginPath();
        c.moveTo(0, y);
        c.lineTo(w, y);
        c.stroke();
      }

      return offscreen;
    }

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();

    // Pre-render frames
    function prerender() {
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        frames[i] = generateFrame(i, canvas.width, canvas.height);
      }
      frames[0] && ctx.drawImage(frames[0], 0, 0);
    }

    prerender();

    const loadGSAP = async () => {
      const g = await import('gsap');
      const { ScrollTrigger: ST } = await import('gsap/ScrollTrigger');
      gsap = g.gsap;
      ScrollTrigger = ST;
      gsap.registerPlugin(ScrollTrigger);
      gsapInstance = gsap;

      const hero = heroRef.current;
      if (!hero) return;

      // Frame scrubbing
      const frameObj = { frame: 0 };
      gsap.to(frameObj, {
        frame: TOTAL_FRAMES - 1,
        snap: 'frame',
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: '+=250%',
          scrub: 0.5,
          pin: true,
        },
        onUpdate: () => {
          const idx = Math.round(frameObj.frame);
          if (frames[idx]) ctx.drawImage(frames[idx], 0, 0);
        },
      });

      // Hero content animations
      gsap.fromTo('.hero-badge-el', { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 1, delay: 0.2, ease: 'power3.out',
      });
      gsap.fromTo('.hero-title-el', { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 1, delay: 0.4, ease: 'power3.out',
      });
      gsap.fromTo('.hero-sub-el', { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.9, delay: 0.6, ease: 'power3.out',
      });
      gsap.fromTo('.hero-btns-el', { opacity: 0, y: 20 }, {
        opacity: 1, y: 0, duration: 0.8, delay: 0.8, ease: 'power3.out',
      });
      gsap.fromTo('.hero-stats-el', { opacity: 0, y: 20 }, {
        opacity: 1, y: 0, duration: 0.8, delay: 1, ease: 'power3.out',
      });

      // Parallax for hero content
      gsap.to('.hero-content-wrap', {
        y: -80,
        opacity: 0,
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: '+=60%',
          scrub: 1,
        },
      });

      // Info section animations
      gsap.utils.toArray('.feature-reveal').forEach((el, i) => {
        gsap.fromTo(el, { opacity: 0, y: 60 }, {
          opacity: 1, y: 0, duration: 0.8, delay: i * 0.1,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      });

      // Stats counter
      gsap.utils.toArray('.stat-count').forEach(el => {
        const target = parseInt(el.dataset.target);
        gsap.fromTo({ n: 0 }, { n: target }, {
          duration: 1.5,
          ease: 'power2.out',
          onUpdate: function() {
            el.textContent = Math.round(this.targets()[0].n);
          },
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      });
    };

    loadGSAP();

    window.addEventListener('resize', () => {
      resize();
      frames.length = 0;
      prerender();
    });

    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);

    return () => {
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
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[#27ae60] flex items-center justify-center animate-glow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 0 0-7.5 16.5"/>
                <path d="M12 2c2 4 4 8 0 14"/>
                <path d="M12 2c-2 4-4 8 0 14"/>
                <path d="M2 12h20"/>
              </svg>
            </div>
            <span className="font-display text-xl font-800 text-white" style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>Trankas</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors" style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}>Funciones</a>
            <a href="#how" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors" style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}>¿Cómo funciona?</a>
            <a href="#rutas" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors" style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}>Rutas</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button className="btn-ghost text-sm" onClick={() => openAuth('login')}>Ingresar</button>
            <button className="btn-primary text-sm" onClick={() => openAuth('register')}>
              Comenzar gratis
            </button>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden text-[var(--text-muted)] p-2" onClick={() => setMobileMenuOpen(v => !v)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-nav px-6 py-4 flex flex-col gap-3">
            <a href="#features" className="btn-ghost" onClick={() => setMobileMenuOpen(false)}>Funciones</a>
            <a href="#how" className="btn-ghost" onClick={() => setMobileMenuOpen(false)}>¿Cómo funciona?</a>
            <button className="btn-primary w-full" onClick={() => { openAuth('register'); setMobileMenuOpen(false); }}>Comenzar gratis</button>
            <button className="btn-outline w-full" onClick={() => { openAuth('login'); setMobileMenuOpen(false); }}>Ingresar</button>
          </div>
        )}
      </nav>

      {/* ===== HERO with FRAME SCRUB ===== */}
      <section ref={heroRef} className="relative w-full h-screen overflow-hidden">
        {/* Canvas background */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Noise overlay for film grain */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
          opacity: 0.6,
          mixBlendMode: 'overlay',
        }} />

        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(2,9,4,0.7) 100%)',
        }} />

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none" style={{
          background: 'linear-gradient(to bottom, transparent, var(--bg-void))',
        }} />

        {/* Hero Content */}
        <div className="hero-content-wrap absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          {/* Badge */}
          <div className="hero-badge-el mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.25)', opacity: 0 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)', display: 'inline-block', animation: 'glowPulse 2s ease-in-out infinite' }} />
            <span className="text-xs font-600 tracking-widest text-[var(--accent-bright)]" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '2px' }}>NEIVA, HUILA • COLOMBIA</span>
          </div>

          {/* Title */}
          <h1 className="hero-title-el mb-6" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, lineHeight: 1.0, opacity: 0 }}>
            <span style={{ display: 'block', fontSize: 'clamp(4rem, 10vw, 9rem)', background: 'linear-gradient(135deg, #fff 0%, var(--accent-bright) 50%, var(--accent-primary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Trankas
            </span>
            <span style={{ display: 'block', fontSize: 'clamp(1rem, 2.5vw, 1.5rem)', color: 'var(--text-secondary)', fontWeight: 400, fontFamily: 'var(--font-body)', marginTop: '8px', letterSpacing: '3px', textTransform: 'uppercase' }}>
              Gestión inteligente de residuos
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hero-sub-el max-w-xl mx-auto mb-10" style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: 'var(--text-muted)', lineHeight: 1.7, opacity: 0 }}>
            Conoce cuándo pasa el camión por tu barrio, reporta basureros clandestinos y conecta con recicladores independientes de Neiva.
          </p>

          {/* Buttons */}
          <div className="hero-btns-el flex flex-wrap gap-4 justify-center mb-14" style={{ opacity: 0 }}>
            <button className="btn-primary" style={{ fontSize: '1rem', padding: '15px 36px' }} onClick={() => openAuth('register')}>
              Comenzar gratis
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <a href="#features" className="btn-outline" style={{ fontSize: '1rem', padding: '14px 32px' }}>
              Ver cómo funciona
            </a>
          </div>

          {/* Stats */}
          <div className="hero-stats-el flex gap-8 md:gap-16 justify-center" style={{ opacity: 0 }}>
            {[
              { value: 10, suffix: '', label: 'Comunas' },
              { value: 200, suffix: '+', label: 'Barrios' },
              { value: 24, suffix: '/7', label: 'Reportes' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: 'var(--text-primary)', lineHeight: 1 }}>
                  <span className="stat-count" data-target={stat.value}>{stat.value}</span>{stat.suffix}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--text-dim)]" style={{ animation: 'float 3s ease-in-out infinite' }}>
          <span style={{ fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>Scroll</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="py-28 px-6 relative" style={{ background: 'var(--bg-void)' }}>
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-20 feature-reveal">
            <p className="text-xs font-600 tracking-widest mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '3px', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
              Funcionalidades
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1 }}>
              Todo lo que necesitas<br />
              <span className="gradient-text">en un solo lugar</span>
            </h2>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🗺️',
                title: 'Mapa de Rutas Interactivo',
                desc: 'Visualiza las 5 zonas de recolección de Neiva en tiempo real. Haz clic en tu barrio para ver el horario exacto.',
                color: 'rgba(46,204,113,0.08)',
                border: 'rgba(46,204,113,0.2)',
              },
              {
                icon: '🤖',
                title: 'Asistente IA con Groq',
                desc: 'Pregúntale qué hacer con cualquier residuo. Clasificación inteligente con Llama 3.2 en tiempo real.',
                color: 'rgba(79,255,176,0.06)',
                border: 'rgba(79,255,176,0.18)',
              },
              {
                icon: '📍',
                title: 'Reportes Comunitarios',
                desc: 'Reporta basureros clandestinos, bloqueos o fallas con foto y ubicación GPS. La comunidad te respalda.',
                color: 'rgba(201,168,76,0.06)',
                border: 'rgba(201,168,76,0.18)',
              },
              {
                icon: '♻️',
                title: 'Puntos de Acopio',
                desc: 'Encuentra el punto verde más cercano para tus materiales aprovechables.',
                color: 'rgba(46,204,113,0.06)',
                border: 'rgba(46,204,113,0.15)',
              },
              {
                icon: '🚛',
                title: 'Recolección Especial',
                desc: 'Solicita recogida de escombros, muebles o restos especiales. Conectamos con recicladores independientes.',
                color: 'rgba(52,152,219,0.06)',
                border: 'rgba(52,152,219,0.18)',
              },
              {
                icon: '🔔',
                title: 'Alertas y Notificaciones',
                desc: 'Recibe recordatorios antes del día de recolección y alertas comunitarias de tu zona.',
                color: 'rgba(255,107,53,0.06)',
                border: 'rgba(255,107,53,0.15)',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="glass-card feature-reveal p-7 flex flex-col gap-4"
                style={{
                  animationDelay: `${i * 0.08}s`,
                  background: feature.color,
                  borderColor: feature.border,
                }}
              >
                <div style={{ fontSize: '2.2rem' }}>{feature.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                  {feature.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.65 }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" className="py-28 px-6" style={{ background: 'linear-gradient(180deg, var(--bg-void) 0%, var(--bg-deep) 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20 feature-reveal">
            <p className="text-xs tracking-widest mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '3px', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
              ¿Cómo funciona?
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.1 }}>
              Simple. Rápido. <span className="gradient-text">Efectivo.</span>
            </h2>
          </div>

          <div className="flex flex-col gap-6">
            {[
              { num: '01', title: 'Crea tu cuenta', desc: 'Regístrate con Google, Apple o tu correo. Solo toma 30 segundos.', icon: '👤' },
              { num: '02', title: 'Configura tu ubicación', desc: 'Selecciona tu barrio y te mostramos el horario de recolección exacto de tu zona.', icon: '📍' },
              { num: '03', title: 'Usa todas las funciones', desc: 'Consulta el mapa, usa el asistente IA, reporta problemas o solicita recolección especial.', icon: '✨' },
            ].map((step, i) => (
              <div key={i} className="glass-card feature-reveal flex gap-6 items-start p-7" style={{ animationDelay: `${i * 0.15}s` }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '3rem',
                  fontWeight: 800,
                  color: 'rgba(46,204,113,0.15)',
                  lineHeight: 1,
                  minWidth: '60px',
                  flexShrink: 0,
                }}>
                  {step.num}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span style={{ fontSize: '1.4rem' }}>{step.icon}</span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                      {step.title}
                    </h3>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== RUTAS SECTION ===== */}
      <section id="rutas" className="py-28 px-6" style={{ background: 'var(--bg-void)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 feature-reveal">
            <p className="text-xs tracking-widest mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '3px', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
              Rutas oficiales
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.1 }}>
              Horarios de <span className="gradient-text">recolección</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: '0.9rem' }}>
              5 zonas de servicio domiciliario en Neiva
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 feature-reveal">
            {[
              { zona: '01', nombre: 'Norte — Aeropuerto', comunas: '1, 2', dias: 'Lun / Mié / Vie', horario: '7AM – 1PM', color: '#c8e6c9' },
              { zona: '02', nombre: 'Oriente — Centro Oriente', comunas: '5, 7, 10', dias: 'Mar / Jue / Sáb', horario: '7AM – 1PM', color: '#ef9a9a' },
              { zona: '03', nombre: 'Centro — Entre Ríos', comunas: '3, 4', dias: 'Lun / Mié / Vie', horario: '1PM – 7PM', color: '#80cbc4' },
              { zona: '04', nombre: 'Sur — Zona Industrial', comunas: '6, 8', dias: 'Mar / Jue / Sáb', horario: '1PM – 7PM', color: '#a5d6a7' },
              { zona: '05', nombre: 'Norte — Galindo', comunas: '9', dias: 'Lun a Sáb', horario: '7AM – 3PM', color: '#b2dfdb' },
            ].map((z, i) => (
              <div key={i} className="glass-card p-6" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div style={{ width: 14, height: 14, borderRadius: '3px', background: z.color, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                    Zona {z.zona}
                  </span>
                </div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {z.nombre}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Comunas {z.comunas}</p>
                <div className="flex flex-col gap-1">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    {z.dias}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--accent-primary)' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {z.horario}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10 feature-reveal">
            <button className="btn-primary" onClick={() => openAuth('register')}>
              Ver mapa interactivo completo
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-28 px-6" style={{ background: 'var(--bg-deep)' }}>
        <div className="max-w-3xl mx-auto text-center feature-reveal">
          <div className="glass-card p-12 md:p-16" style={{ background: 'rgba(46,204,113,0.04)', borderColor: 'rgba(46,204,113,0.2)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🌱</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.1, marginBottom: '16px' }}>
              Únete a la comunidad<br /><span className="gradient-text">Trankas</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '32px' }}>
              Haz parte del cambio en Neiva. Gestiona tus residuos de forma inteligente y ayuda a construir una ciudad más limpia.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="btn-primary" style={{ fontSize: '1rem', padding: '15px 36px' }} onClick={() => openAuth('register')}>
                Crear cuenta gratis
              </button>
              <button className="btn-outline" onClick={() => openAuth('login')}>
                Ya tengo cuenta
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-12 px-6" style={{ background: 'var(--bg-void)', borderTop: '1px solid var(--border-glass)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[#27ae60] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 0 0-7.5 16.5"/>
                  <path d="M12 2c2 4 4 8 0 14"/>
                  <path d="M12 2c-2 4-4 8 0 14"/>
                </svg>
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>Trankas</span>
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>
              © 2025 Trankas — Gestión de residuos para Neiva, Huila
            </p>
            <div className="flex gap-6">
              {['Términos', 'Privacidad', 'Contacto'].map(link => (
                <a key={link} href="#" style={{ color: 'var(--text-dim)', fontSize: '0.82rem', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--text-muted)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-dim)'}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ===== AUTH MODAL ===== */}
      <AuthModal
        isOpen={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onModeChange={setAuthMode}
      />
    </>
  );
}
