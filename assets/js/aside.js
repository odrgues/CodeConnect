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
      .map((link) => {
        // Item "Publicar" - mostra apenas texto
        if (link.class === "btn-publicar") {
          return `
            <li>
              <a href="${link.href}" class="${link.class}">
                ${link.text}
              </a>
            </li>
          `;
        }
        // Demais itens - mostram apenas ícone
        else {
          return `
            <li>
              <a href="${link.href}" class="menu-link">
                <img src="${link.icon}" class="desktop-icon" alt="${link.text}" />
              </a>
            </li>
          `;
        }
      })
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
});
