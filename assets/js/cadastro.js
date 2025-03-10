// ERRO: a pagina de login redireciona com delay pra pagina do feed (esperado), e a pagina de cadastro redireciona pro login mas sem delay (nao esperado)
document.addEventListener("DOMContentLoaded", () => {
  const btnCadastro = document.getElementById("btn-cadastro");
  const nomeCadastro = document.getElementById("nome");
  const emailCadastro = document.getElementById("email-cadastro");
  const senhaCadastro = document.getElementById("senha-cadastro");
  const mensagemCadastro = document.getElementById("mensagem-cadastro");
  const toggleSenha = document.getElementById("toggle-senha");
  const requisitoTamanho = document.getElementById("requisito-tamanho");
  const requisitoMaiuscula = document.getElementById("requisito-maiuscula");
  const requisitoEspecial = document.getElementById("requisito-especial");

  toggleSenha.addEventListener("click", () => {
    if (senhaCadastro.type === "password") {
      senhaCadastro.type = "text";
      toggleSenha.textContent = "🙈";
    } else {
      senhaCadastro.type = "password";
      toggleSenha.textContent = "👁️";
    }
  });

  senhaCadastro.addEventListener("input", () => {
    const password = senhaCadastro.value;

    atualizarRequisito(
      requisitoTamanho,
      password.length >= 8 && password.length <= 20
    );
    atualizarRequisito(requisitoMaiuscula, /[A-Z]/.test(password));
    atualizarRequisito(requisitoEspecial, /[!@#$%^&*()_.]/.test(password));
  });

  function atualizarRequisito(requisito, condicao) {
    if (condicao) {
      requisito.style.color = "green";
    } else {
      requisito.style.color = "red";
    }
  }

  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function validarSenha(password) {
    const temTamanhoMinimo = password.length >= 8 && password.length <= 20;
    const temMaiuscula = /[A-Z]/.test(password);
    const temEspecial = /[!@#$%^&*()_.]/.test(password);
    return temTamanhoMinimo && temMaiuscula && temEspecial;
  }

  async function verificaEmail(email) {
    try {
      const response = await fetch(
        `http://localhost:3000/usuarios?email=${email}`
      );
      const usuarios = await response.json();
      return usuarios.length > 0;
    } catch (error) {
      console.error("Erro ao verificar e-mail:", error);
      return false;
    }
  }

  async function cadastrarUsuario(username, email, password) {
    const url = "http://localhost:3000/usuarios";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error("Erro ao cadastrar usuário.");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error("Erro ao cadastrar usuário");
    }
  }

  function exibirMensagemCadastro(texto, cor) {
    mensagemCadastro.textContent = texto;
    mensagemCadastro.style.color = cor;
  }

  //   btnCadastro.addEventListener("click", async (event) => {
  //     event.preventDefault();

  //     exibirMensagemCadastro("Cadastro simulado com sucesso!", "green");

  //     setTimeout(() => {
  //         console.log("Redirecionando para a página de login...");
  //         window.location.href = "/pages/login.html";
  //     }, 3000);
  // });

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  btnCadastro.addEventListener("click", async (event) => {
    event.preventDefault();

    const username = nomeCadastro.value.trim();
    const email = emailCadastro.value.trim();
    const password = senhaCadastro.value.trim();

    if (!username || !email || !password) {
      exibirMensagemCadastro("Preencha todos os campos.", "red");
      return;
    }

    if (!validarEmail(email)) {
      exibirMensagemCadastro(
        "Email inválido. Certifique-se de incluir '@' e um domínio válido.",
        "red"
      );
      return;
    }

    if (!validarSenha(password)) {
      exibirMensagemCadastro(
        "A senha deve ter entre 8 e 20 caracteres, uma letra maiúscula e um caractere especial.",
        "red"
      );
      return;
    }

    try {
      const emailExistente = await verificaEmail(email);
      if (emailExistente) {
        exibirMensagemCadastro(
          "E-mail já cadastrado. Use outro e-mail.",
          "red"
        );
        return;
      }

      btnCadastro.disabled = true;
      btnCadastro.textContent = "Cadastrando...";

      const response = await cadastrarUsuario(username, email, password);
      console.log("Resposta do JSON Server:", response);

      exibirMensagemCadastro("Cadastro realizado com sucesso!", "green");

      window.location.href = "../pages/login.html";


    } catch (error) {
      console.error("Erro no cadastro:", error.message);
      // exibirMensagemCadastro(error.message, "red"); TO DO: trocar a mensagem que aparece pro usuario 
    } finally {
      btnCadastro.disabled = false;
      btnCadastro.textContent = "Cadastrar";
    }
  });

  nomeCadastro.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      emailCadastro.focus();
    }
  });

  emailCadastro.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      senhaCadastro.focus();
    }
  });

  senhaCadastro.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      btnCadastro.click();
    }
  });
});
