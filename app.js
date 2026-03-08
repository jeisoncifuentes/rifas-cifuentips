/* ══════════════════════════════════════════════
   RIFAS CIFUENTIPS — app.js
   ══════════════════════════════════════════════ */

// ── Navegación entre vistas ──
const navLinks   = document.querySelectorAll(".nav-link");
const views      = document.querySelectorAll(".view");
const viewTitle  = document.getElementById("view-title");

const titles = {
  inicio:    "Inicio",
  panel:     "Panel",
  crear:     "Crear rifa",
  publica:   "Página pública",
  gestionar: "Gestionar",
};

function switchView(target) {
  navLinks.forEach(l => l.classList.remove("active"));
  views.forEach(v => v.classList.remove("active"));

  const link = document.querySelector(`.nav-link[data-view="${target}"]`);
  const view = document.getElementById(target);

  if (link) link.classList.add("active");
  if (view) {
    view.classList.add("active");
    view.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (viewTitle) viewTitle.textContent = titles[target] || "Rifas Cifuentips";

  // Generar grilla de números al entrar a la vista pública
  if (target === "publica") {
    buildNumberGrid();
    initCountdown();    // ← Sprint 2
    animateProgress(); // ← Sprint 2
  }
}

navLinks.forEach(btn => {
  btn.addEventListener("click", () => switchView(btn.dataset.view));
});

// Botones CTA que llevan a otras vistas
document.querySelectorAll("[data-view-target]").forEach(btn => {
  btn.addEventListener("click", () => switchView(btn.dataset.viewTarget));
});

// ── Grilla de números interactiva ──
const numberStates = {};
const STATES = ["available", "reserved", "paid", "available", "available"];

// Distribución demo
const PRESET = {
  "02": "paid", "03": "reserved", "05": "paid",
  "07": "reserved", "08": "selected", "12": "selected",
  "13": "paid", "14": "reserved", "17": "paid",
  "18": "reserved", "22": "paid", "23": "reserved",
  "24": "selected", "26": "paid", "31": "paid",
  "33": "reserved", "37": "paid", "42": "reserved",
  "45": "paid", "48": "paid", "51": "reserved",
  "55": "paid", "61": "paid", "63": "reserved",
  "68": "paid", "72": "reserved", "75": "paid",
  "80": "paid", "84": "reserved", "91": "paid",
};

function buildNumberGrid() {
  const grid = document.getElementById("numberGrid");
  if (!grid || grid.dataset.built) return;
  grid.dataset.built = "1";

  for (let i = 0; i <= 99; i++) {
    const num = String(i).padStart(2, "0");
    const state = PRESET[num] || "available";
    numberStates[num] = state;

    const btn = document.createElement("button");
    btn.className = `grid-number ${state}`;
    btn.textContent = num;
    btn.dataset.num = num;
    btn.setAttribute("type", "button");
    btn.setAttribute("aria-label", `Número ${num} - ${state}`);

    if (state === "available") {
      btn.addEventListener("click", () => toggleNumber(btn, num));
    } else {
      btn.disabled = true;
    }

    grid.appendChild(btn);
  }
}

function toggleNumber(btn, num) {
  if (numberStates[num] === "selected") {
    numberStates[num] = "available";
    btn.classList.remove("selected");
    btn.classList.add("available");
  } else {
    numberStates[num] = "selected";
    btn.classList.remove("available");
    btn.classList.add("selected");
    // Mini animación al seleccionar
    btn.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(1.05)" }],
      { duration: 250, easing: "ease-out" }
    );
  }
  syncSelectedInput();
}

function syncSelectedInput() {
  const selected = Object.keys(numberStates)
    .filter(n => numberStates[n] === "selected")
    .join(", ");

  const input = document.querySelector(".reserve-form input[type='text']:last-of-type");
  if (input) input.value = selected || "";
}

// ── Entrada inicial ──
buildNumberGrid();

/* ══════════════════════════════════════════════
   SPRINT 1 — FEATURES DE ALTO IMPACTO
   ══════════════════════════════════════════════ */

