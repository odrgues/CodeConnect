document.addEventListener("DOMContentLoaded", async () => {
  const token = getAuthToken();
  if (!token) {
    console.log(
      "Feed JS: Token JWT não encontrado. Redirecionando para login."
    );
    window.location.href = "../pages/login.html";
    return;
  }
  console.log("Feed JS: Token JWT encontrado. Usuário autenticado.");

  let listaDeProjetos = [];

  const CONFIG = {
    API_FEED_POSTS: "http://localhost:8080/api/v1/Posts",
    API_BUSCA_TITULO: "http://localhost:8080/api/v1/Posts/titulo",
    API_DETALHES_POST: "http://localhost:8080/api/v1/Posts",
    PERFIL_PAGE: "../pages/perfil.html",
    MESSAGE_DISPLAY_TIME: 3000,
  };

  const MESSAGES = {
    errors: {
      loadProjects: "Erro ao carregar os projetos. Tente novamente.",
      searchProjects: "Erro ao realizar a pesquisa. Tente novamente.",
      fetchDetails: "Erro ao buscar detalhes do projeto.",
      noProjectsFound: "Nenhum projeto encontrado.",
      modalNotFound: "Erro: Elementos do modal não encontrados.",
      networkError: "Erro de conexão. Verifique sua internet.",
      serverError: "Erro do servidor. Tente novamente mais tarde.",
    },
  };

  const DOM = {
    projectList: null,
    searchInput: null,
    sortBySelect: null,
    detalhesModal: null,
    closeModalButton: null,
    detalheTitulo: null,
    detalheUsuario: null,
    detalheDescricao: null,
    detalheCriacao: null,
    detalheImagemPost: null,

    init: () => {
      DOM.projectList = document.getElementById("project-list");
      DOM.searchInput = document.getElementById("search-input");
      DOM.sortBySelect = document.getElementById("sort-by");
      DOM.detalhesModal = document.getElementById("detalhes-modal");
      DOM.closeModalButton = document.querySelector(".close-button");
      DOM.detalheTitulo = document.getElementById("detalhe-titulo");
      DOM.detalheUsuario = document.getElementById("detalhe-usuario");
      DOM.detalheDescricao = document.getElementById("detalhe-descricao");
      DOM.detalheCriacao = document.getElementById("detalhe-data-criacao");
      DOM.detalheImagemPost = document.getElementById("detalhe-imagem-post");

      if (!DOM.projectList)
        console.warn("DOM.init: Elemento 'project-list' não encontrado.");
      if (!DOM.searchInput)
        console.warn("DOM.init: Elemento 'search-input' não encontrado.");
      if (!DOM.sortBySelect)
        console.warn("DOM.init: Elemento 'sort-by' não encontrado.");
      if (!DOM.detalhesModal)
        console.warn("DOM.init: Elemento 'detalhes-modal' não encontrado.");
      if (!DOM.closeModalButton)
        console.warn(
          "DOM.init: Elemento '.close-button' (modal) não encontrado."
        );
      if (!DOM.detalheTitulo)
        console.warn("DOM.init: Elemento 'detalhe-titulo' não encontrado.");
      if (!DOM.detalheUsuario)
        console.warn("DOM.init: Elemento 'detalhe-usuario' não encontrado.");
      if (!DOM.detalheDescricao)
        console.warn("DOM.init: Elemento 'detalhe-descricao' não encontrado.");
      if (!DOM.detalheCriacao)
        console.warn(
          "DOM.init: Elemento 'detalhe-data-criacao' não encontrado."
        );
      if (!DOM.detalheImagemPost)
        console.warn(
          "DOM.init: Elemento 'detalhe-imagem-post' não encontrado."
        );
    },
  };

  const API = {
    fetchData: async (url) => {
      try {
        const response = await authenticatedFetch(url);
        const responseData = await response.json().catch((err) => {
          console.error(
            "API.fetchData: Erro ao parsear JSON da resposta:",
            err,
            "Resposta bruta:",
            response.status,
            response.statusText
          );

          return { message: MESSAGES.errors.serverError };
        });

        if (!response.ok) {
          console.error(
            "API.fetchData: Erro na resposta da API:",
            response.status,
            responseData
          );

          throw new Error(responseData.message || MESSAGES.errors.serverError);
        }
        return responseData;
      } catch (error) {
        console.error("API.fetchData: Erro na requisição:", error);

        throw new Error(error.message || MESSAGES.errors.networkError);
      }
    },

    buscarTodosProjetos: async () => {
      return API.fetchData(CONFIG.API_FEED_POSTS);
    },

    pesquisarProjetosPorTitulo: async (searchTerm) => {
      const searchURL = `${CONFIG.API_BUSCA_TITULO}?title=${encodeURIComponent(
        searchTerm
      )}`;
      return API.fetchData(searchURL);
    },

    buscarDetalhesProjeto: async (idDoProjeto) => {
      const detailsURL = `${CONFIG.API_DETALHES_POST}/${idDoProjeto}`;
      return API.fetchData(detailsURL);
    },
  };

  const Utils = {
    exibirMensagem: (elemento, texto, tipo = "erro") => {
      if (!elemento) {
        console.warn(
          `Utils.exibirMensagem: Elemento de mensagem não encontrado para exibir: "${texto}"`
        );
        return;
      }

      elemento.textContent = texto;
      elemento.className = `mensagem-${tipo}`;
      elemento.style.display = "block";
      setTimeout(() => {
        elemento.style.display = "none";
      }, CONFIG.MESSAGE_DISPLAY_TIME);
    },

    exibirProjetos: (projetos) => {
      if (!DOM.projectList) {
        console.warn(
          "Utils.exibirProjetos: Elemento 'project-list' não encontrado."
        );
        return;
      }
      DOM.projectList.innerHTML = "";

      if (projetos && projetos.length > 0) {
        projetos.forEach((projeto) => {
          const projectCard = document.createElement("div");
          projectCard.classList.add("cartao-projeto");
          projectCard.style.cursor = "pointer";

          projectCard.addEventListener("click", (event) => {
            if (!event.target.closest("a")) {
              Handlers.verDetalhesProjeto(projeto.id);
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
              <p>
                <a href="${CONFIG.PERFIL_PAGE}?userId=${projeto.userId}"
                   class="link-perfil-usuario"
                   aria-label="Ver perfil de ${projeto.nomeUsuario}">
                  ${projeto.nomeUsuario}
                </a>
              </p>
            </div>
          `;
          DOM.projectList.appendChild(projectCard);
        });
      } else {
        DOM.projectList.innerHTML = `<div class="no-projects">${MESSAGES.errors.noProjectsFound}</div>`;
      }
    },

    filtrarProjetos: () => {
      const sortBy = DOM.sortBySelect ? DOM.sortBySelect.value : "recentes";
      let listaOrdenada = [...listaDeProjetos];

      if (sortBy === "recentes" || sortBy === "antigos") {
        listaOrdenada = listaOrdenada.map((projeto) => {
          const dataString = projeto.dataCriacaoPosts
            ? projeto.dataCriacaoPosts.split(" ")[0]
            : null;
          return {
            ...projeto,

            _dataOrdenacao: dataString
              ? new Date(dataString.split("/").reverse().join("-"))
              : new Date(0),
          };
        });

        if (sortBy === "recentes") {
          listaOrdenada.sort(
            (a, b) => b._dataOrdenacao.getTime() - a._dataOrdenacao.getTime()
          );
        } else {
          listaOrdenada.sort(
            (a, b) => a._dataOrdenacao.getTime() - b._dataOrdenacao.getTime()
          );
        }

        listaOrdenada = listaOrdenada.map(
          ({ _dataOrdenacao, ...resto }) => resto
        );
      }

      Utils.exibirProjetos(listaOrdenada);
    },
  };

  const Handlers = {
    handleSearch: async () => {
      const searchTerm = DOM.searchInput
        ? DOM.searchInput.value.trim().toLowerCase()
        : "";
      if (searchTerm.length < 3 && searchTerm.length > 0) {
        Utils.exibirMensagem(
          DOM.projectList,
          "Digite pelo menos 3 caracteres para buscar.",
          "erro"
        );
        return;
      }
      if (!searchTerm) {
        await Handlers.carregarProjetosIniciais();
        return;
      }

      try {
        const projetosEncontrados = await API.pesquisarProjetosPorTitulo(
          searchTerm
        );
        Utils.exibirProjetos(projetosEncontrados);
        listaDeProjetos = projetosEncontrados;
      } catch (error) {
        console.error("Handlers.handleSearch: Erro na busca:", error);
        Utils.exibirMensagem(
          DOM.projectList,
          MESSAGES.errors.searchProjects,
          "erro"
        );
        Utils.exibirProjetos([]);
      }
    },

    verDetalhesProjeto: async (idDoProjeto) => {
      if (
        !DOM.detalhesModal ||
        !DOM.detalheTitulo ||
        !DOM.detalheUsuario ||
        !DOM.detalheDescricao ||
        !DOM.detalheCriacao ||
        !DOM.detalheImagemPost
      ) {
        console.error(MESSAGES.errors.modalNotFound);
        Utils.exibirMensagem(
          DOM.projectList,
          MESSAGES.errors.modalNotFound,
          "erro"
        );
        return;
      }

      DOM.detalhesModal.style.display = "flex";
      DOM.detalheTitulo.textContent = "Carregando...";
      DOM.detalheUsuario.textContent = "";
      DOM.detalheDescricao.textContent = "";
      DOM.detalheCriacao.textContent = "";
      DOM.detalheImagemPost.src = "";
      DOM.detalheImagemPost.style.display = "none";

      try {
        const projeto = await API.buscarDetalhesProjeto(idDoProjeto);

        DOM.detalheTitulo.textContent = projeto.title;
        DOM.detalheUsuario.textContent = projeto.nomeUsuario;
        DOM.detalheUsuario.href = `${CONFIG.PERFIL_PAGE}?userId=${projeto.userId}`;
        DOM.detalheDescricao.textContent = projeto.descricao;
        DOM.detalheCriacao.textContent = projeto.dataCriacaoPosts
          ? projeto.dataCriacaoPosts.split(" ")[0]
          : "N/A";

        if (projeto.imageUrl) {
          DOM.detalheImagemPost.src = projeto.imageUrl;
          DOM.detalheImagemPost.style.display = "block";
        } else {
          DOM.detalheImagemPost.style.display = "none";
        }
      } catch (error) {
        console.error(
          "Handlers.verDetalhesProjeto: Erro ao buscar detalhes:",
          error
        );
        DOM.detalheTitulo.textContent = `Erro: ${
          error.message || MESSAGES.errors.fetchDetails
        }`;
        DOM.detalheTitulo.style.color = "red";
        DOM.detalheImagemPost.style.display = "none";
      }
    },

    inicializarModal: () => {
      if (DOM.closeModalButton && DOM.detalhesModal) {
        DOM.closeModalButton.addEventListener("click", () => {
          DOM.detalhesModal.style.display = "none";
        });

        window.addEventListener("click", (event) => {
          if (event.target === DOM.detalhesModal) {
            DOM.detalhesModal.style.display = "none";
          }
        });
      } else {
        console.warn(
          "Handlers.inicializarModal: Elementos do modal não encontrados para inicialização."
        );
      }
    },

    carregarProjetosIniciais: async () => {
      try {
        const data = await API.buscarTodosProjetos();
        listaDeProjetos = data;
        Utils.exibirProjetos(data);
      } catch (error) {
        console.error(
          "Handlers.carregarProjetosIniciais: Erro ao carregar projetos:",
          error
        );
        Utils.exibirMensagem(
          DOM.projectList,
          MESSAGES.errors.loadProjects,
          "erro"
        );
        Utils.exibirProjetos([]);
      }
    },
  };

  const init = async () => {
    DOM.init();

    await Handlers.carregarProjetosIniciais();

    Handlers.inicializarModal();

    if (DOM.searchInput) {
      DOM.searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          Handlers.handleSearch();
        }
      });
    }

    if (DOM.sortBySelect) {
      DOM.sortBySelect.addEventListener("change", Utils.filtrarProjetos);
    }

    console.log("init: Event listeners configurados e projetos carregados.");
  };

  init();
});
