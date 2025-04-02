const CONFIG = {
  API_URL: "http://localhost:8080/api/v1/usuarios",
  REDIRECT_DELAY: 2000,
  LOGIN_PAGE: "../pages/login.html",
};

const DOM = {
  get form() {
    return (
      document.getElementById("form-cadastro") || {
        addEventListener: () => {},
        requestSubmit: () => {},
      }
    );
  },
  get nome() {
    return (
      document.getElementById("nome") || {
        value: "",
        addEventListener: () => {},
        focus: () => {},
        style: {},
      }
    );
  },
  get email() {
    return (
      document.getElementById("email-cadastro") || {
        value: "",
        addEventListener: () => {},
        focus: () => {},
        style: {},
      }
    );
  },
  get senha() {
    return (
      document.getElementById("senha") || {
        value: "",
        type: "password",
        addEventListener: () => {},
        focus: () => {},
        style: {},
      }
    );
  },
  get toggleSenha() {
    return (
      document.getElementById("toggle-senha") || {
        addEventListener: () => {},
        setAttribute: () => {},
      }
    );
  },
  get iconeSenha() {
    return (
      document.querySelector(".icone-senha-cadastro") || {
        src: "",
      }
    );
  },
  get mensagem() {
    return (
      document.getElementById("mensagem-cadastro") || {
        textContent: "",
        style: {},
        className: "",
        setAttribute: () => {},
      }
    );
  },
  get btnCadastro() {
    return (
      document.getElementById("btn-cadastro") || {
        disabled: false,
        style: {},
        innerHTML: "",
        textContent: "",
      }
    );
  },
  get contadorSenha() {
    return (
      document.getElementById("contador-senha") || {
        textContent: "",
        style: {},
      }
    );
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

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || "Erro ao processar a solicitação.");
        error.status = response.status;
        throw error;
      }
      return data; 
    } catch (error) {
      console.error("Erro técnico na API:", error);
      throw error; 
    }
  },
};

const Utils = {
  validarSenha: (senha) => {
    return senha.length >= 8 && senha.length <= 20;
  },

  validarEmail: (email) => {
    return email.includes("@") && email.includes(".com");
  },

  exibirMensagem: (elemento, texto, tipo = "erro") => { 
    elemento.textContent = texto;
    elemento.className = tipo; 
    // elemento.style.display = "block";
    // elemento.style.color = tipo === "erro" ? "#f44336" : "#4CAF50"; 

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
  },

  handleSubmit: async (event) => {
    event.preventDefault();
    
    
    DOM.btnCadastro.disabled = true;
    DOM.btnCadastro.innerHTML = '<div class="loader"></div>';

    const dados = {
      username: DOM.nome.value.trim(),
      email: DOM.email.value.trim().toLowerCase(),
      password: DOM.senha.value.trim(),
    };

    try {
     
      if (!dados.username) {
        throw new Error("O nome é obrigatório");
      }
      if (!dados.email) {
        throw new Error("O e-mail é obrigatório");
      }
      if (!dados.password) {
        throw new Error("A senha é obrigatória");
      }
      if (!Utils.validarEmail(dados.email)) {
        throw new Error("Por favor, insira um e-mail válido com @ e .com");
      }
      if (!Utils.validarSenha(dados.password)) {
        throw new Error("A senha deve ter entre 8 e 20 caracteres");
      }

      
      await API.cadastrarUsuario(dados);

      
      Utils.exibirMensagem(
        DOM.mensagem,
        "Cadastro realizado com sucesso!",
        "sucesso"
      );

      
      setTimeout(() => {
        window.location.href = CONFIG.LOGIN_PAGE;
      }, CONFIG.REDIRECT_DELAY);

    } catch (error) {
      
      let mensagemErro = error.message;
      
      if (error.status === 500) { //TODO: alterar o numero de erro
        mensagemErro = "Este e-mail já está cadastrado. Por favor, use outro e-mail ou faça login.";
      }

      
      Utils.exibirMensagem(
        DOM.mensagem,
        mensagemErro,
        "erro"
      );

    } finally {
      
      DOM.btnCadastro.disabled = false;
      DOM.btnCadastro.textContent = "Cadastrar";
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
