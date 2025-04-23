document.addEventListener("DOMContentLoaded", function () {
  const asideMenu = `
      <aside>
        <img src="../assets/img/aside/Frame 2106.png" alt="logo do codeconnect" />
        <nav>
          <ul class="lista-links">
            <li>
              <a href="#" class="link-destaque">Publicar</a>
            </li>
            <li>
              <a href="#" class="menu-link">
                <img src="../assets/img/aside/Frame 2.png" />
              </a>
            </li>
            <li>
              <a href="#" class="menu-link">
                <img src="../assets/img/aside/Frame 3.png" />
              </a>
            </li>
            <li>
              <a href="#" class="menu-link">
                <img src="../assets/img/aside/Frame 5.png" />
              </a>
            </li>
            <li>
              <a href="#" class="menu-link">
                <img src="../assets/img/aside/Frame 4.png" />
              </a>
            </li>
          </ul>
        </nav>
      </aside>
      `;

  const container = document.getElementById("aside-container");
  if (container) {
    container.innerHTML = asideMenu;
    highlightCurrentPage();
  }

  function highlightCurrentPage() {
    const links = document.querySelectorAll(".menu-link");
    // 2. Obtém o nome do arquivo da página atual (ex: "index.html")
    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";

    // 3. Percorre cada link do menu
    links.forEach((link) => {
      // 4. Se o link corresponder à página atual, adiciona a classe 'active'
      if (link.getAttribute("href") === currentPage) {
        link.classList.add("active");
      }
    });
  }
});
