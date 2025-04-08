const CONFIG = {
  API_URL: "http://localhost:8080/api/v1/usuarios",
  MIN_LOADER_TIME: 1500,
  MESSAGE_DISPLAY_TIME: 2000,
  FEED_PAGE: "../pages/feed.html",
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
    const startTime = Date.now();

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

      await Promise.all([
        API.loginUsuario(dados),
        new Promise((resolve) => setTimeout(resolve, CONFIG.MIN_LOADER_TIME)),
      ]);

      Utils.exibirMensagem(DOM.mensagem, MESSAGES.success.login, "sucesso");

      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(
        CONFIG.MESSAGE_DISPLAY_TIME - elapsed,
        1000
      );

      setTimeout(() => {
        window.location.href = CONFIG.FEED_PAGE;
      }, remainingTime);
    } catch (error) {
      let mensagemErro = error.message;

      if (error.status === 401) {
        mensagemErro = MESSAGES.errors.invalidCredentials;
      } else if (error.name === "TypeError") {
        mensagemErro = MESSAGES.errors.networkError;
      }

      Utils.exibirMensagem(DOM.mensagem, mensagemErro, "erro");
    } finally {
      const elapsed = Date.now() - startTime;
      const remainingLoaderTime = Math.max(0, CONFIG.MIN_LOADER_TIME - elapsed);

      setTimeout(() => {
        Utils.toggleLoader(DOM.btnLogin, false);
      }, remainingLoaderTime);
    }
  },

  setupInputValidation: () => {
    DOM.email.addEventListener("input", () => {
      const isValid = Utils.validarEmail(DOM.email.value);
      DOM.email.style.borderColor = isValid
        ? "#4CAF50"
        : DOM.email.value
        ? "#f44336"
        : "";
    });

    DOM.senha.addEventListener("input", () => {
      const hasValue = DOM.senha.value.length > 0;
      DOM.senha.style.borderColor = hasValue ? "#4CAF50" : "";
    });
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
