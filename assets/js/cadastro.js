const CONFIG = {
  API_URL: "http://localhost:8080/api/v1/usuarios",

  MIN_LOADER_TIME: 1500,
  MESSAGE_DISPLAY_TIME: 3000,
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
    return (
      document.getElementById("mensagem-cadastro") || {
        textContent: "",
        style: {},
        className: "",
      }
    );
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
  get contadorSenha() {
    return (
      document.getElementById("contador-senha") || {
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

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(
          data.message || "Erro ao processar a solicitação."
        );
        error.status = response.status;
        throw error;
      }

      return data;
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
    elemento.textContent = texto;
    elemento.className = tipo;
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

  atualizarValidacaoSenha: () => {
    const senha = DOM.senha.value;
    DOM.contadorSenha.textContent = `${senha.length}/20`;
  },

  handleSubmit: async (event) => {
    event.preventDefault();
    const startTime = Date.now();

    Utils.toggleLoader(DOM.btnCadastro, true);

    const dados = {
      username: DOM.nome.value.trim(),
      email: DOM.email.value.trim().toLowerCase(),
      password: DOM.senha.value.trim(),
    };

    try {
      if (!dados.username) throw new Error("O nome é obrigatório");
      if (!dados.email) throw new Error("O e-mail é obrigatório");
      if (!dados.password) throw new Error("A senha é obrigatória");
      if (!Utils.validarEmail(dados.email)) {
        throw new Error("Por favor, insira um e-mail válido");
      }
      if (!Utils.validarSenha(dados.password)) {
        throw new Error("A senha deve ter entre 8 e 20 caracteres");
      }

      await Promise.all([
        API.cadastrarUsuario(dados),
        new Promise((resolve) => setTimeout(resolve, CONFIG.MIN_LOADER_TIME)),
      ]);

      Utils.exibirMensagem(
        DOM.mensagem,
        "Cadastro realizado com sucesso!",
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
      let mensagemErro = error.message;

      if (error.status === 500) {
        //mudar com backend
        mensagemErro =
          "Este e-mail já está cadastrado. Por favor, use outro e-mail ou faça login.";
      }

      Utils.exibirMensagem(DOM.mensagem, mensagemErro, "erro");
    } finally {
      const elapsed = Date.now() - startTime;
      const remainingLoaderTime = Math.max(0, CONFIG.MIN_LOADER_TIME - elapsed);

      setTimeout(() => {
        Utils.toggleLoader(DOM.btnCadastro, false);
      }, remainingLoaderTime);
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

  DOM.contadorSenha.textContent = "0/20";
};

document.addEventListener("DOMContentLoaded", init);
