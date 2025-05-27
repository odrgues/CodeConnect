document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("userId");
  console.log("ID do usuário:", userId);

  const CONFIG = {
    API_BUSCAR_POSTS_USUARIO: "http://localhost:8080/api/v1/Posts/usuario",
    API_BUSCAR_POST: "http://localhost:8080/api/v1/Posts",
    API_BUSCAR_USUARIO: "http://localhost:8080/api/v1/usuarios",
    API_EDITAR_USUARIO: "http://localhost:8080/api/v1/usuarios/atualiza-dados/",
    MESSAGE_DISPLAY_TIME: 3000,
    MIN_LOADER_TIME: 1500,
    CLOUDINARY: {
      UPLOAD_URL: "https://api.cloudinary.com/v1_1/dzzk4ybjo/image/upload",
      UPLOAD_PRESET: "codeconnect_upload",
    },
  };

  const DOM = {
    mensagem: document.getElementById("mensagem-perfil"),
    username: document.getElementById("nome-usuario"),
    descricaoUsuario: document.getElementById("descricao-usuario"),
    listaDePosts: document.getElementById("posts-list"),
    modalDetalhesPost: document.getElementById("detalhes-modal-post"),
    closeModalDetalhesPost: document.querySelector(
      "#detalhes-modal-post .close-button"
    ),
    modalEditarPerfil: document.getElementById("modal-editar-perfil"),
    formEditarPerfil: document.getElementById("form-editar-perfil"),
    inputFotoPerfil: document.getElementById("foto-perfil-modal"),
  };

  const MESSAGES = {
    errors: {
      userNotFound: "ID do usuário não encontrado.",
      projectFetchFailed: (status) =>
        `Erro ao buscar posts do usuário: ${status}`,
      default: "Ocorreu um erro inesperado.",
      postNotFound: "Detalhes do post não encontrados.",
      uploadFailed: "Falha ao enviar imagem. Tente novamente.",
    },
    success: {
      profileUpdated: "Perfil atualizado com sucesso!",
    },
  };

  const mostrarMensagem = (texto, tipo = "erro") => {
    if (DOM.mensagem) {
      DOM.mensagem.textContent = texto;
      DOM.mensagem.className = `mensagem ${tipo}`;
      DOM.mensagem.style.display = "block";
      setTimeout(() => {
        DOM.mensagem.style.display = "none";
      }, CONFIG.MESSAGE_DISPLAY_TIME);
    }
  };

  async function carregarPerfilUsuario() {
    try {
      const response = await fetch(`${CONFIG.API_BUSCAR_USUARIO}/${userId}`);
      if (!response.ok)
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      const usuario = await response.json();
      if (!usuario) throw new Error("Dados do usuário não encontrados");
      await atualizarInterfacePerfil(usuario);
    } catch (error) {
      mostrarMensagem("Falha ao carregar perfil. Tente novamente", "erro");
    }
  }

  async function atualizarInterfacePerfil(usuario) {
    const fotoPerfil = document.getElementById("foto-perfil-padrao");
    const urlImagem = usuario.fotoUrl;

    if (urlImagem && urlImagem !== "null" && urlImagem !== "undefined") {
      fotoPerfil.src = urlImagem;
      const imgLoaded = await new Promise((resolve) => {
        fotoPerfil.onload = () => resolve(true);
        fotoPerfil.onerror = () => resolve(false);
        setTimeout(() => resolve(false), 5000);
      });
      if (!imgLoaded) {
        fotoPerfil.src =
          "../assets/img/perfil/Suspicious Look Around GIF by nounish ⌐◨-◨.gif";
      }
    } else {
      fotoPerfil.src =
        "../assets/img/perfil/Suspicious Look Around GIF by nounish ⌐◨-◨.gif";
    }

    DOM.username.textContent = usuario.username || usuario.name || "Usuário";
    DOM.descricaoUsuario.textContent = usuario.descricao || "Nenhuma descrição";
  }

  async function uploadCloudinary(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CONFIG.CLOUDINARY.UPLOAD_PRESET);
    try {
      const response = await fetch(CONFIG.CLOUDINARY.UPLOAD_URL, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Erro no upload:", error);
      return null;
    }
  }

  function exibirPost(posts) {
    if (!DOM.listaDePosts) return;
    DOM.listaDePosts.innerHTML = "";
    if (posts && posts.length > 0) {
      posts.forEach((post) => {
        const postDiv = document.createElement("div");
        postDiv.classList.add("post-card");
        postDiv.dataset.postID = post.id;
        postDiv.innerHTML = `
          <h3>${post.title}</h3>
          <p>${post.username}</p>
          <p>${
            post.descricao ? post.descricao.substring(0, 100) : "Sem descrição"
          }</p>`;
        postDiv.addEventListener("click", () => verDetalhesPosts(post.id));
        DOM.listaDePosts.appendChild(postDiv);
      });
    } else {
      DOM.listaDePosts.innerHTML = `<p>O usuário ainda não criou nenhum post :(</p>`;
    }
  }

  async function exibirPostUsuario() {
    if (!userId) {
      mostrarMensagem(MESSAGES.errors.userNotFound, "erro");
      return;
    }

    try {
      const response = await fetch(
        `${CONFIG.API_BUSCAR_POSTS_USUARIO}/${userId}`
      );
      if (!response.ok)
        throw new Error(MESSAGES.errors.projectFetchFailed(response.status));
      const data = await response.json();
      exibirPost(data);
    } catch (error) {
      mostrarMensagem(error.message || MESSAGES.errors.default, "erro");
      if (DOM.listaDePosts) {
        DOM.listaDePosts.innerHTML =
          '<div class="error">Erro ao carregar os posts do usuário.</div>';
      }
    }
  }

  async function verDetalhesPosts(idDoPost) {
    const modal = DOM.modalDetalhesPost;
    const detalheTitulo = document.getElementById("detalhe-titulo-post");
    const detalheUsuario = document.getElementById("detalhe-usuario-post");
    const detalheDescricao = document.getElementById("detalhe-descricao-post");

    if (!modal || !detalheTitulo || !detalheUsuario || !detalheDescricao)
      return;

    try {
      const response = await fetch(`${CONFIG.API_BUSCAR_POST}/${idDoPost}`);
      if (!response.ok) throw new Error(MESSAGES.errors.postNotFound);
      const post = await response.json();
      detalheTitulo.textContent = post.title;
      detalheUsuario.textContent = post.username;
      detalheDescricao.textContent = post.descricao || "Sem descrição";
      modal.style.display = "flex";
    } catch (error) {
      mostrarMensagem(error.message || MESSAGES.errors.default, "erro");
    }
  }

  function configurarEdicaoPerfil() {
    const editarBtn = document.getElementById("editar-perfil-btn");
    const fecharModal = document.querySelector(
      "#modal-editar-perfil .fechar-modal"
    );
    const previewFoto = document.getElementById("preview-foto-perfil");

    editarBtn.addEventListener("click", () => {
      document.getElementById("nome-modal").value = DOM.username.textContent;
      document.getElementById("descricao-modal").value =
        DOM.descricaoUsuario.textContent;
      DOM.modalEditarPerfil.style.display = "block";
    });

    fecharModal.addEventListener("click", () => {
      DOM.modalEditarPerfil.style.display = "none";
    });

    DOM.inputFotoPerfil.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          previewFoto.src = event.target.result;
          previewFoto.style.display = "block";
        };
        reader.readAsDataURL(file);
      }
    });

    DOM.formEditarPerfil.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("nome-modal").value;
      const descricao = document.getElementById("descricao-modal").value;
      const fotoFile = DOM.inputFotoPerfil.files[0];

      if (username.length < 3) {
        mostrarMensagem("Nome precisa ter pelo menos 3 caracteres", "erro");
        return;
      }

      let fotoPerfilUrl = null;
      if (fotoFile) {
        fotoPerfilUrl = await uploadCloudinary(fotoFile);
        if (!fotoPerfilUrl) {
          mostrarMensagem(MESSAGES.errors.uploadFailed, "erro");
          return;
        }
      }

      const dadosAtualizacao = {
        username,
        descricao,
        fotoUrl: fotoPerfilUrl,
      };

      try {
        const response = await fetch(`${CONFIG.API_EDITAR_USUARIO}${userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dadosAtualizacao),
        });

        if (!response.ok) throw new Error("Falha ao atualizar perfil");

        DOM.modalEditarPerfil.style.display = "none";
        mostrarMensagem(MESSAGES.success.profileUpdated, "sucesso");
        carregarPerfilUsuario();
      } catch (error) {
        mostrarMensagem(error.message || MESSAGES.errors.default, "erro");
      }
    });
  }

  DOM.closeModalDetalhesPost?.addEventListener("click", () => {
    DOM.modalDetalhesPost.style.display = "none";
  });

  carregarPerfilUsuario();
  configurarEdicaoPerfil();
  exibirPostUsuario();
});
