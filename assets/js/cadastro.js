document.addEventListener("DOMContentLoaded", () => {
  const CONFIG = {
    API_URL: "http://localhost:8080/api/v1/usuarios",
    MIN_LOADER_TIME: 1500,
    MESSAGE_DISPLAY_TIME: 1500,
    LOGIN_PAGE: "../pages/login.html",
  };

  const DOM = {
    get form() {
      return document.getElementById("form-cadastro");
    },
    get nome() {
      return document.getElementById("nome");
    },
    get email() {
      return document.getElementById("email-cadastro");
    },
    get senha() {
      return document.getElementById("senha");
    },
    get toggleSenha() {
      return document.getElementById("toggle-senha");
    },
    get iconeSenha() {
      return document.querySelector(".icone-senha-cadastro");
    },
    get mensagem() {
      return document.getElementById("mensagem-cadastro");
    },
    get btnCadastro() {
      return document.getElementById("btn-cadastro");
    },

    init: () => {
      DOM.form = DOM.form;
      DOM.nome = DOM.nome;
      DOM.email = DOM.email;
      DOM.senha = DOM.senha;
      DOM.toggleSenha = DOM.toggleSenha;
      DOM.iconeSenha = DOM.iconeSenha;
      DOM.mensagem = DOM.mensagem;
      DOM.btnCadastro = DOM.btnCadastro;

      if (!DOM.form) console.warn("Elemento 'form-cadastro' não encontrado.");
      if (!DOM.nome) console.warn("Elemento 'nome' não encontrado.");
      if (!DOM.email) console.warn("Elemento 'email-cadastro' não encontrado.");
      if (!DOM.senha) console.warn("Elemento 'senha' não encontrado.");
      if (!DOM.toggleSenha)
        console.warn("Elemento 'toggle-senha' não encontrado.");
      if (!DOM.iconeSenha)
        console.warn("Elemento '.icone-senha-cadastro' não encontrado.");
      if (!DOM.mensagem)
        console.warn("Elemento 'mensagem-cadastro' não encontrado.");
      if (!DOM.btnCadastro)
        console.warn("Elemento 'btn-cadastro' não encontrado.");
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
            resposta.message || `Erro do servidor: Status ${response.status}`
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
      if (!elemento) return;

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
      if (!DOM.senha || !DOM.iconeSenha) {
        console.warn(
          "Elementos de senha ou ícone não encontrados para toggle."
        );
        return;
      }

      const isSenhaVisivel = DOM.senha.type === "text";
      DOM.senha.type = isSenhaVisivel ? "password" : "text";
      DOM.iconeSenha.src = isSenhaVisivel ? IMAGES.hide : IMAGES.show;
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

      if (!dados.name) {
        Utils.exibirMensagem(
          DOM.mensagem,
          "Por favor, preencha o nome.",
          "erro"
        );
        if (DOM.nome) DOM.nome.focus();
        Utils.toggleLoader(DOM.btnCadastro, false);
        return;
      }

      if (!Utils.validarEmail(dados.email)) {
        Utils.exibirMensagem(DOM.mensagem, "E-mail inválido.", "erro");
        if (DOM.email) DOM.email.focus();
        Utils.toggleLoader(DOM.btnCadastro, false);
        return;
      }

      if (!Utils.validarSenha(dados.password)) {
        Utils.exibirMensagem(
          DOM.mensagem,
          "A senha deve ter entre 8 e 20 caracteres.",
          "erro"
        );
        if (DOM.senha) DOM.senha.focus();
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
        const remainingLoaderTime = Math.max(
          0,
          CONFIG.MIN_LOADER_TIME - elapsed
        );

        setTimeout(() => {
          Utils.toggleLoader(DOM.btnCadastro, false);
          setTimeout(() => {
            window.location.href = CONFIG.LOGIN_PAGE;
          }, CONFIG.MESSAGE_DISPLAY_TIME);
        }, remainingLoaderTime);
      } catch (error) {
        Utils.exibirMensagem(
          DOM.mensagem,
          error.message || "Erro ao cadastrar. Tente novamente.",
          "erro"
        );
        Utils.toggleLoader(DOM.btnCadastro, false);
      } finally {
        if (DOM.senha) {
          DOM.senha.value = "";
        }
      }
    },
  };

  const init = () => {
    DOM.init();

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
        "Elemento 'form-cadastro' não encontrado. Submissão do formulário não funcionará."
      );
    }

    if (DOM.nome && DOM.email) {
      DOM.nome.addEventListener("keydown", (e) => {
        if (e.key === "Enter") DOM.email.focus();
      });
    }

    if (DOM.email && DOM.senha) {
      DOM.email.addEventListener("keydown", (e) => {
        if (e.key === "Enter") DOM.senha.focus();
      });
    }

    if (DOM.senha && DOM.form) {
      DOM.senha.addEventListener("keydown", (e) => {
        if (e.key === "Enter") DOM.form.requestSubmit();
      });
    }
  };

  init();
});
