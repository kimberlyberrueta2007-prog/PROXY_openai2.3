// 🌌 Fondo animado con estrellas 
const galaxy = document.getElementById("galaxy-bg");
for (let i = 0; i < 150; i++) {
  const s = document.createElement("div");
  s.classList.add("star");
  const size = Math.random() * 3 + "px";
  s.style.width = size;
  s.style.height = size;
  s.style.top = Math.random() * 100 + "%";
  s.style.left = Math.random() * 100 + "%";
  s.style.animationDuration = 2 + Math.random() * 3 + "s";
  galaxy.appendChild(s);
}

// 🎬 Entrar al estudio
const enterBtn = document.getElementById("enterBtn");
const welcome = document.getElementById("welcome-screen");
const studio = document.getElementById("studio");

enterBtn.addEventListener("click", () => {
  welcome.classList.add("fade-out");
  setTimeout(() => {
    welcome.classList.add("hidden");
    studio.classList.remove("hidden");
    speak("Bienvenido al estudio de arte DiseñaArte. Estoy aquí para ayudarte a crear ilustraciones elegantes y llenas de vida.");
    appendMessage("DiseñaArte IA", "🎨 Bienvenido al estudio DiseñaArte. Activa el modo Crear o Asesorar y empecemos tu obra.");
  }, 800);
});

// ✨ Estilo animación de salida
const style = document.createElement("style");
style.innerHTML = `
  .fade-out { animation: fadeOut 1s ease forwards; }
  @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
`;
document.head.appendChild(style);

// 🎨 Canvas
const canvas = document.getElementById("drawBoard");
const ctx = canvas.getContext("2d");
let drawing = false, color = "#000000", erasing = false;
let modo = "crear";

document.getElementById("colorPicker").addEventListener("input", e => color = e.target.value);
document.getElementById("brushSize").addEventListener("input", e => ctx.lineWidth = e.target.value);
canvas.addEventListener("mousedown", () => drawing = true);
canvas.addEventListener("mouseup", () => { drawing = false; ctx.beginPath(); });
canvas.addEventListener("mousemove", draw);

function draw(e) {
  if (!drawing) return;
  ctx.lineCap = "round";
  ctx.strokeStyle = erasing ? "#FFFFFF" : color;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

// 🧭 Botones
document.getElementById("eraseBtn").addEventListener("click", () => {
  erasing = !erasing;
  appendMessage("DiseñaArte IA", erasing ? "✏️ Modo borrador activado." : "🎨 Volviendo al modo dibujo.");
  speak(erasing ? "Modo borrador activado." : "Volviendo al modo dibujo.");
});

document.getElementById("clearBtn").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  appendMessage("DiseñaArte IA", "🧼 Lienzo limpio, listo para crear algo nuevo.");
  speak("Lienzo limpio, listo para crear algo nuevo.");
});

document.getElementById("saveBtn").addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "dibujo.png";
  link.href = canvas.toDataURL();
  link.click();
  appendMessage("DiseñaArte IA", "💾 Tu obra ha sido guardada correctamente.");
  speak("Tu obra ha sido guardada correctamente.");
});

document.getElementById("exitBtn").addEventListener("click", () => {
  appendMessage("DiseñaArte IA", "👋 Ha sido un placer dibujar contigo. ¡Nos vemos pronto!");
  speak("Ha sido un placer dibujar contigo. ¡Nos vemos pronto!");
});

// 🎭 Modos
document.getElementById("createBtn").addEventListener("click", () => {
  modo = "crear";
  appendMessage("DiseñaArte IA", "🎨 Modo Crear activado. Dibuja libremente o pídele al asesor que pinte algo completo.");
  speak("Modo Crear activado. Dibuja libremente o pídele al asesor que pinte algo completo.");
});

document.getElementById("teachBtn").addEventListener("click", () => {
  modo = "asesorar";
  appendMessage("DiseñaArte IA", "🧠 Modo Asesorar activado. Te guiaré con trazos y bocetos paso a paso.");
  speak("Modo Asesorar activado. Te guiaré con trazos y bocetos paso a paso.");
});

// 💬 Chat funcional
const chatBox = document.getElementById("chat-box");
const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", e => { if (e.key === "Enter") sendMessage(); });

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.textContent = `${sender}: ${text}`;
  msg.className = sender === "Usuario" ? "user-msg" : "bot-msg";
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  appendMessage("Usuario", text);

  // 🚀 IA local o proxy (auto detección)
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: text, mode: modo })
    });
    if (res.ok) {
      const data = await res.json();
      appendMessage("DiseñaArte IA", data.reply || "✨ Aquí tienes tu resultado creativo.");
      speak(data.reply || "Aquí tienes tu resultado creativo.");
      if (modo === "crear") drawGeneratedArt(text);
      else drawTutorial(text);
      return;
    }
  } catch (e) {
    // Si no hay proxy, usa el modo local
    console.warn("Proxy no encontrado, usando IA local:", e);
  }

  handleBotResponse(text.toLowerCase());
  userInput.value = "";
}

function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "es-MX";
  utter.pitch = 0.9;
  utter.rate = 1;
  speechSynthesis.speak(utter);
}

// 🤖 IA local por defecto (si no hay proxy)
function handleBotResponse(msg) {
  let response = "";

  if (msg.includes("hola")) {
    response = "¡Hola! Soy DiseñaArte, tu asesor creativo. Dime si quieres un dibujo completo o un tutorial paso a paso.";
  }
  else if (modo === "crear") {
    response = "Perfecto, prepararé algo visualmente hermoso. Observa el lienzo...";
    drawGeneratedArt(msg);
  }
  else if (modo === "asesorar") {
    response = "Comencemos el tutorial artístico con trazos definidos y elegantes.";
    drawTutorial(msg);
  }
  else {
    response = "Puedes cambiar al modo Crear o Asesorar. Estoy listo para ayudarte.";
  }

  appendMessage("DiseñaArte IA", response);
  speak(response);
}

