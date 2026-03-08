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
    initCountdown();        // Sprint 2
    animateProgress();      // Sprint 2 (también actualiza leyenda dinámica)
  }
  // Actualizar tabla y contadores al entrar a gestionar
  if (target === "gestionar") {
    renderGestionar();
    updateManageStats();
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
    // Sprint 3B: usa numberStates cargados desde localStorage si existen
    const state = numberStates[num] || PRESET[num] || "available";
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

// ── Entrada inicial — gestionada por initApp() al final del archivo ──

/* ══════════════════════════════════════════════
   SPRINT 1 — FEATURES DE ALTO IMPACTO
   ══════════════════════════════════════════════ */

// ── Datos demo de compradores ──
const DEMO_BUYERS = [
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
let BUYERS = DEMO_BUYERS.map(b => ({ ...b })); // array mutable (Sprint 3B)

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
    href: url, download: `compradores-${((RIFA_CONFIG||{}).nombre||"rifa").toLowerCase().replace(/\s+/g,"-")}.csv`,
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
    const msg    = `🏆 ¡Tenemos ganador!\n\n🎰 Número ganador: *${num}*\n👤 ${person}\n\n🎁 Rifa: ${(RIFA_CONFIG||{}).nombre || "Rifa"}\n📣 Organizado por Rifas Cifuentips`;
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
  const _cfg   = RIFA_CONFIG || {};
  const _precio = `$${_fmtPrecio(_cfg.precio || 10000)} COP por número`;
  const _fecha  = _fmtFecha(_cfg.fecha || "2026-04-20", { year: undefined });
  ctx.fillStyle = "#eef2ff"; ctx.font = "bold 24px sans-serif";
  ctx.textAlign = "center"; ctx.fillText(_cfg.nombre || "Freidora de aire Oster", W / 2, 110);
  ctx.fillStyle = "#94a3b8"; ctx.font = "13px sans-serif";
  ctx.fillText(`${_precio}  ·  Sorteo: ${_fecha}  ·  Lotería del Valle`, W / 2, 136);

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
    const _c  = RIFA_CONFIG || {};
    const msg = `🎟️ ¡Aparté mis números!\n\n👤 *${nombre}*\n🔢 Números: *${nums}*\n\n🎁 Rifa: ${_c.nombre || "Rifa"}\n💰 $${_fmtPrecio(_c.precio || 10000)} COP cada uno\n📅 Sorteo: ${_fmtFecha(_c.fecha || "2026-04-20")}\n\nOrganizado por *Rifas Cifuentips* 🌟`;
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
  const SORTEO = new Date(`${RIFA_CONFIG?.fecha || "2026-04-20"}T20:00:00-05:00`);

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

  // Sprint 3B: valores dinámicos desde BUYERS
  const PAID     = BUYERS.filter(b => b.estado === "Pagado").length;
  const RESERVED = BUYERS.filter(b => b.estado === "Apartado").length;
  const TOTAL    = RIFA_CONFIG?.total ?? 100;
  const TARGET   = PAID; // la barra muestra solo pagados; apartados se ven en leyenda

  updateProgressLegend(); // Sprint 3B: actualizar leyenda con datos reales

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
  const paid = BUYERS.filter(b => b.estado === "Pagado").length;
  const cfg  = RIFA_CONFIG || {};
  const msg =
    `🎉 *¡Rifas Cifuentips!*\n\n` +
    `🏆 Premio: *${cfg.nombre || "Rifa"}*\n` +
    `💰 Solo *$${_fmtPrecio(cfg.precio || 10000)} COP* por número\n` +
    `📅 Sorteo: *${_fmtFecha(cfg.fecha || "2026-04-20")}*\n` +
    `⚡ ¡Ya van ${paid}/${cfg.total || 100} vendidos!\n\n` +
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

/* ══════════════════════════════════════════════
   SPRINT 3B — PERSISTENCIA localStorage
   ══════════════════════════════════════════════ */

const STORAGE_KEY = "rifas-cifuentips-v1";

// ════════════════════════════
// Guardar / Cargar estado
// ════════════════════════════
function saveState() {
  try {
    // "selected" es estado UI temporal — se guarda como "available"
    const ns = {};
    for (const [k, v] of Object.entries(numberStates)) {
      ns[k] = v === "selected" ? "available" : v;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ buyers: BUYERS, numberStates: ns }));
  } catch (e) { console.warn("saveState:", e); }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ════════════════════════════
// Reconstruir grilla (fuerza rebuild con estado actual)
// ════════════════════════════
function rebuildNumberGrid() {
  const grid = document.getElementById("numberGrid");
  if (grid) { grid.innerHTML = ""; delete grid.dataset.built; }
  buildNumberGrid();
}

// ════════════════════════════
// Tabla de compradores dinámica
// ════════════════════════════
function renderGestionar() {
  const tbody = document.getElementById("gestionarTbody");
  if (!tbody) return;

  if (BUYERS.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text-3)">
      Sin compradores aún — los números se apartan desde la <em>vista pública</em>.
    </td></tr>`;
    return;
  }

  tbody.innerHTML = [...BUYERS]
    .sort((a, b) => Number(a.num) - Number(b.num))
    .map(b => {
      const isApart = b.estado === "Apartado";
      const pill = isApart
        ? `<span class="pill-soon">⏳ Apartado</span>`
        : `<span class="pill-live">✅ Pagado</span>`;
      const btn = isApart
        ? `<button class="action-btn green-btn" data-num="${b.num}" data-action="pagar">Marcar pagado</button>`
        : `<button class="action-btn gray-btn"  data-num="${b.num}" data-action="liberar">Liberar</button>`;
      return `<tr>
        <td><strong>${b.num}</strong></td>
        <td>${b.nombre}</td>
        <td>${b.cel}</td>
        <td>${pill}</td>
        <td>${btn}</td>
      </tr>`;
    }).join("");
}

// ════════════════════════════
// Contadores de gestionar
// ════════════════════════════
function updateManageStats() {
  const paid  = BUYERS.filter(b => b.estado === "Pagado").length;
  const apart = BUYERS.filter(b => b.estado === "Apartado").length;
  const disp  = Math.max(0, (RIFA_CONFIG?.total ?? 100) - BUYERS.length);
  const $     = id => document.getElementById(id);
  if ($("statDisp"))    $("statDisp").textContent    = disp;
  if ($("statApart"))   $("statApart").textContent   = apart;
  if ($("statPagados")) $("statPagados").textContent = paid;
}

// ════════════════════════════
// Leyenda del sold-strip (Sprint 2 ↔ 3B)
// ════════════════════════════
function updateProgressLegend() {
  const paid  = BUYERS.filter(b => b.estado === "Pagado").length;
  const apart = BUYERS.filter(b => b.estado === "Apartado").length;
  const disp  = Math.max(0, (RIFA_CONFIG?.total ?? 100) - BUYERS.length);
  const $     = id => document.getElementById(id);
  if ($("legendPaid"))      $("legendPaid").innerHTML      = `<i class="dot-paid"></i> Pagados: ${paid}`;
  if ($("legendReserved"))  $("legendReserved").innerHTML  = `<i class="dot-reserved"></i> Apartados: ${apart}`;
  if ($("legendAvailable")) $("legendAvailable").innerHTML = `<i class="dot-available"></i> Libres: ${disp}`;
}

// ════════════════════════════
// Toast notification
// ════════════════════════════
function showToast(msg, type = "success") {
  const t = Object.assign(document.createElement("div"), {
    className: `rifa-toast rifa-toast--${type}`,
    textContent: msg,
  });
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add("rifa-toast--visible"));
  setTimeout(() => {
    t.classList.remove("rifa-toast--visible");
    setTimeout(() => t.remove(), 350);
  }, 2800);
}

// ════════════════════════════
// Apartar números (formulario público)
// ════════════════════════════
function apartarNow() {
  const inputs  = document.querySelectorAll("#publica .reserve-form input");
  const nombre  = inputs[0]?.value.trim();
  const cel     = inputs[1]?.value.trim();

  if (!nombre) { showToast("⚠️ Escribe tu nombre", "error"); return; }
  if (!cel)    { showToast("⚠️ Escribe tu celular", "error"); return; }

  const selected = Object.keys(numberStates).filter(n => numberStates[n] === "selected");
  if (!selected.length) {
    showToast("⚠️ Selecciona al menos un número en la grilla", "error");
    return;
  }

  selected.forEach(num => {
    BUYERS.push({ num, nombre, cel, estado: "Apartado" });
    numberStates[num] = "reserved";
  });

  saveState();
  rebuildNumberGrid();
  syncSelectedInput();
  renderGestionar();
  updateManageStats();
  updateProgressLegend();

  if (inputs[0]) inputs[0].value = "";
  if (inputs[1]) inputs[1].value = "";

  const label = selected.length > 1 ? `${selected.length} números` : `número ${selected[0]}`;
  showToast(`✅ ${label} apartado(s) para ${nombre} 🎉`);
}

// ════════════════════════════
// Acciones de gestionar
// ════════════════════════════
function markPaid(num) {
  const b = BUYERS.find(b => b.num === num);
  if (!b) return;
  b.estado         = "Pagado";
  numberStates[num] = "paid";
  saveState();
  renderGestionar();
  updateManageStats();
  updateProgressLegend();
  rebuildNumberGrid();
  showToast(`✅ Número ${num} marcado como pagado`);
}

function liberarNum(num) {
  const idx = BUYERS.findIndex(b => b.num === num);
  if (idx === -1) return;
  BUYERS.splice(idx, 1);
  numberStates[num] = "available";
  saveState();
  renderGestionar();
  updateManageStats();
  updateProgressLegend();
  rebuildNumberGrid();
  showToast(`🔓 Número ${num} liberado`);
}

// ════════════════════════════
// Resetear a demo
// ════════════════════════════
function resetToDemo() {
  BUYERS.length = 0;
  BUYERS.push(...DEMO_BUYERS.map(b => ({ ...b })));
  Object.keys(numberStates).forEach(k => delete numberStates[k]);
  localStorage.removeItem(STORAGE_KEY);
  rebuildNumberGrid();
  renderGestionar();
  updateManageStats();
  updateProgressLegend();
}

// ════════════════════════════
// Event listeners — Sprint 3B
// ════════════════════════════
document.getElementById("btnApartar")
  ?.addEventListener("click", apartarNow);

document.getElementById("btnResetDemo")
  ?.addEventListener("click", () => {
    if (!confirm("¿Limpiar todos los compradores y volver al demo?")) return;
    resetToDemo();
    showToast("🔄 Datos reiniciados al demo");
  });

document.getElementById("gestionarTbody")
  ?.addEventListener("click", e => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const { num, action } = btn.dataset;
    if (action === "pagar")   markPaid(num);
    if (action === "liberar") liberarNum(num);
  });

// ════════════════════════════
// initApp — carga estado y arranca la UI
// ════════════════════════════
function initApp() {
  // Sprint 3C: cargar configuración de rifa
  const savedCfg = loadConfig();
  if (savedCfg) Object.assign(RIFA_CONFIG, savedCfg);

  const saved = loadState();
  if (saved?.buyers && saved?.numberStates) {
    BUYERS.length = 0;
    BUYERS.push(...saved.buyers);
    Object.assign(numberStates, saved.numberStates);
  }
  buildNumberGrid();
  renderGestionar();
  updateManageStats();
  updateProgressLegend();
  applyConfig();        // Sprint 3C
  populateCrearForm();  // Sprint 3C
}
// initApp() se llama al final del archivo (después de que Sprint 3C inicializa RIFA_CONFIG)

/* ══════════════════════════════════════════════
   SPRINT 3C — PERSONALIZACIÓN DE RIFA
   ══════════════════════════════════════════════ */

const CONFIG_KEY = "rifas-config-v1";

const DEFAULT_CONFIG = {
  nombre:   "Freidora de aire Oster",
  premio:   "Freidora de aire de 4 litros",
  desc:     "Rifa para impulsar ventas del negocio. El ganador se define con las últimas dos cifras de la lotería del Valle.",
  total:    100,
  precio:   10000,
  fecha:    "2026-04-20",
  whatsapp: "3150000000",
  regla:    "Últimas dos cifras del premio mayor de la lotería del Valle",
  imagen:   null,
};

let RIFA_CONFIG = { ...DEFAULT_CONFIG };

// ════════════════════════════
// Helpers de formato
// ════════════════════════════
function _fmtPrecio(n) {
  return Number(n).toLocaleString("es-CO");
}

function _fmtFecha(iso, opts = {}) {
  try {
    const defaults = { day: "numeric", month: "long", year: "numeric" };
    return new Date(iso + "T12:00:00").toLocaleDateString("es-CO", { ...defaults, ...opts });
  } catch { return iso; }
}

// ════════════════════════════
// Guardar / Cargar configuración
// ════════════════════════════
function saveConfig() {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(RIFA_CONFIG));
  } catch (e) { console.warn("saveConfig:", e); }
}

function loadConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return null;
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch { return null; }
}

// ════════════════════════════
// Aplicar configuración a la UI
// ════════════════════════════
function applyConfig() {
  const c = RIFA_CONFIG;
  const $ = id => document.getElementById(id);

  if ($("heroRifaNombre")) $("heroRifaNombre").textContent = c.nombre;
  if ($("heroRifaSub"))    $("heroRifaSub").innerHTML =
    `Organizada por <strong>Tienda El Buen Gusto</strong> · $${_fmtPrecio(c.precio)} COP por número`;

  if ($("cdDate")) {
    const dia = new Date(c.fecha + "T12:00:00")
      .toLocaleDateString("es-CO", { day: "numeric", month: "long" });
    $("cdDate").textContent = `Sorteo: ${dia} · Lotería del Valle`;
  }

  if ($("infoFecha")) $("infoFecha").textContent = _fmtFecha(c.fecha);

  const winTitle = document.querySelector("#winnerModal .modal-title");
  if (winTitle) winTitle.textContent = c.nombre;

  const chip = document.querySelector(".numbers-card .chip-tag");
  if (chip) chip.textContent = `${c.total} números`;

  if ($("prevNombre")) $("prevNombre").textContent = c.nombre;
  if ($("prevPrecio")) $("prevPrecio").textContent = `$${_fmtPrecio(c.precio)} COP por número`;
  if ($("prevFecha"))  $("prevFecha").textContent  =
    `📅 Sorteo: ${_fmtFecha(c.fecha, { year: undefined })}`;

  _applyHeroImage(c.imagen);
  _applyPreviewImage(c.imagen);

  // Resetear countdown para que use la nueva fecha
  if (_cdInterval) { clearInterval(_cdInterval); _cdInterval = null; }
}

function _applyHeroImage(imgUrl) {
  const el = document.getElementById("heroPrizeImg");
  if (!el) return;
  if (imgUrl) {
    el.style.backgroundImage = `url(${imgUrl})`;
    el.classList.add("has-img");
  } else {
    el.style.backgroundImage = "";
    el.classList.remove("has-img");
  }
}

function _applyPreviewImage(imgUrl) {
  const el = document.getElementById("prevImagen");
  if (!el) return;
  if (imgUrl) {
    el.style.backgroundImage = `url(${imgUrl})`;
    el.classList.add("has-img");
    el.innerHTML = "";
  } else {
    el.style.backgroundImage = "";
    el.classList.remove("has-img");
  }
}

// ════════════════════════════
// Formulario crear ↔ RIFA_CONFIG
// ════════════════════════════
function populateCrearForm() {
  const $ = id => document.getElementById(id);
  if ($("cfgNombre"))  $("cfgNombre").value  = RIFA_CONFIG.nombre;
  if ($("cfgPremio"))  $("cfgPremio").value  = RIFA_CONFIG.premio;
  if ($("cfgDesc"))    $("cfgDesc").value     = RIFA_CONFIG.desc;
  if ($("cfgTotal"))   $("cfgTotal").value    = String(RIFA_CONFIG.total);
  if ($("cfgPrecio"))  $("cfgPrecio").value   = String(RIFA_CONFIG.precio);
  if ($("cfgFecha"))   $("cfgFecha").value    = RIFA_CONFIG.fecha;
  if ($("cfgWa"))      $("cfgWa").value       = RIFA_CONFIG.whatsapp;
  if ($("cfgRegla"))   $("cfgRegla").value    = RIFA_CONFIG.regla;
}

function readCrearForm() {
  const $ = id => document.getElementById(id);
  const nombre  = $("cfgNombre")?.value.trim();
  const premio  = $("cfgPremio")?.value.trim();
  const desc    = $("cfgDesc")?.value.trim();
  const total   = parseInt($("cfgTotal")?.value);
  const precio  = parseInt(($("cfgPrecio")?.value || "").replace(/\D/g, ""));
  const fecha   = $("cfgFecha")?.value;
  const wa      = $("cfgWa")?.value.trim();
  const regla   = $("cfgRegla")?.value.trim();
  if (nombre)      RIFA_CONFIG.nombre   = nombre;
  if (premio)      RIFA_CONFIG.premio   = premio;
  if (desc)        RIFA_CONFIG.desc     = desc;
  if (total > 0)   RIFA_CONFIG.total    = total;
  if (precio > 0)  RIFA_CONFIG.precio   = precio;
  if (fecha)       RIFA_CONFIG.fecha    = fecha;
  if (wa)          RIFA_CONFIG.whatsapp = wa;
  if (regla)       RIFA_CONFIG.regla    = regla;
}

// Live preview mientras el usuario escribe
function updateLivePreview() {
  const $ = id => document.getElementById(id);
  const nombre = $("cfgNombre")?.value.trim() || RIFA_CONFIG.nombre;
  const precio = parseInt(($("cfgPrecio")?.value || "").replace(/\D/g, "")) || RIFA_CONFIG.precio;
  const fecha  = $("cfgFecha")?.value || RIFA_CONFIG.fecha;
  if ($("prevNombre")) $("prevNombre").textContent = nombre;
  if ($("prevPrecio")) $("prevPrecio").textContent = `$${_fmtPrecio(precio)} COP por número`;
  if ($("prevFecha"))  $("prevFecha").textContent  =
    `📅 Sorteo: ${_fmtFecha(fecha, { year: undefined })}`;
}

function publicarRifa() {
  readCrearForm();
  saveConfig();
  applyConfig();
  showToast("🚀 ¡Rifa publicada! Los cambios ya se ven en la página pública.");
  setTimeout(() => switchView("publica"), 1400);
}

// ════════════════════════════
// Event listeners — Sprint 3C
// ════════════════════════════
document.getElementById("cfgImagen")?.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;
  if (file.size > 3 * 1024 * 1024) {
    showToast("⚠️ La imagen debe pesar menos de 3 MB", "error");
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    RIFA_CONFIG.imagen = e.target.result;
    _applyPreviewImage(RIFA_CONFIG.imagen);
    const hint = document.getElementById("cfgImagenHint");
    if (hint) hint.textContent = file.name;
    showToast("📸 Imagen cargada — pulsa 'Publicar rifa' para guardar");
  };
  reader.readAsDataURL(file);
});

["cfgNombre", "cfgPrecio", "cfgFecha"].forEach(id => {
  document.getElementById(id)?.addEventListener("input", updateLivePreview);
});

document.getElementById("btnPublicar")?.addEventListener("click", publicarRifa);

document.getElementById("btnBorrador")?.addEventListener("click", () => {
  readCrearForm();
  saveConfig();
  showToast("💾 Borrador guardado");
});

// ════════════════════════════
// Arranque final (después de que RIFA_CONFIG está declarado)
// ════════════════════════════
initApp();
