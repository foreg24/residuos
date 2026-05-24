// lib/db.js — Capa de base de datos con Vercel KV
// Vercel KV es Redis administrado, gratis en el free plan
// Docs: https://vercel.com/docs/storage/vercel-kv

import { kv } from '@vercel/kv';
import bcrypt from 'bcryptjs';

// ============================================================
// USERS
// ============================================================

export async function getUserByEmail(email) {
  try {
    return await kv.get(`user:email:${email.toLowerCase()}`);
  } catch {
    return null;
  }
}

export async function getUserById(id) {
  try {
    return await kv.get(`user:${id}`);
  } catch {
    return null;
  }
}

export async function createUser({ name, email, password, phone, provider = 'credentials' }) {
  const id = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

  const user = {
    id,
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    phone: phone || null,
    provider,
    isReciclador: false,
    verified: provider !== 'credentials', // OAuth users auto-verified
    onboardingDone: false,    // ← flag para mostrar onboarding
    location: null,           // { barrio, comuna, direccion, lat, lng }
    createdAt: new Date().toISOString(),
  };

  // Guardar por ID y por email (para lookup rápido)
  await kv.set(`user:${id}`, user);
  await kv.set(`user:email:${email.toLowerCase()}`, user);

  return user;
}

export async function updateUser(id, updates) {
  const existing = await getUserById(id);
  if (!existing) return null;

  const updated = { ...existing, ...updates, id }; // id no se puede cambiar
  await kv.set(`user:${id}`, updated);
  await kv.set(`user:email:${existing.email}`, updated);
  return updated;
}

export async function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

// ============================================================
// VERIFICATION CODES
// ============================================================

export async function saveVerificationCode(email, code) {
  // Expira en 10 minutos
  await kv.set(`verify:${email.toLowerCase()}`, code, { ex: 600 });
}

export async function checkVerificationCode(email, code) {
  const stored = await kv.get(`verify:${email.toLowerCase()}`);
  if (!stored || stored !== code) return false;
  await kv.del(`verify:${email.toLowerCase()}`);
  return true;
}

// ============================================================
// REPORTS
// ============================================================

export async function createReport({ userId, tipo, descripcion, ubicacion, imagen }) {
  const id = `rpt_${Date.now()}`;
  const report = {
    id, userId, tipo, descripcion, ubicacion, imagen,
    fecha: new Date().toISOString(),
    status: 'pendiente',
  };
  // Guardar reporte y agregarlo a la lista del usuario
  await kv.set(`report:${id}`, report);
  await kv.lpush(`reports:user:${userId}`, id);
  return report;
}

export async function getUserReports(userId) {
  try {
    const ids = await kv.lrange(`reports:user:${userId}`, 0, 49);
    if (!ids?.length) return [];
    const reports = await Promise.all(ids.map(id => kv.get(`report:${id}`)));
    return reports.filter(Boolean);
  } catch {
    return [];
  }
}

// ============================================================
// COLLECTION REQUESTS (Solicitudes)
// ============================================================

export async function createSolicitud({ userId, tipo, volumen, descripcion, direccion, fecha, hora }) {
  const id = `sol_${Date.now()}`;
  const sol = {
    id, userId, tipo, volumen, descripcion, direccion, fecha, hora,
    status: 'buscando-reciclador',
    fecha_solicitud: new Date().toISOString(),
  };
  await kv.set(`solicitud:${id}`, sol);
  await kv.lpush(`solicitudes:user:${userId}`, id);
  return sol;
}

export async function getUserSolicitudes(userId) {
  try {
    const ids = await kv.lrange(`solicitudes:user:${userId}`, 0, 49);
    if (!ids?.length) return [];
    const soles = await Promise.all(ids.map(id => kv.get(`solicitud:${id}`)));
    return soles.filter(Boolean);
  } catch {
    return [];
  }
}

// ============================================================
// ALERTS (Alertas comunitarias)
// ============================================================

export async function createAlerta({ userId, categoria, descripcion, ubicacion }) {
  const id = `alt_${Date.now()}`;
  const alerta = {
    id, userId, categoria, descripcion, ubicacion,
    fecha: new Date().toISOString(),
    votosSi: 1,
    votosNo: 0,
    resuelta: false,
    votantes: { [userId]: 'si' },
  };
  await kv.set(`alerta:${id}`, alerta);
  await kv.lpush('alertas:all', id);
  return alerta;
}

export async function getAllAlertas() {
  try {
    const ids = await kv.lrange('alertas:all', 0, 99);
    if (!ids?.length) return [];
    const alertas = await Promise.all(ids.map(id => kv.get(`alerta:${id}`)));
    return alertas.filter(Boolean);
  } catch {
    return [];
  }
}

export async function voteAlerta(id, userId, vote) {
  const alerta = await kv.get(`alerta:${id}`);
  if (!alerta) return null;

  const votantes = alerta.votantes || {};
  const prevVote = votantes[userId];

  if (prevVote === vote) {
    // Quitar voto
    delete votantes[userId];
    alerta[vote === 'si' ? 'votosSi' : 'votosNo'] = Math.max(0, alerta[vote === 'si' ? 'votosSi' : 'votosNo'] - 1);
  } else {
    if (prevVote) {
      alerta[prevVote === 'si' ? 'votosSi' : 'votosNo'] = Math.max(0, alerta[prevVote === 'si' ? 'votosSi' : 'votosNo'] - 1);
    }
    votantes[userId] = vote;
    alerta[vote === 'si' ? 'votosSi' : 'votosNo'] += 1;
  }

  alerta.votantes = votantes;
  await kv.set(`alerta:${id}`, alerta);
  return alerta;
}
