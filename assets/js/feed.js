const CONFIG = {
  API_FEED_POSTS: "http://localhost:8080/api/v1/Posts",
  API_BUSCA: "http://localhost:8080/api/v1/Posts/titulo",
  MESSAGE_DISPLAY_TIME: 3000,
};

let listaDeProjetos = [];
async function buscarProjetos() {
  try {
    const response = await fetch(CONFIG.API_FEED_POSTS);
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }
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
    const searchURL = `${CONFIG.API_BUSCA}`;
    const response = await fetch(searchURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: searchTerm }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw (
        new Error(errorData.message) ||
        "O usuário ou projeto não foi encontrado."
      );
    }
    const data = await response.json();
    console.log("Dados da pesquisa:", data);
    exibirProjetos(data);
  } catch (error) {
    console.log("Erro ao pesquisar projetos: ", error);
    document.getElementById("project-list").innerHTML =
      '<div class = "error">Erro ao realizar a pesquisa.</div>';
  }
}

function filtrarProjetos() {
  const sortBy = document.getElementById("sort-by").value;
  let listaOrdenada = [...listaDeProjetos];

  if (sortBy === "recentes") {
    listaOrdenada.sort(
      (a, b) => new Date(b.dataCriacaoPosts) - new Date(a.dataCriacaoPosts)
    );
  } else if (sortBy === "antigos") {
    listaOrdenada.sort(
      (a, b) => new Date(a.dataCriacaoPosts) - new Date(b.dataCriacaoPosts)
    );
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
                <p>${projeto.nomeUsuario}</p>
                <p>${
                  projeto.descricao
                    ? projeto.descricao.substring(0, 100) + ""
                    : "Sem descrição"
                }</p>
                <p>${projeto.dataFormatada}</p>
      `;

      projectListElement.appendChild(projectCard);
    });
  } else {
    projectListElement.innerHTML =
      '<div class="no-projects">Nenhum projeto encontrado.</div>';
  }
}

function verDetalhesProjeto(projetos) {
  const projectListElement = document.getElementById("project-list");
  projectListElement.innerHTML = "";
  // Aqui você pode redirecionar para a página de detalhes do projeto
}

window.onload = buscarProjetos;
