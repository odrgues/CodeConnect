const CONFIG = {
  API_URL: "http://localhost:8080/api/v1/usuarios ",

  MIN_LOADER_TIME: 1500,
  MESSAGE_DISPLAY_TIME: 1500,
  LOGIN_PAGE: "../pages/login.html",
};

const DOM = {
  get form() {
    return (
      document.getElementById("form-cadastro") || {
        addEventListener: () => {},
        requestSubmit: () => {},
      }
    );
  },
  get nome() {
    return (
      document.getElementById("nome") || {
        value: "",
        addEventListener: () => {},
        focus: () => {},
      }
    );
  },
  get email() {
    return (
      document.getElementById("email-cadastro") || {
        value: "",
        addEventListener: () => {},
        focus: () => {},
      }
    );
  },
  get senha() {
    return (
      document.getElementById("senha") || {
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
      document.querySelector(".icone-senha-cadastro") || {
        src: "",
      }
    );
  },
  get mensagem() {
    return document.getElementById("mensagem-cadastro");
  },
  get btnCadastro() {
    return (
      document.getElementById("btn-cadastro") || {
        disabled: false,
        innerHTML: "",
        textContent: "",
      }
    );
  },
};

const IMAGES = {
  show: "../assets/img/cadastro-login/visibility.png",
  hide: "../assets/img/cadastro-login/visibility_off.png",
};

const API = {
  cadastrarUsuario: async (dados) => {
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
  validarSenha: (senha) => {
    return senha.length >= 8 && senha.length <= 20;
  },

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
      elemento.textContent = elemento.dataset.originalText || "Cadastrar";
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

    Utils.toggleLoader(DOM.btnCadastro, true);

    const dados = {
      name: DOM.nome.value.trim(),
      email: DOM.email.value.trim().toLowerCase(),
      password: DOM.senha.value.trim(),
    };

    if (!dados.name || !dados.email || !dados.password) {
      Utils.exibirMensagem(DOM.mensagem, "Preencha todos os campos", "erro");
      Utils.toggleLoader(DOM.btnCadastro, false);
      return;
    }

    if (!Utils.validarEmail(dados.email)) {
      Utils.exibirMensagem(DOM.mensagem, "E-mail inválido", "erro");
      Utils.toggleLoader(DOM.btnCadastro, false);
      return;
    }

    if (!Utils.validarSenha(dados.password)) {
      Utils.exibirMensagem(
        DOM.mensagem,
        "Senha deve ter 8-20 caracteres",
        "erro"
      );
      Utils.toggleLoader(DOM.btnCadastro, false);
      return;
    }

    try {
      const resposta = await API.cadastrarUsuario(dados);

      Utils.exibirMensagem(
        DOM.mensagem,
        resposta.message || "Cadastro realizado com sucesso!",
        "sucesso"
      );

      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(
        CONFIG.MESSAGE_DISPLAY_TIME - elapsed,
        1000
      );

      setTimeout(() => {
        window.location.href = CONFIG.LOGIN_PAGE;
      }, remainingTime);
    } catch (error) {
      Utils.exibirMensagem(
        DOM.mensagem,
        error.message || "Erro ao cadastrar",
        "erro"
      );
    } finally {
      const elapsed = Date.now() - startTime;
      const remainingLoaderTime = Math.max(0, CONFIG.MIN_LOADER_TIME - elapsed);

      if (remainingLoaderTime > 0) {
        setTimeout(() => {
          Utils.toggleLoader(DOM.btnCadastro, false);
        }, remainingLoaderTime);
      } else {
        Utils.toggleLoader(DOM.btnCadastro, false);
      }

      DOM.senha.value = "";
    }
  },
};
const init = () => {
  if (!DOM.form) return;

  DOM.toggleSenha.addEventListener("click", Handlers.toggleVisibilidadeSenha);
  DOM.form.addEventListener("submit", Handlers.handleSubmit);
  DOM.senha.addEventListener("input", Handlers.atualizarValidacaoSenha);

  DOM.nome.addEventListener("keydown", (e) => {
    if (e.key === "Enter") DOM.email.focus();
  });

  DOM.email.addEventListener("keydown", (e) => {
    if (e.key === "Enter") DOM.senha.focus();
  });

  DOM.senha.addEventListener("keydown", (e) => {
    if (e.key === "Enter") DOM.form.requestSubmit();
  });
};

document.addEventListener("DOMContentLoaded", init);
