const CONFIG = {
  API_URL: "http://localhost:8080/api/v1/usuarios",
  REDIRECT_DELAY: 2000,
  LOGIN_PAGE: "../pages/login.html",
};

const DOM = {
  form: document.getElementById("form-cadastro"),
  nome: document.getElementById("nome"),
  email: document.getElementById("email-cadastro"),
  senha: document.getElementById("senha"),
  toggleSenha: document.getElementById("toggle-senha"),
  iconeSenha: document.querySelector(".icone-senha-cadastro"),
  mensagem: document.getElementById("mensagem-cadastro"),
  btnCadastro: document.getElementById("btn-cadastro"),
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao cadastrar usuário");
      }

      return await response.json();
    } catch (error) {
      console.error("Erro na API:", error);
      throw error;
    }
  },
};

const Utils = {
  validarEmail: (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  },


  exibirMensagem: (elemento, texto, tipo = "erro") => {
    elemento.textContent = texto;
    elemento.className = tipo;
    elemento.style.display = "block";

    if (tipo === "sucesso") {
      elemento.style.color = "#4CAF50"; //css aqui
    } else {
      elemento.style.color = "#f44336"; //css aqui
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

    DOM.iconeSenha.src = isSenhaVisivel ? IMAGES.show : IMAGES.hide;
    DOM.toggleSenha.setAttribute(
      "aria-label",
      isSenhaVisivel ? "Mostrar senha" : "Ocultar senha"
    );
  },

  handleSubmit: async (event) => {
    event.preventDefault();

    DOM.btnCadastro.disabled = true;
    DOM.btnCadastro.innerHTML = '<span id="btn-texto">Aguarde...</span>';

    const dados = {
      username: DOM.nome.value.trim(),
      email: DOM.email.value.trim(),
      password: DOM.senha.value.trim(),
    };

    try {
      if (!Utils.validarEmail(dados.email)) {
        throw new Error("E-mail inválido. Use o formato exemplo@dominio.com");
      }

      const response = await API.cadastrarUsuario(dados);

      Utils.exibirMensagem(
        DOM.mensagem,
        "Cadastro realizado com sucesso!",
        "sucesso"
      );

      setTimeout(() => {
        window.location.href = CONFIG.LOGIN_PAGE;
      }, CONFIG.REDIRECT_DELAY);
    } catch (error) {
      console.error("Erro no cadastro:", error);
      Utils.exibirMensagem(
        DOM.mensagem,
        error.message || "Erro ao cadastrar. Tente novamente.",
        "erro"
      );
    } finally {
      DOM.btnCadastro.disabled = false;
      DOM.btnCadastro.innerHTML = '<span id="btn-texto">Cadastrar</span>';
    }
  },
};

const init = () => {
  DOM.toggleSenha.addEventListener("click", Handlers.toggleVisibilidadeSenha);
  DOM.form.addEventListener("submit", Handlers.handleSubmit);
  DOM.email.addEventListener("input", (e) => {
    Handlers.validarEmail();
  });

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
