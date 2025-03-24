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
    requisito.style.color = condicao ? "green" : "red";
  }

  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function validarSenha(password) {
    return (
      password.length >= 8 &&
      password.length <= 20 &&
      /[A-Z]/.test(password) &&
      /[!@#$%^&*()_.]/.test(password)
    );
  }

  async function cadastrarUsuario(username, email, password) {
    const url = "http://localhost:8080/api/v1/usuarios";

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
        throw new Error(errorData.message || "Erro ao cadastrar usuário.");
      }

      return await response.json();
    } catch (error) {
      throw new Error("Erro ao cadastrar usuário");
    }
  }

  function exibirMensagemCadastro(texto, cor) {
    mensagemCadastro.textContent = texto;
    mensagemCadastro.style.color = cor;
  }

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
      btnCadastro.disabled = true;
      btnCadastro.textContent = "Cadastrando...";

      await cadastrarUsuario(username, email, password);

      exibirMensagemCadastro("Cadastro realizado com sucesso!", "green");

      setTimeout(() => {
        window.location.href = "../pages/login.html";
      }, 2000);
    } catch (error) {
      console.error("Erro no cadastro:", error.message);

      if (error.message.includes("E-mail já cadastrado")) {
        exibirMensagemCadastro("E-mail já cadastrado. Use outro.", "red");
      } else {
        exibirMensagemCadastro("Erro ao cadastrar. Tente novamente.", "red");
      }
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
