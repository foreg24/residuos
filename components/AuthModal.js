'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';

export default function AuthModal({ isOpen, mode, onClose, onModeChange }) {
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifyEmail, setVerifyEmail] = useState('');
  const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', '']);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (!isOpen) { setStep('form'); setError(''); setLoading(false); }
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const update = (field, value) => setFormData(p => ({ ...p, [field]: value }));

  // ===== SOCIAL LOGIN =====
  const handleGoogle = async () => {
    setLoading(true);
    try {
      // signIn redirects automatically to /dashboard via callbackUrl
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch {
      setError('Error con Google. Intenta de nuevo.');
      setLoading(false);
    }
  };

  const handleApple = async () => {
    setLoading(true);
    try {
      await signIn('apple', { callbackUrl: '/dashboard' });
    } catch {
      setError('Error con Apple. Intenta de nuevo.');
      setLoading(false);
    }
  };

  // ===== EMAIL LOGIN =====
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) { setError('Completa todos los campos'); return; }
    setLoading(true); setError('');
    try {
      const users = JSON.parse(localStorage.getItem('trankas_users') || '[]');
      const user = users.find(u => u.email === formData.email);
      if (!user) { setError('Usuario no encontrado'); setLoading(false); return; }
      if (user.password !== btoa(formData.password)) { setError('Contraseña incorrecta'); setLoading(false); return; }
      
      // Save session FIRST, then redirect
      const sessionUser = { ...user, password: undefined };
      localStorage.setItem('trankas_session', JSON.stringify(sessionUser));
      
      // Small delay to ensure localStorage is written before navigation
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);
    } catch {
      setError('Error al iniciar sesión');
      setLoading(false);
    }
  };

  // ===== EMAIL REGISTER =====
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) { setError('Completa todos los campos'); return; }
    if (formData.password !== formData.confirmPassword) { setError('Las contraseñas no coinciden'); return; }
    if (formData.password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return; }

    setLoading(true); setError('');
    try {
      const users = JSON.parse(localStorage.getItem('trankas_users') || '[]');
      if (users.find(u => u.email === formData.email)) { setError('Este correo ya está registrado'); setLoading(false); return; }

      const newUser = {
        id: `local_${Date.now()}`,
        name: formData.name,
        email: formData.email,
        password: btoa(formData.password),
        phone: formData.phone,
        isReciclador: false,
        createdAt: new Date().toISOString(),
        verified: true, // skip verification in prod for now
      };
      users.push(newUser);
      localStorage.setItem('trankas_users', JSON.stringify(users));
      
      // Save session immediately
      const sessionUser = { ...newUser, password: undefined };
      localStorage.setItem('trankas_session', JSON.stringify(sessionUser));

      setStep('setup');
    } catch {
      setError('Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  // ===== VERIFY =====
  const handleVerify = () => {
    const code = codeDigits.join('');
    if (code.length !== 6) { setError('Ingresa el código completo'); return; }
    
    const stored = JSON.parse(localStorage.getItem(`trankas_verify_${verifyEmail}`) || 'null');
    if (!stored || stored.code !== code || Date.now() > stored.expires) {
      setError('Código inválido o expirado'); return;
    }

    localStorage.removeItem(`trankas_verify_${verifyEmail}`);
    const users = JSON.parse(localStorage.getItem('trankas_users') || '[]');
    const user = users.find(u => u.email === verifyEmail);
    if (user) {
      user.verified = true;
      localStorage.setItem('trankas_users', JSON.stringify(users));
      const sessionUser = { ...user, password: undefined };
      localStorage.setItem('trankas_session', JSON.stringify(sessionUser));
    }
    setStep('setup');
  };

  const handleCodeInput = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...codeDigits];
    next[index] = value.slice(-1);
    setCodeDigits(next);
    if (value && index < 5) document.getElementById(`code-${index + 1}`)?.focus();
  };

  const handleCodeKey = (index, e) => {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handleSetupDone = () => {
    window.location.href = '/dashboard';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0" style={{ background: 'rgba(2,9,4,0.85)', backdropFilter: 'blur(12px)' }} onClick={onClose} />

      <div
        className="relative w-full max-w-md max-h-[92vh] overflow-y-auto scrollbar-thin"
        style={{
          background: 'rgba(8,18,9,0.95)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 60px rgba(46,204,113,0.08)',
          backdropFilter: 'blur(40px)',
          animation: 'fadeUp 0.4s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px', background: 'linear-gradient(90deg, transparent, var(--accent-primary), transparent)' }} />

        <button onClick={onClose} className="absolute top-4 right-4 btn-ghost" style={{ padding: '8px', borderRadius: '50%', color: 'var(--text-muted)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div className="p-8">

          {/* ===== FORM STEP ===== */}
          {step === 'form' && (
            <>
              <div className="mb-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[#27ae60] flex items-center justify-center mx-auto mb-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a10 10 0 0 0-7.5 16.5"/><path d="M12 2c2 4 4 8 0 14"/><path d="M12 2c-2 4-4 8 0 14"/>
                  </svg>
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color: 'var(--text-primary)' }}>
                  {mode === 'login' ? 'Bienvenido de vuelta' : 'Únete a Trankas'}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
                  {mode === 'login' ? 'Ingresa a tu cuenta' : 'Gestión inteligente de residuos en Neiva'}
                </p>
              </div>

              {/* Social buttons */}
              <div className="flex flex-col gap-3 mb-6">
                <button onClick={handleGoogle} disabled={loading}
                  className="flex items-center justify-center gap-3 w-full py-3 px-5 rounded-full transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-display)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar con Google
                </button>

                <button onClick={handleApple} disabled={loading}
                  className="flex items-center justify-center gap-3 w-full py-3 px-5 rounded-full transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-display)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Continuar con Apple
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div style={{ flex: 1, height: '1px', background: 'var(--border-glass)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-display)' }}>o con correo</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-glass)' }} />
              </div>

              {error && (
                <div className="mb-5 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.25)', color: '#ffb49a', fontSize: '0.85rem' }}>
                  {error}
                </div>
              )}

              <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
                {mode === 'register' && (
                  <div className="form-group">
                    <label className="form-label">Nombre completo</label>
                    <input className="form-input" type="text" placeholder="Ana García" value={formData.name} onChange={e => update('name', e.target.value)} required />
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Correo electrónico</label>
                  <input className="form-input" type="email" placeholder="tu@email.com" value={formData.email} onChange={e => update('email', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Contraseña</label>
                  <div style={{ position: 'relative' }}>
                    <input className="form-input" type={showPass ? 'text' : 'password'} placeholder={mode === 'register' ? 'Mínimo 8 caracteres' : '••••••••'} value={formData.password} onChange={e => update('password', e.target.value)} style={{ paddingRight: '44px' }} required />
                    <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                      {showPass
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                </div>
                {mode === 'register' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Confirmar contraseña</label>
                      <input className="form-input" type="password" placeholder="Repite la contraseña" value={formData.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Teléfono (opcional)</label>
                      <input className="form-input" type="tel" placeholder="300 123 4567" value={formData.phone} onChange={e => update('phone', e.target.value)} />
                    </div>
                  </>
                )}

                <button type="submit" className="btn-primary w-full justify-center" style={{ fontSize: '0.95rem', padding: '14px' }} disabled={loading}>
                  {loading
                    ? <><div className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Cargando...</>
                    : mode === 'login' ? 'Ingresar' : 'Crear cuenta'
                  }
                </button>
              </form>

              <p className="text-center mt-6" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                <button className="btn-ghost" style={{ padding: 0, color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.85rem', display: 'inline' }}
                  onClick={() => { onModeChange(mode === 'login' ? 'register' : 'login'); setError(''); }}>
                  {mode === 'login' ? 'Regístrate' : 'Ingresa'}
                </button>
              </p>
            </>
          )}

          {/* ===== SETUP STEP (after register) ===== */}
          {step === 'setup' && (
            <>
              <div className="text-center mb-8">
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  ¡Cuenta creada!
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  Ya puedes usar Trankas. Configura tu barrio en el dashboard para ver los horarios de recolección.
                </p>
              </div>
              <button className="btn-primary w-full justify-center" style={{ fontSize: '0.95rem', padding: '14px' }} onClick={handleSetupDone}>
                Ir al dashboard
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
