import { auth } from '../../../lib/auth';
import { getUserByEmail, createAlerta, getAllAlertas, voteAlerta } from '../../../lib/db';

export async function GET() {
  try {
    const alertas = await getAllAlertas();
    return Response.json(alertas);
  } catch {
    return Response.json({ error: 'Error obteniendo alertas' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.email) return Response.json({ error: 'No autenticado' }, { status: 401 });
    const user = await getUserByEmail(session.user.email);
    if (!user) return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });

    const body = await req.json();
    if (!body.categoria || !body.ubicacion) {
      return Response.json({ error: 'Categoría y ubicación requeridas' }, { status: 400 });
    }

    const alerta = await createAlerta({ userId: user.id, ...body });
    return Response.json(alerta);
  } catch {
    return Response.json({ error: 'Error creando alerta' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await auth();
    if (!session?.user?.email) return Response.json({ error: 'No autenticado' }, { status: 401 });
    const user = await getUserByEmail(session.user.email);
    if (!user) return Response.json({ error: 'No autenticado' }, { status: 401 });

    const { id, vote } = await req.json();
    if (!id || !['si', 'no'].includes(vote)) {
      return Response.json({ error: 'ID y voto (si/no) requeridos' }, { status: 400 });
    }

    const updated = await voteAlerta(id, user.id, vote);
    return Response.json(updated);
  } catch {
    return Response.json({ error: 'Error votando' }, { status: 500 });
  }
}
