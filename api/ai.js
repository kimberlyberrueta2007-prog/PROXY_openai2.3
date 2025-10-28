import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    const { prompt, mode } = await req.json();

    // 🔮 Si es modo crear, generamos una descripción artística e instrucciones
    if (mode === "crear") {
      const completion = await client.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: "Eres una IA artística llamada DiseñaArte. Describe pinturas con detalle, color, composición y estilo visual, como si fueran hechas a mano." },
          { role: "user", content: prompt }
        ]
      });

      const description = completion.choices[0].message.content;

      return res.status(200).json({
        reply: `🖌️ ${description}`,
        draw: { type: "paint", prompt }
      });
    }

    // 🎓 Si es modo asesorar, devuelve guía paso a paso
    const guide = await client.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: "Eres un profesor de dibujo DiseñaArte. Explica paso a paso cómo hacer bocetos." },
        { role: "user", content: prompt }
      ]
    });

    res.status(200).json({ reply: `✏️ ${guide.choices[0].message.content}` });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al generar respuesta IA" });
  }
}
