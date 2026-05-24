import { auth } from '../../../lib/auth';
import { getUserByEmail, createSolicitud, getUserSolicitudes } from '../../../lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) return Response.json({ error: 'No autenticado' }, { status: 401 });
    const user = await getUserByEmail(session.user.email);
    if (!user) return Response.json([]);
    const soles = await getUserSolicitudes(user.id);
    return Response.json(soles);
  } catch {
    return Response.json({ error: 'Error obteniendo solicitudes' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.email) return Response.json({ error: 'No autenticado' }, { status: 401 });
    const user = await getUserByEmail(session.user.email);
    if (!user) return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });

    const body = await req.json();
    if (!body.tipo || !body.volumen || !body.direccion) {
      return Response.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const sol = await createSolicitud({ userId: user.id, ...body });
    return Response.json(sol);
  } catch {
    return Response.json({ error: 'Error creando solicitud' }, { status: 500 });
  }
}
