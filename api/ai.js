export default async function handler(req, res) {
  const { prompt, mode } = req.body;
  res.status(200).json({ reply: `IA local procesó: ${prompt} en modo ${mode}` });
}
