import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🚀 Compatible con App Router (Next.js 13+)
export async function POST(req) {
  try {
    const { prompt, mode } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Falta el prompt" }),
        { status: 400 }
      );
    }

    // 🎨 MODO CREAR → genera descripción e instrucciones de dibujo
    if (mode === "crear") {
      const completion = await client.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `
              Eres DiseñaArte, una IA artista que da instrucciones paso a paso 
              para dibujar con código (canvas 2D). 
              Devuelve instrucciones simples que indiquen qué figura dibujar: 
              "conejo", "flor", "persona", "mariposa", "paisaje", "gato", etc.
              Usa frases breves y directas como:
              "Dibuja un conejo de cuerpo completo con orejas largas"
              o "Pinta un paisaje con montañas y un sol brillante".
              No generes código, solo texto descriptivo.
            `,
          },
          { role: "user", content: prompt },
        ],
      });

      const description =
        completion.choices?.[0]?.message?.content ||
        "Crea una ilustración elegante con trazos definidos.";

      // Retorna una descripción que tu script.js interpretará
      return new Response(
        JSON.stringify({
          reply: `🖌️ ${description}`,
          draw: { type: "canvas", prompt: description },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // ✏️ MODO ASESORAR → guía de boceto paso a paso
    const guide = await client.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `
            Eres DiseñaArte, un profesor de dibujo.
            Enseña con frases simples cómo bocetar proporciones,
            rostro, cuerpo y cabello con líneas suaves y trazos definidos.
          `,
        },
        { role: "user", content: prompt },
      ],
    });

    const guideText =
      guide.choices?.[0]?.message?.content ||
      "Comienza con trazos suaves para definir la forma principal.";

    return new Response(
      JSON.stringify({ reply: `✏️ ${guideText}` }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error en IA:", error);
    return new Response(
      JSON.stringify({
        error: "Error al generar respuesta IA",
        details: error.message,
      }),
      { status: 500 }
    );
  }
}

