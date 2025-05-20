document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("userId");
  console.log("ID do usuário:", userId);

  const CONFIG = {
    API_BUSCAR_POSTS_USUARIO: "http://localhost:8080/api/v1/Posts/usuario",
    MESSAGE_DISPLAY_TIME: 3000,
    MIN_LOADER_TIME: 1500,
  };

  const DOM = {
    mensagem: document.getElementById("mensagem-perfil"),
    nomeUsuario: document.getElementById("nome-usuario"),
    descricaoUsuario: document.getElementById("descricao-usuario"),
    listaDePosts: document.getElementById("posts-list"),
  };

  const MESSAGES = {
    errors: {
      userNotFound: "ID do usuário não encontrado.",
      projectFetchFailed: (status) =>
        `Erro ao buscar projetos do usuário: ${status}`,
      default: "Ocorreu um erro inesperado.",
    },
    succes: {},
  };

  const mostrarMensagem = (texto, tipo = "erro") => {
    DOM.mensagem.textContent = texto;
    DOM.mensagem.className = `mensagem-${tipo}`;
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
      ('<div class = "error">Erro ao carregar os projetos do usuário.</div>');
      return [];
    }
  }

  exibirPostUsuario();
});
