let currentMode = 'login';

function openAuth(mode) {
  currentMode = mode;
  renderAuthForm();
  document.getElementById('auth-backdrop').classList.add('open');
}

function closeAuth() {
  document.getElementById('auth-backdrop').classList.remove('open');
}

function toggleMobileMenu() {
  document.getElementById('mobile-menu').classList.toggle('open');
}

function switchMode() {
  currentMode = currentMode === 'login' ? 'register' : 'login';
  renderAuthForm();
}

function togglePass() {
  const inp = document.getElementById('f-pass');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

function toast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  document.getElementById('toasts').appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
}

function setAuthLoading(loading) {
  const btn = document.getElementById('auth-btn');
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? 'Cargando...' : (currentMode === 'login' ? 'Ingresar' : 'Crear cuenta');
}

async function doLogin() {
  const email = document.getElementById('f-email')?.value?.trim();
  const pass = document.getElementById('f-pass')?.value;
  if (!email || !pass) return showAuthError('Completa todos los campos');
  setAuthLoading(true);
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    const data = await res.json();
    if (!res.ok) return showAuthError(data.error || 'Error al ingresar');
    window.location.href = '/dashboard';
  } catch { showAuthError('Error de conexión'); }
  finally { setAuthLoading(false); }
}

async function doRegister() {
  const name = document.getElementById('f-name')?.value?.trim();
  const email = document.getElementById('f-email')?.value?.trim();
  const pass = document.getElementById('f-pass')?.value;
  const pass2 = document.getElementById('f-pass2')?.value;
  const phone = document.getElementById('f-phone')?.value?.trim();
  if (!name || !email || !pass) return showAuthError('Completa los campos requeridos');
  if (pass !== pass2) return showAuthError('Las contraseñas no coinciden');
  if (pass.length < 8) return showAuthError('La contraseña debe tener al menos 8 caracteres');
  setAuthLoading(true);
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: pass, phone })
    });
    const data = await res.json();
    if (!res.ok) return showAuthError(data.error || 'Error al registrarse');
    window.location.href = '/dashboard';
  } catch { showAuthError('Error de conexión'); }
  finally { setAuthLoading(false); }
}

function handleApple(e) {
  e.preventDefault();
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = '/auth/apple/callback';
  document.body.appendChild(form);
  form.submit();
  return false;
}

function renderAuthForm() {
  const isLogin = currentMode === 'login';
  document.getElementById('auth-body').innerHTML = `
    <div class="modal-logo">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><path d="M12 2a10 10 0 0 0-7.5 16.5"/><path d="M12 2c2 4 4 8 0 14"/><path d="M12 2c-2 4-4 8 0 14"/></svg>
    </div>
    <div class="modal-title">${isLogin ? 'Bienvenido de vuelta' : 'Únete a Trankas'}</div>
    <div class="modal-subtitle">${isLogin ? 'Ingresa a tu cuenta' : 'Gestión inteligente de residuos en Neiva'}</div>

    <a href="/auth/google" class="social-btn" style="text-decoration:none;margin-bottom:10px;display:flex;align-items:center;justify-content:center;gap:12px;padding:13px;border-radius:var(--r-full);border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:var(--text-1);font-family:var(--font-d);font-weight:600;font-size:.9rem">
      <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
      Continuar con Google
    </a>

    <a href="#" class="social-btn" style="text-decoration:none;margin-bottom:10px;display:flex;align-items:center;justify-content:center;gap:12px;padding:13px;border-radius:var(--r-full);border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:var(--text-1);font-family:var(--font-d);font-weight:600;font-size:.9rem" onclick="handleApple(event)">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
      Continuar con Apple
    </a>

    <div class="divider"><div class="divider-line"></div><span class="divider-text">o con correo</span><div class="divider-line"></div></div>

    <div id="auth-error" class="modal-error"></div>

    ${!isLogin ? `<div class="form-group"><label class="form-label">Nombre completo</label><input class="form-input" id="f-name" type="text" placeholder="Ana García"></div>` : ''}
    <div class="form-group"><label class="form-label">Correo electrónico</label><input class="form-input" id="f-email" type="email" placeholder="tu@email.com"></div>
    <div class="form-group"><label class="form-label">Contraseña</label>
      <div class="input-wrap">
        <input class="form-input" id="f-pass" type="password" placeholder="${isLogin ? '••••••••' : 'Mínimo 8 caracteres'}">
        <button class="input-toggle" type="button" onclick="togglePass()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>
    </div>
    ${!isLogin ? `<div class="form-group"><label class="form-label">Confirmar contraseña</label><input class="form-input" id="f-pass2" type="password" placeholder="Repite la contraseña"></div><div class="form-group"><label class="form-label">Teléfono (opcional)</label><input class="form-input" id="f-phone" type="tel" placeholder="300 123 4567"></div>` : ''}

    <button class="btn-primary" style="width:100%;justify-content:center;padding:14px;font-size:.95rem;margin-top:4px" onclick="${isLogin ? 'doLogin()' : 'doRegister()'}" id="auth-btn">
      ${isLogin ? 'Ingresar' : 'Crear cuenta'}
    </button>
    <div class="modal-switch">
      ${isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
      <button onclick="switchMode()">${isLogin ? 'Regístrate' : 'Ingresa'}</button>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const FRAME_COUNT = 51;
  const FRAME_PATH = i => `/frames/${String(i+1).padStart(4,'0')}.png`;
  const images = [];
  let loaded = 0;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (images[0]?.complete) drawFrame(0);
  }

  function drawFrame(i) {
    const img = images[Math.min(i, images.length - 1)];
    if (!img?.complete) return;
    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    if (!iw || !ih) return;
    const scale = Math.max(cw/iw, ch/ih);
    const sw = iw*scale, sh = ih*scale;
    ctx.drawImage(img, (cw-sw)/2, (ch-sh)/2, sw, sh);
  }

  function preload() {
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i);
      img.onload = () => { loaded++; if (i === 0) { resize(); drawFrame(0); } if (loaded >= FRAME_COUNT) initST(); };
      img.onerror = () => { loaded++; if (loaded >= FRAME_COUNT) initST(); };
      images[i] = img;
    }
  }

  function initST() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);
    const frame = { n: 0 };
    gsap.to(frame, {
      n: FRAME_COUNT - 1, snap: 'n', ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: '+=250%', scrub: .5, pin: true },
      onUpdate: () => drawFrame(Math.round(frame.n))
    });
    gsap.to('#hero-content', { y: -80, opacity: 0, scrollTrigger: { trigger: '#hero', start: 'top top', end: '+=60%', scrub: 1 } });
  }

  resize();
  preload();
  window.addEventListener('resize', resize);

  gsap.fromTo('#hero-badge', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, delay: .2, ease: 'power3.out' });
  gsap.fromTo('#hero-title', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, delay: .4, ease: 'power3.out' });
  gsap.fromTo('#hero-desc', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .9, delay: .6, ease: 'power3.out' });
  gsap.fromTo('#hero-btns', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .8, delay: .8, ease: 'power3.out' });
  gsap.fromTo('#hero-stats', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .8, delay: 1, ease: 'power3.out' });

  window.addEventListener('scroll', () => {
    document.getElementById('topnav').classList.toggle('scrolled', window.scrollY > 60);
  });

  const revealEls = document.querySelectorAll('.feature-card,.step-card');
  const io = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), i * 80); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  document.getElementById('auth-backdrop').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeAuth();
  });
});