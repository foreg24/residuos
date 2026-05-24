gsap.registerPlugin(ScrollTrigger);

const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');
const FRAME_COUNT = 60;
const FRAME_PATH = i => `/frames/${String(i+1).padStart(4,'0')}.jpg`;

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
    img.onload = () => { loaded++; if (i === 0) { resize(); drawFrame(0); } if (loaded >= FRAME_COUNT) initScrollTrigger(); };
    img.onerror = () => { loaded++; if (loaded >= FRAME_COUNT) initScrollTrigger(); };
    images[i] = img;
  }
}

function initScrollTrigger() {
  const frame = { n: 0 };
  gsap.to(frame, {
    n: FRAME_COUNT - 1,
    snap: 'n',
    ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: '+=250%', scrub: .5, pin: true },
    onUpdate: () => drawFrame(Math.round(frame.n))
  });

  gsap.to('#hero-content', {
    y: -80, opacity: 0,
    scrollTrigger: { trigger: '#hero', start: 'top top', end: '+=60%', scrub: 1 }
  });
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
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

function toggleMobileMenu() {
  const m = document.getElementById('mobile-menu');
  m.classList.toggle('open');
}

let currentMode = 'login';

function openAuth(mode) {
  currentMode = mode;
  renderAuthForm();
  document.getElementById('auth-backdrop').classList.add('open');
}

function closeAuth() {
  document.getElementById('auth-backdrop').classList.remove('open');
}

document.getElementById('auth-backdrop').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeAuth();
});

function renderAuthForm() {
  const isLogin = currentMode === 'login';
  document.getElementById('auth-body').innerHTML = `
    <div class="modal-logo">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><path d="M12 2a10 10 0 0 0-7.5 16.5"/><path d="M12 2c2 4 4 8 0 14"/><path d="M12 2c-2 4-4 8 0 14"/></svg>
    </div>
    <div class="modal-title">${isLogin ? 'Bienvenido de vuelta' : 'Únete a Trankas'}</div>
    <div class="modal-subtitle">${isLogin ? 'Ingresa a tu cuenta' : 'Gestión inteligente de residuos en Neiva'}</div>

    <div id="auth-error" class="modal-error"></div>

    ${!isLogin ? `<div class="form-group"><label class="form-label">Nombre completo</label><input class="form-input" id="f-name" type="text" placeholder="Ana García" required></div>` : ''}
    <div class="form-group"><label class="form-label">Correo electrónico</label><input class="form-input" id="f-email" type="email" placeholder="tu@email.com" required></div>
    <div class="form-group"><label class="form-label">Contraseña</label>
      <div class="input-wrap">
        <input class="form-input" id="f-pass" type="password" placeholder="${isLogin ? '••••••••' : 'Mínimo 8 caracteres'}" required>
        <button class="input-toggle" type="button" onclick="togglePass()">
          <svg id="eye-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>
    </div>
    ${!isLogin ? `<div class="form-group"><label class="form-label">Confirmar contraseña</label><input class="form-input" id="f-pass2" type="password" placeholder="Repite la contraseña" required></div>
    <div class="form-group"><label class="form-label">Teléfono (opcional)</label><input class="form-input" id="f-phone" type="tel" placeholder="300 123 4567"></div>` : ''}

    <button class="btn-primary" style="width:100%;justify-content:center;padding:14px;font-size:.95rem;margin-top:4px" onclick="${isLogin ? 'doLogin()' : 'doRegister()'}" id="auth-btn">
      ${isLogin ? 'Ingresar' : 'Crear cuenta'}
    </button>

    <div class="modal-switch">
      ${isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
      <button onclick="switchMode()">${isLogin ? 'Regístrate' : 'Ingresa'}</button>
    </div>
  `;
}

function switchMode() {
  currentMode = currentMode === 'login' ? 'register' : 'login';
  renderAuthForm();
}

function togglePass() {
  const inp = document.getElementById('f-pass');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent = msg;
  el.classList.add('show');
}

function setAuthLoading(loading) {
  const btn = document.getElementById('auth-btn');
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

function toast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  document.getElementById('toasts').appendChild(t);
  setTimeout(() => t.remove(), 4000);
}
