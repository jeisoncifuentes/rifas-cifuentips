
/* ══════════════════════════════════════════════
   SPRINT 5B — COMPARTIR Y VIRAL
   ══════════════════════════════════════════════ */

const SHARE_KEY = "RIFAS_SHARE_COUNT";

function _getShareCount() {
  return parseInt(localStorage.getItem(SHARE_KEY) || "0");
}

function _incShareCount() {
  var n = _getShareCount() + 1;
  localStorage.setItem(SHARE_KEY, String(n));
  _renderShareCount();
}

function _renderShareCount() {
  var el = document.getElementById("shareCount");
  if (!el) return;
  var n = _getShareCount();
  if (n > 0) {
    el.textContent = "🔥 Compartida " + n + (n === 1 ? " vez" : " veces");
    el.style.display = "";
  } else {
    el.style.display = "none";
  }
}

function _openWhatsApp(msg) {
  window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank");
  _incShareCount();
}

function _copyToClipboard(text, label) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
      .then(function() { showToast("📋 " + label + " copiado al portapapeles"); })
      .catch(function() { _fallbackCopy(text, label); });
  } else {
    _fallbackCopy(text, label);
  }
}

function _fallbackCopy(text, label) {
  var ta = document.createElement("textarea");
  ta.value = text;
  ta.style.cssText = "position:fixed;opacity:0;";
  document.body.appendChild(ta);
  ta.focus(); ta.select();
  try { document.execCommand("copy"); showToast("📋 " + label + " copiado"); }
  catch(e) { showToast("⚠️ No se pudo copiar", "error"); }
  document.body.removeChild(ta);
}

// ── Compartir rifa por WhatsApp ──
document.getElementById("btnShareRifa") && document.getElementById("btnShareRifa").addEventListener("click", function() {
  var c = RIFA_CONFIG;
  var link = window.location.href.split("?")[0];
  var fecha = "";
  try { fecha = new Date(c.fecha + "T12:00:00").toLocaleDateString("es-CO", {day:"numeric",month:"long",year:"numeric"}); }
  catch(e) { fecha = c.fecha; }
  var nl = String.fromCharCode(10);
  var msg = "🎰 *¡Participa en la rifa " + c.nombre + "!*" + nl + nl
    + "🏆 Premio: " + c.premio + nl
    + "💰 Precio por número: $" + Number(c.precio).toLocaleString("es-CO") + " COP" + nl
    + "📅 Sorteo: " + fecha + nl
    + "🎲 Regla: " + c.regla + nl + nl
    + "👉 Más info: " + link + nl + nl
    + "¡Quedan pocos números! 🔥";
  _openWhatsApp(msg);
});

// ── Compartir resultado del sorteo ──
document.getElementById("btnShareResult") && document.getElementById("btnShareResult").addEventListener("click", function() {
  var display = document.getElementById("drumDisplay");
  var person  = document.getElementById("winnerPerson");
  var num     = (display && display.textContent) || "??";
  var ganador = (person && person.textContent) || "—";
  var nl = String.fromCharCode(10);
  var msg = "🏆 *¡Tenemos ganador en la rifa " + RIFA_CONFIG.nombre + "!*" + nl + nl
    + "🎉 Número ganador: *" + num + "*" + nl
    + "👤 Ganador: " + ganador + nl + nl
    + "¡Felicitaciones! 🥳";
  _openWhatsApp(msg);
});

// ── Compartir ticket (número reservado) ──
document.getElementById("btnShareTicket") && document.getElementById("btnShareTicket").addEventListener("click", function() {
  var c   = RIFA_CONFIG;
  var num = (document.getElementById("ticketNum") && document.getElementById("ticketNum").textContent) || "??";
  var fecha = "";
  try { fecha = new Date(c.fecha + "T12:00:00").toLocaleDateString("es-CO", {day:"numeric",month:"long",year:"numeric"}); }
  catch(e) { fecha = c.fecha; }
  var nl = String.fromCharCode(10);
  var msg = "🎟️ *¡Participé en la rifa " + c.nombre + "!*" + nl + nl
    + "🔢 Mi número: *" + num + "*" + nl
    + "💰 Precio: $" + Number(c.precio).toLocaleString("es-CO") + " COP" + nl
    + "📅 Sorteo: " + fecha + nl + nl
    + "¡Aún hay números disponibles! 🔥";
  _openWhatsApp(msg);
});

// ── Copiar link — vista pública ──
document.getElementById("btnCopyRifaLink") && document.getElementById("btnCopyRifaLink").addEventListener("click", function() {
  _copyToClipboard(window.location.href, "Link de la rifa");
});

// ── Copiar link — gestionar ──
document.getElementById("btnCopyGestionar") && document.getElementById("btnCopyGestionar").addEventListener("click", function() {
  _copyToClipboard(window.location.href, "Link de la rifa");
});

// Inicializar contador al arrancar
_renderShareCount();

