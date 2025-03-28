//  TODO: o codigo nao entrega resposta do email ja registrado
// quando acontece um erro, por exemplo no email, o usuario nao consegue editar e tentar cadastrar DragEvent, por conta do botao desativda


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
  contadorSenha: document.getElementById("contador-senha"),
  requisitoSenha: document.querySelector(".requisito"),
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
        const error = new Error(errorData.message || "bananinha 123");
        const errorData = await response.json();
        error.status = response.status;
        throw error;
      }
      return await response.json();
    } catch (error) {
      console.error("Erro técnico na API:", {
        message: error.message,
        status: error.status,
        stack: error.stack,
      });
      throw error;
    }
  },
};

const Utils = {
  validarSenha: (senha) => {
    return senha.length >= 8 && senha.length <= 20;
  },

  validarEmail: (email) => {
    return email.includes('@') && email.includes('.com');
  },

  exibirMensagem: (elemento, erro) => {
    let mensagemUsuario;

    if (erro.status === 409) {
      mensagemUsuario =
        "Este e-mail já está cadastrado. Por favor, use outro e-mail ou faça login.";
    } else {
      mensagemUsuario =
        "Ocorreu um erro ao cadastrar. Por favor, tente novamente.";
    }

    elemento.textContent = mensagemUsuario;
    elemento.className = "erro";
    elemento.style.display = "block";
    elemento.style.color = "#f44336";

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
  },

  atualizarValidacaoSenha: () => {
    const senha = DOM.senha.value;
    const valido = Utils.validarSenha(senha);

    DOM.contadorSenha.textContent = `${senha.length}/20`;
    DOM.contadorSenha.style.color = senha.length > 20 ? "#f44336" : "#666";
    DOM.senha.style.borderColor = valido
      ? "#4CAF50"
      : senha.length > 0
      ? "#f44336"
      : "";
  },

  handleSubmit: async (event) => {
    event.preventDefault();
    DOM.btnCadastro.disabled = true;
    DOM.btnCadastro.textContent = "Aguarde...";

    const dados = {
      username: DOM.nome.value.trim(),
      email: DOM.email.value.trim().toLowerCase(),
      password: DOM.senha.value.trim(),
    };

    try {
      if (!dados.username || !dados.email || !dados.password) {
        throw { message: "Campos obrigatórios faltando" };
      }

      if (!Utils.validarEmail(dados.email)) {
        throw new Error("Por favor, insira um e-mail válido com @ e .com");
      }

      if (!Utils.validarSenha(dados.password)) {
        throw { message: "Senha inválida" };
      }

      await API.cadastrarUsuario(dados);

      DOM.mensagem.textContent = "Cadastro realizado com sucesso!";
      DOM.mensagem.style.color = "#4CAF50";
      DOM.mensagem.style.display = "block";

      setTimeout(() => {
        window.location.href = CONFIG.LOGIN_PAGE;
      }, CONFIG.REDIRECT_DELAY);


    } catch (error) {
 if (error.message.includes("e-mail válido")) {
        DOM.mensagem.textContent = error.message;
      } 
      else if (error.status === 409) {
        DOM.mensagem.textContent = "Este e-mail já está cadastrado. Por favor, use outro e-mail.";
      }
      else {
        DOM.mensagem.textContent = "Ocorreu um erro ao cadastrar. Por favor, tente novamente.";
      }
      
      DOM.mensagem.style.color = "#f44336";
      DOM.mensagem.style.display = "block";
    }
  }
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
