document.addEventListener("DOMContentLoaded", () => {
  const btnCadastro = document.getElementById("btn-cadastro");
  const nomeCadastro = document.getElementById("nome");
  const emailCadastro = document.getElementById("email-cadastro");
  const senhaCadastro = document.getElementById("senha-cadastro");
  const mensagemCadastro = document.getElementById("mensagem-cadastro");

  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function validarSenha(senha) {
    return senha.length >= 6;
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

  btnCadastro.addEventListener("click", async (event) => {
    event.preventDefault();

    const nome = nomeCadastro.value;
    const email = emailCadastro.value;
    const senha = senhaCadastro.value;

    if (!nome || !email || !senha) {
      exibirMensagemCadastro("Preencha todos os campos.", "red");
      return;
    }

    if (!validarEmail(email)) {
      exibirMensagemCadastro("Email inválido.", "red");
      return;
    }

    if (!validarSenha(senha)) {
      exibirMensagemCadastro("A senha deve ter no mínimo 6 caracteres.", "red");
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
      // btnCadastro.textContent = "Registrando...";

      const response = await cadastrarUsuario(nome, email, senha);
      console.log("Resposta do JSON Server:", response);

      exibirMensagemCadastro("Cadastro realizado com sucesso!", "green");

      setTimeout(() => {
        window.location.href = "../pages/login.html";
      }, 1000);
    } catch (error) {
      console.error("Erro no cadastro:", error);
      exibirMensagemCadastro(error.message, "red");
    } finally {
      btnCadastro.disabled = false;
      // btnCadastro.textContent = "Cadastrar";
    }
  });

  async function cadastrarUsuario(nome, email, senha) {
    const url = "http://localhost:3000/usuarios";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome, email, senha }),
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
});
