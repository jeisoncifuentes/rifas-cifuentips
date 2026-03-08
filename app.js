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
  if (target === "publica") buildNumberGrid();
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
