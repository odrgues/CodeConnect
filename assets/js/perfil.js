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
    API_EXCLUIR_POST: "http://localhost:8080/api/v1/Posts/",
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
    btnExcluirPost: document.getElementById("btn-excluir-post"),
    confirmacaoExclusaoModal: document.getElementById(
      "confirmacao-exclusao-modal"
    ), // A div inteira
    btnConfirmarExclusao: document.getElementById("btn-confirmar-exclusao"),
    btnCancelarConfirmacao: document.getElementById("btn-cancelar-confirmacao"),
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
      postDeleteFailed: "Erro ao excluir o post. Tente novamente.",
    },
    success: {
      profileUpdated: "Perfil atualizado com sucesso!",
      postDeleted: "Post excluído com sucesso!",
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
    if (!userId) {
      // Adicionado verificação de userId aqui
      console.error(
        "ID do usuário não definido. Não é possível carregar o perfil."
      );
      mostrarMensagem(MESSAGES.errors.userNotFound, "erro");
      return null;
    }
    try {
      const response = await fetch(`${CONFIG.API_BUSCAR_USUARIO}/${userId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Erro ${response.status}: ${response.statusText}`,
        }));
        throw new Error(
          errorData.message || `Erro ${response.status}: ${response.statusText}`
        );
      }
      const usuario = await response.json();
      console.log("dados recebidos", usuario);
      if (!usuario) throw new Error("Dados do usuário não encontrados");
      await atualizarInterfacePerfil(usuario);
      return usuario;
    } catch (error) {
      console.error("Erro ao carregar perfil do usuário:", error);
      mostrarMensagem(
        "Falha ao carregar perfil. " + (error.message || "Tente novamente"),
        "erro"
      );
      return null;
    }
  }

  async function executarExclusaoPost(idDoPost) {
    try {
      const response = await fetch(`${CONFIG.API_EXCLUIR_POST}${idDoPost}`, {
        method: "DELETE",
        headers: {
          // Se seu backend exigir autenticação (ex: JWT Token), adicione aqui:
          // 'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Erro desconhecido ao excluir post." }));
        throw new Error(errorData.message || MESSAGES.errors.postDeleteFailed);
      }

      mostrarMensagem(MESSAGES.success.postDeleted, "sucesso");
      DOM.modalDetalhesPost.style.display = "none";
      exibirPostUsuario();
    } catch (error) {
      console.error("Erro ao excluir post:", error);
      mostrarMensagem(error.message, "erro");
      DOM.confirmacaoExclusaoModal.style.display = "none";
    }
  }

  function iniciarExclusaoPost(idDoPost) {
    if (DOM.confirmacaoExclusaoModal) {
      DOM.confirmacaoExclusaoModal.style.display = "flex";

      DOM.btnConfirmarExclusao.onclick = null;
      DOM.btnCancelarConfirmacao.onclick = null;

      DOM.btnConfirmarExclusao.onclick = () => {
        DOM.confirmacaoExclusaoModal.style.display = "none";
        executarExclusaoPost(idDoPost);
      };

      DOM.btnCancelarConfirmacao.onclick = () => {
        DOM.confirmacaoExclusaoModal.style.display = "none";
        mostrarMensagem("Exclusão cancelada.", "informacao");
      };
    } else {
      console.error("Elemento de confirmação de exclusão não encontrado.");

      if (
        confirm(
          "Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita."
        )
      ) {
        executarExclusaoPost(idDoPost);
      }
    }
  }

  async function atualizarInterfacePerfil(usuario) {
    const fotoPerfil = document.getElementById("foto-perfil-padrao");
    const urlImagem = usuario.fotoUrl;

    if (fotoPerfil) {
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
    } else {
      console.warn("Elemento 'foto-perfil-padrao' não encontrado no DOM.");
    }

    DOM.nomeUsuario.textContent = usuario.username || "Usuário Indisponível";
    DOM.descricaoUsuario.textContent =
      usuario.descricao || "Descrição Indisponível";

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
                          post.dataCriacaoPosts
                            ? post.dataCriacaoPosts.split(" ")[0]
                            : "N/A"
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
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Erro ${response.status}: ${response.statusText}`,
        }));
        throw new Error(
          errorData.message ||
            MESSAGES.errors.projectFetchFailed(response.status)
        );
      }
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
    const modal = DOM.modalDetalhesPost;
    const detalheTitulo = document.getElementById("detalhe-titulo-post");
    const detalheUsuario = document.getElementById("detalhe-usuario-post");
    const detalheDescricao = document.getElementById("detalhe-descricao-post");
    const detalheCriacao = document.getElementById("detalhe-data-criacao");

    if (!modal) {
      console.error("Modal de detalhes do post não encontrado!");
      return;
    }

    modal.style.display = "flex";
    detalheTitulo.textContent = "";
    detalheUsuario.textContent = "";
    detalheDescricao.textContent = "";
    detalheCriacao.textContent = "";

    if (DOM.confirmacaoExclusaoModal) {
      DOM.confirmacaoExclusaoModal.style.display = "none";
    }

    if (DOM.btnExcluirPost) {
      const oldBtn = DOM.btnExcluirPost;
      const newBtn = oldBtn.cloneNode(true);
      oldBtn.parentNode.replaceChild(newBtn, oldBtn);
      DOM.btnExcluirPost = newBtn;

      DOM.btnExcluirPost.addEventListener("click", () =>
        iniciarExclusaoPost(idDoPost)
      );
      DOM.btnExcluirPost.style.display = "block";
    }

    try {
      const response = await fetch(`${CONFIG.API_BUSCAR_POST}/${idDoPost}`);
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: MESSAGES.errors.postNotFound }));
        throw new Error(errorData.message || "Erro ao buscar detalhes do post");
      }
      const post = await response.json();

      detalheTitulo.textContent = post.title || "Título Indisponível";
      detalheTitulo.style.color = "black";
      detalheUsuario.textContent = post.nomeUsuario || "Usuário Desconhecido";
      detalheDescricao.textContent = post.descricao || "Sem descrição.";
      detalheCriacao.textContent = post.dataCriacaoPosts
        ? post.dataCriacaoPosts.split(" ")[0]
        : "N/A";
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
      detalheTitulo.textContent = `Erro: ${error.message}`;
      detalheTitulo.style.color = "black";
      mostrarMensagem("Erro ao carregar detalhes do post.", "erro");
      if (DOM.btnExcluirPost) DOM.btnExcluirPost.style.display = "none";
    }
  }

  function toggleEditMode(enable) {
    const fotoPerfilPadrao = document.getElementById("foto-perfil-padrao");
    const labelInputFoto = document.querySelector(
      'label[for="input-foto-perfil"]'
    );

    if (
      !DOM.nomeUsuario ||
      !DOM.descricaoUsuario ||
      !DOM.editarPerfilBtn ||
      !DOM.inputNomeUsuario ||
      !DOM.inputDescricaoUsuario ||
      !DOM.inputFotoPerfil ||
      !DOM.previewFotoPerfil ||
      !DOM.salvarPerfilBtn ||
      !DOM.cancelarEdicaoBtn
    ) {
      console.error(
        "Alguns elementos DOM para edição de perfil não foram encontrados."
      );
      return;
    }

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
    if (
      !DOM.editarPerfilBtn ||
      !DOM.cancelarEdicaoBtn ||
      !DOM.inputFotoPerfil ||
      !DOM.salvarPerfilBtn
    ) {
      console.warn(
        "Botões ou inputs de edição de perfil não encontrados. Edição de perfil desativada."
      );
      return;
    }

    DOM.editarPerfilBtn.addEventListener("click", async () => {
      const currentUser = await carregarPerfilUsuario();
      if (currentUser) {
        DOM.inputNomeUsuario.value =
          currentUser.username || currentUser.name || "";
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
      const username = DOM.inputNomeUsuario.value.trim();
      const descricao = DOM.inputDescricaoUsuario.value.trim();
      const fotoFile = DOM.inputFotoPerfil.files[0];

      if (username.length < 3) {
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
          "../assets/img/perfil/Suspicious Look Around GIF by nounish ⌐◨-◨.gif";

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

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({
            message: "Falha ao atualizar perfil",
          }));
          throw new Error(errorBody.message || "Falha ao atualizar perfil");
        }
        const dados = await response.json();
        console.log("o que estou enviando:", dados);

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

    if (closeButtonX && modal) {
      closeButtonX.addEventListener("click", () => {
        modal.style.display = "none";
      });
      window.addEventListener("click", (event) => {
        if (event.target === modal) {
          modal.style.display = "none";
        }
      });
    } else {
      console.warn(
        "Elementos do modal de detalhes do post (closeButtonX ou modal) não encontrados."
      );
    }
  }

  (function init() {
    if (userId) {
      carregarPerfilUsuario();
      exibirPostUsuario();
    } else {
      console.warn(
        "ID do usuário não disponível. Algumas funcionalidades podem não carregar."
      );
      mostrarMensagem(
        MESSAGES.errors.userNotFound + " (Faça login novamente)",
        "erro"
      );
    }
    configurarEdicaoPerfil();
    inicializarModal();
    toggleEditMode(false);
  })();
});
