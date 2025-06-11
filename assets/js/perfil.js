document.addEventListener("DOMContentLoaded", async () => {
  const loggedInUserId = localStorage.getItem("userId");
  console.log(
    "Perfil JS: (1) ID do usuário logado do localStorage:",
    loggedInUserId
  );

  const urlParams = new URLSearchParams(window.location.search);
  const profileIdFromUrl = urlParams.get("userId");
  console.log("Perfil JS: (2) ID do usuário obtido da URL:", profileIdFromUrl);

  const currentProfileId = profileIdFromUrl || loggedInUserId;
  console.log(
    "Perfil JS: (3) ID FINAL do perfil a ser carregado (currentProfileId):",
    currentProfileId
  );

  const token = getAuthToken();
  if (!token) {
    console.log(
      "Perfil JS: Token JWT não encontrado. Redirecionando para login."
    );
    window.location.href = "../pages/login.html";
    return;
  }
  console.log("Perfil JS: Token JWT encontrado. Usuário autenticado.");

  const CONFIG = {
    API_BUSCAR_POSTS_USUARIO:
      "https://codeconnect-production-ac3a.up.railway.app/api/v1/Posts/usuario",
    API_BUSCAR_POST:
      "https://codeconnect-production-ac3a.up.railway.app/api/v1/Posts",
    API_BUSCAR_USUARIO:
      "https://codeconnect-production-ac3a.up.railway.app/api/v1/usuarios",
    API_EDITAR_USUARIO:
      "https://codeconnect-production-ac3a.up.railway.app/api/v1/usuarios/atualiza-dados/",
    API_EXCLUIR_POST:
      "https://codeconnect-production-ac3a.up.railway.app/api/v1/Posts/",
    MESSAGE_DISPLAY_TIME: 3000,
    MIN_LOADER_TIME: 1500,
    CLOUDINARY: {
      UPLOAD_URL: "https://api.cloudinary.com/v1_1/dzzk4ybjo/image/upload",
      UPLOAD_PRESET: "codeconnect_upload",
    },
  };

  const DOM = {
    mensagem: document.getElementById("mensagem-perfil"),
    fotoPerfilPadrao: document.getElementById("foto-perfil-padrao"),
    nomeUsuario: document.getElementById("nome-usuario"),
    descricaoUsuario: document.getElementById("descricao-usuario"),
    editarPerfilBtn: document.getElementById("editar-perfil-btn"),
    inputNomeUsuario: document.getElementById("input-nome-usuario"),
    inputDescricaoUsuario: document.getElementById("input-descricao-usuario"),
    inputFotoPerfil: document.getElementById("input-foto-perfil"),
    previewFotoPerfil: document.getElementById("preview-foto-perfil"),
    salvarPerfilBtn: document.getElementById("salvar-perfil-btn"),
    cancelarEdicaoBtn: document.getElementById("cancelar-edicao-btn"),
    labelInputFoto: document.querySelector('label[for="input-foto-perfil"]'),
    listaDePosts: document.getElementById("posts-list"),
    modalDetalhesPost: document.getElementById("detalhes-modal-post"),
    closeModalDetalhesPost: document.querySelector(
      "#detalhes-modal-post .close-button"
    ),
    detalheTituloPost: document.getElementById("detalhe-titulo-post"),
    detalheUsuarioPost: document.getElementById("detalhe-usuario-post"),
    detalheDescricaoPost: document.getElementById("detalhe-descricao-post"),
    detalheDataCriacaoPost: document.getElementById("detalhe-data-criacao"),
    detalheImagemPost: document.getElementById("detalhe-imagem-post"),
    btnExcluirPost: document.getElementById("btn-excluir-post"),

    inlineConfirmacaoExclusao: document.getElementById(
      "inline-confirmacao-exclusao"
    ),
    btnConfirmarInline: document.getElementById("btn-confirmar-inline"),
    btnCancelarInline: document.getElementById("btn-cancelar-inline"),
  };

  const MESSAGES = {
    errors: {
      userNotFound: "ID do usuário não encontrado.",
      fetchFailed: (status) => `Erro ao buscar dados: ${status}`,
      default: "Ocorreu um erro inesperado.",
      postNotFound: "Detalhes do post não encontrados.",
      uploadFailed: "Falha ao enviar imagem. Tente novamente.",
      nameTooShort: "Nome de usuário precisa ter pelo menos 3 caracteres.",
      postDeleteFailed: "Erro ao excluir o post. Tente novamente.",
    },
    success: {
      profileUpdated: "Perfil atualizado com sucesso!",
      postDeleted: "Post excluído com sucesso!",
      editCanceled: "Edição cancelada.",
      deleteCanceled: "Exclusão cancelada.",
    },
    info: {
      loading: "Carregando...",
    },
  };

  const mostrarMensagem = (texto, tipo = "erro") => {
    console.log(
      `Perfil JS: Mensagem exibida - Tipo: ${tipo}, Texto: "${texto}"`
    );
    if (DOM.mensagem) {
      DOM.mensagem.textContent = texto;
      DOM.mensagem.className = `mensagem ${tipo}`;
      DOM.mensagem.style.display = "block";
      setTimeout(() => {
        DOM.mensagem.style.display = "none";
      }, CONFIG.MESSAGE_DISPLAY_TIME);
    } else {
      console.error("Perfil JS: Elemento DOM.mensagem não encontrado.");
    }
  };

  async function handleFetchError(response) {
    let errorMessage = `Erro HTTP: ${response.status} ${response.statusText}`;
    try {
      const errorBody = await response.json();
      if (errorBody.message) {
        errorMessage = errorBody.message;
      } else if (typeof errorBody === "string") {
        errorMessage = errorBody;
      }
    } catch (parseError) {
      console.warn(
        `handleFetchError: Falha ao parsear JSON de erro: ${parseError.message}`
      );
    }
    return new Error(errorMessage);
  }

  async function uploadCloudinary(file) {
    console.log(
      "Perfil JS: Iniciando upload para Cloudinary do arquivo:",
      file.name
    );
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CONFIG.CLOUDINARY.UPLOAD_PRESET);
    try {
      const response = await fetch(CONFIG.CLOUDINARY.UPLOAD_URL, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      console.log("Perfil JS: Resposta do Cloudinary:", data);
      return data.secure_url;
    } catch (error) {
      console.error("Perfil JS: Erro no upload para Cloudinary:", error);
      return null;
    }
  }

  function toggleEditMode(enable) {
    console.log(
      `Perfil JS: Toggle Modo de Edição: ${enable ? "ATIVADO" : "DESATIVADO"}`
    );

    const elementsExist =
      DOM.nomeUsuario &&
      DOM.descricaoUsuario &&
      DOM.editarPerfilBtn &&
      DOM.inputNomeUsuario &&
      DOM.inputDescricaoUsuario &&
      DOM.inputFotoPerfil &&
      DOM.previewFotoPerfil &&
      DOM.salvarPerfilBtn &&
      DOM.cancelarEdicaoBtn &&
      DOM.fotoPerfilPadrao;

    if (!elementsExist) {
      console.error(
        "Perfil JS: ERRO - Alguns elementos DOM para edição de perfil não foram encontrados. Verifique o objeto DOM."
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
      if (DOM.labelInputFoto) DOM.labelInputFoto.style.display = "block";
      DOM.fotoPerfilPadrao.style.display = "none";
    } else {
      DOM.nomeUsuario.style.display = "block";
      DOM.descricaoUsuario.style.display = "block";

      DOM.inputNomeUsuario.style.display = "none";
      DOM.inputDescricaoUsuario.style.display = "none";
      DOM.inputFotoPerfil.style.display = "none";
      DOM.previewFotoPerfil.style.display = "none";
      DOM.salvarPerfilBtn.style.display = "none";
      DOM.cancelarEdicaoBtn.style.display = "none";
      if (DOM.labelInputFoto) DOM.labelInputFoto.style.display = "none";
      DOM.fotoPerfilPadrao.style.display = "block";
    }
  }

  async function carregarPerfilUsuario() {
    console.log("Perfil JS: Carregando perfil para o ID:", currentProfileId);
    if (!currentProfileId) {
      console.error(
        "Perfil JS: ERRO - ID do usuário não definido em carregarPerfilUsuario."
      );
      mostrarMensagem(MESSAGES.errors.userNotFound, "erro");
      return null;
    }
    try {
      const apiUrl = `${CONFIG.API_BUSCAR_USUARIO}/${currentProfileId}`;
      console.log("Perfil JS: URL da requisição de perfil:", apiUrl);
      const response = await authenticatedFetch(apiUrl);
      console.log("Perfil JS: Resposta HTTP da API de usuário:", response);

      if (!response.ok) {
        throw await handleFetchError(response);
      }
      const usuario = await response.json();
      console.log(
        "Perfil JS: Dados do perfil recebidos (JSON de sucesso):",
        usuario
      );
      if (!usuario) throw new Error("Dados do usuário não encontrados");

      DOM.nomeUsuario.textContent = usuario.username || "Usuário Indisponível";
      DOM.descricaoUsuario.textContent =
        usuario.descricao || "Descrição Indisponível";
      console.log("Perfil JS: Nome e descrição do perfil atualizados.");

      const urlImagem = usuario.fotoUrl;
      if (DOM.fotoPerfilPadrao) {
        if (urlImagem && urlImagem !== "null" && urlImagem !== "undefined") {
          DOM.fotoPerfilPadrao.src = urlImagem;

          await new Promise((resolve) => {
            DOM.fotoPerfilPadrao.onload = () => {
              console.log("Perfil JS: Foto de perfil carregada com sucesso.");
              resolve(true);
            };
            DOM.fotoPerfilPadrao.onerror = () => {
              console.warn(
                "Perfil JS: Erro ao carregar a foto de perfil. Usando fallback."
              );
              DOM.fotoPerfilPadrao.src =
                "../assets/img/perfil/Suspicious Look Around GIF by nounish ⌐◨-◨.gif";
              resolve(false);
            };

            setTimeout(() => {
              if (!DOM.fotoPerfilPadrao.complete) {
                console.warn(
                  "Perfil JS: Carregamento da foto de perfil excedeu o tempo limite. Usando fallback."
                );
                DOM.fotoPerfilPadrao.src =
                  "../assets/img/perfil/Suspicious Look Around GIF by nounish ⌐◨-◨.gif";
                resolve(false);
              }
            }, 5000);
          });
        } else {
          console.log(
            "Perfil JS: URL da foto de perfil ausente ou inválida. Usando fallback."
          );
          DOM.fotoPerfilPadrao.src =
            "../assets/img/perfil/Suspicious Look Around GIF by nounish ⌐◨-◨.gif";
        }
      } else {
        console.warn(
          "Perfil JS: Elemento 'foto-perfil-padrao' não encontrado no DOM."
        );
      }

      if (
        currentProfileId &&
        loggedInUserId &&
        String(currentProfileId) === String(loggedInUserId)
      ) {
        console.log(
          "Perfil JS: Usuário logado é o mesmo do perfil. Mostrando botão de editar."
        );
        DOM.editarPerfilBtn.style.display = "inline-block";

        if (DOM.inputNomeUsuario)
          DOM.inputNomeUsuario.value = usuario.username || "";
        if (DOM.inputDescricaoUsuario)
          DOM.inputDescricaoUsuario.value = usuario.descricao || "";
      } else {
        console.log(
          "Perfil JS: Usuário logado NÃO é o mesmo do perfil. Escondendo botão de editar."
        );
        DOM.editarPerfilBtn.style.display = "none";
        toggleEditMode(false);
      }
      return usuario;
    } catch (error) {
      console.error("Perfil JS: Erro ao carregar perfil do usuário:", error);
      mostrarMensagem(
        "Falha ao carregar perfil. " + (error.message || "Tente novamente"),
        "erro"
      );
      return null;
    }
  }

  function renderPosts(posts) {
    console.log(
      "Perfil JS: Exibindo posts. Total de posts:",
      posts ? posts.length : 0
    );
    if (!DOM.listaDePosts) {
      console.error(
        "Perfil JS: ERRO - Elemento DOM.listaDePosts (posts-list) não encontrado."
      );
      return;
    }
    DOM.listaDePosts.innerHTML = "";
    if (posts && posts.length > 0) {
      posts.forEach((post) => {
        const postDiv = document.createElement("div");
        postDiv.classList.add("post-card");
        postDiv.style.cursor = "pointer";
        postDiv.addEventListener("click", (event) => {
          if (!event.target.closest("a")) {
            fetchAndShowPostDetails(post.id);
          }
        });

        console.log(
          `Perfil JS: Montando cartão para post ID ${post.id}. userId do post: ${post.userId}, nomeUsuario do post: ${post.nomeUsuario}`
        );

        postDiv.innerHTML = `
          ${
            post.imageUrl
              ? `<img src="${post.imageUrl}" alt="Imagem do Post ${post.title}" />`
              : ""
          }
          <h3>${post.title || "Título Indisponível"}</h3>
          <p>${
            post.descricao
              ? post.descricao.substring(0, 60) +
                (post.descricao.length > 100 ? "..." : "")
              : "Sem descrição"
          }</p>

          <div class="detalhes-post-card">
              <span>${
                post.dataCriacaoPosts
                  ? post.dataCriacaoPosts.split(" ")[0]
                  : "N/A"
              }</span>
    
          </div>
        `;
        DOM.listaDePosts.appendChild(postDiv);
      });
    } else {
      DOM.listaDePosts.innerHTML = '<div class="no-posts"></div>';
    }
  }

  async function fetchAndRenderUserPosts() {
    console.log(
      "Perfil JS: Buscando e exibindo posts para o ID:",
      currentProfileId
    );
    if (!currentProfileId) {
      mostrarMensagem(MESSAGES.errors.userNotFound, "erro");
      console.error(
        "Perfil JS: ERRO - ID do usuário não definido para fetchAndRenderUserPosts."
      );
      return;
    }

    try {
      const apiUrl = `${CONFIG.API_BUSCAR_POSTS_USUARIO}/${currentProfileId}`;
      console.log("Perfil JS: URL da requisição de posts do usuário:", apiUrl);
      const response = await authenticatedFetch(apiUrl);
      console.log("Perfil JS: Resposta HTTP da API de posts:", response);

      if (!response.ok) {
        throw await handleFetchError(response);
      }
      const data = await response.json();
      console.log(
        "Perfil JS: Dados dos posts recebidos (JSON de sucesso):",
        data
      );
      renderPosts(data);
    } catch (error) {
      console.error(
        "Perfil JS: Erro ao buscar e exibir posts do usuário (capturado):",
        error
      );
      mostrarMensagem(MESSAGES.errors.default, "erro");
      if (DOM.listaDePosts) {
        DOM.listaDePosts.innerHTML =
          '<div class="error">Erro ao carregar os posts do usuário.</div>';
      }
    }
  }

  async function fetchAndShowPostDetails(idDoPost) {
    console.log(
      "Perfil JS: Abrindo modal de detalhes para o post ID:",
      idDoPost
    );
    const modal = DOM.modalDetalhesPost;
    const detalheTitulo = DOM.detalheTituloPost;
    const detalheUsuario = DOM.detalheUsuarioPost;
    const detalheDescricao = DOM.detalheDescricaoPost;
    const detalheCriacao = DOM.detalheDataCriacaoPost;
    const detalheImagemPost = DOM.detalheImagemPost;

    if (!modal) {
      console.error(
        "Perfil JS: ERRO - Modal de detalhes do post não encontrado!"
      );
      return;
    }

    modal.style.display = "flex";
    detalheTitulo.textContent = "Carregando...";
    detalheUsuario.innerHTML = "";
    detalheDescricao.textContent = "";
    detalheCriacao.textContent = "";
    if (detalheImagemPost) {
      detalheImagemPost.src = "";
      detalheImagemPost.style.display = "none";
    }

    if (DOM.inlineConfirmacaoExclusao) {
      DOM.inlineConfirmacaoExclusao.style.display = "none";
    }

    if (DOM.btnExcluirPost) {
      const oldBtn = DOM.btnExcluirPost;
      const newBtn = oldBtn.cloneNode(true);
      oldBtn.parentNode.replaceChild(newBtn, oldBtn);
      DOM.btnExcluirPost = newBtn;

      DOM.btnExcluirPost.addEventListener("click", () =>
        iniciarExclusaoPost(idDoPost)
      );

      console.log(
        `Perfil JS: Verificando visibilidade do botão de excluir. currentProfileId: ${currentProfileId}, loggedInUserId: ${loggedInUserId}`
      );
      if (
        currentProfileId &&
        loggedInUserId &&
        String(currentProfileId) === String(loggedInUserId)
      ) {
        console.log("Perfil JS: Botão de exclusão VISÍVEL.");
        DOM.btnExcluirPost.style.display = "block";
      } else {
        console.log("Perfil JS: Botão de exclusão ESCONDIDO.");
        DOM.btnExcluirPost.style.display = "none";
      }
    } else {
      console.warn("Perfil JS: Elemento 'btn-excluir-post' não encontrado.");
    }

    try {
      const apiUrl = `${CONFIG.API_BUSCAR_POST}/${idDoPost}`;
      console.log("Perfil JS: URL da requisição de detalhes do post:", apiUrl);
      const response = await authenticatedFetch(apiUrl);
      console.log(
        "Perfil JS: Resposta HTTP da API de post específico:",
        response
      );

      if (!response.ok) {
        throw await handleFetchError(response);
      }
      const post = await response.json();
      console.log(
        "Perfil JS: Dados do post recebidos (JSON de sucesso):",
        post
      );

      detalheTitulo.textContent = post.title || "Título Indisponível";

      console.log(
        `Perfil JS: Montando link de usuário no modal. userId do post: ${post.userId}, nomeUsuario do post: ${post.nomeUsuario}`
      );
      detalheUsuario.innerHTML = `<a href="../pages/perfil.html?userId=${
        post.userId
      }" style="color: #81fe88; text-decoration: none; cursor: pointer;">${
        post.nomeUsuario || "Usuário Desconhecido"
      }</a>`;

      detalheDescricao.textContent = post.descricao || "Sem descrição.";
      detalheCriacao.textContent = post.dataCriacaoPosts
        ? post.dataCriacaoPosts.split(" ")[0]
        : "N/A";

      if (detalheImagemPost && post.imageUrl) {
        detalheImagemPost.src = post.imageUrl;
        detalheImagemPost.style.display = "block";
        console.log("Perfil JS: Imagem do post exibida.");
      } else if (detalheImagemPost) {
        detalheImagemPost.style.display = "none";
        console.log("Perfil JS: Imagem do post ausente ou vazia. Escondida.");
      }
    } catch (error) {
      console.error(
        "Perfil JS: Erro ao carregar detalhes do post (capturado):",
        error
      );
      detalheTitulo.textContent = `Erro: ${
        error.message || MESSAGES.errors.default
      }`;

      mostrarMensagem("Erro ao carregar detalhes do post.", "erro");
      if (DOM.btnExcluirPost) DOM.btnExcluirPost.style.display = "none";
      if (detalheImagemPost) detalheImagemPost.style.display = "none";
    }
  }

  function setupProfileEditFunctionality() {
    console.log("Perfil JS: Configurando edição de perfil...");
    if (
      !DOM.editarPerfilBtn ||
      !DOM.cancelarEdicaoBtn ||
      !DOM.inputFotoPerfil ||
      !DOM.salvarPerfilBtn
    ) {
      console.warn(
        "Perfil JS: WARNING - Alguns elementos DOM para edição de perfil não foram encontrados. Edição de perfil desativada."
      );
      return;
    }

    DOM.editarPerfilBtn.addEventListener("click", async () => {
      console.log("Perfil JS: Botão 'Editar Perfil' clicado.");
      const currentUser = await carregarPerfilUsuario();
      if (currentUser) {
        DOM.inputNomeUsuario.value =
          currentUser.username || currentUser.name || "";
        DOM.inputDescricaoUsuario.value = currentUser.descricao || "";

        if (currentUser.fotoUrl) {
          DOM.previewFotoPerfil.src = currentUser.fotoUrl;
          DOM.previewFotoPerfil.style.display = "block";
          console.log(
            "Perfil JS: Preview da foto de perfil atualizada com URL existente."
          );
        } else {
          DOM.previewFotoPerfil.src =
            "../assets/img/perfil/Suspicious Look Around GIF by nounish ⌐◨-◨.gif";
          DOM.previewFotoPerfil.style.display = "block";
          console.log(
            "Perfil JS: Preview da foto de perfil atualizada com fallback."
          );
        }
      }
      toggleEditMode(true);
    });

    DOM.cancelarEdicaoBtn.addEventListener("click", () => {
      console.log("Perfil JS: Botão 'Cancelar Edição' clicado.");
      carregarPerfilUsuario();
      toggleEditMode(false);
      mostrarMensagem(MESSAGES.success.editCanceled, "informacao");
    });

    DOM.inputFotoPerfil.addEventListener("change", (e) => {
      console.log("Perfil JS: Input de foto de perfil alterado.");
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          DOM.previewFotoPerfil.src = event.target.result;
          DOM.previewFotoPerfil.style.display = "block";
          console.log("Perfil JS: Pré-visualização da nova foto de perfil.");
        };
        reader.readAsDataURL(file);
      } else {
        carregarPerfilUsuario();
      }
    });

    DOM.salvarPerfilBtn.addEventListener("click", async () => {
      console.log("Perfil JS: Botão 'Salvar Perfil' clicado.");
      const username = DOM.inputNomeUsuario.value.trim();
      const descricao = DOM.inputDescricaoUsuario.value.trim();
      const fotoFile = DOM.inputFotoPerfil.files[0];

      if (username.length < 3) {
        mostrarMensagem(MESSAGES.errors.nameTooShort, "erro");
        console.log("Perfil JS: Validação falhou - nome muito curto.");
        return;
      }

      let fotoPerfilUrl = null;

      if (fotoFile) {
        console.log(
          "Perfil JS: Foto de perfil selecionada. Iniciando upload para Cloudinary."
        );
        fotoPerfilUrl = await uploadCloudinary(fotoFile);
        if (!fotoPerfilUrl) {
          mostrarMensagem(MESSAGES.errors.uploadFailed, "erro");
          console.error("Perfil JS: Falha no upload da foto de perfil.");
          return;
        }
        console.log(
          "Perfil JS: URL da foto de perfil do Cloudinary:",
          fotoPerfilUrl
        );
      } else {
        const isPreviewShowingExistingImage =
          DOM.previewFotoPerfil.src &&
          DOM.previewFotoPerfil.src !==
            "../assets/img/perfil/Suspicious Look Around GIF by nounish ⌐◨-◨.gif" &&
          DOM.previewFotoPerfil.src.includes("http");

        if (isPreviewShowingExistingImage) {
          fotoPerfilUrl = DOM.previewFotoPerfil.src;
          console.log(
            "Perfil JS: Usando URL da foto de perfil existente (não alterada).",
            fotoPerfilUrl
          );
        } else {
          fotoPerfilUrl = null;
          console.log(
            "Perfil JS: Nenhuma nova foto, usando foto atual ou definindo como null."
          );
        }
      }

      const dadosAtualizacao = {
        username,
        descricao,
        fotoUrl: fotoPerfilUrl,
      };

      console.log(
        "Perfil JS: Dados para atualização do perfil:",
        dadosAtualizacao
      );
      console.log("Perfil JS: Enviando atualização para o ID:", loggedInUserId);

      try {
        const response = await authenticatedFetch(
          `${CONFIG.API_EDITAR_USUARIO}${loggedInUserId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dadosAtualizacao),
          }
        );
        console.log(
          "Perfil JS: Resposta HTTP da API de atualização de perfil:",
          response
        );

        if (!response.ok) {
          throw await handleFetchError(response);
        }
        const dados = await response.json();
        console.log(
          "Perfil JS: Dados da atualização recebidos (JSON de sucesso):",
          dados
        );

        mostrarMensagem(MESSAGES.success.profileUpdated, "sucesso");
        await carregarPerfilUsuario();
        toggleEditMode(false);
      } catch (error) {
        console.error("Perfil JS: Erro ao salvar perfil (capturado):", error);
        mostrarMensagem(error.message || MESSAGES.errors.default, "erro");
      }
    });
  }

  function setupPostDetailsModal() {
    console.log("Perfil JS: Inicializando modal de detalhes do post.");
    const modal = DOM.modalDetalhesPost;
    const closeButtonX = DOM.closeModalDetalhesPost;

    if (closeButtonX && modal) {
      closeButtonX.addEventListener("click", () => {
        modal.style.display = "none";

        if (DOM.inlineConfirmacaoExclusao) {
          DOM.inlineConfirmacaoExclusao.style.display = "none";
        }
        console.log("Perfil JS: Modal de detalhes do post fechado pelo 'X'.");
      });
      window.addEventListener("click", (event) => {
        if (event.target === modal) {
          modal.style.display = "none";

          if (DOM.inlineConfirmacaoExclusao) {
            DOM.inlineConfirmacaoExclusao.style.display = "none";
          }
          console.log(
            "Perfil JS: Modal de detalhes do post fechado ao clicar fora."
          );
        }
      });
    } else {
      console.warn(
        "Perfil JS: WARNING - Elementos do modal de detalhes do post (closeButtonX ou modal) não encontrados."
      );
    }
  }

  function iniciarExclusaoPost(idDoPost) {
    console.log(
      "Perfil JS: Iniciando processo de confirmação de exclusão IN-LINE para o post ID:",
      idDoPost
    );

    if (DOM.btnExcluirPost) {
      DOM.btnExcluirPost.style.display = "none";
    }

    if (DOM.inlineConfirmacaoExclusao) {
      DOM.inlineConfirmacaoExclusao.style.display = "block";

      DOM.btnConfirmarInline.onclick = null;
      DOM.btnCancelarInline.onclick = null;

      DOM.btnConfirmarInline.onclick = () => {
        console.log("Perfil JS: Botão 'Sim' da confirmação in-line clicado.");
        DOM.inlineConfirmacaoExclusao.style.display = "none";
        executarExclusaoPost(idDoPost);
      };

      DOM.btnCancelarInline.onclick = () => {
        console.log("Perfil JS: Botão 'Não' da confirmação in-line clicado.");
        DOM.inlineConfirmacaoExclusao.style.display = "none";

        if (DOM.btnExcluirPost) {
          DOM.btnExcluirPost.style.display = "block";
        }
        mostrarMensagem(MESSAGES.success.deleteCanceled, "informacao");
      };
    } else {
      console.error(
        "Perfil JS: Elemento de confirmação in-line não encontrado. Usando confirm() padrão."
      );

      if (
        confirm(
          "Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita."
        )
      ) {
        executarExclusaoPost(idDoPost);
      }
    }
  }

  async function executarExclusaoPost(idDoPost) {
    console.log("Perfil JS: Executando exclusão do post com ID:", idDoPost);
    try {
      const response = await authenticatedFetch(
        `${CONFIG.API_EXCLUIR_POST}${idDoPost}`,
        {
          method: "DELETE",
        }
      );
      console.log("Perfil JS: Resposta da API de exclusão de post:", response);

      if (!response.ok) {
        throw await handleFetchError(response);
      }

      console.log("Perfil JS: Post excluído com sucesso!");
      mostrarMensagem(MESSAGES.success.postDeleted, "sucesso");
      DOM.modalDetalhesPost.style.display = "none";

      if (DOM.btnExcluirPost) {
        DOM.btnExcluirPost.style.display = "block";
      }
      fetchAndRenderUserPosts();
    } catch (error) {
      console.error("Perfil JS: Erro ao excluir post (capturado):", error);
      mostrarMensagem(
        error.message || MESSAGES.errors.postDeleteFailed,
        "erro"
      );

      if (DOM.inlineConfirmacaoExclusao) {
        DOM.inlineConfirmacaoExclusao.style.display = "none";
      }

      if (DOM.btnExcluirPost) {
        DOM.btnExcluirPost.style.display = "block";
      }
    }
  }

  (function init() {
    console.log("Perfil JS: Iniciando script principal do perfil.");

    const token = getAuthToken();
    if (!token) {
      console.warn(
        "Perfil JS: Token JWT não encontrado na inicialização. Redirecionamento já deveria ter ocorrido."
      );
      return;
    }

    if (currentProfileId) {
      console.log(
        "Perfil JS: currentProfileId está definido. Carregando perfil e posts."
      );
      carregarPerfilUsuario();
      fetchAndRenderUserPosts();
    } else {
      console.warn(
        "Perfil JS: WARNING - ID do usuário não disponível. Algumas funcionalidades podem não carregar."
      );
      mostrarMensagem(
        MESSAGES.errors.userNotFound + " (Faça login novamente)",
        "erro"
      );
    }

    setupProfileEditFunctionality();
    setupPostDetailsModal();

    console.log("Perfil JS: Script principal do perfil inicializado.");
  })();
});
