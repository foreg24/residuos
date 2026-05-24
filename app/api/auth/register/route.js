import { getUserByEmail, createUser, saveVerificationCode } from '../../../../lib/db';

export async function POST(req) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return Response.json({ error: 'Nombre, email y contraseña son requeridos' }, { status: 400 });
    }
    if (password.length < 8) {
      return Response.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 });
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return Response.json({ error: 'Este correo ya está registrado' }, { status: 400 });
    }

    const user = await createUser({ name, email, password, phone });

    // Generate and save 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await saveVerificationCode(email, code);

    // In production: send email with code via Resend/Nodemailer
    // For now return code in dev mode
    return Response.json({
      success: true,
      userId: user.id,
      devCode: process.env.NODE_ENV !== 'production' ? code : undefined,
      message: 'Usuario creado. Revisa tu correo para el código de verificación.',
    });
  } catch (error) {
    console.error('Register error:', error);
    return Response.json({ error: 'Error al crear la cuenta' }, { status: 500 });
  }
}
