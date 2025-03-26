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
  // requisitosSenha: {
  //   tamanho: document.getElementById("req-tamanho"),
  //   maiuscula: document.getElementById("req-maiuscula"),
  //   especial: document.getElementById("req-especial"),
  // },
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
  // validarEmail: (email) => {
  //   const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  //   return regex.test(email);
  // },

  // validarSenha: (senha) => {
  //   const temTamanho = senha.length >= 8 && senha.length <= 20;
  //   const temMaiuscula = /[A-Z]/.test(senha);
  //   const temEspecial = /[!@#$%^&*()_.]/.test(senha);
  //   return {
  //     temTamanho,
  //     temMaiuscula,
  //     temEspecial,
  //     valida: temTamanho && temMaiuscula && temEspecial,
  //   };
  // },

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

  // atualizarRequisitosSenha: (senha) => {
  //   const { temTamanho, temMaiuscula, temEspecial } = Utils.validarSenha(senha);

  //   DOM.requisitosSenha.tamanho.setAttribute("data-valido", temTamanho);
  //   DOM.requisitosSenha.maiuscula.setAttribute("data-valido", temMaiuscula);
  //   DOM.requisitosSenha.especial.setAttribute("data-valido", temEspecial);

  //   DOM.requisitosSenha.tamanho.classList.toggle("valido", temTamanho);
  //   DOM.requisitosSenha.maiuscula.classList.toggle("valido", temMaiuscula);
  //   DOM.requisitosSenha.especial.classList.toggle("valido", temEspecial);
  // },
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

  // validarCampoSenha: () => {
  //   Utils.atualizarRequisitosSenha(DOM.senha.value);
  // },

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
      // if (!Utils.validarEmail(dados.email)) {
      //   throw new Error("E-mail inválido. Use o formato exemplo@dominio.com");
      // }

      // const { valida: senhaValida } = Utils.validarSenha(dados.senha);
      // if (!senhaValida) {
      //   throw new Error("A senha não atende a todos os requisitos.");
      // }

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
  // DOM.senha.addEventListener("input", Handlers.validarCampoSenha);
  DOM.form.addEventListener("submit", Handlers.handleSubmit);
  // DOM.senha.addEventListener("input", (e) => {
  //   Handlers.validarCampoSenha();
  // });

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
