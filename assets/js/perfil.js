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
    nomeUsuario: document.getElementById("nome-usuario"),
    descricaoUsuario: document.getElementById("descricao-usuario"),
    listaDePosts: document.getElementById("posts-list"),
    modalDetalhesPost: document.getElementById("detalhes-modal-post"),
    closeModalDetalhesPost: document.querySelector(
      "#detalhes-modal-post .close-button"
    ),

    inputNomeUsuario: document.getElementById("input-nome-usuario"),
    inputDescricaoUsuario: document.getElementById("input-descricao-usuario"),
    inputFotoPerfil: document.getElementById("input-foto-perfil"),
    previewFotoPerfil: document.getElementById("preview-foto-perfil"),
    editarPerfilBtn: document.getElementById("editar-perfil-btn"),
    salvarPerfilBtn: document.getElementById("salvar-perfil-btn"),
    cancelarEdicaoBtn: document.getElementById("cancelar-edicao-btn"),
  };

  const MESSAGES = {
    errors: {
      userNotFound: "ID do usuário não encontrado.",
      projectFetchFailed: (status) =>
        `Erro ao buscar posts do usuário: ${status}`,
      default: "Ocorreu um erro inesperado.",
      postNotFound: "Detalhes do post não encontrados.",
      uploadFailed: "Falha ao enviar imagem. Tente novamente.",
      nameTooShort: "Nome precisa ter pelo menos 3 caracteres.",
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
      return usuario;
    } catch (error) {
      console.error("Erro ao carregar perfil do usuário:", error);
      mostrarMensagem("Falha ao carregar perfil. Tente novamente", "erro");
      return null;
    }
  }

  async function atualizarInterfacePerfil(usuario) {
    const fotoPerfil = document.getElementById("foto-perfil-padrao");
    const urlImagem = usuario.fotoUrl;

    if (urlImagem && urlImagem !== "null" && urlImagem !== "undefined") {
      fotoPerfil.src = urlImagem;

      await new Promise((resolve) => {
        fotoPerfil.onload = () => resolve(true);
        fotoPerfil.onerror = () => {
          console.warn("Erro ao carregar a foto de perfil. Usando fallback.");
          fotoPerfil.src =
            "../assets/img/perfil/Suspicious Look Around GIF by nounish ⌐◨-◨.gif";
          resolve(false);
        };

        setTimeout(() => {
          if (!fotoPerfil.complete) {
            console.warn(
              "Carregamento da foto de perfil excedeu o tempo limite. Usando fallback."
            );
            fotoPerfil.src =
              "../assets/img/perfil/Suspicious Look Around GIF by nounish ⌐◨-◨.gif";
            resolve(false);
          } else {
            resolve(true);
          }
        }, 5000);
      });
    } else {
      fotoPerfil.src =
        "../assets/img/perfil/Suspicious Look Around GIF by nounish ⌐◨-◨.gif";
    }

    DOM.nomeUsuario.textContent = usuario.username;
    DOM.descricaoUsuario.textContent = usuario.descricao;

    if (DOM.inputNomeUsuario)
      DOM.inputNomeUsuario.value = usuario.username || "";
    if (DOM.inputDescricaoUsuario)
      DOM.inputDescricaoUsuario.value = usuario.descricao || "";
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
    if (!DOM.listaDePosts) {
      console.error("Elemento DOM.listaDePosts não encontrado.");
      return;
    }
    DOM.listaDePosts.innerHTML = "";

    if (posts && posts.length > 0) {
      posts.forEach((post) => {
        const postDiv = document.createElement("div");
        postDiv.classList.add("post-card");
        postDiv.style.cursor = "pointer";
        postDiv.addEventListener("click", () => {
          verDetalhesPosts(post.id);
        });

        postDiv.innerHTML = `
          <h3>${post.title}</h3>
          
          <p>${
            post.descricao
              ? post.descricao.substring(0, 100) +
                (post.descricao.length > 100 ? "..." : "")
              : "Sem descrição"
          }</p>
          
          ${
            post.imageUrl
              ? `<img src="${post.imageUrl}" alt="Imagem do Post ${post.title}" />`
              : ""
          }
          

        <div class="detalhes-post-card" style="color: black;">
          <span>${
            post.dataCriacaoPosts ? post.dataCriacaoPosts.split(" ")[0] : "N/A"
          }</span>
          <p>${post.nomeUsuario}</p>
        </div>
        `;

        DOM.listaDePosts.appendChild(postDiv);
      });
    } else {
      DOM.listaDePosts.innerHTML =
        '<div class="no-posts">O usuário ainda não criou nenhum post :(</div>';
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
      console.error("Erro ao exibir posts do usuário:", error);
      mostrarMensagem(error.message || MESSAGES.errors.default, "erro");
      if (DOM.listaDePosts) {
        DOM.listaDePosts.innerHTML =
          '<div class="error">Erro ao carregar os posts do usuário.</div>';
      }
    }
  }

  async function verDetalhesPosts(idDoPost) {
    const modal = document.getElementById("detalhes-modal-post");
    const detalheTitulo = document.getElementById("detalhe-titulo-post");
    const detalheUsuario = document.getElementById("detalhe-usuario-post");
    const detalheDescricao = document.getElementById("detalhe-descricao-post");
    const detalheCriacao = document.getElementById("detalhe-data-criacao");

    if (!modal) {
      console.error("Modal não encontrado!");
      return;
    }

    modal.style.display = "flex";
    detalheTitulo.textContent = "";
    detalheUsuario.textContent = "";
    detalheDescricao.textContent = "";
    detalheCriacao.textContent = "";

    try {
      const response = await fetch(`${CONFIG.API_BUSCAR_POST}/${idDoPost}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao buscar detalhes");
      }

      const post = await response.json();

      detalheTitulo.textContent = post.title;
      detalheTitulo.style.color = "black";
      detalheUsuario.textContent = post.nomeUsuario;
      detalheDescricao.textContent = post.descricao;
      detalheCriacao.textContent = post.dataCriacaoPosts.split(" ")[0];
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
      detalheTitulo.textContent = `Erro: ${error.message}`;
      detalheTitulo.style.color = "black";
    }
  }

  function toggleEditMode(enable) {
    const fotoPerfilPadrao = document.getElementById("foto-perfil-padrao");
    const labelInputFoto = document.querySelector(
      'label[for="input-foto-perfil"]'
    );

    if (enable) {
      DOM.nomeUsuario.style.display = "none";
      DOM.descricaoUsuario.style.display = "none";
      DOM.editarPerfilBtn.style.display = "none";

      DOM.inputNomeUsuario.style.display = "block";
      DOM.inputDescricaoUsuario.style.display = "block";
      DOM.inputFotoPerfil.style.display = "block";
      DOM.previewFotoPerfil.style.display = "block";
      DOM.salvarPerfilBtn.style.display = "inline-block";
      DOM.cancelarEdicaoBtn.style.display = "inline-block";
      if (labelInputFoto) labelInputFoto.style.display = "block";

      if (fotoPerfilPadrao) fotoPerfilPadrao.style.display = "none";
    } else {
      DOM.nomeUsuario.style.display = "block";
      DOM.descricaoUsuario.style.display = "block";
      DOM.editarPerfilBtn.style.display = "inline-block";

      DOM.inputNomeUsuario.style.display = "none";
      DOM.inputDescricaoUsuario.style.display = "none";
      DOM.inputFotoPerfil.style.display = "none";
      DOM.previewFotoPerfil.style.display = "none";
      DOM.salvarPerfilBtn.style.display = "none";
      DOM.cancelarEdicaoBtn.style.display = "none";
      if (labelInputFoto) labelInputFoto.style.display = "none";

      if (fotoPerfilPadrao) fotoPerfilPadrao.style.display = "block";
    }
  }

  function configurarEdicaoPerfil() {
    DOM.editarPerfilBtn.addEventListener("click", async () => {
      const currentUser = await carregarPerfilUsuario();
      if (currentUser) {
        DOM.inputNomeUsuario.value = currentUser.username || "";
        DOM.inputDescricaoUsuario.value = currentUser.descricao || "";

        if (currentUser.fotoUrl) {
          DOM.previewFotoPerfil.src = currentUser.fotoUrl;
          DOM.previewFotoPerfil.style.display = "block";
        } else {
          DOM.previewFotoPerfil.src =
            "../assets/img/perfil/Suspicious Look Around GIF by nounish ⌐◨-◨.gif";
          DOM.previewFotoPerfil.style.display = "block";
        }
      }
      toggleEditMode(true);
    });

    DOM.cancelarEdicaoBtn.addEventListener("click", () => {
      carregarPerfilUsuario();
      toggleEditMode(false);
      mostrarMensagem("Edição cancelada.", "informacao");
    });

    DOM.inputFotoPerfil.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          DOM.previewFotoPerfil.src = event.target.result;
          DOM.previewFotoPerfil.style.display = "block";
        };
        reader.readAsDataURL(file);
      }
    });

    DOM.salvarPerfilBtn.addEventListener("click", async () => {
      const nomeUsuario = DOM.inputNomeUsuario.value.trim();
      const descricao = DOM.inputDescricaoUsuario.value.trim();
      const fotoFile = DOM.inputFotoPerfil.files[0];

      if (nomeUsuario.length < 3) {
        mostrarMensagem(MESSAGES.errors.nameTooShort, "erro");
        return;
      }

      let fotoPerfilUrl = null;

      if (fotoFile) {
        fotoPerfilUrl = await uploadCloudinary(fotoFile);
        if (!fotoPerfilUrl) {
          mostrarMensagem(MESSAGES.errors.uploadFailed, "erro");
          return;
        }
      } else {
        const fotoPadrao = document.getElementById("foto-perfil-padrao").src;
        const urlBasePadrao =
          "http://localhost:8080/assets/img/perfil/Suspicious Look Around GIF by nounish ⌐◨-◨.gif";

        if (
          DOM.previewFotoPerfil.src &&
          DOM.previewFotoPerfil.src !== fotoPadrao &&
          DOM.previewFotoPerfil.src !== urlBasePadrao
        ) {
          fotoPerfilUrl = DOM.previewFotoPerfil.src;
        } else {
          fotoPerfilUrl = null;
        }
      }

      const dadosAtualizacao = {
        nomeUsuario,
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

        mostrarMensagem(MESSAGES.success.profileUpdated, "sucesso");
        await carregarPerfilUsuario();
        toggleEditMode(false);
      } catch (error) {
        console.error("Erro ao salvar perfil:", error);
        mostrarMensagem(error.message || MESSAGES.errors.default, "erro");
      }
    });
  }

  function inicializarModal() {
    const modal = DOM.modalDetalhesPost;
    const closeButtonX = DOM.closeModalDetalhesPost;

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
    carregarPerfilUsuario();
    configurarEdicaoPerfil();
    exibirPostUsuario();
    inicializarModal();
    toggleEditMode(false);
  };
});
