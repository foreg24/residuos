// lib/db.js — Base de datos con Upstash Redis
// Variables requeridas en Vercel:
//   UPSTASH_REDIS_REST_URL
//   UPSTASH_REDIS_REST_TOKEN
// Se configuran automáticamente al conectar la integración de Upstash en Vercel Marketplace

import { Redis } from '@upstash/redis';
import bcrypt from 'bcryptjs';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// ============================================================
// USERS
// ============================================================

export async function getUserByEmail(email) {
  try {
    return await redis.get(`user:email:${email.toLowerCase()}`);
  } catch { return null; }
}

export async function getUserById(id) {
  try {
    return await redis.get(`user:${id}`);
  } catch { return null; }
}

export async function createUser({ name, email, password, phone, provider = 'credentials', image = null }) {
  const id = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

  const user = {
    id,
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    phone: phone || null,
    image: image || null,
    provider,
    isReciclador: false,
    verified: provider !== 'credentials',
    onboardingDone: false,
    location: null,
    createdAt: new Date().toISOString(),
  };

  await redis.set(`user:${id}`, user);
  await redis.set(`user:email:${email.toLowerCase()}`, user);
  return user;
}

export async function updateUser(id, updates) {
  const existing = await getUserById(id);
  if (!existing) return null;
  const updated = { ...existing, ...updates, id };
  await redis.set(`user:${id}`, updated);
  await redis.set(`user:email:${existing.email}`, updated);
  return updated;
}

export async function verifyPassword(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

// ============================================================
// VERIFICATION CODES
// ============================================================

export async function saveVerificationCode(email, code) {
  await redis.set(`verify:${email.toLowerCase()}`, code, { ex: 600 });
}

export async function checkVerificationCode(email, code) {
  const stored = await redis.get(`verify:${email.toLowerCase()}`);
  if (!stored || stored !== code) return false;
  await redis.del(`verify:${email.toLowerCase()}`);
  return true;
}

// ============================================================
// REPORTS
// ============================================================

export async function createReport({ userId, tipo, descripcion, ubicacion, imagen }) {
  const id = `rpt_${Date.now()}`;
  const report = { id, userId, tipo, descripcion, ubicacion, imagen, fecha: new Date().toISOString(), status: 'pendiente' };
  await redis.set(`report:${id}`, report);
  await redis.lpush(`reports:user:${userId}`, id);
  return report;
}

export async function getUserReports(userId) {
  try {
    const ids = await redis.lrange(`reports:user:${userId}`, 0, 49);
    if (!ids?.length) return [];
    const reports = await Promise.all(ids.map(id => redis.get(`report:${id}`)));
    return reports.filter(Boolean);
  } catch { return []; }
}

// ============================================================
// SOLICITUDES
// ============================================================

export async function createSolicitud({ userId, tipo, volumen, descripcion, direccion, fecha, hora }) {
  const id = `sol_${Date.now()}`;
  const sol = { id, userId, tipo, volumen, descripcion, direccion, fecha, hora, status: 'buscando-reciclador', fecha_solicitud: new Date().toISOString() };
  await redis.set(`solicitud:${id}`, sol);
  await redis.lpush(`solicitudes:user:${userId}`, id);
  return sol;
}

export async function getUserSolicitudes(userId) {
  try {
    const ids = await redis.lrange(`solicitudes:user:${userId}`, 0, 49);
    if (!ids?.length) return [];
    const soles = await Promise.all(ids.map(id => redis.get(`solicitud:${id}`)));
    return soles.filter(Boolean);
  } catch { return []; }
}

// ============================================================
// ALERTAS
// ============================================================

export async function createAlerta({ userId, categoria, descripcion, ubicacion }) {
  const id = `alt_${Date.now()}`;
  const alerta = { id, userId, categoria, descripcion, ubicacion, fecha: new Date().toISOString(), votosSi: 1, votosNo: 0, resuelta: false, votantes: { [userId]: 'si' } };
  await redis.set(`alerta:${id}`, alerta);
  await redis.lpush('alertas:all', id);
  return alerta;
}

export async function getAllAlertas() {
  try {
    const ids = await redis.lrange('alertas:all', 0, 99);
    if (!ids?.length) return [];
    const alertas = await Promise.all(ids.map(id => redis.get(`alerta:${id}`)));
    return alertas.filter(Boolean);
  } catch { return []; }
}

export async function voteAlerta(id, userId, vote) {
  const alerta = await redis.get(`alerta:${id}`);
  if (!alerta) return null;
  const votantes = alerta.votantes || {};
  const prev = votantes[userId];
  if (prev === vote) {
    delete votantes[userId];
    alerta[vote === 'si' ? 'votosSi' : 'votosNo'] = Math.max(0, alerta[vote === 'si' ? 'votosSi' : 'votosNo'] - 1);
  } else {
    if (prev) alerta[prev === 'si' ? 'votosSi' : 'votosNo'] = Math.max(0, alerta[prev === 'si' ? 'votosSi' : 'votosNo'] - 1);
    votantes[userId] = vote;
    alerta[vote === 'si' ? 'votosSi' : 'votosNo'] += 1;
  }
  alerta.votantes = votantes;
  await redis.set(`alerta:${id}`, alerta);
  return alerta;
}
