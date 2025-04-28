const CONFIG = {
  API_PUBLICACAO_URL: "",
  LOGIN_PAGE: "../pages/login.html",
  MIN_LOADER_TIME: 1500,
  MESSAGE_DISPLAY_TIME: 3000,
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
  form: document.querySelector("form"),
  nomeProjeto: document.getElementById("nome"),
  descricao: document.getElementById("descricao"),
  mensagem: document.getElementById("mensagem-erro-sucesso"),
  btnPublicar: document.getElementById("btn-publicar"),
  btnDescartar: document.getElementById("btn-descartar"),
  uploadBtn: document.getElementById("upload-btn"),
  inputUpload: document.getElementById("image-upload"),
  imagemPrincipal: document.querySelector(".main-imagem"),
  nomeImagem: document.querySelector(".container-imagem-nome p"),
};

const Utils = {
  exibirMensagem: (elemento, texto, tipo = "erro") => {
    elemento.textContent = texto;
    elemento.className = tipo;
    elemento.style.display = "block";
    setTimeout(
      () => (elemento.style.display = "none"),
      CONFIG.MESSAGE_DISPLAY_TIME
    );
  },

  // toggleLoader: (elemento, isLoading) => {
  //   if (isLoading) {
  //     elemento.dataset.originalText = elemento.textContent;
  //     elemento.innerHTML = '<span class="loader"></span>';
  //     elemento.disabled = true;
  //   } else {
  //     elemento.textContent = elemento.dataset.originalText || "Publicar";
  //     elemento.disabled = false;
  //   }
  // },

  validarFormulario: () => {
    let valido = true;

    if (!DOM.nomeProjeto.value.trim()) {
      DOM.nomeProjeto.classList.add("campo-invalido");
      valido = false;
    } else {
      DOM.nomeProjeto.classList.remove("campo-invalido");
    }

    if (!DOM.descricao.value.trim()) {
      DOM.descricao.classList.add("campo-invalido");
      valido = false;
    } else {
      DOM.descricao.classList.remove("campo-invalido");
    }

    if (!DOM.imagemPrincipal.src.includes("data:image")) {
      DOM.inputUpload.classList.add("campo-invalido");
      valido = false;
    } else {
      DOM.inputUpload.classList.remove("campo-invalido");
    }

    return valido;
  },

  lerArquivo: (arquivo) => {
    return new Promise((resolve, reject) => {
      const leitor = new FileReader();
      leitor.onload = () => resolve({ url: leitor.result, nome: arquivo.name });
      leitor.onerror = () => reject(MESSAGES.errors.invalidImage);
      leitor.readAsDataURL(arquivo);
    });
  },

  limparFormulario: () => {
    DOM.nomeProjeto.value = "";
    DOM.descricao.value = "";
    DOM.imagemPrincipal.src = "/assets/img/publicacao/imagem1.png";
    DOM.nomeImagem.textContent = "image_projeto.png";
  },
};

DOM.imagemPrincipal.src = "/assets/img/publicacao/imagem1.png";

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

  handleDescartar: () => {
    Utils.limparFormulario();
  },

  handleSubmit: async (event) => {
    event.preventDefault();
    const startTime = Date.now();
    Utils.toggleLoader(DOM.btnPublicar, true);

    try {
      if (!Utils.validarFormulario()) {
        throw new Error(MESSAGES.errors.requiredFields);
      }

      const dados = {
        nome: DOM.nomeProjeto.value.trim(),
        descricao: DOM.descricao.value.trim(),
        imagem: DOM.imagemPrincipal.src,
        // tags: Tags.obterTagsSelecionadas(),
        usuarioId: localStorage.getItem("userId"),
        data: new Date().toISOString(),
      };

      const response = await fetch(CONFIG.API_PUBLICACAO_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || MESSAGES.errors.serverError);
      }

      Utils.exibirMensagem(
        DOM.mensagem,
        MESSAGES.success.postCreated,
        "sucesso"
      );
      setTimeout(() => Utils.limparFormulario(), 1500);
    } catch (error) {
      Utils.exibirMensagem(
        DOM.mensagem,
        error.message || MESSAGES.errors.serverError,
        "erro"
      );
    } finally {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, CONFIG.MIN_LOADER_TIME - elapsed);
      setTimeout(
        () => Utils.toggleLoader(DOM.btnPublicar, false),
        remainingTime
      );
    }
  },
};

const textarea = document.getElementById("descricao");

textarea.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
});

const init = () => {
  // Verifica login
  if (!Handlers.verificarAutenticacao()) return;

  DOM.uploadBtn.addEventListener("click", () => DOM.inputUpload.click());
  DOM.inputUpload.addEventListener("change", Handlers.handleUpload);
  DOM.btnDescartar.addEventListener("click", Handlers.handleDescartar);

  DOM.form.addEventListener("submit", Handlers.handleSubmit);
};

document.addEventListener("DOMContentLoaded", init);
