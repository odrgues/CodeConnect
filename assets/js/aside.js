document.addEventListener("DOMContentLoaded", function () {
  const config = {
    cssPath: "../assets/css/aside.css",
    logoPath: "../assets/img/aside/desktop/Frame 2106.png",

    links: [
      {
        href: "/pages/publicar.html",
        class: "btn-publicar",
        text: "Publicar",
      },
      {
        href: "/pages/feed.html",
        icon: "../assets/img/aside/desktop/Frame 2.png",
        altText: "Ícone de Feed",
      },
      {
        href: "/pages/perfil.html",
        icon: "../assets/img/aside/desktop/Frame 3.png",
        altText: "Ícone de Perfil",
      },
      {
        href: "/pages/sobre.html",
        icon: "../assets/img/aside/desktop/Frame 5.png",
        altText: "Ícone Sobre nós",
      },
      {
        href: "/pages/login.html",
        icon: "../assets/img/aside/desktop/Frame 4.png",
        id: "logout-link",
        altText: "Ícone de Sair",
      },
    ],
  };

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
          const altText = link.altText || `Ícone`;
          const linkId = link.id ? `id="${link.id}"` : "";

          return `
            <li>
              <a href="${link.href}" class="menu-link" ${linkId}>
                <img src="${link.icon}" class="desktop-icon" alt="${altText}" />
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

  function handleLogout(event) {
    event.preventDefault();

    console.log("Aside JS: Realizando logout...");

    localStorage.removeItem("jwt_token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");

    window.location.href = "/pages/login.html";
  }

  loadCSS(config.cssPath);

  const asideHTML = createAside(config);

  const container = document.getElementById("aside-container");
  if (container) {
    container.innerHTML = asideHTML;
  } else {
    console.error(
      "Aside JS: Elemento 'aside-container' não encontrado no DOM."
    );
  }

  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", handleLogout);
    console.log("Aside JS: Listener de logout adicionado.");
  } else {
    console.warn(
      "Aside JS: Link de logout não encontrado. A funcionalidade de logout pode não funcionar."
    );
  }

  const currentPage = window.location.pathname;
  if (currentPage.includes("/pages/publicar.html")) {
    const asideElement = container.querySelector("aside");
    if (asideElement) {
      asideElement.classList.add("pagina-publicar");
      document.body.classList.add("pagina-publicar");
      console.log("Aside JS: Classes 'pagina-publicar' adicionadas.");
    }
  }
});
