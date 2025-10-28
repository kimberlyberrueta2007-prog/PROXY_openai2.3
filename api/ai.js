import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { prompt, mode } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: "Falta el prompt" });
    }

    // 🎨 MODO CREAR (genera descripción e imagen)
    if (mode === "crear") {
      const completion = await client.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content:
              "Eres DiseñaArte, una IA artística que crea ilustraciones elegantes con trazos definidos, brillo y estilo digital painting.",
          },
          { role: "user", content: prompt },
        ],
      });

      const description =
        completion.choices?.[0]?.message?.content ||
        "Ilustración generada artísticamente.";

      // 🖼️ Crear imagen con modelo de arte
      const image = await client.images.generate({
        model: "gpt-image-1",
        prompt: `${prompt}, estilo ilustración elegante con trazos definidos y brillo digital painting.`,
        size: "1024x1024",
      });

      const imageUrl = image.data?.[0]?.url;

      return res.status(200).json({
        reply: `🖌️ ${description}`,
        image: imageUrl,
      });
    }

    // ✏️ MODO ASESORAR (tutorial paso a paso)
    const guide = await client.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content:
            "Eres DiseñaArte, un profesor de dibujo que enseña bocetos paso a paso con proporciones, anatomía básica y trazos suaves.",
        },
        { role: "user", content: prompt },
      ],
    });

    const guideText =
      guide.choices?.[0]?.message?.content ||
      "Comienza con formas básicas y líneas suaves.";

    return res.status(200).json({
      reply: `✏️ ${guideText}`,
    });
  } catch (error) {
    console.error("❌ Error IA:", error);
    return res.status(500).json({
      error: "Error al generar respuesta IA",
      details: error.message,
    });
  }
}

