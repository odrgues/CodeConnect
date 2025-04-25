// aside.js
document.addEventListener("DOMContentLoaded", function () {
  // Configurações
  const config = {
    cssPath: "/assets/css/aside.css",
    logoPath: "/assets/img/aside/desktop/Frame 2106.png",
    links: [
      {
        href: "/pages/publicar.html",
        text: "Publicar",
        class: "btn-publicar",
      },
      {
        href: "/pages/feed.html",
        icon: "/assets/img/aside/desktop/Frame 2.png",
        text: "Feed",
      },
      {
        href: "#",
        icon: "/assets/img/aside/desktop/Frame 3.png",
        text: "Projetos",
      },
      {
        href: "/pages/login.html",
        icon: "/assets/img/aside/desktop/Frame 4.png",
        text: "Login",
      },
    ],
  };

  // Carrega CSS
  loadCSS(config.cssPath);

  // Cria o aside
  const asideHTML = createAside(config);

  // Insere no container
  const container = document.getElementById("aside-container");
  if (container) {
    container.innerHTML = asideHTML;
    highlightCurrentPage();
  }

  // Funções auxiliares
  function loadCSS(path) {
    if (!document.querySelector(`link[href="${path}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = path;
      document.head.appendChild(link);
    }
  }

  function createAside(config) {
    const linksHTML = config.links
      .map(
        (link) => `
        <li>
          <a href="${link.href}" class="${link.class || "menu-link"}">
            ${
              link.icon
                ? `<img src="${link.icon}" class="desktop-icon" alt="${link.text}" />`
                : link.text
            }
          </a>
        </li>
      `
      )
      .join("");

    return `
        <aside>
          <img src="${config.logoPath}" alt="logo do codeconnect" class="logo-desktop" />
          <nav class="menu">
            <ul class="lista-links">
              ${linksHTML}
            </ul>
          </nav>
        </aside>
      `;
  }

  function highlightCurrentPage() {
    const links = document.querySelectorAll(".menu-link, .btn-publicar");
    const currentPath = window.location.pathname.toLowerCase();

    links.forEach((link) => {
      const linkPath = link.getAttribute("href").toLowerCase();

      // Remove classe ativa de todos os links primeiro
      link.classList.remove("active");

      // Verifica se o link corresponde à página atual
      if (
        currentPath === linkPath ||
        (currentPath.endsWith("/") && linkPath === "/pages/feed.html") ||
        (currentPath.includes(linkPath) && linkPath !== "/")
      ) {
        link.classList.add("active");
      }
    });
  }
});
