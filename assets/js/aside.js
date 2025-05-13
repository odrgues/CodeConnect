document.addEventListener("DOMContentLoaded", function () {
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
        href: "/pages/perfil.html",
        icon: "/assets/img/aside/desktop/Frame 3.png",
        text: "Perfil",
      },
      {
        href: "/pages/sobre.html",
        icon: "/assets/img/aside/desktop/Frame 5.png",
        text: "Sobre nós",
      },

      {
        href: "/pages/login.html",
        icon: "/assets/img/aside/desktop/Frame 4.png",
        text: "Sair",
      },
    ],
  };

  loadCSS(config.cssPath);

  const asideHTML = createAside(config);

  const container = document.getElementById("aside-container");
  if (container) {
    container.innerHTML = asideHTML;
  }

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
        if (link.class === "btn-publicar") {
          return `
            <li>
              <a href="${link.href}" class="${link.class}">
                ${link.text}
              </a>
            </li>
          `;
        } else {
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
