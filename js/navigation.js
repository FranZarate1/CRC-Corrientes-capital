const navToggle = document.querySelector(".nav-toggle");
const navigation = document.getElementById("site-navigation");

if (navToggle && navigation) {
  const closeMenu = () => {
    navToggle.closest(".site-header").classList.remove("menu-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menú");
  };

  navToggle.addEventListener("click", () => {
    const open = navToggle.getAttribute("aria-expanded") !== "true";
    navToggle.closest(".site-header").classList.toggle("menu-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  });

  navigation.addEventListener("click", event => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
      closeMenu();
      navToggle.focus();
    }
  });
}
