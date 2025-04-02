const CONFIG = {
  API_URL: "http://localhost:8080/api/v1/usuarios/login",
  REDIRECT_DELAY: 3000,
  FEED_PAGE: "../pages/feed.html",
};

const MESSAGES = {
  errors: {
    invalidEmail: "Por favor, insira um e-mail válido.",
    invalidCredentials: "E-mail ou senha incorretos.",
    networkError: "Problema de conexão. Tente novamente.",
    requiredFields: "Todos os campos são obrigatórios.",
    sessionExpired: "Sessão expirada. Faça login novamente.",
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
        style: {},
        innerHTML: "",
      }
    );
  },
  get email() {
    return (
      document.getElementById("email-login") || {
        value: "",
        addEventListener: () => {},
        focus: () => {},
        style: {},
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
        style: {},
      }
    );
  },
  get toggleSenha() {
    return (
      document.getElementById("toggle-senha") || {
        addEventListener: () => {},
        setAttribute: () => {},
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
        style: {},
        className: "",
        setAttribute: () => {},
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
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  exibirMensagem: (elemento, texto, tipo = "erro") => {
    elemento.textContent = texto;
    elemento.className = tipo;
    elemento.style.display = "block";

    if (tipo === "sucesso") {
      elemento.style.color = "#4CAF50";
    } else {
      elemento.style.color = "#f44336";
    }

    setTimeout(() => {
      elemento.style.display = "none";
    }, 5000);
  },
};

const API = {
  async loginUsuario(dados) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(CONFIG.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(dados),
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          //erro pra credenciais invalidas
          throw new Error(MESSAGES.errors.invalidCredentials);
        }
        throw new Error(data.message || MESSAGES.errors.networkError);
      }

      if (data.token) {
        localStorage.setItem("authToken", data.token);
        if (data.usuario) {
          localStorage.setItem("userData", JSON.stringify(data.usuario));
        }
      }

      return data;
    } catch (error) {
      console.error("Erro no login:", error);
      if (error.name === "AbortError") {
        //confirmar com backend
        throw new Error("Tempo de conexão esgotado. Verifique sua internet.");
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  },

  async chamadaAutenticada(url, metodo = "GET", corpo = null) {
    const token = localStorage.getItem("authToken"); //obtem o token
    if (!token) throw new Error(MESSAGES.errors.sessionExpired); //se nao houver token, manda a msg
    const config = {
      // prepara os cabeçalhos da requisicao
      method: metodo,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    if (corpo) config.body = JSON.stringify(corpo); //converte pra json

    const response = await fetch(url, config); //envia a requisitao
    if (response.status === 401) {
      localStorage.removeItem("authToken");
      throw new Error(MESSAGES.errors.sessionExpired);
    }

    return await response.json();
  },
};

const Handlers = {
  toggleVisibilidadeSenha: () => {
    const isSenhaVisivel = DOM.senha.type === "text";
    DOM.senha.type = isSenhaVisivel ? "password" : "text";

    if (DOM.iconeSenha) {
      DOM.iconeSenha.src = isSenhaVisivel ? IMAGES.show : IMAGES.hide;
    }

    DOM.toggleSenha.setAttribute(
      "aria-label",
      isSenhaVisivel ? "Mostrar senha" : "Ocultar senha"
    );
  },

  handleSubmit: async (event) => {
    event.preventDefault();
    DOM.btnLogin.disabled = true;
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

      await API.loginUsuario(dados);
      Utils.exibirMensagem(DOM.mensagem, MESSAGES.success.login, "sucesso");

      setTimeout(() => {
        window.location.href = CONFIG.FEED_PAGE;
      }, CONFIG.REDIRECT_DELAY);
    } catch (error) {
      Utils.exibirMensagem(
        DOM.mensagem,
        error.message || MESSAGES.errors.networkError,
        "erro"
      );
    } finally {
      DOM.btnLogin.disabled = false;
      Utils.toggleLoader(DOM.btnLogin, false);
    }
  },

  //validaçao em tempo real
  setupInputValidation: () => {
    DOM.email.addEventListener("input", () => {
      const isValid = Utils.validarEmail(DOM.email.value);
      DOM.email.style.borderColor = isValid
        ? "#4CAF50" // verde se válido
        : DOM.email.value
        ? "#f44336"
        : ""; // vermelho se inválido
    });

    DOM.senha.addEventListener("input", () => {
      const hasValue = DOM.senha.value.length > 0;
      DOM.senha.style.borderColor = hasValue ? "#f44336" : ""; //verde se preenchido
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
