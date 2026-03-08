const navLinks = document.querySelectorAll(".nav-link");
const views = document.querySelectorAll(".view");
const viewTitle = document.getElementById("view-title");

const titles = {
  inicio: "Inicio",
  panel: "Panel",
  crear: "Crear rifa",
  publica: "Pagina publica",
  gestionar: "Gestionar",
};

navLinks.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.view;

    navLinks.forEach((link) => link.classList.remove("active"));
    views.forEach((view) => view.classList.remove("active"));

    button.classList.add("active");
    document.getElementById(target).classList.add("active");
    viewTitle.textContent = titles[target] || "Rifas Andalucia";
  });
});