// ✏️ Dibujo artístico completo (modo crear)
function drawGeneratedArt(prompt) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 2;

  if (prompt.includes("flor")) drawFlowerField();
  else if (prompt.includes("conejo")) drawRabbit();
  else if (prompt.includes("mariposa")) drawButterfly();
  else if (prompt.includes("paisaje") || prompt.includes("campo")) drawLandscape();
  else if (prompt.includes("persona") || prompt.includes("humano")) drawHumanSilhouette();
  else drawAbstractArt();
}

// 🌸 Ejemplos de dibujos
function drawFlowerField() {
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#99ccff");
  grad.addColorStop(1, "#66cc66");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * canvas.width;
    const y = 400 + Math.random() * 200;
    ctx.fillStyle = "#228b22";
    ctx.fillRect(x, y, 2, 20);
    ctx.beginPath();
    ctx.arc(x, y - 5, 7, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${Math.random() * 360}, 80%, 60%)`;
    ctx.fill();
  }
  appendMessage("DiseñaArte IA", "🌼 Campo de flores completo. La naturaleza florece en tu lienzo.");
}

function drawRabbit() {
  ctx.fillStyle = "#f7ede2";
  ctx.beginPath();
  ctx.ellipse(400, 350, 80, 100, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(370, 260, 25, 70, 0.2, 0, Math.PI * 2);
  ctx.ellipse(430, 260, 25, 70, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(390, 340, 5, 0, Math.PI * 2);
  ctx.arc(410, 340, 5, 0, Math.PI * 2);
  ctx.fill();
  appendMessage("DiseñaArte IA", "🐇 Un conejo elegante con textura suave y luz natural.");
}

function drawButterfly() {
  ctx.fillStyle = "#ff66cc";
  ctx.beginPath();
  ctx.ellipse(400, 300, 20, 60, 0, 0, Math.PI * 2);
  ctx.fill();
  const wings = ["#ffccff", "#ff99cc", "#ff66cc", "#cc33ff"];
  wings.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(400 + (i % 2 === 0 ? -60 : 60), 300 + (i < 2 ? -30 : 30), 60, 80, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  appendMessage("DiseñaArte IA", "🦋 Mariposa de colores brillantes con alas simétricas y suaves reflejos.");
}

function drawLandscape() {
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#87CEEB");
  grad.addColorStop(1, "#2E8B57");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#FFD700";
  ctx.beginPath();
  ctx.arc(700, 100, 50, 0, Math.PI * 2);
  ctx.fill();
  appendMessage("DiseñaArte IA", "🌄 Un paisaje elegante con tonos suaves y luz dorada.");
}

function drawHumanSilhouette() {
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(400, 150);
  ctx.arc(400, 150, 40, 0, Math.PI * 2);
  ctx.moveTo(400, 190);
  ctx.lineTo(400, 350);
  ctx.moveTo(400, 220);
  ctx.lineTo(360, 300);
  ctx.moveTo(400, 220);
  ctx.lineTo(440, 300);
  ctx.moveTo(400, 350);
  ctx.lineTo(360, 450);
  ctx.moveTo(400, 350);
  ctx.lineTo(440, 450);
  ctx.stroke();
  appendMessage("DiseñaArte IA", "🧍 Silueta humana artística creada con elegancia minimalista.");
}

// 🎨 Tutorial con cabello y cuerpo completo
function drawTutorial(topic) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(0,0,0,0.6)";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";

  if (topic.includes("rostro") || topic.includes("cara")) {
    ctx.beginPath();
    ctx.ellipse(400, 300, 70, 90, 0, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.moveTo(340 + i * 8, 210);
      ctx.quadraticCurveTo(400, 170, 460 - i * 8, 210);
      ctx.stroke();
    }
    appendMessage("DiseñaArte IA", "👩 Tutorial: rostro con cabello y proporciones base.");
    speak("Tutorial de rostro con cabello y proporciones base.");
  } 
  else if (topic.includes("cuerpo") || topic.includes("persona") || topic.includes("humano")) {
    ctx.beginPath();
    ctx.ellipse(400, 150, 40, 50, 0, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      const x1 = 400 + Math.sin(i) * 20;
      const y1 = 100 + Math.random() * 15;
      const x2 = 380 + Math.random() * 40;
      ctx.moveTo(400, 100);
      ctx.quadraticCurveTo(x1, y1, x2, 180);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(400, 200);
    ctx.lineTo(400, 400);
    ctx.moveTo(400, 250);
    ctx.lineTo(340, 320);
    ctx.moveTo(400, 250);
    ctx.lineTo(460, 320);
    ctx.moveTo(400, 400);
    ctx.lineTo(360, 500);
    ctx.moveTo(400, 400);
    ctx.lineTo(440, 500);
    ctx.stroke();
    appendMessage("DiseñaArte IA", "🧍 Tutorial: figura humana completa con cabello. Observa proporciones y postura.");
    speak("Tutorial de figura humana completa con cabello. Observa las proporciones del cuerpo y la armonía del trazo.");
  } 
  else {
    ctx.beginPath();
    ctx.moveTo(300, 200);
    ctx.lineTo(500, 400);
    ctx.stroke();
    appendMessage("DiseñaArte IA", "✏️ Tutorial base activo. Practica líneas y formas libres.");
    speak("Tutorial base activo. Practica líneas y formas libres.");
  }
}
