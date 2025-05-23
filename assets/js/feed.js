const CONFIG = {
  API_FEED_POSTS: "http://localhost:8080/api/v1/Posts",
  API_BUSCA: "http://localhost:8080/api/v1/Posts/titulo",
};

let listaDeProjetos = [];

async function buscarProjetos() {
  try {
    const response = await fetch(CONFIG.API_FEED_POSTS);
    if (!response.ok) throw new Error(`Erro: ${response.status}`);
    const data = await response.json();
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
      // Extrai apenas a parte da data (assumindo formato "DD/MM/AAAA HH:MM")
      const [data, hora] = projeto.dataCriacaoPosts.split(" ");
      return {
        ...projeto,
        _dataOrdenacao: new Date(data.split("/").reverse().join("-")), // Converte para "AAAA-MM-DD"
      };
    });

    // Ordena pela data (sem hora)
    if (sortBy === "recentes") {
      listaOrdenada.sort((a, b) => b._dataOrdenacao - a._dataOrdenacao);
    } else {
      listaOrdenada.sort((a, b) => a._dataOrdenacao - b._dataOrdenacao);
    }

    // Remove o campo temporário (opcional)
    listaOrdenada = listaOrdenada.map(({ _dataOrdenacao, ...resto }) => resto);
  } else if (sortBy === "relevancia") {
    listaOrdenada.sort((a, b) => b.likes - a.likes);
  }

  exibirProjetos(listaOrdenada);
}

function exibirProjetos(projetos) {
  const projectListElement = document.getElementById("project-list");
  projectListElement.innerHTML = "";

  if (projetos && projetos.length > 0) {
    projetos.forEach((projeto) => {
      const projectCard = document.createElement("div");
      projectCard.classList.add("project-card");
      projectCard.style.cursor = "pointer";

      projectCard.addEventListener("click", () => {
        verDetalhesProjeto(projeto.id);
      });

      projectCard.innerHTML = `
        <h3>${projeto.title}</h3>
        <p>${projeto.name}</p>
        <p>${
          projeto.descricao
            ? projeto.descricao.substring(0, 100)
            : "Sem descrição"
        }</p>
        
        
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

  if (!modal) {
    console.error("Modal não encontrado!");
    return;
  }

  modal.style.display = "flex";
  detalheTitulo.textContent = "Carregando...";
  detalheUsuario.textContent = "";
  detalheDescricao.textContent = "";

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
    detalheUsuario.textContent = projeto.name;

    detalheDescricao.textContent = projeto.descricao;
  } catch (error) {
    console.error("Erro ao carregar detalhes:", error);
    detalheTitulo.textContent = `Erro: ${error.message}`;
    detalheTitulo.style.color = "black";
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
};
