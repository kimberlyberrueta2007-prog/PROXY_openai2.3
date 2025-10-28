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

    // 🧠 Validación simple
    if (!prompt) {
      return res.status(400).json({ error: "Falta el prompt" });
    }

    // 🎨 MODO CREAR → imagen artística + descripción
    if (mode === "crear") {
      // 1️⃣ Generar descripción artística con GPT
      const completion = await client.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content:
              "Eres DiseñaArte, una IA artística experta en pintura digital elegante con trazos definidos, brillo y contraste. Describe el estilo, los colores y la atmósfera de la obra.",
          },
          { role: "user", content: prompt },
        ],
      });

      const description = completion.choices[0]?.message?.content || "Ilustración artística generada.";

      // 2️⃣ Generar imagen con DALL·E 3
      const image = await client.images.generate({
        model: "gpt-image-1", // DALL·E 3
        prompt: `${prompt}, ilustración elegante con trazos definidos y brillo, estilo digital painting profesional.`,
        size: "1024x1024",
      });

      const imageUrl = image.data[0].url;

      return res.status(200).json({
        reply: `🖌️ ${description}`,
        image: imageUrl, // el JS la dibuja en el canvas
      });
    }

    // ✏️ MODO ASESORAR → guía paso a paso (solo texto)
    const guide = await client.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content:
            "Eres DiseñaArte, un profesor de dibujo. Enseña paso a paso cómo realizar bocetos artísticos con trazos elegantes y proporciones correctas.",
        },
        { role: "user", content: prompt },
      ],
    });

    const guideText = guide.choices[0]?.message?.content || "Comienza con formas básicas y líneas suaves.";

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
