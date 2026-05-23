export async function POST(req) {
  try {
    const { message, history } = await req.json();

    const systemPrompt = `Eres el asistente oficial de Trankas, la app de gestión de residuos de Neiva, Huila, Colombia.

Tu especialidad es:
1. Clasificar residuos: orgánicos, aprovechables (plástico, papel, vidrio, metal, cartón), peligrosos (pilas, electrónicos, químicos, medicamentos), o escombros/especiales.
2. Dar consejos prácticos de reciclaje adaptados al contexto de Neiva.
3. Orientar sobre los horarios de recolección según las 5 zonas de Neiva:
   - Zona 01 (Comunas 1,2 - Norte/Aeropuerto): Lunes, Miércoles y Viernes, 7AM–1PM
   - Zona 02 (Comunas 5,7,10 - Oriente): Martes, Jueves y Sábado, 7AM–1PM
   - Zona 03 (Comunas 3,4 - Centro): Lunes, Miércoles y Viernes, 1PM–7PM
   - Zona 04 (Comunas 6,8 - Sur): Martes, Jueves y Sábado, 1PM–7PM
   - Zona 05 (Comuna 9 - Norte/Galindo): Lunes a Sábado, 7AM–3PM
4. Informar sobre la empresa de aseo de Neiva: Promoambiental Distrito.
5. Orientar sobre puntos de acopio disponibles en Neiva.

Siempre responde en español colombiano, de forma clara, amigable y práctica. Usa emojis con moderación. Respuestas entre 2-5 párrafos máximo. Si no sabes algo específico de Neiva, dilo honestamente.`;

    const messages = (history || []).slice(-10).map(m => ({
      role: m.role,
      content: m.content,
    }));

    if (!messages.length || messages[messages.length - 1].role !== 'user') {
      messages.push({ role: 'user', content: message });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Groq error:', err);
      throw new Error('Groq API error');
    }

    const data = await response.json();
    return Response.json({ response: data.choices[0].message.content });

  } catch (error) {
    console.error('AI error:', error);
    return Response.json(
      { response: 'Lo siento, hubo un error procesando tu consulta. Por favor intenta de nuevo.' },
      { status: 500 }
    );
  }
}
