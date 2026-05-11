const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Base de datos en memoria (para demo - usar MongoDB/PostgreSQL en producción)
const users = [];
const verificationCodes = new Map();
const reports = [];
const collectionRequests = [];

// ===== AUTH MIDDLEWARE =====
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requerido' });
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ error: 'Token inválido' });
    }
};

// ===== EMAIL SERVICE =====
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

const sendVerificationEmail = async (email, name, code) => {
    try {
        const transporter = createTransporter();
        await transporter.sendMail({
            from: `"Trankas" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Verifica tu cuenta - Trankas',
            html: `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                    <h2 style="color:#2d7a46;">¡Bienvenido a Trankas!</h2>
                    <p>Hola ${name},</p>
                    <p>Tu código de verificación es:</p>
                    <div style="background:#f0f7f1;padding:20px;text-align:center;border-radius:10px;margin:20px 0;">
                        <h1 style="color:#2d7a46;font-size:2rem;letter-spacing:8px;">${code}</h1>
                    </div>
                    <p>Este código expira en 10 minutos.</p>
                    <p style="color:#666;font-size:0.9rem;">Si no solicitaste este registro, ignora este correo.</p>
                </div>
            `
        });
        return true;
    } catch (error) {
        console.error('Error enviando email:', error);
        return false;
    }
};

// ===== ROUTES =====

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Register
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, phone, gender } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Datos incompletos' });
    }
    
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'Email ya registrado' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
        id: Date.now().toString(),
        name,
        email,
        password: hashedPassword,
        phone,
        gender,
        isReciclador: false,
        createdAt: new Date().toISOString()
    };
    
    users.push(user);
    
    // Generar y enviar código
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes.set(email, { code, expires: Date.now() + 600000 });
    
    const emailSent = await sendVerificationEmail(email, name, code);
    
    res.json({ 
        success: true, 
        message: 'Usuario registrado. Verifica tu email.',
        emailSent,
        devCode: process.env.NODE_ENV === 'development' ? code : undefined
    });
});

// Verify email
app.post('/api/auth/verify', (req, res) => {
    const { email, code } = req.body;
    const stored = verificationCodes.get(email);
    
    if (!stored || stored.code !== code || Date.now() > stored.expires) {
        return res.status(400).json({ error: 'Código inválido o expirado' });
    }
    
    verificationCodes.delete(email);
    const user = users.find(u => u.email === email);
    if (user) user.verified = true;
    
    const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
    );
    
    res.json({ success: true, token, user: { ...user, password: undefined } });
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    
    if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
    );
    
    res.json({ success: true, token, user: { ...user, password: undefined } });
});

// Forgot password
app.post('/api/auth/forgot', async (req, res) => {
    const { email } = req.body;
    const user = users.find(u => u.email === email);
    
    if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const resetToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1h' }
    );
    
    user.resetToken = resetToken;
    
    try {
        const transporter = createTransporter();
        await transporter.sendMail({
            from: `"Trankas" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Recuperar contraseña - Trankas',
            html: `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                    <h2 style="color:#2d7a46;">Recuperar contraseña</h2>
                    <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset.html?token=${resetToken}"
                       style="background:#2d7a46;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px;display:inline-block;margin:20px 0;">
                        Restablecer contraseña
                    </a>
                    <p style="color:#666;font-size:0.9rem;">Este enlace expira en 1 hora.</p>
                </div>
            `
        });
        res.json({ success: true, message: 'Instrucciones enviadas' });
    } catch (error) {
        res.status(500).json({ error: 'Error enviando email' });
    }
});

// ===== AI CLASSIFICATION (Groq) =====
app.post('/api/ai/classify', authMiddleware, async (req, res) => {
    const { message, image } = req.body;
    
    try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: 'llama-3.2-90b-vision-preview',
            messages: [
                {
                    role: 'system',
                    content: `Eres un asistente experto en gestión de residuos de Neiva, Colombia. 
                    Clasifica residuos en: orgánico, aprovechable (plástico, papel, vidrio, metal), 
                    peligroso (pilas, electrónicos, químicos), o recolección especial (escombros, muebles).
                    Da respuestas cortas y prácticas en español. Incluye tips de reciclaje.`
                },
                {
                    role: 'user',
                    content: message || '¿Qué tipo de residuo es este?'
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        res.json({ 
            success: true, 
            response: response.data.choices[0].message.content 
        });
    } catch (error) {
        console.error('Groq API error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Error en el servicio de IA' });
    }
});

