const CONFIG = {
  API_PUBLICACAO_URL: "http://localhost:8080/api/v1/Posts",
  MESSAGE_DISPLAY_TIME: 3000,
  PERFIL_PAGE: "/pages/perfil.html",
};

const MESSAGES = {
  errors: {
    notLoggedIn: "Faça login para publicar.",
    requiredFields: "Preencha todos os campos obrigatórios.",
    invalidImage: "Selecione uma imagem válida.",
    networkError: "Erro de conexão. Tente novamente.",
    serverError: "Erro ao publicar. Tente mais tarde.",
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
  criarPublicacao: async (dados, timeout = 8000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(CONFIG.API_PUBLICACAO_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || MESSAGES.errors.serverError);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
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
      return false;
    }

    if (nomeProjeto.length < 3) {
      Utils.exibirMensagem(
        DOM.mensagem,
        "O nome do projeto deve ter pelo menos 3 caracteres.",
        "erro"
      );
      DOM.nomeProjeto.focus();
      return false;
    }

    if (descricao.length < 10) {
      Utils.exibirMensagem(
        DOM.mensagem,
        "A descrição deve ter pelo menos 10 caracteres.",
        "erro"
      );
      DOM.descricao.focus();
      return false;
    }

    return true;
  },

  lerArquivo: (arquivo) => {
    return new Promise((resolve, reject) => {
      const tiposPermitidos = ["image/png", "image/jpeg", "image/jpg"];
      if (!tiposPermitidos.includes(arquivo.type)) {
        return reject("Apenas imagens PNG, JPG e JPEG são permitidas");
      }

      const tamanhoMaximoMB = 5;
      const tamanhoMaximoBytes = tamanhoMaximoMB * 1024 * 1024;
      if (arquivo.size > tamanhoMaximoBytes) {
        return reject(`A imagem deve ter menos de ${tamanhoMaximoMB}MB`);
      }

      const leitor = new FileReader();
      leitor.onload = () => resolve({ url: leitor.result, nome: arquivo.name });
      leitor.onerror = () => reject(MESSAGES.errors.invalidImage);
      leitor.readAsDataURL(arquivo);
    });
  },

  limparFormulario: () => {
    DOM.form.reset();
    DOM.imagemPrincipal.src = "/assets/img/publicacao/imagem1.png";
    DOM.nomeImagem.textContent = "image_projeto.png";
  },
};
const Handlers = {
  handleUpload: async (event) => {
    const arquivo = event.target.files[0];
    if (!arquivo) return;
    try {
      const conteudo = await Utils.lerArquivo(arquivo);
      DOM.imagemPrincipal.src = conteudo.url;
      DOM.nomeImagem.textContent = conteudo.nome;
    } catch (erro) {
      Utils.exibirMensagem(DOM.mensagem, erro, "erro");
    }
  },

  verificarAutenticacao: () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      Utils.exibirMensagem(DOM.mensagem, MESSAGES.errors.notLoggedIn, "erro");
      setTimeout(() => {
        window.location.href = CONFIG.LOGIN_PAGE;
      }, 2000);
      return false;
    }
    return true;
  },

  handleDescartar: () => {
    Utils.limparFormulario();
  },

  ajustarTextarea: () => {
    const textarea = document.getElementById("descricao");
    if (textarea) {
      textarea.addEventListener("input", function () {
        this.style.height = "auto";
        this.style.height = this.scrollHeight + "px";
      });
    }
  },

  handleSubmit: async (event) => {
    event.preventDefault();
    const startTime = Date.now();
    try {
      if (!Utils.validarFormulario()) {
        throw new Error(MESSAGES.errors.requiredFields);
      }

      // let imagem = null;
      // if (DOM.inputUpload.files[0]) {
      //   const conteudo = await Utils.lerArquivo(DOM.inputUpload.files[0]);
      //   imagem = conteudo.url.split(",")[1];
      // }

      const dados = {
        title: DOM.nomeProjeto.value.trim(),
        descricao: DOM.descricao.value.trim(),
        usuarioId: localStorage.getItem("userId"),
      };

      await API.criarPublicacao(dados);

      Utils.exibirMensagem(
        DOM.mensagem,
        MESSAGES.success.postCreated,
        "sucesso"
      );

      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(
        CONFIG.MESSAGE_DISPLAY_TIME - elapsed,
        1000
      );

      setTimeout(() => {
        Utils.limparFormulario(),
          1500,
          (window.location.href = CONFIG.PERFIL_PAGE);
      }, remainingTime);
    } catch (error) {
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
      const elapsed = Date.now() - startTime;
      const remainingLoaderTime = Math.max(0, CONFIG.MIN_LOADER_TIME - elapsed);

      // if (remainingLoaderTime > 0) {
      //   setTimeout(() => {
      //     Utils.toggleLoader(DOM.btnPublicar, false);
      //   }, remainingLoaderTime);
      // } else {
      //   Utils.toggleLoader(DOM.btnPublicar, false);
      // }
    }
  },
};

const init = () => {
  Handlers.ajustarTextarea();

  if (!Handlers.verificarAutenticacao()) return;
  DOM.form.addEventListener("submit", Handlers.handleSubmit);
  DOM.btnUpload.addEventListener("click", () => DOM.inputUpload.click());

  DOM.inputUpload.addEventListener("change", Handlers.handleUpload);
  DOM.btnDescartar.addEventListener("click", Handlers.handleDescartar);
};

document.addEventListener("DOMContentLoaded", init);
