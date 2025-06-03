document.addEventListener("DOMContentLoaded", () => {
<<<<<<< HEAD
  if (localStorage.getItem("jwt_token")) {
    window.location.href = "/pages/feed.html";
    return;
  }

  const CONFIG = {
    API_URL: "http://localhost:8080/api/v1/auth",
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
      DOM.form = document.getElementById("form-login");
      DOM.btnLogin = document.getElementById("btn-login");
      DOM.email = document.getElementById("email-login");
      DOM.senha = document.getElementById("senha-login");
      DOM.toggleSenha = document.getElementById("toggle-senha");
      DOM.iconeSenha = document.querySelector(".icone-senha-login");
      DOM.mensagem = document.getElementById("mensagem-login");

      if (!DOM.form) console.warn("Elemento 'form-login' não encontrado.");
      if (!DOM.btnLogin) console.warn("Elemento 'btn-login' não encontrado.");
      if (!DOM.email) console.warn("Elemento 'email-login' não encontrado.");
      if (!DOM.senha) console.warn("Elemento 'senha-login' não encontrado.");
      if (!DOM.toggleSenha)
        console.warn("Elemento 'toggle-senha' não encontrado.");
      if (!DOM.iconeSenha)
        console.warn("Elemento '.icone-senha-login' não encontrado.");
      if (!DOM.mensagem)
        console.warn("Elemento 'mensagem-login' não encontrado.");
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

=======
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

>>>>>>> master
        const responseData = await response.json();

        if (!response.ok) {
          const error = new Error(
            responseData.message ||
              `Erro do servidor: Status ${response.status}`
          );
          error.status = response.status;
          throw error;
        }
<<<<<<< HEAD

=======
>>>>>>> master
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
<<<<<<< HEAD
      if (!elemento) return;
=======
>>>>>>> master
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
<<<<<<< HEAD
        console.warn("Elementos de senha ou ícone de toggle não encontrados.");
=======
        console.warn("Elementos de senah ou ícone de toggle não encontrados.");
>>>>>>> master
        return;
      }

      const isSenhaVisivel = DOM.senha.type === "text";
      DOM.senha.type = isSenhaVisivel ? "password" : "text";
      DOM.iconeSenha.src = isSenhaVisivel ? IMAGES.hide : IMAGES.show;
    },

    handleSubmit: async (event) => {
      event.preventDefault();
<<<<<<< HEAD
      const startTime = Date.now();

      Utils.toggleLoader(DOM.btnLogin, true);

      const dados = {
        email: DOM.email ? DOM.email.value.trim().toLowerCase() : "",
        password: DOM.senha ? DOM.senha.value : "",
=======
      const startime = Date.now();
      Utils.toggleLoader(DOM.btnLogin, true);
      const dados = {
        email: DOM.email.value.trim().toLowerCase(),
        password: DOM.senha.value,
>>>>>>> master
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
<<<<<<< HEAD
          "Por favor, insira sua senha.",
          "erro"
        );
=======
          "Pro favor, insira sua senha.",
          "erro"
        );

>>>>>>> master
        if (DOM.senha) DOM.senha.focus();
        Utils.toggleLoader(DOM.btnLogin, false);
        return;
      }

      if (!Utils.validarEmail(dados.email)) {
<<<<<<< HEAD
        Utils.exibirMensagem(DOM.mensagem, "E-mail inválido.", "erro");
=======
        Utils.exibirMensagem(DOM.mensagem, "E-mail inválido", "erro");
>>>>>>> master
        if (DOM.email) DOM.email.focus();
        Utils.toggleLoader(DOM.btnLogin, false);
        return;
      }

      try {
        const resposta = await API.loginUsuario(dados);
<<<<<<< HEAD

        if (resposta.token) {
          localStorage.setItem("jwt_token", resposta.token);
        } else {
          throw new Error("Token de autenticação não recebido na resposta.");
        }

=======
        localStorage.setItem("userId", resposta.id);
>>>>>>> master
        Utils.exibirMensagem(
          DOM.mensagem,
          resposta.message || "Login realizado com sucesso!",
          "sucesso"
        );

<<<<<<< HEAD
        const elapsed = Date.now() - startTime;
=======
        const elapsed = Date.now() - startime;
>>>>>>> master
        const remainingLoaderTime = Math.max(
          0,
          CONFIG.MIN_LOADER_TIME - elapsed
        );

        setTimeout(() => {
          Utils.toggleLoader(DOM.btnLogin, false);
<<<<<<< HEAD

=======
>>>>>>> master
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
<<<<<<< HEAD

        if (DOM.btnLogin && DOM.btnLogin.disabled) {
          Utils.toggleLoader(DOM.btnLogin, false);
        }
=======
>>>>>>> master
      }
    },
  };

  const init = () => {
    DOM.init();

<<<<<<< HEAD
    if (DOM.email) DOM.email.setAttribute("aria-label", "Insira seu e-mail");
    if (DOM.senha) DOM.senha.setAttribute("aria-label", "Insira sua senha");

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

=======
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

>>>>>>> master
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
