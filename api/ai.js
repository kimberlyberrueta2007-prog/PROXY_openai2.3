export default async function handler(req, res) {
  // Permitir solo peticiones POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { prompt, mode } = req.body;

  if (!prompt || !mode) {
    return res.status(400).json({ error: "Faltan parámetros requeridos: prompt o mode." });
  }

  try {
    // 🖌️ MODO CREAR (genera imagen con estilo pintura digital elegante)
    if (mode === "crear") {
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt: `
            ${prompt}, 
            estilo pintura al óleo digital profesional, 
            iluminación elegante, 
            textura visible de pincel, 
            profundidad atmosférica, 
            colores armoniosos, 
            detalle artístico realista, 
            composición equilibrada, 
            sombras suaves, 
            contraste natural, 
            trazo limpio y brillo sutil.
          `,
          size: "1024x1024",
          quality: "hd"
        })
      });

      const data = await response.json();

      if (!data?.data || !data.data[0]?.url) {
        console.error("Error: Respuesta inesperada de OpenAI", data);
        return res.status(500).json({ reply: "No se pudo generar la imagen, intenta de nuevo." });
      }

      const imageUrl = data.data[0].url;

      return res.status(200).json({
        reply: "🎨 Tu obra artística está lista, creada con trazos digitales elegantes.",
        imageUrl
      });
    }

    // 📘 MODO ASESORAR (texto/tutoría artística avanzada)
    if (mode === "asesorar") {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `
                Eres "DiseñaArte IA", un tutor artístico profesional.
                Enseñas dibujo y pintura con un estilo elegante, amable y preciso.
                Das explicaciones paso a paso y sugieres técnicas de luz, color, y forma.
                Cuando el usuario pida "modo asesorar", no dibujas, sino enseñas.
              `
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.9
        })
      });

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "No se obtuvo respuesta del tutor.";

      return res.status(200).json({ reply });
    }

    // 🚫 Si el modo no es válido
    return res.status(400).json({ error: "Modo inválido. Usa 'crear' o 'asesorar'." });

  } catch (error) {
    console.error("Error en DiseñaArte IA:", error);
    return res.status(500).json({
      reply: "❌ Ocurrió un error al procesar tu solicitud artística."
    });
  }
}
