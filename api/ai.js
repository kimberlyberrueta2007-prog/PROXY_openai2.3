import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { prompt, mode } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Falta el prompt" }),
        { status: 400 }
      );
    }

    // 🎨 MODO CREAR: genera descripción + imagen
    if (mode === "crear") {
      const completion = await client.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content:
              "Eres DiseñaArte, una IA artística experta en ilustraciones elegantes con trazos definidos, brillo, contraste y estilo digital painting.",
          },
          { role: "user", content: prompt },
        ],
      });

      const description =
        completion.choices[0]?.message?.content ||
        "Ilustración generada artísticamente.";

      // 🖼️ Generar imagen con DALL·E 3
      const image = await client.images.generate({
        model: "gpt-image-1",
        prompt: `${prompt}, ilustración elegante con trazos definidos y brillo, digital painting artístico.`,
        size: "1024x1024",
      });

      const imageUrl = image.data[0]?.url;

      return new Response(
        JSON.stringify({
          reply: `🖌️ ${description}`,
          image: imageUrl,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // ✏️ MODO ASESORAR: texto paso a paso
    const guide = await client.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content:
            "Eres DiseñaArte, un profesor de dibujo que enseña paso a paso cómo crear bocetos artísticos con proporciones y trazos suaves.",
        },
        { role: "user", content: prompt },
      ],
    });

    const guideText =
      guide.choices[0]?.message?.content ||
      "Comienza con formas básicas y líneas suaves.";

    return new Response(
      JSON.stringify({
        reply: `✏️ ${guideText}`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error IA:", error);
    return new Response(
      JSON.stringify({
        error: "Error al generar respuesta IA",
        details: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
