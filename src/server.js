require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const { requireAuth } = require('./middleware/auth');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'trankas-secret-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Nombre, email y contraseña requeridos' });
  if (password.length < 8) return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  const existing = await db.getUserByEmail(email);
  if (existing) return res.status(400).json({ error: 'Este correo ya está registrado' });
  const user = await db.createUser({ name, email, password, phone });
  req.session.userId = user.id;
  req.session.email = user.email;
  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });
  const user = await db.getUserByEmail(email);
  if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
  if (!user.password) return res.status(401).json({ error: 'Esta cuenta usa login social' });
  const valid = await db.verifyPassword(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Contraseña incorrecta' });
  req.session.userId = user.id;
  req.session.email = user.email;
  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/user', requireAuth, async (req, res) => {
  const user = await db.getUserById(req.session.userId);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  const { password: _, ...safeUser } = user;
  res.json(safeUser);
});

app.patch('/api/user', requireAuth, async (req, res) => {
  const allowed = ['name', 'phone', 'location', 'onboardingDone', 'isReciclador'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  const updated = await db.updateUser(req.session.userId, updates);
  if (!updated) return res.status(404).json({ error: 'Usuario no encontrado' });
  const { password: _, ...safeUser } = updated;
  res.json(safeUser);
});

app.get('/api/reports', requireAuth, async (req, res) => {
  const reports = await db.getUserReports(req.session.userId);
  res.json(reports);
});

app.post('/api/reports', requireAuth, async (req, res) => {
  const { tipo, descripcion, ubicacion, imagen } = req.body;
  if (!tipo) return res.status(400).json({ error: 'Tipo requerido' });
  const report = await db.createReport({ userId: req.session.userId, tipo, descripcion, ubicacion, imagen });
  res.json(report);
});

app.get('/api/solicitudes', requireAuth, async (req, res) => {
  const soles = await db.getUserSolicitudes(req.session.userId);
  res.json(soles);
});

app.post('/api/solicitudes', requireAuth, async (req, res) => {
  const { tipo, volumen, descripcion, direccion, fecha, hora } = req.body;
  if (!tipo || !volumen || !direccion) return res.status(400).json({ error: 'Faltan campos requeridos' });
  const sol = await db.createSolicitud({ userId: req.session.userId, tipo, volumen, descripcion, direccion, fecha, hora });
  res.json(sol);
});

app.get('/api/alertas', async (req, res) => {
  const alertas = await db.getAllAlertas();
  res.json(alertas);
});

app.post('/api/alertas', requireAuth, async (req, res) => {
  const { categoria, descripcion, ubicacion } = req.body;
  if (!categoria || !ubicacion) return res.status(400).json({ error: 'Categoría y ubicación requeridas' });
  const alerta = await db.createAlerta({ userId: req.session.userId, categoria, descripcion, ubicacion });
  res.json(alerta);
});

app.patch('/api/alertas/:id/vote', requireAuth, async (req, res) => {
  const { vote } = req.body;
  if (!['si', 'no'].includes(vote)) return res.status(400).json({ error: 'Voto inválido' });
  const updated = await db.voteAlerta(req.params.id, req.session.userId, vote);
  if (!updated) return res.status(404).json({ error: 'Alerta no encontrada' });
  res.json(updated);
});

app.post('/api/ai/chat', requireAuth, async (req, res) => {
  const { message, history } = req.body;
  const systemPrompt = `Eres el asistente de Trankas, app de residuos de Neiva, Huila, Colombia. Clasificas residuos (orgánicos, aprovechables, peligrosos, especiales), das consejos de reciclaje y orientas sobre horarios de recolección: Zona 01 comunas 1,2 lun/mié/vie 7AM-1PM; Zona 02 comunas 5,7,10 mar/jue/sáb 7AM-1PM; Zona 03 comunas 3,4 lun/mié/vie 1PM-7PM; Zona 04 comunas 6,8 mar/jue/sáb 1PM-7PM; Zona 05 comuna 9 lun-sáb 7AM-3PM. Responde en español colombiano, breve y práctico.`;
  const messages = (history || []).slice(-10);
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    messages.push({ role: 'user', content: message });
  }
  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'system', content: systemPrompt }, ...messages], temperature: 0.7, max_tokens: 600 })
    });
    const data = await groqRes.json();
    res.json({ response: data.choices[0].message.content });
  } catch {
    res.status(500).json({ response: 'Error en el asistente. Intenta de nuevo.' });
  }
});

app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '../public/dashboard.html')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Trankas running on port ${PORT}`));

module.exports = app;
