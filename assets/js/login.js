// js/login.js

document.addEventListener("DOMContentLoaded", () => {
  // === INÍCIO: Lógica para verificar se o usuário já está logado ===
  // Se o token JWT já existir no localStorage, redireciona para a página do feed
  if (localStorage.getItem("jwt_token")) {
    window.location.href = "/pages/feed.html"; // Ajuste o caminho se necessário para a página do feed
    return; // Interrompe a execução do script para não tentar logar novamente
  }
  // === FIM: Lógica para verificar se o usuário já está logado ===

  const CONFIG = {
    // URL do endpoint de login do backend.
    // Confirmado: http://localhost:8080/api/v1/auth/ (com a barra final)
    API_URL: "http://localhost:8080/api/v1/auth/", // <<== AJUSTADO AQUI PARA INCLUIR A BARRA FINAL
    MIN_LOADER_TIME: 1500,
    MESSAGE_DISPLAY_TIME: 1500,
    FEED_PAGE: "/pages/feed.html", // Caminho para a página do feed
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
      // Usando getElementById diretamente e adicionando warnings se não encontrados
      DOM.form = document.getElementById("form-login");
      DOM.btnLogin = document.getElementById("btn-login");
      DOM.email = document.getElementById("email-login");
      DOM.senha = document.getElementById("senha-login");
      DOM.toggleSenha = document.getElementById("toggle-senha");
      DOM.iconeSenha = document.querySelector(".icone-senha-login"); // Usando querySelector para classe
      DOM.mensagem = document.getElementById("mensagem-login");

      // Adição de console.warn para elementos não encontrados para depuração
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
          body: JSON.stringify(dados), // Dados: { email: "...", password: "..." }
        });

        const responseData = await response.json();

        if (!response.ok) {
          // Se a resposta não for 200 OK, lançar um erro
          const error = new Error(
            responseData.message ||
              `Erro do servidor: Status ${response.status}`
          );
          error.status = response.status;
          throw error;
        }
        // Se a resposta.ok for true, retorna os dados (que devem conter o token)
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
      if (!elemento) return; // Garante que o elemento existe
      if (isLoading) {
        elemento.dataset.originalText = elemento.textContent;
        elemento.innerHTML = '<span class="loader"></span>'; // Assumindo que você tem CSS para .loader
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
      event.preventDefault(); // Impede o recarregamento da página
      const startTime = Date.now(); // Correção: 'startime' para 'startTime'

      Utils.toggleLoader(DOM.btnLogin, true); // Ativa o loader no botão

      const dados = {
        email: DOM.email ? DOM.email.value.trim().toLowerCase() : "", // Garante que DOM.email existe
        password: DOM.senha ? DOM.senha.value : "", // Garante que DOM.senha existe
      };

      // === Validações de Entrada ===
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
      // === FIM Validações de Entrada ===

      try {
        const resposta = await API.loginUsuario(dados);

        // === INÍCIO: Lógica para armazenar o JWT ===
        if (resposta.token) {
          // Confirma que o backend retorna o token na chave 'token'
          localStorage.setItem("jwt_token", resposta.token); // <<== AQUI ESTÁ O JWT
          // Se o backend também retorna o ID do usuário separadamente e você precisa, mantenha:
          // localStorage.setItem("userId", resposta.id); // Você pode manter isso se quiser o ID separado
        } else {
          // Se o token não veio na resposta esperada, trate como erro
          throw new Error("Token de autenticação não recebido na resposta.");
        }
        // === FIM: Lógica para armazenar o JWT ===

        Utils.exibirMensagem(
          DOM.mensagem,
          resposta.message || "Login realizado com sucesso!",
          "sucesso"
        );

        const elapsed = Date.now() - startTime; // Correção: 'startime' para 'startTime'
        const remainingLoaderTime = Math.max(
          0,
          CONFIG.MIN_LOADER_TIME - elapsed
        );

        setTimeout(() => {
          Utils.toggleLoader(DOM.btnLogin, false);
          // Redireciona após exibir a mensagem de sucesso e o tempo mínimo do loader
          setTimeout(() => {
            window.location.href = CONFIG.FEED_PAGE;
          }, CONFIG.MESSAGE_DISPLAY_TIME);
        }, remainingLoaderTime);
      } catch (error) {
        Utils.exibirMensagem(
          DOM.mensagem,
          error.message || "Credenciais inválidas. Tente novamente.", // Mensagem genérica para erro no login
          "erro"
        );
      } finally {
        // Sempre limpa a senha após a tentativa, sucesso ou falha
        if (DOM.senha) {
          DOM.senha.value = "";
        }
        // O loader é desativado no finally apenas se não houve erro que o desligou antes
        // Ou em caso de erro na API, para que o loader não fique travado
        if (DOM.btnLogin && DOM.btnLogin.disabled) {
          // Desativa o loader se ainda estiver ativo
          Utils.toggleLoader(DOM.btnLogin, false);
        }
      }
    },
  };

  const init = () => {
    DOM.init(); // Inicializa os elementos DOM

    // Configura listeners e atributos de acessibilidade
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

    // Navegação com Enter
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
  init(); // Chama a função de inicialização
});
