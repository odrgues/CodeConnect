const CONFIG = {
  API_URL: "http://localhost:8080/api/v1/usuarios/login",
  MIN_LOADER_TIME: 1500,
  MESSAGE_DISPLAY_TIME: 1500,
  FEED_PAGE: "/pages/feed.html",
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
    return document.getElementById("mensagem-login");
  },
};

const IMAGES = {
  show: "../assets/img/cadastro-login/visibility.png",
  hide: "../assets/img/cadastro-login/visibility_off.png",
};
const API = {
  loginUsuario: async (dados) => {
    try {
      const response = await fetch(CONFIG.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(dados),
      });

      const resposta = await response.json();

      if (!response.ok) {
        const error = new Error(
          resposta.message || "Erro ao processar a solicitação."
        );
        error.status = response.status;
        throw error;
      }

      return resposta;
    } catch (error) {
      console.error("Erro na API:", error);
      throw error;
    }
  },
};

const Utils = {
  validarEmail: (email) => {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(email);
  },

  exibirMensagem: (elemento, texto, tipo = "erro") => {
    if (!elemento) return;

    elemento.textContent = texto;
    elemento.className = `mensagem-${tipo}`;
    elemento.style.display = "block";

    setTimeout(
      () => {
        elemento.style.display = "none";
      },
      tipo === "sucesso" ? CONFIG.MESSAGE_DISPLAY_TIME : 3000
    );
  },

  toggleLoader: (elemento, isLoading) => {
    if (isLoading) {
      elemento.dataset.originalText = elemento.textContent;
      elemento.innerHTML = '<span class="loader"></span>';
      elemento.disabled = true;
    } else {
      elemento.textContent = elemento.dataset.originalText || "Entrar";
      elemento.disabled = false;
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
      password: DOM.senha.value,
    };

    if (!dados.email || !dados.password) {
      Utils.exibirMensagem(DOM.mensagem, "Preencha todos os campos", "erro");
      Utils.toggleLoader(DOM.btnLogin, false);
      return;
    }

    if (!Utils.validarEmail(dados.email)) {
      Utils.exibirMensagem(DOM.mensagem, "E-mail inválido", "erro");
      Utils.toggleLoader(DOM.btnLogin, false);
      return;
    }

    try {
      const resposta = await API.loginUsuario(dados);

      localStorage.setItem("userId", resposta.id);
      Utils.exibirMensagem(
        DOM.mensagem,
        resposta.message || "Login realizado!",
        "sucesso"
      );

      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(
        CONFIG.MESSAGE_DISPLAY_TIME - elapsed,
        1000
      );

      setTimeout(() => {
        window.location.href = CONFIG.FEED_PAGE;
      }, remainingTime);
    } catch (error) {
      Utils.exibirMensagem(
        DOM.mensagem,
        error.message || "Erro desconhecido",
        "erro"
      );
    } finally {
      const elapsed = Date.now() - startTime;
      const remainingLoaderTime = Math.max(0, CONFIG.MIN_LOADER_TIME - elapsed);

      if (remainingLoaderTime > 0) {
        setTimeout(() => {
          Utils.toggleLoader(DOM.btnLogin, false);
        }, remainingLoaderTime);
      } else {
        Utils.toggleLoader(DOM.btnLogin, false);
      }
    }
  },
};
const init = () => {
  DOM.email.setAttribute("aria-label", "Insira seu e-mail");
  DOM.senha.setAttribute("aria-label", "Insira sua senha");
  DOM.toggleSenha.addEventListener("click", Handlers.toggleVisibilidadeSenha);
  DOM.form.addEventListener("submit", Handlers.handleSubmit);

  DOM.email.addEventListener("keydown", (e) => {
    if (e.key === "Enter") DOM.senha.focus();
  });

  DOM.senha.addEventListener("keydown", (e) => {
    if (e.key === "Enter") DOM.form.requestSubmit();
  });
};

document.addEventListener("DOMContentLoaded", init);
