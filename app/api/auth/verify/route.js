import { checkVerificationCode, getUserByEmail, updateUser } from '../../../../lib/db';

export async function POST(req) {
  try {
    const { email, code } = await req.json();
    if (!email || !code) return Response.json({ error: 'Email y código requeridos' }, { status: 400 });

    const valid = await checkVerificationCode(email, code);
    if (!valid) return Response.json({ error: 'Código inválido o expirado' }, { status: 400 });

    const user = await getUserByEmail(email);
    if (user) await updateUser(user.id, { verified: true });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Error verificando código' }, { status: 500 });
  }
}