// ── Datos demo de compradores ──
const BUYERS = [
  { num: "08", nombre: "Maria Rojas",     cel: "3150001111", estado: "Apartado" },
  { num: "12", nombre: "Carlos Vega",     cel: "3160002222", estado: "Pagado"   },
  { num: "24", nombre: "Luisa Gómez",     cel: "3170003333", estado: "Apartado" },
  { num: "02", nombre: "Pedro Martínez",  cel: "3180004444", estado: "Pagado"   },
  { num: "05", nombre: "Ana López",       cel: "3190005555", estado: "Pagado"   },
  { num: "13", nombre: "Juan Herrera",    cel: "3200006666", estado: "Pagado"   },
  { num: "17", nombre: "Rosa Castaño",    cel: "3210007777", estado: "Pagado"   },
  { num: "22", nombre: "Luis García",     cel: "3220008888", estado: "Pagado"   },
  { num: "26", nombre: "Clara Torres",    cel: "3230009999", estado: "Pagado"   },
];

// ════════════════════════════
// FEATURE 3: Exportar CSV
// ════════════════════════════
function exportCSV() {
  const headers = ["Número", "Nombre", "Celular", "Estado"];
  const rows    = BUYERS.map(b => [b.num, b.nombre, b.cel, b.estado]);
  const csv     = "\uFEFF" + [headers, ...rows].map(r => r.join(",")).join("\r\n");
  const blob    = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url     = URL.createObjectURL(blob);
  const link    = Object.assign(document.createElement("a"), {
    href: url, download: "compradores-rifas-freidora.csv",
  });
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

document.getElementById("btnExportCSV")
  ?.addEventListener("click", exportCSV);

// ════════════════════════════
// FEATURE 1: Generador de ganador animado
// ════════════════════════════
let _spinning = false;
let _fastTimer = null, _slowTimer = null;

function openWinnerModal() {
  document.getElementById("winnerModal").classList.add("active");
  _resetDrum();
}

function closeWinnerModal() {
  document.getElementById("winnerModal").classList.remove("active");
  clearInterval(_fastTimer);
  clearInterval(_slowTimer);
  _spinning = false;
}

function _resetDrum() {
  _spinning = false;
  clearInterval(_fastTimer);
  clearInterval(_slowTimer);

  document.getElementById("winnerReveal").classList.remove("show");
  document.getElementById("confettiContainer").innerHTML = "";

  const spinBtn  = document.getElementById("spinBtn");
  const resetBtn = document.getElementById("resetDrumBtn");
  spinBtn.disabled = false;
  spinBtn.textContent = "🎰 ¡Girar la tómbola!";
  spinBtn.style.display = "";
  resetBtn.style.display = "none";

  const display = document.getElementById("drumDisplay");
  display.textContent = "??";
  display.classList.remove("winner-display", "spinning");

  const rnd = () => String(Math.floor(Math.random() * 100)).padStart(2, "0");
  document.querySelectorAll(".drum-ball").forEach(b => {
    b.classList.remove("orbiting");
    b.textContent = rnd();
  });
}

function _spinDrum() {
  if (_spinning) return;
  _spinning = true;

  const spinBtn = document.getElementById("spinBtn");
  spinBtn.disabled = true;
  spinBtn.textContent = "🎲 Girando…";

  const display = document.getElementById("drumDisplay");
  const balls   = document.querySelectorAll(".drum-ball");
  const rnd     = () => String(Math.floor(Math.random() * 100)).padStart(2, "0");

  display.classList.add("spinning");
  balls.forEach(b => b.classList.add("orbiting"));

  // Fase rápida: 2.5 s
  _fastTimer = setInterval(() => {
    display.textContent = rnd();
    balls.forEach(b => { b.textContent = rnd(); });
  }, 55);

  setTimeout(() => {
    clearInterval(_fastTimer);

    // Fase lenta: 1.5 s
    _slowTimer = setInterval(() => { display.textContent = rnd(); }, 220);

    setTimeout(() => {
      clearInterval(_slowTimer);
      display.classList.remove("spinning");
      balls.forEach(b => b.classList.remove("orbiting"));

      // Elegir ganador (todos los números del 00 al 99)
      const winner = rnd();
      display.textContent = winner;
      display.classList.add("winner-display");

      const buyer  = BUYERS.find(b => b.num === winner);
      const person = buyer ? `${buyer.nombre}  ·  ${buyer.cel}` : "Número sin apartar";
      document.getElementById("winnerPerson").textContent = person;

      setTimeout(() => {
        document.getElementById("winnerReveal").classList.add("show");
        spinBtn.style.display = "none";
        document.getElementById("resetDrumBtn").style.display = "";
        _launchConfetti();
      }, 380);
    }, 1500);
  }, 2500);
}

function _launchConfetti() {
  const container = document.getElementById("confettiContainer");
  container.innerHTML = "";
  const colors = ["#00e573","#ffd60a","#fb923c","#38bdf8","#a78bfa","#ffffff","#ff6b6b"];
  for (let i = 0; i < 70; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.cssText = `
      left:${Math.random() * 100}%;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      width:${4 + Math.random() * 5}px;
      height:${7 + Math.random() * 9}px;
      border-radius:${Math.random() > 0.5 ? "50%" : "2px"};
      animation-delay:${Math.random() * 0.55}s;
      animation-duration:${1.4 + Math.random() * 1.6}s;
    `;
    container.appendChild(el);
  }
}

// Eventos — winner modal
document.getElementById("btnSortear")
  ?.addEventListener("click", openWinnerModal);
document.getElementById("closeWinner")
  ?.addEventListener("click", closeWinnerModal);
document.getElementById("spinBtn")
  ?.addEventListener("click", _spinDrum);
document.getElementById("resetDrumBtn")
  ?.addEventListener("click", _resetDrum);
document.getElementById("winnerModal")
  ?.addEventListener("click", e => {
    if (e.target.id === "winnerModal") closeWinnerModal();
  });
document.getElementById("btnShareResult")
  ?.addEventListener("click", () => {
    const num    = document.getElementById("drumDisplay").textContent;
    const person = document.getElementById("winnerPerson").textContent;
    const msg    = `🏆 ¡Tenemos ganador!\n\n🎰 Número ganador: *${num}*\n👤 ${person}\n\n🎁 Rifa: Freidora de aire Oster\n📣 Organizado por Rifas Cifuentips`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  });

// ════════════════════════════
// FEATURE 2: Ticket para WhatsApp (Canvas)
// ════════════════════════════
function openTicketModal() {
  const inputs  = document.querySelectorAll(".reserve-form input");
  const nombre  = inputs[0]?.value?.trim() || "Participante";
  const cel     = inputs[1]?.value?.trim() || "Sin celular";
  const numeros = inputs[2]?.value?.trim() || "—";
  document.getElementById("ticketModal").classList.add("active");
  requestAnimationFrame(() => _drawTicket(nombre, cel, numeros));
}

function closeTicketModal() {
  document.getElementById("ticketModal").classList.remove("active");
}

// Helper: rounded rectangle path
function _roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function _drawTicket(nombre, cel, numeros) {
  const canvas = document.getElementById("ticketCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = 800, H = 450;
  canvas.width  = W;
  canvas.height = H;

  // ── Fondo ──
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, "#08101e");
  bgGrad.addColorStop(1, "#0d1828");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Glow verde (esquina TL)
  const g1 = ctx.createRadialGradient(0, 0, 0, 0, 0, 480);
  g1.addColorStop(0, "rgba(0,229,115,0.09)");
  g1.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);

  // Glow dorado (esquina TR)
  const g2 = ctx.createRadialGradient(W, 0, 0, W, 0, 380);
  g2.addColorStop(0, "rgba(255,214,10,0.07)");
  g2.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);

  // ── Borde neón ──
  ctx.shadowBlur = 18; ctx.shadowColor = "#00e573";
  ctx.strokeStyle = "#00e573"; ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, W - 4, H - 4);
  ctx.shadowBlur = 0;

  // Esquinas decorativas
  const ca = 14, cs = 2;
  ctx.fillStyle = "#00e573";
  [[8,8,ca,cs],[8,8,cs,ca],[W-8-ca,8,ca,cs],[W-8-cs,8,cs,ca],
   [8,H-8-cs,ca,cs],[8,H-8-ca,cs,ca],[W-8-ca,H-8-cs,ca,cs],[W-8-cs,H-8-ca,cs,ca]]
  .forEach(([x,y,w,h]) => ctx.fillRect(x,y,w,h));

  // ── Franja header ──
  const hg = ctx.createLinearGradient(0, 0, W, 72);
  hg.addColorStop(0, "rgba(0,229,115,0.16)");
  hg.addColorStop(1, "rgba(255,214,10,0.05)");
  ctx.fillStyle = hg; ctx.fillRect(0, 0, W, 72);

  // Estrella + marca
  ctx.shadowBlur = 12; ctx.shadowColor = "#00e573";
  ctx.fillStyle = "#00e573"; ctx.font = "bold 22px sans-serif";
  ctx.textAlign = "left"; ctx.fillText("★", 28, 46);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#eef2ff"; ctx.font = "bold 15px sans-serif";
  ctx.fillText("RIFAS CIFUENTIPS", 60, 46);

  // Badge de ticket (derecha)
  const bW = 172, bH = 28, bX = W - bW - 22, bY = 22;
  ctx.fillStyle = "rgba(0,229,115,0.11)";
  _roundRect(ctx, bX, bY, bW, bH, 999); ctx.fill();
  ctx.strokeStyle = "rgba(0,229,115,0.4)"; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = "#00e573"; ctx.font = "bold 10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("🎟  TICKET DE APARTADO", bX + bW / 2, bY + 18);

  // Divisor header
  ctx.strokeStyle = "rgba(255,255,255,0.07)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(22, 72); ctx.lineTo(W - 22, 72); ctx.stroke();

  // ── Nombre de la rifa ──
  ctx.fillStyle = "#eef2ff"; ctx.font = "bold 24px sans-serif";
  ctx.textAlign = "center"; ctx.fillText("Freidora de aire Oster", W / 2, 110);
  ctx.fillStyle = "#94a3b8"; ctx.font = "13px sans-serif";
  ctx.fillText("$10.000 COP por número  ·  Sorteo: 20 abril 2026  ·  Lotería del Valle", W / 2, 136);

  // ── Bolas con números ──
  const nums = numeros.split(",").map(s => s.trim()).filter(Boolean);
  const ballR = Math.min(46, 190 / Math.max(nums.length, 1));
  const gap   = ballR * 2 + 12;
  const totalBW = nums.length * gap - 12;
  const startX  = (W - totalBW) / 2 + ballR;
  const cy = 224;

  if (nums.length <= 6) {
    nums.forEach((n, i) => {
      const cx = startX + i * gap;
      // Sombra
      ctx.shadowBlur = 28; ctx.shadowColor = "rgba(255,214,10,0.55)";
      // Gradiente bola
      const bg = ctx.createRadialGradient(cx - ballR * 0.3, cy - ballR * 0.3, ballR * 0.05, cx, cy, ballR);
      bg.addColorStop(0, "#fff9c0"); bg.addColorStop(0.55, "#ffd60a"); bg.addColorStop(1, "#b87800");
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.arc(cx, cy, ballR, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      // Brillo
      const shine = ctx.createRadialGradient(cx - ballR*0.3, cy - ballR*0.35, 0, cx - ballR*0.25, cy - ballR*0.3, ballR*0.55);
      shine.addColorStop(0, "rgba(255,255,255,0.42)"); shine.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = shine;
      ctx.beginPath(); ctx.arc(cx, cy, ballR, 0, Math.PI * 2); ctx.fill();
      // Número
      const fs = nums.length <= 2 ? 26 : nums.length <= 4 ? 21 : 17;
      ctx.fillStyle = "#1a0d00"; ctx.font = `bold ${fs}px sans-serif`;
      ctx.textAlign = "center"; ctx.fillText(n.padStart(2, "0"), cx, cy + fs * 0.38);
    });
  } else {
    // Muchos números — caja de texto
    ctx.fillStyle = "rgba(255,214,10,0.09)";
    _roundRect(ctx, W/2 - 255, 190, 510, 66, 12); ctx.fill();
    ctx.strokeStyle = "rgba(255,214,10,0.28)"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.shadowBlur = 16; ctx.shadowColor = "rgba(255,214,10,0.5)";
    ctx.fillStyle = "#ffd60a"; ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center"; ctx.fillText("Números: " + numeros, W / 2, 231);
    ctx.shadowBlur = 0;
  }

  // ── Divisor ──
  ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(22, 294); ctx.lineTo(W - 22, 294); ctx.stroke();

  // ── Info del participante ──
  const c2x = W / 2 + 18;
  ctx.textAlign = "left"; ctx.fillStyle = "#5d6e85"; ctx.font = "bold 10px sans-serif";
  ctx.fillText("PARTICIPANTE", 30, 318); ctx.fillText("CELULAR", c2x, 318);
  ctx.fillStyle = "#eef2ff"; ctx.font = "bold 16px sans-serif";
  ctx.fillText(nombre.slice(0, 30), 30, 344); ctx.fillText(cel.slice(0, 20), c2x, 344);

  // ── Sello APARTADO ──
  ctx.save();
  ctx.translate(W - 86, H - 60);
  ctx.rotate(-Math.PI / 9);
  ctx.shadowBlur = 10; ctx.shadowColor = "rgba(0,229,115,0.45)";
  ctx.strokeStyle = "rgba(0,229,115,0.65)"; ctx.lineWidth = 2;
  _roundRect(ctx, -62, -19, 124, 36, 4); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#00e573"; ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "center"; ctx.fillText("APARTADO ✓", 0, 7);
  ctx.restore();

  // ── Footer ──
  ctx.fillStyle = "rgba(255,255,255,0.04)"; ctx.fillRect(0, H - 34, W, 34);
  ctx.strokeStyle = "rgba(255,255,255,0.07)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, H - 34); ctx.lineTo(W, H - 34); ctx.stroke();
  ctx.fillStyle = "#5d6e85"; ctx.font = "11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("cifuentips.com  ·  Conserva este ticket como comprobante de tu número apartado", W / 2, H - 12);
}

