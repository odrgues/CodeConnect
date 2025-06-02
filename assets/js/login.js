document.addEventListener("DOMContentLoaded", () => {
  const CONFIG = {
    API_URL: "http://localhost:8080/api/v1/usuarios/login",
    MIN_LOADER_TIME: 1500,
    MESSAGE_DISPLAY_TIME: 1500,
    FEED_PAGE: "/pages/feed.html",
  };

  const DOM = {
    form: null,
    btnLogin: null,
    email: null,
    senha: null,
    toggleSenha: null,
    iconeSenha: null,
    mensagem: null,

    init: () => {
      DOM.form = document.getElementById("form-login") || {
        addEventListener: () => {},
        requestSubmit: () => {},
      };

      DOM.btnLogin = document.getElementById("btn-login") || {
        disabled: false,
        innerHTML: "",
        textContent: "",
      };

      DOM.email = document.getElementById("email-login") || {
        value: "",
        addEventListener: () => {},
        focus: () => {},
      };

      DOM.senha = document.getElementById("senha-login") || {
        value: "",
        type: "password",
        addEventListener: () => {},
        focus: () => {},
      };
      DOM.toggleSenha = document.getElementById("toggle-senha") || {
        addEventListener: () => {},
      };
      DOM.iconeSenha = document.querySelector(".icone-senha-login") || {
        src: "",
      };
      DOM.mensagem = document.getElementById("mensagem-login");
      if (!DOM.mensagem) {
        console.warn(
          "Elemento 'mensagem-login' não encontrado. Mensagens de feedback podem não ser exibidas."
        );
      }
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

        const responseData = await response.json();

        if (!response.ok) {
          const error = new Error(
            responseData.message ||
              `Erro do servidor: Status ${response.status}`
          );
          error.status = response.status;
          throw error;
        }
        return responseData;
      } catch (error) {
        console.error("Erro na API de login:", error);
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
      if (!DOM.senha || !DOM.toggleSenha || !DOM.iconeSenha) {
        console.warn("Elementos de senah ou ícone de toggle não encontrados.");
        return;
      }

      const isSenhaVisivel = DOM.senha.type === "text";
      DOM.senha.type = isSenhaVisivel ? "password" : "text";
      DOM.iconeSenha.src = isSenhaVisivel ? IMAGES.hide : IMAGES.show;
    },

    handleSubmit: async (event) => {
      event.preventDefault();
      const startime = Date.now();
      Utils.toggleLoader(DOM.btnLogin, true);
      const dados = {
        email: DOM.email.value.trim().toLowerCase(),
        password: DOM.senha.value,
      };

      if (!dados.email) {
        Utils.exibirMensagem(
          DOM.mensagem,
          "Por favor, insira seu e-mail.",
          "erro"
        );
        if (DOM.email) DOM.email.focus();
        Utils.toggleLoader(DOM.btnLogin, false);
        return;
      }

      if (!dados.password) {
        Utils.exibirMensagem(
          DOM.mensagem,
          "Pro favor, insira sua senha.",
          "erro"
        );

        if (DOM.senha) DOM.senha.focus();
        Utils.toggleLoader(DOM.btnLogin, false);
        return;
      }

      if (!Utils.validarEmail(dados.email)) {
        Utils.exibirMensagem(DOM.mensagem, "E-mail inválido", "erro");
        if (DOM.email) DOM.email.focus();
        Utils.toggleLoader(DOM.btnLogin, false);
        return;
      }

      try {
        const resposta = await API.loginUsuario(dados);
        localStorage.setItem("userId", resposta.id);
        Utils.exibirMensagem(
          DOM.mensagem,
          resposta.message || "Login realizado com sucesso!",
          "sucesso"
        );

        const elapsed = Date.now() - startime;
        const remainingLoaderTime = Math.max(
          0,
          CONFIG.MIN_LOADER_TIME - elapsed
        );

        setTimeout(() => {
          Utils.toggleLoader(DOM.btnLogin, false);
          setTimeout(() => {
            window.location.href = CONFIG.FEED_PAGE;
          }, CONFIG.MESSAGE_DISPLAY_TIME);
        }, remainingLoaderTime);
      } catch (error) {
        Utils.exibirMensagem(
          DOM.mensagem,
          error.message || "Credenciais inválidas. Tente novamente.",
          "erro"
        );
      } finally {
        if (DOM.senha) {
          DOM.senha.value = "";
        }
      }
    },
  };

  const init = () => {
    DOM.init();

    if (DOM.email) {
      DOM.email.setAttribute("aria-label", "Insira seu e-mail");
    }

    if (DOM.senha) {
      DOM.senha.setAttribute("aria-label", "Insira sua senha");
    }

    if (DOM.toggleSenha) {
      DOM.toggleSenha.addEventListener(
        "click",
        Handlers.toggleVisibilidadeSenha
      );
    } else {
      console.warn(
        "Elemento 'toggle-senha' não encontrado. Funcionalidade de toggle de senha desativada."
      );
    }

    if (DOM.form) {
      DOM.form.addEventListener("submit", Handlers.handleSubmit);
    } else {
      console.warn(
        "Elemento 'form-login' não encontrado. Submissão do formulário não funcionará."
      );
    }
    if (DOM.email && DOM.senha) {
      DOM.email.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          DOM.senha.focus();
        }
      });
    }

    if (DOM.senha && DOM.form) {
      DOM.senha.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          DOM.form.requestSubmit();
        }
      });
    }
  };
  init();
});
