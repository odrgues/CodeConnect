document.addEventListener("DOMContentLoaded", function () {
  const asideStyles = document.createElement("link");
  asideStyles.rel = "stylesheet";
  asideStyles.href = "../assets/css/aside.css";
  document.head.appendChild(asideStyles);
  const asideMenu = `
    <style src = "../assets/css/aside.css"></style>
      <aside>
        <img src="../assets/img/aside/Frame 2106.png" alt="logo do codeconnect" />
        <nav>
          <ul class="lista-links">
            <li>
              <a href="#" class="link-destaque">Publicar</a>
            </li>
            <li>
              <a href="/pages/feed.html" class="menu-link">
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

    const currentPage =
      window.location.pathname.split("/").pop() || "/pages/feed.html";

    links.forEach((link) => {
      if (link.getAttribute("href") === currentPage) {
        link.classList.add("active"); //css
      }
    });
  }
});