function downloadTicket() {
  const canvas = document.getElementById("ticketCanvas");
  if (!canvas) return;
  const inputs = document.querySelectorAll(".reserve-form input");
  const nums   = inputs[2]?.value?.trim().replace(/,\s*/g, "-") || "ticket";
  const link   = Object.assign(document.createElement("a"), {
    href: canvas.toDataURL("image/png"),
    download: `ticket-rifa-${nums}.png`,
  });
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Eventos — ticket modal
document.getElementById("btnTicket")
  ?.addEventListener("click", openTicketModal);
document.getElementById("closeTicket")
  ?.addEventListener("click", closeTicketModal);
document.getElementById("ticketModal")
  ?.addEventListener("click", e => {
    if (e.target.id === "ticketModal") closeTicketModal();
  });
document.getElementById("btnDownloadTicket")
  ?.addEventListener("click", downloadTicket);
document.getElementById("btnShareTicket")
  ?.addEventListener("click", () => {
    const inputs  = document.querySelectorAll(".reserve-form input");
    const nombre  = inputs[0]?.value?.trim() || "Participante";
    const nums    = inputs[2]?.value?.trim() || "—";
    const msg     = `🎟️ ¡Aparté mis números!\n\n👤 *${nombre}*\n🔢 Números: *${nums}*\n\n🎁 Rifa: Freidora de aire Oster\n💰 $10.000 COP cada uno\n📅 Sorteo: 20 abril 2026\n\nOrganizado por *Rifas Cifuentips* 🌟`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  });

/* ══════════════════════════════════════════════
   SPRINT 2 — VIRALIZACIÓN Y CONVERSIÓN
   ══════════════════════════════════════════════ */

// ════════════════════════════
// FEATURE: Countdown timer
// ════════════════════════════
let _cdInterval = null;

function initCountdown() {
  if (_cdInterval) return; // ya corriendo

  // Fecha del sorteo (Colombia UTC-5)
  const SORTEO = new Date("2026-04-20T20:00:00-05:00");

  function _setFlip(id, val) {
    const el = document.getElementById(id);
    if (!el || el.textContent === val) return;
    el.textContent = val;
    el.classList.remove("cd-tick");
    requestAnimationFrame(() => el.classList.add("cd-tick"));
  }

  function _tick() {
    const diff = SORTEO - new Date();
    if (diff <= 0) {
      ["cdDays","cdHours","cdMins","cdSecs"].forEach(id => _setFlip(id, "00"));
      clearInterval(_cdInterval);
      _cdInterval = null;
      return;
    }
    const pad = n => String(n).padStart(2, "0");
    _setFlip("cdDays",  pad(Math.floor(diff / 864e5)));
    _setFlip("cdHours", pad(Math.floor((diff % 864e5) / 36e5)));
    _setFlip("cdMins",  pad(Math.floor((diff % 36e5) / 6e4)));
    _setFlip("cdSecs",  pad(Math.floor((diff % 6e4) / 1e3)));
  }

  _tick();
  _cdInterval = setInterval(_tick, 1000);
}

// ════════════════════════════
// FEATURE: Animated progress bar
// ════════════════════════════
let _progTimer = null;

function animateProgress() {
  // Reiniciar si ya estaba corriendo
  if (_progTimer) { clearInterval(_progTimer); _progTimer = null; }

  const PAID     = 68;
  const RESERVED = 12;
  const TOTAL    = 100;
  const TARGET   = PAID; // la barra muestra solo pagados; apartados se ven en leyenda

  // Reset visual instantáneo
  const fillEl  = document.getElementById("soldFill");
  const cntEl   = document.getElementById("soldCount");
  const pctEl   = document.getElementById("soldPct");
  const alertEl = document.getElementById("soldAlert");

  if (fillEl)  { fillEl.style.transition = "none"; fillEl.style.width = "0%"; }
  if (cntEl)   cntEl.textContent  = `0 / ${TOTAL} vendidos`;
  if (pctEl)   { pctEl.textContent = "0%"; pctEl.style.color = ""; pctEl.style.textShadow = ""; }
  if (alertEl) alertEl.textContent = "";

  // Dar un frame para que el reset se pinte antes de animar
  requestAnimationFrame(() => {
    if (fillEl) fillEl.style.transition = ""; // restaurar transición CSS

    let current = 0;
    const step  = TARGET / 70; // ~70 pasos

    _progTimer = setInterval(() => {
      current = Math.min(current + step, TARGET);
      const rounded = Math.round(current);
      const pct     = Math.round((rounded / TOTAL) * 100);

      if (cntEl)  cntEl.textContent  = `${rounded} / ${TOTAL} vendidos`;
      if (fillEl) fillEl.style.width = pct + "%";

      if (pctEl) {
        pctEl.textContent = pct + "%";
        if (pct >= 85)      { pctEl.style.color = "var(--amber)"; pctEl.style.textShadow = "0 0 16px rgba(251,146,60,0.5)"; }
        else if (pct >= 65) { pctEl.style.color = "var(--gold)";  pctEl.style.textShadow = "0 0 16px rgba(255,214,10,0.5)"; }
        else                { pctEl.style.color = "var(--green)"; pctEl.style.textShadow = "0 0 16px rgba(0,229,115,0.5)"; }
      }

      if (current >= TARGET) {
        clearInterval(_progTimer);
        _progTimer = null;
        const remaining = TOTAL - PAID - RESERVED;
        if (alertEl && remaining <= 30) {
          alertEl.textContent = `⚡ ¡Solo quedan ${remaining} libres!`;
        }
      }
    }, 22);
  });
}

// ════════════════════════════
// FEATURE: Viral share
// ════════════════════════════
function shareRifa() {
  const msg =
    `🎉 *¡Rifas Cifuentips!*\n\n` +
    `🏆 Premio: *Freidora de aire Oster*\n` +
    `💰 Solo *$10.000 COP* por número\n` +
    `📅 Sorteo: *20 de abril de 2026*\n` +
    `⚡ ¡Ya van 68/100 vendidos!\n\n` +
    `Corre a apartar tu número antes de que se agoten 👇`;
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
}

function copyRifaLink() {
  const url = window.location.href;
  const btn  = document.getElementById("btnCopyRifaLink");

  const _flash = () => {
    if (!btn) return;
    const orig = btn.textContent;
    btn.textContent = "✅ ¡Copiado!";
    btn.style.color = "var(--green)";
    setTimeout(() => { btn.textContent = orig; btn.style.color = ""; }, 2200);
  };

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(url).then(_flash).catch(() => _fallbackCopy(url, _flash));
  } else {
    _fallbackCopy(url, _flash);
  }
}

function _fallbackCopy(text, cb) {
  const ta = Object.assign(document.createElement("textarea"), {
    value: text, style: "position:fixed;opacity:0",
  });
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); cb(); } catch (_) {}
  document.body.removeChild(ta);
}

// Eventos — viral share
document.getElementById("btnShareRifa")
  ?.addEventListener("click", shareRifa);
document.getElementById("btnCopyRifaLink")
  ?.addEventListener("click", copyRifaLink);
