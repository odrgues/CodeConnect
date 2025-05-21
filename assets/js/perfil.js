document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("userId");
  console.log("ID do usuário:", userId);

  const CONFIG = {
    API_BUSCAR_POSTS_USUARIO: "http://localhost:8080/api/v1/Posts/usuario",
    API_BUSCAR_POST: "http://localhost:8080/api/v1/Posts",
    MESSAGE_DISPLAY_TIME: 3000,
    MIN_LOADER_TIME: 1500,
  };

  const DOM = {
    mensagem: document.getElementById("mensagem-perfil"),
    nomeUsuario: document.getElementById("nome-usuario"),
    descricaoUsuario: document.getElementById("descricao-usuario"),
    listaDePosts: document.getElementById("posts-list"),
    modalDetalhesPost: document.getElementById("detalhes-modal-post"),
    closeModalDetalhesPost: document.querySelector(
      "#detalhes-modal-post .close-button"
    ),
  };

  const MESSAGES = {
    errors: {
      userNotFound: "ID do usuário não encontrado.",
      projectFetchFailed: (status) =>
        `Erro ao buscar posts do usuário: ${status}`,
      default: "Ocorreu um erro inesperado.",
      postNotFound: "Detalhes do post não encontrados.",
    },

    succes: {
      profileUpdated: "Perfil atualizado com sucesso!",
    },
  };

  const mostrarMensagem = (texto, tipo = "erro") => {
    DOM.mensagem.textContent = texto;
    DOM.mensagem.className = `mensagem ${tipo}`;
    DOM.mensagem.style.display = "block";

    setTimeout(() => {
      DOM.mensagem.style.display = "none";
    }, CONFIG.MESSAGE_DISPLAY_TIME);
  };

  function exibirPost(posts) {
    const postListElement = document.getElementById("posts-list");
    postListElement.innerHTML = "";

    if (posts && posts.length > 0) {
      posts.forEach((post) => {
        const postDiv = document.createElement("div");
        postDiv.classList.add("post-card");
        postDiv.dataset.postID = post.id;

        postDiv.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.nomeUsuario}</p> 
        <p>${
          post.descricao
            ? post.descricao.substring(0, 100) + ""
            : "Sem descrição"
        }</p>
        <p>${post.dataCriacaoPosts}</p>
      `;
        postDiv.addEventListener("click", () => {
          console.log("Post clicado! ID:", post.id);
          verDetalhesPosts(post.id);
        });

        postListElement.appendChild(postDiv);
      });
    } else {
      postListElement.innerHTML = `<p>O usuário ainda não criou nenhum post :( </p>`;
    }
  }

  async function exibirPostUsuario() {
    const idUsuario = localStorage.getItem("userId");
    if (!idUsuario) {
      console.error("ID do usuário não encontrado.");
      mostrarMensagem(MESSAGES.errors.userNotFound, "erro");
      return;
    }
    try {
      const response = await fetch(
        `${CONFIG.API_BUSCAR_POSTS_USUARIO}/${idUsuario}`
      );

      if (!response.ok) {
        throw new Error(MESSAGES.errors.projectFetchFailed(response.status));
      }
      const data = await response.json();
      exibirPost(data);
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      mostrarMensagem(error.message || MESSAGES.errors.default, "erro");
      const listaDePosts = document.getElementById("posts-list");
      listaDePosts.innerHTML = "";
      ('<div class = "error">Erro ao carregar os posts do usuário.</div>');
      return [];
    }
  }

  async function verDetalhesPosts(idDoPost) {
    console.log("verDetalhesPosts chamada com ID:", idDoPost);
    const modal = document.getElementById("detalhes-modal-post");
    const detalheTitulo = document.getElementById("detalhe-titulo-post");
    const detalheUsuario = document.getElementById("detalhe-usuario-post");
    const detalheDescricao = document.getElementById("detalhe-descricao-post");
    const detalheData = document.getElementById("detalhe-data");

    if (!modal) {
      console.error("Modal não encontrado!");
      return;
    }

    modal.style.display = "flex";
    console.log("Tentando exibir modal. Display:", modal.style.display);
    detalheTitulo.textContent = "";
    detalheUsuario.textContent = "";
    detalheDescricao.textContent = "";
    detalheData.textContent = "";

    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/Posts/${idDoPost}`
      );
      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.message || "Erro ao buscar detalhes");
      }

      const post = await response.json();
      detalheTitulo.textContent = post.title;
      detalheTitulo.style.color = "black";
      detalheUsuario.textContent = post.nomeUsuario;

      detalheDescricao.textContent = post.descricao;
      detalheData.textContent = post.dataCriacaoPosts;
    } catch (error) {
      detalheTitulo.textContent = `Erro: ${error.message}`;
      detalheTitulo.style.color = "black";
    }
  }

  function inicializarModais() {
    const modal = document.getElementById("detalhes-modal-post");
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
    exibirPostUsuario();

    inicializarModais();
  };
});
