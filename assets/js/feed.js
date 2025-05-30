const CONFIG = {
  API_FEED_POSTS: "http://localhost:8080/api/v1/Posts",
  API_BUSCA: "http://localhost:8080/api/v1/Posts/titulo",
};

let listaDeProjetos = [];

async function buscarProjetos() {
  try {
    const response = await fetch(CONFIG.API_FEED_POSTS);
    console.log("Resposta bruta:", response);
    if (!response.ok) throw new Error(`Erro: ${response.status}`);
    const data = await response.json();
    console.log("Dados recebidos:", data);
    listaDeProjetos = data;
    exibirProjetos(data);
  } catch (error) {
    console.error("Erro ao buscar projetos:", error);
    document.getElementById("project-list").innerHTML =
      '<div class="error">Erro ao carregar os projetos.</div>';
  }
}

async function pesquisarProjetos() {
  const searchTerm = document
    .getElementById("search-input")
    .value.toLowerCase();

  try {
    const searchURL = `${CONFIG.API_BUSCA}?title=${encodeURIComponent(
      searchTerm
    )}`;
    const response = await fetch(searchURL);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro na busca.");
    }
    const data = await response.json();
    exibirProjetos(data);
  } catch (error) {
    console.error("Erro ao pesquisar projetos:", error);
    document.getElementById("project-list").innerHTML =
      '<div class="error">Erro ao realizar a pesquisa.</div>';
  }
}

function filtrarProjetos() {
  const sortBy = document.getElementById("sort-by").value;
  let listaOrdenada = [...listaDeProjetos];

  if (sortBy === "recentes" || sortBy === "antigos") {
    listaOrdenada = listaOrdenada.map((projeto) => {
      const [data] = projeto.dataCriacaoPosts.split(" ");
      return {
        ...projeto,
        _dataOrdenacao: new Date(data.split("/").reverse().join("-")),
      };
    });

    if (sortBy === "recentes") {
      listaOrdenada.sort((a, b) => b._dataOrdenacao - a._dataOrdenacao);
    } else {
      listaOrdenada.sort((a, b) => a._dataOrdenacao - b._dataOrdenacao);
    }

    listaOrdenada = listaOrdenada.map(({ _dataOrdenacao, ...resto }) => resto);
  }

  exibirProjetos(listaOrdenada);
}
function exibirProjetos(projetos) {
  const projectListElement = document.getElementById("project-list");
  projectListElement.innerHTML = "";
  if (projetos && projetos.length > 0) {
    projetos.forEach((projeto) => {
      const projectCard = document.createElement("div");
      projectCard.classList.add("cartao-projeto");
      projectCard.style.cursor = "pointer";
      projectCard.addEventListener("click", (event) => {
        // Previne que o clique no link do usuário ative o modal do projeto
        if (!event.target.closest("a")) {
          verDetalhesProjeto(projeto.id);
        }
      });

      projectCard.innerHTML = `
                <h3>${projeto.title}</h3>
                
                <p>${
                  projeto.descricao
                    ? projeto.descricao.substring(0, 100) +
                      (projeto.descricao.length > 100 ? "..." : "")
                    : "Sem descrição"
                }</p>
                
                ${
                  projeto.imageUrl
                    ? `<img src="${projeto.imageUrl}" alt="Imagem do Projeto ${projeto.title}" />`
                    : ""
                }
                
                <div class="detalhes-projeto">
                    <span>${
                      projeto.dataCriacaoPosts
                        ? projeto.dataCriacaoPosts.split(" ")[0]
                        : "N/A"
                    }</span>
                    <p><a href="../pages/perfil.html?userId=${
                      projeto.userId
                    }" style="color: #007bff; text-decoration: underline;">${
        projeto.nomeUsuario
      }</a></p>
                </div>
            `;

      projectListElement.appendChild(projectCard);
    });
  } else {
    projectListElement.innerHTML =
      '<div class="no-projects">Nenhum projeto encontrado.</div>';
  }
}
async function verDetalhesProjeto(idDoProjeto) {
  const modal = document.getElementById("detalhes-modal");
  const detalheTitulo = document.getElementById("detalhe-titulo");
  const detalheUsuario = document.getElementById("detalhe-usuario");
  const detalheDescricao = document.getElementById("detalhe-descricao");
  const detalheCriacao = document.getElementById("detalhe-data-criacao");
  // Selecione o elemento da imagem no modal
  const detalheImagemPost = document.getElementById("detalhe-imagem-post"); // <-- Adicione esta linha

  if (!modal) {
    console.error("Modal não encontrado!");
    return;
  }

  modal.style.display = "flex";
  detalheTitulo.textContent = "";
  detalheUsuario.textContent = "";
  detalheDescricao.textContent = "";
  detalheCriacao.textContent = "";
  detalheImagemPost.src = ""; // <-- Limpe a src para evitar mostrar imagem anterior
  detalheImagemPost.style.display = "none"; // <-- Esconda a imagem por padrão até que a URL seja definida

  try {
    const response = await fetch(
      `http://localhost:8080/api/v1/Posts/${idDoProjeto}`
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao buscar detalhes");
    }

    const projeto = await response.json();

    detalheTitulo.textContent = projeto.title;
    detalheTitulo.style.color = "black";
    detalheUsuario.textContent = projeto.nomeUsuario;
    detalheUsuario.href = `../pages/perfil.html?userId=${projeto.userId}`; // Use 'projeto.userId' aqui, pois o objeto é 'projeto' e não 'post'

    detalheDescricao.textContent = projeto.descricao;
    detalheCriacao.textContent = projeto.dataCriacaoPosts.split(" ")[0];

    // --- Adicione esta lógica para a imagem ---
    if (projeto.imageUrl) {
      detalheImagemPost.src = projeto.imageUrl;
      detalheImagemPost.style.display = "block"; // Mostra a imagem se houver uma URL
    } else {
      detalheImagemPost.style.display = "none"; // Garante que a imagem esteja escondida se não houver URL
    }
    // --- Fim da lógica da imagem ---
  } catch (error) {
    console.error("Erro ao carregar detalhes:", error);
    detalheTitulo.textContent = `Erro: ${error.message}`;
    detalheTitulo.style.color = "black";
    detalheImagemPost.style.display = "none"; // Esconda a imagem em caso de erro também
  }
}

function inicializarModal() {
  const modal = document.getElementById("detalhes-modal");
  const closeButtonX = document.querySelector(".close-button");

  if (closeButtonX) {
    closeButtonX.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
}
window.onload = function () {
  buscarProjetos();
  inicializarModal();

  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        pesquisarProjetos();
      }
    });
  }
};
