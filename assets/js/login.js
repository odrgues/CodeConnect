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
    console.log("API: Iniciando requisição de login...");
    console.log("API: Dados enviados:", dados); // Mostra o email e senha que estão sendo enviados
    try {
      const response = await fetch(CONFIG.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(dados),
      });

      console.log("API: Resposta HTTP (objeto Response):", response); // Loga o objeto Response completo
      if (!response.ok) {
        // Se a resposta não for OK (status 4xx, 5xx), tenta ler o erro do corpo
        const errorData = await response.json();
        console.error(
          "API: Erro na resposta da API (JSON de erro):",
          errorData
        );
        const error = new Error(
          errorData.message || "Erro ao processar a solicitação."
        );
        error.status = response.status;
        throw error;
      }

      const resposta = await response.json();
      console.log("API: Resposta da API (JSON de sucesso):", resposta); // Loga o corpo da resposta JSON já parseado
      return resposta;
    } catch (error) {
      console.error("API: Erro capturado na requisição de login:", error);
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
    console.log(`Utils: Exibindo mensagem - Tipo: ${tipo}, Texto: "${texto}"`);
    elemento.textContent = texto;
    elemento.className = `mensagem-${tipo}`;
    elemento.style.display = "block";

    setTimeout(
      () => {
        elemento.style.display = "none";
        console.log(`Utils: Mensagem "${texto}" ocultada.`);
      },
      tipo === "sucesso" ? CONFIG.MESSAGE_DISPLAY_TIME : 3000
    );
  },

  toggleLoader: (elemento, isLoading) => {
    console.log(`Utils: Toggle Loader - isLoading: ${isLoading}`);
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
    console.log("Handlers: Alternando visibilidade da senha.");
    const isSenhaVisivel = DOM.senha.type === "text";
    DOM.senha.type = isSenhaVisivel ? "password" : "text";
    DOM.iconeSenha.src = isSenhaVisivel ? IMAGES.show : IMAGES.hide;
  },

  handleSubmit: async (event) => {
    event.preventDefault();
    console.log("Handlers: Formulário de login submetido.");
    const startTime = Date.now();

    Utils.toggleLoader(DOM.btnLogin, true);
    const dados = {
      email: DOM.email.value.trim(),
      password: DOM.senha.value,
    };

    console.log("Handlers: Dados do formulário para validação:", dados);

    if (!dados.email || !dados.password) {
      Utils.exibirMensagem(DOM.mensagem, "Preencha todos os campos", "erro");
      Utils.toggleLoader(DOM.btnLogin, false);
      console.log("Handlers: Validação falhou - campos vazios.");
      return;
    }

    if (!Utils.validarEmail(dados.email)) {
      Utils.exibirMensagem(DOM.mensagem, "E-mail inválido", "erro");
      Utils.toggleLoader(DOM.btnLogin, false);
      console.log("Handlers: Validação falhou - e-mail inválido.");
      return;
    }

    try {
      const resposta = await API.loginUsuario(dados);

      // --- Ponto Crítico de Depuração ---
      console.log(
        "Handlers: Resposta recebida da API para processamento:",
        resposta
      );
      console.log(
        "Handlers: Valor de resposta.id ANTES de salvar no localStorage:",
        resposta.id
      );

      localStorage.setItem("userId", resposta.id);
      console.log(
        "Handlers: userId salvo no localStorage:",
        localStorage.getItem("userId")
      ); // Verifica o que foi salvo
      // --- Fim do Ponto Crítico ---

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

      console.log(
        `Handlers: Redirecionando para ${CONFIG.FEED_PAGE} em ${remainingTime}ms.`
      );
      setTimeout(() => {
        window.location.href = CONFIG.FEED_PAGE;
      }, remainingTime);
    } catch (error) {
      console.error("Handlers: Erro no handleSubmit (capturado):", error);
      Utils.exibirMensagem(
        DOM.mensagem,
        error.message || "Erro desconhecido",
        "erro"
      );
    } finally {
      console.log("Handlers: Bloco finally do handleSubmit.");
      const elapsed = Date.now() - startTime;
      const remainingLoaderTime = Math.max(0, CONFIG.MIN_LOADER_TIME - elapsed);

      if (remainingLoaderTime > 0) {
        setTimeout(() => {
          Utils.toggleLoader(DOM.btnLogin, false);
          console.log("Handlers: Loader desativado após delay.");
        }, remainingLoaderTime);
      } else {
        Utils.toggleLoader(DOM.btnLogin, false);
        console.log("Handlers: Loader desativado imediatamente.");
      }
    }
  },
};

const init = () => {
  console.log("Init: Inicializando event listeners...");
  DOM.email.setAttribute("aria-label", "Insira seu e-mail");
  DOM.senha.setAttribute("aria-label", "Insira sua senha");
  DOM.toggleSenha.addEventListener("click", Handlers.toggleVisibilidadeSenha);
  DOM.form.addEventListener("submit", Handlers.handleSubmit);

  DOM.email.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      DOM.senha.focus();
      console.log("Init: Enter pressionado no email, foco na senha.");
    }
  });

  DOM.senha.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      DOM.form.requestSubmit();
      console.log("Init: Enter pressionado na senha, submetendo formulário.");
    }
  });
  console.log("Init: Event listeners configurados.");
};

document.addEventListener("DOMContentLoaded", init);