// ===== SCHEDULE =====
app.get('/api/schedule/:barrio', (req, res) => {
    const barrio = req.params.barrio.toLowerCase();
    
    // Mapeo de barrios a comunas (usar base de datos real en producción)
    const barrioComuna = {
        'santa inés': '1', 'cándido leguízamo': '1', 'las mercedes': '1',
        'el centro': '4', 'san pedro': '4', 'los martires': '4',
        'la libertad': '5', 'primero de mayo': '5', 'kennedy': '5',
        'minuto de dios': '6', 'miramar': '6', 'andalucía': '6',
        'las brisas': '7', 'casa loma': '7', 'la floresta': '7',
        'la isla': '8', 'las américas': '8', 'alfonso lópez': '8',
        'trínidad': '9', 'alberto galindo': '9', 'villa magdalena': '9',
        'la rioja': '10', 'once de noviembre': '10', 'los comuneros': '10'
    };
    
    const comuna = barrioComuna[barrio];
    if (!comuna) {
        return res.status(404).json({ error: 'Barrio no encontrado' });
    }
    
    const horarios = {
        '1': { dia: 'Lunes', horario: '7AM - 12PM', zona: 'Norte' },
        '2': { dia: 'Miércoles', horario: '7AM - 12PM', zona: 'Centro Occidente' },
        '3': { dia: 'Martes', horario: '7AM - 12PM', zona: 'Entre Ríos' },
        '4': { dia: 'Jueves', horario: '2PM - 6PM', zona: 'Central' },
        '5': { dia: 'Viernes', horario: '7AM - 12PM', zona: 'Oriental' },
        '6': { dia: 'Viernes', horario: '2PM - 6PM', zona: 'Sur' },
        '7': { dia: 'Sábado', horario: '7AM - 3PM', zona: 'Centro Oriente' },
        '8': { dia: 'Lunes', horario: '2PM - 6PM', zona: 'Sur Oriental' },
        '9': { dia: 'Martes', horario: '2PM - 6PM', zona: 'Norte' },
        '10': { dia: 'Miércoles', horario: '2PM - 6PM', zona: 'Oriente Alto' }
    };
    
    res.json({ 
        success: true, 
        comuna, 
        schedule: horarios[comuna],
        barrio: req.params.barrio
    });
});

// ===== REPORTS =====
app.post('/api/reports', authMiddleware, (req, res) => {
    const { tipo, descripcion, ubicacion, imagen } = req.body;
    
    const report = {
        id: Date.now().toString(),
        userId: req.user.userId,
        tipo,
        descripcion,
        ubicacion,
        imagen,
        fecha: new Date().toISOString(),
        status: 'pendiente'
    };
    
    reports.push(report);
    res.json({ success: true, report });
});

app.get('/api/reports', authMiddleware, (req, res) => {
    const userReports = reports.filter(r => r.userId === req.user.userId);
    res.json({ success: true, reports: userReports });
});

// ===== COLLECTION REQUESTS =====
app.post('/api/collection/request', authMiddleware, (req, res) => {
    const { tipo, volumen, descripcion, direccion, fecha, hora } = req.body;
    
    const request = {
        id: Date.now().toString(),
        userId: req.user.userId,
        tipo,
        volumen,
        descripcion,
        direccion,
        fecha,
        hora,
        status: 'buscando-reciclador',
        createdAt: new Date().toISOString()
    };
    
    collectionRequests.push(request);
    res.json({ success: true, request });
});

app.get('/api/collection/requests', authMiddleware, (req, res) => {
    const userRequests = collectionRequests.filter(r => r.userId === req.user.userId);
    res.json({ success: true, requests: userRequests });
});

// ===== SERVE FRONTEND =====
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🌿 Trankas server running on port ${PORT}`);
    console.log(`📱 Local: http://localhost:${PORT}`);
});

module.exports = app;