document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("userId");
  console.log("ID do usuário:", userId);

  const CONFIG = {
    API_BUSCAR_POSTS_USUARIO: "http://localhost:8080/api/v1/Posts/usuario",
    API_BUSCAR_PROJETO: "http://localhost:8080/api/v1/Posts", // Adicionado para buscar detalhes de um único post
    MESSAGE_DISPLAY_TIME: 3000,
    MIN_LOADER_TIME: 1500,
  };

  const DOM = {
    mensagem: document.getElementById("mensagem-perfil"),
    nomeUsuario: document.getElementById("nome-usuario"),
    descricaoUsuario: document.getElementById("descricao-usuario"),
    listaDePosts: document.getElementById("posts-list"),
    modalEditarPerfil: document.getElementById("modal-editar-perfil"),
    formEditarPerfil: document.getElementById("form-editar-perfil"),
    nomeModal: document.getElementById("nome-modal"),
    descricaoModal: document.getElementById("descricao-modal"),
    closeModalEditarPerfil: document.querySelector(
      "#modal-editar-perfil .close-button"
    ),
    modalDetalhesPost: document.getElementById("detalhes-modal-post"), // Corrigido o ID
    closeModalDetalhesPost: document.querySelector(
      "#detalhes-modal-post .close-button"
    ), // Corrigido o seletor
    fotoPerfil: document.getElementById("foto-perfil-padrao"),
    fotoPerfilInput: document.getElementById("foto-perfil-modal"),
    previewFotoPerfil: document.getElementById("preview-foto-perfil"),
    editarPerfilBtn: document.getElementById("editar-perfil-btn"),
  };

  const MESSAGES = {
    errors: {
      userNotFound: "ID do usuário não encontrado.",
      projectFetchFailed: (status) =>
        `Erro ao buscar projetos do usuário: ${status}`,
      default: "Ocorreu um erro inesperado.",
      postNotFound: "Detalhes do post não encontrados.", // Adicionado
    },
    success: {
      profileUpdated: "Perfil atualizado com sucesso!", // Adicionado
    },
  };

  const mostrarMensagem = (texto, tipo = "erro") => {
    if (!DOM.mensagem) {
      console.error("Elemento 'mensagem-perfil' não encontrado no HTML.");
      return;
    }
    DOM.mensagem.textContent = texto;
    DOM.mensagem.className = `mensagem ${tipo}`; // Adicionado espaço para manter a classe 'mensagem'
    DOM.mensagem.style.display = "block";

    setTimeout(() => {
      DOM.mensagem.style.display = "none";
    }, CONFIG.MESSAGE_DISPLAY_TIME);
  };

  // Função para exibir os posts na lista
  function exibirPost(posts) {
    const postListElement = DOM.listaDePosts;
    postListElement.innerHTML = ""; // Limpa o conteúdo anterior

    if (posts && posts.length > 0) {
      posts.forEach((post) => {
        const postDiv = document.createElement("div");
        postDiv.classList.add("post-card");
        postDiv.dataset.postId = post.id; // Armazena o ID do post no dataset

        postDiv.innerHTML = `
              <h3>${post.title}</h3>
              <p>Nome do Usuário: ${post.nomeUsuario}</p> 
              <p>Descrição: ${
                post.descricao
                  ? post.descricao.substring(0, 100) + "..."
                  : "Sem descrição"
              }</p>
              <p>Data de Criação: ${post.dataCriacaoPosts}</p>
            `;

        // Adiciona o event listener para abrir o modal de detalhes do post
        postDiv.addEventListener("click", () => {
          verDetalhesPosts(post.id);
        });

        postListElement.appendChild(postDiv);
      });
    } else {
      postListElement.innerHTML = `<p>O usuário ainda não criou nenhum post :( </p>`;
    }
  }

  // Função para buscar e exibir os posts do usuário
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
      exibirPost(data); // Chama a função para exibir os posts
    } catch (error) {
      console.error("Erro ao buscar posts do usuário:", error);
      mostrarMensagem(error.message || MESSAGES.errors.default, "erro");
      DOM.listaDePosts.innerHTML =
        '<div class="error">Erro ao carregar os projetos do usuário.</div>';
      return [];
    }
  }

  // Função para ver detalhes de um post específico
  async function verDetalhesPosts(idDoPost) {
    const modal = DOM.modalDetalhesPost; // Usando o elemento do DOM
    const detalheTitulo = document.getElementById("detalhe-titulo-post");
    const detalheUsuario = document.getElementById("detalhe-usuario-post");
    const detalheDescricao = document.getElementById("detalhe-descricao-post");
    const detalheData = document.getElementById("detalhe-data");

    if (!modal) {
      console.error("Modal de detalhes do post não encontrado!");
      return;
    }

    modal.style.display = "flex"; // Exibe o modal
    detalheTitulo.textContent = "Carregando...";
    detalheUsuario.textContent = "";
    detalheDescricao.textContent = "";
    detalheData.textContent = "";

    try {
      const response = await fetch(
        `${CONFIG.API_BUSCAR_PROJETO}/${idDoPost}` // Usando a API_BUSCAR_PROJETO
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || MESSAGES.errors.postNotFound);
      }

      const postDetalhado = await response.json();
      detalheTitulo.textContent = postDetalhado.title;
      detalheTitulo.style.color = "black";
      detalheUsuario.textContent = `Usuário: ${postDetalhado.nomeUsuario}`;
      detalheDescricao.textContent = postDetalhado.descricao;
      detalheData.textContent = postDetalhado.dataCriacaoPosts;
    } catch (error) {
      console.error("Erro ao carregar detalhes do post:", error);
      detalheTitulo.textContent = `Erro: ${error.message}`;
      detalheTitulo.style.color = "black";
      mostrarMensagem(error.message, "erro");
    }
  }

  // Função para inicializar os modais (fechar ao clicar fora ou no X)
  function inicializarModais() {
    // Modal de Edição de Perfil
    if (DOM.closeModalEditarPerfil) {
      DOM.closeModalEditarPerfil.addEventListener("click", () => {
        DOM.modalEditarPerfil.style.display = "none";
      });
    }
    if (DOM.modalEditarPerfil) {
      window.addEventListener("click", (event) => {
        if (event.target === DOM.modalEditarPerfil) {
          DOM.modalEditarPerfil.style.display = "none";
        }
      });
    }

    // Modal de Detalhes do Post
    if (DOM.closeModalDetalhesPost) {
      DOM.closeModalDetalhesPost.addEventListener("click", () => {
        DOM.modalDetalhesPost.style.display = "none";
      });
    }
    if (DOM.modalDetalhesPost) {
      window.addEventListener("click", (event) => {
        if (event.target === DOM.modalDetalhesPost) {
          DOM.modalDetalhesPost.style.display = "none";
        }
      });
    }
  }

  // Funções de edição de perfil (mantidas do seu código anterior)
  // Certifique-se de que 'usuarioId' esteja definido globalmente ou passado como parâmetro
  let usuarioId = localStorage.getItem("userId") || 1; // Exemplo: defina um padrão ou obtenha de outra forma

  if (DOM.editarPerfilBtn) {
    DOM.editarPerfilBtn.addEventListener("click", () => {
      DOM.modalEditarPerfil.style.display = "block";
      carregarDadosUsuarioParaEdicao(usuarioId);
    });
  }

  if (DOM.fotoPerfilInput) {
    DOM.fotoPerfilInput.addEventListener("change", () => {
      const file = DOM.fotoPerfilInput.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        DOM.fotoPerfil.src = e.target.result;
        DOM.previewFotoPerfil.src = e.target.result;
        DOM.previewFotoPerfil.style.display = "block";
      };

      if (file) {
        reader.readAsDataURL(file);
      } else {
        DOM.fotoPerfil.src = "#";
        DOM.previewFotoPerfil.style.display = "none";
      }
    });
  }

  if (DOM.formEditarPerfil) {
    DOM.formEditarPerfil.addEventListener("submit", async (event) => {
      event.preventDefault();
      const nome = DOM.nomeModal.value;
      const descricao = DOM.descricaoModal.value;
      const foto = DOM.fotoPerfilInput.files[0];

      const formData = new FormData();
      formData.append("nome", nome);
      formData.append("descricao", descricao);
      if (foto) {
        formData.append("foto", foto);
      }

      try {
        const response = await fetch(`/api/v1/usuarios/${usuarioId}`, {
          // Substitua pela sua API de edição de usuário
          method: "PUT",
          body: formData,
        });
        if (!response.ok) {
          throw new Error("Não foi possível salvar as alterações do perfil.");
        }
        carregarDetalhesUsuario(usuarioId);
        DOM.modalEditarPerfil.style.display = "none";
        mostrarMensagem(MESSAGES.success.profileUpdated, "sucesso");
      } catch (error) {
        console.error(error);
        mostrarMensagem(error.message, "erro");
      }
    });
  }

  async function carregarDadosUsuarioParaEdicao(id) {
    try {
      const response = await fetch(`/api/v1/usuarios/${id}`); // Substitua pela sua API de buscar usuário
      if (!response.ok) {
        throw new Error(
          "Não foi possível carregar os dados do usuário para edição."
        );
      }
      const usuario = await response.json();
      DOM.nomeModal.value = usuario.nome;
      DOM.descricaoModal.value = usuario.descricao || "";
      DOM.previewFotoPerfil.style.display = usuario.foto ? "block" : "none";
      DOM.previewFotoPerfil.src = usuario.foto || "#";
    } catch (error) {
      console.error(error);
      mostrarMensagem(error.message, "erro");
    }
  }

  async function carregarDetalhesUsuario(id) {
    try {
      const response = await fetch(`/api/v1/usuarios/${id}`); // Substitua pela sua API de buscar usuário
      if (!response.ok) {
        throw new Error("Não foi possível carregar os detalhes do usuário.");
      }
      const usuario = await response.json();
      DOM.fotoPerfil.src = usuario.foto || "#";
      DOM.nomeUsuario.textContent = usuario.nome;
      DOM.descricaoUsuario.textContent = usuario.descricao || "Sem descrição";
    } catch (error) {
      console.error(error);
      mostrarMensagem(error.message, "erro");
    }
  }

  // Chamadas iniciais
  exibirPostUsuario(); // Carrega os posts do usuário
  carregarDetalhesUsuario(usuarioId);
  verDetalhesPosts(); // Carrega os detalhes do perfil do usuário
  inicializarModais(); // Inicializa os listeners para fechar os modais
});

//FUNCIONANDO
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
