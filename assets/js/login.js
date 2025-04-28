const CONFIG = {
  API_URL: "http://localhost:8080/api/v1/usuarios",
  MIN_LOADER_TIME: 1500,
  MESSAGE_DISPLAY_TIME: 2000,
  PUBLICAR_PAGE: "../pages/publicar.html",
};

const MESSAGES = {
  errors: {
    invalidEmail: "Por favor, insira um e-mail válido.",
    invalidCredentials: "E-mail ou senha incorretos.",
    networkError: "Problema de conexão. Tente novamente.",
    requiredFields: "Todos os campos são obrigatórios.",
  },
  success: {
    login: "Login realizado com sucesso!",
  },
};

const DOM = {
  get form() {
    return (
      document.getElementById("form-login") || {
        addEventListener: () => {},
        requestSubmit: () => {},
      }
    );
  },
  get btnLogin() {
    return (
      document.getElementById("btn-login") || {
        disabled: false,
        innerHTML: "",
        textContent: "",
      }
    );
  },
  get email() {
    return (
      document.getElementById("email-login") || {
        value: "",
        addEventListener: () => {},
        focus: () => {},
      }
    );
  },
  get senha() {
    return (
      document.getElementById("senha-login") || {
        value: "",
        type: "password",
        addEventListener: () => {},
        focus: () => {},
      }
    );
  },
  get toggleSenha() {
    return (
      document.getElementById("toggle-senha") || {
        addEventListener: () => {},
      }
    );
  },
  get iconeSenha() {
    return (
      document.querySelector(".icone-senha-login") || {
        src: "",
      }
    );
  },
  get mensagem() {
    return (
      document.getElementById("mensagem-login") || {
        textContent: "",
        className: "",
      }
    );
  },
};

const IMAGES = {
  show: "../assets/img/cadastro-login/visibility.png",
  hide: "../assets/img/cadastro-login/visibility_off.png",
};

const Utils = {
  validarEmail: (email) => {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(email);
  },

  exibirMensagem: (elemento, texto, tipo = "erro") => {
    elemento.textContent = texto;
    elemento.className = `mensagem-flutuante ${
      tipo === "sucesso" ? "mensagem-sucesso" : "mensagem-erro"
    }`;
    elemento.style.display = "block";

    setTimeout(
      () => {
        elemento.style.display = "none";
      },
      tipo === "sucesso" ? CONFIG.MESSAGE_DISPLAY_TIME : 5000
    );
  },

  toggleLoader: (elemento, isLoading) => {
    if (isLoading) {
      elemento.dataset.originalText = elemento.textContent;
      elemento.innerHTML =
        '<span class="loader-spinner"><span class="spinner-inner"></span></span>';
      elemento.disabled = true;
    } else {
      elemento.textContent = elemento.dataset.originalText || "Entrar";
      elemento.disabled = false;
    }
  },
};

const API = {
  loginUsuario: async (dados) => {
    try {
      const response = await fetch(`${CONFIG.API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(dados),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || MESSAGES.errors.networkError);
        error.status = response.status;
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  },
};

const Handlers = {
  toggleVisibilidadeSenha: () => {
    const isSenhaVisivel = DOM.senha.type === "text";
    DOM.senha.type = isSenhaVisivel ? "password" : "text";
    DOM.iconeSenha.src = isSenhaVisivel ? IMAGES.show : IMAGES.hide;
  },

  handleSubmit: async (event) => {
    event.preventDefault();
    Utils.toggleLoader(DOM.btnLogin, true);

    const dados = {
      email: DOM.email.value.trim(),
      password: DOM.senha.value.trim(),
    };

    try {
      if (!dados.email || !dados.password) {
        throw new Error(MESSAGES.errors.requiredFields);
      }

      if (!Utils.validarEmail(dados.email)) {
        throw new Error(MESSAGES.errors.invalidEmail);
      }

      const data = await API.loginUsuario(dados);

      localStorage.setItem("userId", data.id);
      Utils.exibirMensagem(DOM.mensagem, MESSAGES.success.login, "sucesso");

      setTimeout(() => (window.location.href = CONFIG.PUBLICAR_PAGE), 1500);
    } catch (error) {
      let mensagemErro;

      if (error.name === "TypeError") {
        mensagemErro = MESSAGES.errors.networkError;
      } else {
        mensagemErro = error.message;
      }

      Utils.exibirMensagem(DOM.mensagem, mensagemErro, "erro");
    } finally {
      Utils.toggleLoader(DOM.btnLogin, false);
    }
  },
};
const init = () => {
  DOM.email.setAttribute("aria-label", "Insira seu e-mail");
  DOM.senha.setAttribute("aria-label", "Insira sua senha");
  DOM.mensagem.setAttribute("role", "alert");

  DOM.toggleSenha.addEventListener("click", Handlers.toggleVisibilidadeSenha);
  DOM.form.addEventListener("submit", Handlers.handleSubmit);
  Handlers.setupInputValidation();

  DOM.email.addEventListener("keydown", (e) => {
    if (e.key === "Enter") DOM.senha.focus();
  });

  DOM.senha.addEventListener("keydown", (e) => {
    if (e.key === "Enter") DOM.form.requestSubmit();
  });
};

document.addEventListener("DOMContentLoaded", init);
