//A resposta do botao login está mt rápida, eu preciso mudar isso?


const CONFIG = {
  API_URL: "http://localhost:3000/",
  REDIRECT_DELAY: 2000,
  FEED_PAGE: "../pages/feed.html",
};

const DOM = {
  btnLogin: document.getElementById("btn-login"),
  form: document.getElementById("form-login"),
  email: document.getElementById("email-login"),
  senha: document.getElementById("senha-login"),
  toggleSenha: document.getElementById("toggle-senha"),
  iconeSenha: document.querySelector(".icone-senha-login"),
  mensagem: document.getElementById("mensagem-login"),
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
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao realizar login.");
      }

      return await response.json();
    } catch (error) {
      console.error("Erro na API:", error);
      console.error("Dados enviados: ", dados)
      throw error;
    }
  },
};

const Utils = {
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
    DOM.btnLogin.innerHTML = '<span id="btn-texto">Aguarde...</span>';

    const dados = {
      email: DOM.email.value.trim(),
      password: DOM.senha.value.trim(),
    };

    try {
      const response = await API.loginUsuario(dados);

      Utils.exibirMensagem(
        DOM.mensagem,
        "Login realizado com sucesso!",
        "sucesso"
      );

      setTimeout(() => {
        window.location.href = CONFIG.FEED_PAGE;
      }, CONFIG.REDIRECT_DELAY);
    } catch (error) {
      console.error("Erro no login:", error);
      Utils.exibirMensagem(
        DOM.mensagem,
        error.message || "Erro ao fazer login. Tente novamente.",
        "erro"
      );
    } finally {
      DOM.btnLogin.disabled = false;
      DOM.btnLogin.innerHTML = '<span id="btn-texto">Login</span>';
    }
  },
};

const init = () => {
  if (DOM.toggleSenha) {
    DOM.toggleSenha.addEventListener("click", Handlers.toggleVisibilidadeSenha);
  }

  if (DOM.form) {
    DOM.form.addEventListener("submit", Handlers.handleSubmit);
  }

  DOM.email.addEventListener("keydown", (e) => {
    if (e.key === "Enter") DOM.email.focus();
  });

  DOM.senha.addEventListener("keydown", (e) => {
    if (e.key === "Enter") DOM.senha.focus();
  });
};

document.addEventListener("DOMContentLoaded", init);
