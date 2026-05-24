import { auth } from '../../../lib/auth';
import { getUserByEmail, createReport, getUserReports } from '../../../lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) return Response.json({ error: 'No autenticado' }, { status: 401 });
    const user = await getUserByEmail(session.user.email);
    if (!user) return Response.json([]);
    const reports = await getUserReports(user.id);
    return Response.json(reports);
  } catch {
    return Response.json({ error: 'Error obteniendo reportes' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.email) return Response.json({ error: 'No autenticado' }, { status: 401 });
    const user = await getUserByEmail(session.user.email);
    if (!user) return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });

    const body = await req.json();
    if (!body.tipo) return Response.json({ error: 'Tipo de reporte requerido' }, { status: 400 });

    const report = await createReport({ userId: user.id, ...body });
    return Response.json(report);
  } catch {
    return Response.json({ error: 'Error creando reporte' }, { status: 500 });
  }
}
