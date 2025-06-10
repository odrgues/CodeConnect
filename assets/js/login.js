document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("jwt_token")) {
    window.location.href = "/pages/feed.html";
    return;
  }

  const CONFIG = {
    API_URL: "https://codeconnect-production-ac3a.up.railway.app/api/v1/auth",
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
      if (!elemento) return;
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
        console.warn("Elementos de senha ou ícone de toggle não encontrados.");
        return;
      }

      const isSenhaVisivel = DOM.senha.type === "text";
      DOM.senha.type = isSenhaVisivel ? "password" : "text";
      DOM.iconeSenha.src = isSenhaVisivel ? IMAGES.hide : IMAGES.show;
    },

    handleSubmit: async (event) => {
      event.preventDefault();
      const startTime = Date.now();

      Utils.toggleLoader(DOM.btnLogin, true);

      const dados = {
        email: DOM.email ? DOM.email.value.trim().toLowerCase() : "",
        password: DOM.senha ? DOM.senha.value : "",
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
          "Por favor, insira sua senha.",
          "erro"
        );
        if (DOM.senha) DOM.senha.focus();
        Utils.toggleLoader(DOM.btnLogin, false);
        return;
      }

      if (!Utils.validarEmail(dados.email)) {
        Utils.exibirMensagem(DOM.mensagem, "E-mail inválido.", "erro");
        if (DOM.email) DOM.email.focus();
        Utils.toggleLoader(DOM.btnLogin, false);
        return;
      }

      try {
        const resposta = await API.loginUsuario(dados);

        if (resposta.token) {
          localStorage.setItem("jwt_token", resposta.token);
        } else {
          throw new Error("Token de autenticação não recebido na resposta.");
        }

        if (resposta.id) {
          localStorage.setItem("userId", resposta.id);
          console.log("Login JS: userId salvo:", resposta.id);
        } else {
          console.warn("Login JS: 'id' não encontrado na resposta do backend.");
        }

        if (resposta.name) {
          localStorage.setItem("userName", resposta.name);
          console.log("Login JS: userName salvo (do 'name'):", resposta.name);
        } else if (resposta.userName) {
          localStorage.setItem("userName", resposta.userName);
          console.log(
            "Login JS: userName salvo (do 'userName'):",
            resposta.userName
          );
        } else {
          console.warn(
            "Login JS: 'name' ou 'userName' não encontrado na resposta do backend."
          );
        }

        Utils.exibirMensagem(
          DOM.mensagem,
          resposta.message || "Login realizado com sucesso!",
          "sucesso"
        );

        const elapsed = Date.now() - startTime;
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
          "Erro ao fazer login. Tente novamente.",
          "erro"
        );
      } finally {
        if (DOM.senha) {
          DOM.senha.value = "";
        }

        if (DOM.btnLogin && DOM.btnLogin.disabled) {
          Utils.toggleLoader(DOM.btnLogin, false);
        }
      }
    },
  };

  const init = () => {
    DOM.init();

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
