import { auth } from '../../../lib/auth';
import { getUserByEmail, updateUser } from '../../../lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) return Response.json({ error: 'No autenticado' }, { status: 401 });

    const user = await getUserByEmail(session.user.email);
    if (!user) return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });

    // Never return password
    const { password, ...safeUser } = user;
    return Response.json(safeUser);
  } catch (error) {
    return Response.json({ error: 'Error obteniendo perfil' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await auth();
    if (!session?.user?.email) return Response.json({ error: 'No autenticado' }, { status: 401 });

    const user = await getUserByEmail(session.user.email);
    if (!user) return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });

    const body = await req.json();

    // Only allow safe fields to be updated
    const allowed = ['name', 'phone', 'location', 'onboardingDone', 'isReciclador'];
    const updates = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    const updated = await updateUser(user.id, updates);
    const { password, ...safeUser } = updated;
    return Response.json(safeUser);
  } catch (error) {
    return Response.json({ error: 'Error actualizando perfil' }, { status: 500 });
  }
}
