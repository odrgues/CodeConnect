document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("userId");
  console.log("ID do usuário (inicial):", userId);

  const CONFIG = {
    API_PUBLICACAO_URL: "http://localhost:8080/api/v1/Posts",
    MESSAGE_DISPLAY_TIME: 3000,
    PERFIL_PAGE: "/pages/perfil.html",
    CLOUDINARY: {
      UPLOAD_URL: "https://api.cloudinary.com/v1_1/dzzk4ybjo/image/upload",
      UPLOAD_PRESET: "codeconnect_upload",
    },
    LOGIN_PAGE: "/pages/login.html",
  };

  const MESSAGES = {
    errors: {
      notLoggedIn: "Faça login para publicar.",
      requiredFields: "Preencha todos os campos obrigatórios.",
      invalidImage: "Selecione uma imagem válida (PNG, JPG, JPEG).",
      networkError: "Erro de conexão. Tente novamente.",
      serverError: "Erro ao publicar. Tente mais tarde.",
      uploadFailed:
        "Falha ao enviar imagem para o servidor de arquivos. Tente novamente.",
    },
    success: {
      postCreated: "Projeto publicado com sucesso!",
    },
  };

  const DOM = {
    get form() {
      return (
        document.querySelector("form") || {
          addEventListener: () => {},
          reset: () => {},
          requestSubmit: () => {},
        }
      );
    },

    get nomeProjeto() {
      return (
        document.getElementById("nome") || {
          value: "",
          addEventListener: () => {},
          focus: () => {},
        }
      );
    },

    get descricao() {
      return (
        document.getElementById("descricao") || {
          value: "",
          addEventListener: () => {},
          focus: () => {},
        }
      );
    },

    get mensagem() {
      return (
        document.getElementById("mensagem-publicar") || {
          textContent: "",
          className: "",
          style: { display: "none" },
        }
      );
    },

    get btnPublicar() {
      return (
        document.getElementById("btn-publicar") || {
          disabled: false,
          addEventListener: () => {},
          textContent: "",
        }
      );
    },

    get btnDescartar() {
      return (
        document.getElementById("btn-descartar") || {
          disabled: false,
          addEventListener: () => {},
          textContent: "",
        }
      );
    },

    get btnUpload() {
      return (
        document.getElementById("upload-btn") || {
          addEventListener: () => {},
          textContent: "",
        }
      );
    },

    get inputUpload() {
      return (
        document.getElementById("image-upload") || {
          addEventListener: () => {},
          files: [],
          value: "",
        }
      );
    },

    get imagemPrincipal() {
      return (
        document.querySelector(".main-imagem") || {
          src: "",
          style: {},
          classList: {
            add: () => {},
            remove: () => {},
          },
        }
      );
    },
    get nomeImagem() {
      return (
        document.querySelector(".container-imagem-nome p") || {
          textContent: "",
          style: {},
        }
      );
    },
  };

  const API = {
    criarPublicacao: async (dadosDoPost, timeout = 8000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(CONFIG.API_PUBLICACAO_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dadosDoPost),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: MESSAGES.errors.serverError }));
          console.error(
            "API.criarPublicacao: Erro na resposta da API:",
            errorData
          );
          throw new Error(errorData.message || MESSAGES.errors.serverError);
        }

        const responseData = await response.json();
        return responseData;
      } catch (error) {
        clearTimeout(timeoutId);
        console.error("API.criarPublicacao: Erro na requisição:", error);
        throw error;
      }
    },
  };

  const Utils = {
    exibirMensagem: (elemento, texto, tipo = "erro") => {
      elemento.textContent = texto;
      elemento.className = `mensagem-${tipo}`;
      elemento.style.display = "block";
      setTimeout(
        () => (elemento.style.display = "none"),
        CONFIG.MESSAGE_DISPLAY_TIME
      );
    },

    validarFormulario: () => {
      const form = DOM.form;
      const nomeProjeto = DOM.nomeProjeto.value.trim();
      const descricao = DOM.descricao.value.trim();

      if (!form.checkValidity()) {
        form.reportValidity();
        console.warn(
          "Utils.validarFormulario: Formulário inválido (HTML5 validation)."
        );
        return false;
      }

      if (nomeProjeto.length < 3) {
        Utils.exibirMensagem(
          DOM.mensagem,
          "O nome do projeto deve ter pelo menos 3 caracteres.",
          "erro"
        );
        DOM.nomeProjeto.focus();
        console.warn("Utils.validarFormulario: Nome do projeto muito curto.");
        return false;
      }

      if (descricao.length < 10) {
        Utils.exibirMensagem(
          DOM.mensagem,
          "A descrição deve ter pelo menos 10 caracteres.",
          "erro"
        );
        DOM.descricao.focus();
        console.warn("Utils.validarFormulario: Descrição muito curta.");
        return false;
      }
      return true;
    },

    lerArquivo: (arquivo) => {
      return new Promise((resolve, reject) => {
        const tiposPermitidos = [
          "image/png",
          "image/jpeg",
          "image/jpg",
          "image/gif",
        ];

        if (!tiposPermitidos.includes(arquivo.type)) {
          console.error("Utils.lerArquivo: Tipo de imagem inválido.");
          return reject(MESSAGES.errors.invalidImage);
        }

        const leitor = new FileReader();
        leitor.onload = () => {
          resolve({ url: leitor.result, nome: arquivo.name });
        };
        leitor.onerror = () => {
          console.error("Utils.lerArquivo: Erro ao ler arquivo.");
          reject(MESSAGES.errors.invalidImage);
        };
        leitor.readAsDataURL(arquivo);
      });
    },

    limparFormulario: () => {
      DOM.form.reset();
      DOM.imagemPrincipal.src = "/assets/img/publicacao/imagem1.png";
      DOM.nomeImagem.textContent = "image_projeto.png";
      DOM.inputUpload.value = "";
    },
  };

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
      if (data.secure_url) {
        return data.secure_url;
      } else {
        console.error(
          "uploadCloudinary: secure_url não encontrada na resposta do Cloudinary."
        );
        return null;
      }
    } catch (error) {
      console.error("uploadCloudinary: Erro no upload para Cloudinary:", error);
      return null;
    }
  }

  const Handlers = {
    handleUpload: async (event) => {
      const arquivo = event.target.files[0];
      console.log("Handlers.handleUpload: Arquivo selecionado:", arquivo);
      if (!arquivo) return;
      try {
        const conteudo = await Utils.lerArquivo(arquivo);
        DOM.imagemPrincipal.src = conteudo.url;
        DOM.nomeImagem.textContent = conteudo.nome;
        console.log("Handlers.handleUpload: Imagem preview atualizada.");
      } catch (erro) {
        Utils.exibirMensagem(DOM.mensagem, erro, "erro");
      }
    },

    verificarAutenticacao: () => {
      const currentUserId = localStorage.getItem("userId");
      console.log(
        "Handlers.verificarAutenticacao: userId do localStorage:",
        currentUserId
      );
      if (!currentUserId) {
        Utils.exibirMensagem(DOM.mensagem, MESSAGES.errors.notLoggedIn, "erro");
        setTimeout(() => {
          window.location.href = CONFIG.LOGIN_PAGE || "/pages/login.html";
        }, 2000);
        console.warn("Handlers.verificarAutenticacao: Usuário não logado.");
        return false;
      }
      console.log("Handlers.verificarAutenticacao: Usuário autenticado.");
      return true;
    },

    handleDescartar: () => {
      Utils.limparFormulario();
      console.log("Handlers.handleDescartar: Botão Descartar clicado.");
    },

    ajustarTextarea: () => {
      const textarea = document.getElementById("descricao");
      if (textarea) {
        textarea.addEventListener("input", function () {
          this.style.height = "auto";
          this.style.height = this.scrollHeight + "px";
        });
        console.log(
          "Handlers.ajustarTextarea: Listener de ajuste de textarea adicionado."
        );
      }
    },

    handleSubmit: async (event) => {
      event.preventDefault();
      const startTime = Date.now();
      const currentUserId = localStorage.getItem("userId");
      console.log("Handlers.handleSubmit: Início da submissão do formulário.");
      console.log(
        "Handlers.handleSubmit: currentUserId (do localStorage):",
        currentUserId
      );

      try {
        if (!Handlers.verificarAutenticacao()) {
          console.warn(
            "Handlers.handleSubmit: Autenticação falhou. Abortando submissão."
          );
          return;
        }
        if (!Utils.validarFormulario()) {
          console.warn(
            "Handlers.handleSubmit: Validação do formulário falhou. Abortando submissão."
          );
          return;
        }

        let imageUrl = null;
        const imageFile = DOM.inputUpload.files[0];
        console.log(
          "Handlers.handleSubmit: Arquivo de imagem selecionado:",
          imageFile
        );

        if (imageFile) {
          console.log(
            "Handlers.handleSubmit: Iniciando upload de imagem para Cloudinary..."
          );
          imageUrl = await uploadCloudinary(imageFile);
          if (!imageUrl) {
            Utils.exibirMensagem(
              DOM.mensagem,
              MESSAGES.errors.uploadFailed,
              "erro"
            );
            console.error(
              "Handlers.handleSubmit: Falha no upload da imagem para Cloudinary."
            );
            return;
          }
          console.log(
            "Handlers.handleSubmit: Imagem URL do Cloudinary:",
            imageUrl
          );
        } else {
          console.log(
            "Handlers.handleSubmit: Nenhuma imagem selecionada para upload."
          );
        }

        const dadosParaEnvio = {
          title: DOM.nomeProjeto.value.trim(),
          descricao: DOM.descricao.value.trim(),
          // >>> CORREÇÃO AQUI: Mudado de 'userId' para 'usuarioId' <<<
          usuarioId: currentUserId ? parseInt(currentUserId) : null, // Convertendo para número se existir, ou null
        };

        const userName = localStorage.getItem("userName");
        if (userName) {
          dadosParaEnvio.nomeUsuario = userName;
          console.log(
            "Handlers.handleSubmit: Nome do usuário adicionado:",
            userName
          );
        } else {
          console.warn(
            "Handlers.handleSubmit: Nome do usuário 'userName' não encontrado no localStorage. Verifique se está 'username' ou outra chave."
          );
        }

        if (imageUrl) {
          dadosParaEnvio.imageUrl = imageUrl;
        }

        console.log(
          "Handlers.handleSubmit: Dados finais a serem enviados para a API:",
          dadosParaEnvio
        );

        await API.criarPublicacao(dadosParaEnvio);

        Utils.exibirMensagem(
          DOM.mensagem,
          MESSAGES.success.postCreated,
          "sucesso"
        );
        console.log("Handlers.handleSubmit: Post criado com sucesso!");

        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(
          CONFIG.MESSAGE_DISPLAY_TIME - elapsed,
          1000
        );

        setTimeout(() => {
          Utils.limparFormulario();
          console.log(
            "Handlers.handleSubmit: Redirecionando para a página de perfil..."
          );
          window.location.href = CONFIG.PERFIL_PAGE;
        }, remainingTime);
      } catch (error) {
        console.error(
          "Handlers.handleSubmit: Erro durante a submissão:",
          error
        );
        if (error.name === "AbortError") {
          Utils.exibirMensagem(
            DOM.mensagem,
            "A requisição demorou muito tempo. Tente novamente.",
            "erro"
          );
        } else {
          Utils.exibirMensagem(
            DOM.mensagem,
            error.message || MESSAGES.errors.serverError,
            "erro"
          );
        }
      } finally {
        console.log("Handlers.handleSubmit: Finalizando submissão.");
      }
    },
  };

  const init = () => {
    Handlers.ajustarTextarea();

    // Remover este if, pois verificarAutenticacao já lida com o redirecionamento.
    // if (!Handlers.verificarAutenticacao()) return;

    DOM.form.addEventListener("submit", Handlers.handleSubmit);
    DOM.btnUpload.addEventListener("click", () => DOM.inputUpload.click());

    DOM.inputUpload.addEventListener("change", Handlers.handleUpload);
    DOM.btnDescartar.addEventListener("click", Handlers.handleDescartar);
    console.log("init: Event listeners configurados.");
  };

  init();
});
