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
    // Usar 'usuario.fotoUrl' ou 'usuario.fotoPerfil' dependendo do nome exato no backend
    const urlImagem = usuario.fotoUrl || usuario.fotoPerfil;

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

    DOM.nomeUsuario.textContent = usuario.nomeUsuario;
    DOM.descricaoUsuario.textContent = usuario.descricao;
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

        DOM.listaDePosts.appendChild(postDiv); // Adiciona ao elemento correto no DOM
      });
    } else {
      DOM.listaDePosts.innerHTML =
        '<div class="no-posts">O usuário ainda não criou nenhum post :(</div>';
    }
  }
  // --- FIM DA CORREÇÃO NA FUNÇÃO exibirPost ---

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
    console.log("Tentando abrir modal para post ID:", idDoPost);

    try {
      // 1. Verifique se o modal existe (usando DOM.modalDetalhesPost para consistência)
      const modal = DOM.modalDetalhesPost;
      if (!modal) {
        throw new Error(
          "Elemento 'detalhes-modal-post' não encontrado no DOM."
        );
      }

      // 2. Obtenha os elementos internos com verificação
      const elements = {
        titulo: document.getElementById("detalhe-titulo-post"),
        usuario: document.getElementById("detalhe-usuario-post"),
        descricao: document.getElementById("detalhe-descricao-post"),
        // CORREÇÃO: Usar o ID correto se for diferente no HTML
        data: document.getElementById("detalhe-data-criacao-post"),
      };

      // 3. Mostre o modal imediatamente
      modal.style.display = "flex";

      // 4. Defina conteúdo temporário (ou limpe para carregamento)
      // Definindo "Carregando..." para o título para um feedback melhor
      if (elements.titulo) elements.titulo.textContent = "Carregando...";
      if (elements.usuario) elements.usuario.textContent = "";
      if (elements.descricao) elements.descricao.textContent = "";
      if (elements.data) elements.data.textContent = "";

      // 5. Busque os dados
      const response = await fetch(`${CONFIG.API_BUSCAR_POST}/${idDoPost}`);
      if (!response.ok) {
        // Se a resposta não for OK, tente ler a mensagem de erro do backend
        const errorData = await response
          .json()
          .catch(() => ({ message: MESSAGES.errors.postNotFound }));
        throw new Error(errorData.message || MESSAGES.errors.postNotFound);
      }

      const post = await response.json();
      console.log("Dados do post recebidos:", post);

      // 6. Preencha os dados (com fallbacks e formatação da data)
      if (elements.titulo)
        elements.titulo.textContent = post.title || "Título Indisponível";

      // CORREÇÃO: Usar 'nomeUsuario' ou 'username' conforme a API
      if (elements.usuario)
        elements.usuario.textContent =
          post.nomeUsuario || post.username || "Usuário Desconhecido";

      // CORREÇÃO: A descrição já deve vir completa, sem substring aqui
      if (elements.descricao)
        elements.descricao.textContent = post.descricao || "Sem descrição.";

      // CORREÇÃO: Lógica para a data, similar à verDetalhesProjeto
      if (elements.data) {
        const dataParaExibir = post.dataCriacaoPosts // Prioriza 'dataCriacaoPosts'
          ? post.dataCriacaoPosts.split(" ")[0]
          : post.dataCriacao // Fallback para 'dataCriacao'
          ? post.dataCriacao.split(" ")[0]
          : "N/A";
        elements.data.textContent = dataParaExibir;
      }
    } catch (error) {
      console.error("Erro ao abrir modal:", error);

      // Atualiza o modal com a mensagem de erro
      const tituloElement = document.getElementById("detalhe-titulo-post");
      if (tituloElement)
        tituloElement.textContent = "Erro ao carregar detalhes";
      if (tituloElement) tituloElement.style.color = "black"; // Para garantir a visibilidade do erro

      const descricaoElement = document.getElementById(
        "detalhe-descricao-post"
      );
      if (descricaoElement)
        descricaoElement.textContent =
          error.message || "Falha ao carregar os dados do post.";

      // Se houver um erro, é bom fechar o modal ou dar uma opção para fechar
      // Ou simplesmente deixar a mensagem de erro dentro do modal como está sendo feito
      mostrarMensagem("Erro ao carregar detalhes do post.", "erro");
    }
  }

  // 2. Obtenha os elementos internos com verificação

  function configurarEdicaoPerfil() {
    const editarBtn = document.getElementById("editar-perfil-btn");
    const fecharModal = document.querySelector(
      "#modal-editar-perfil .fechar-modal"
    );
    const previewFoto = document.getElementById("preview-foto-perfil");

    editarBtn.addEventListener("click", () => {
      document.getElementById("nome-modal").value = DOM.nomeUsuario.textContent;
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

      const nomeUsuario = document.getElementById("nome-modal").value;
      const descricao = document.getElementById("descricao-modal").value;
      const fotoFile = DOM.inputFotoPerfil.files[0];

      if (nomeUsuario.length < 3) {
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

        DOM.modalEditarPerfil.style.display = "none";
        mostrarMensagem(MESSAGES.success.profileUpdated, "sucesso");
        carregarPerfilUsuario();
      } catch (error) {
        mostrarMensagem(error.message || MESSAGES.errors.default, "erro");
      }
    });
  }

  function inicializarModal() {
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
    carregarPerfilUsuario();
    configurarEdicaoPerfil();
    exibirPostUsuario();
    inicializarModal();
  };
});
