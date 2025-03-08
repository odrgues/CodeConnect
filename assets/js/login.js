//colocar funçao de ocultar e mostrar a senha
//colocar requisitos dinamicos pra senha
//colocar ícone dinâmico de carregamento no meio do botao de login e de cadastro
//pensar no design responsivo

//comando pro json: json-server --watch db.json --port 3000

document.addEventListener("DOMContentLoaded", () => {
  const btnLogin = document.getElementById("btn-login");
  const emailLogin = document.getElementById("email-login");
  const senhaLogin = document.getElementById("senha-login");
  const mensagemLogin = document.getElementById("mensagem-login");

  btnLogin.addEventListener("click", async (event) => {
    event.preventDefault();

    const emailDigitado = emailLogin.value;
    const senhaDigitada = senhaLogin.value;

    if (!emailDigitado || !senhaDigitada) {
      exibirMensagemLogin("Preencha todos os campos.", "red");
      return;
    }

    if (!validarEmail(emailDigitado)) {
      exibirMensagemLogin(
        "Email inválido. Certifique-se de incluir '@' e um domínio válido.",
        "red"
      );
      return;
    }

    if (!validarSenha(senhaDigitada)) {
      exibirMensagemLogin("A senha deve ter no mínimo 6 caracteres.", "red");
      return;
    }

    try {
      btnLogin.disabled = true;
      btnLogin.textContent = "Carregando...";

      const usuario = await buscarUsuarioPorEmail(emailDigitado);

      if (usuario.senha !== senhaDigitada) {
        throw new Error("Senha incorreta.");
      }

      console.log("Usuário logado:", usuario);
      exibirMensagemLogin("Login realizado com sucesso!", "green");

      setTimeout(() => {
        window.location.href = "../pages/feed.html";
      }, 1000);
    } catch (error) {
      console.error("Erro no login:", error);
      exibirMensagemLogin("Email ou senha incorretos.", "red");
    } finally {
      setTimeout(() => {
        btnLogin.disabled = false;
        btnLogin.textContent = "Login";
      }, 2000);
    }
  });

  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function validarSenha(senha) {
    return senha.length >= 6;
  }

  async function buscarUsuarioPorEmail(email) {
    const url = `http://localhost:3000/usuarios?email=${email}`;

    try {
      const response = await fetch(url);
      console.log("Resposta do JSON Server:", response);

      if (!response.ok) {
        throw new Error("Erro ao verificar credenciais.");
      }

      const data = await response.json();

      if (data.length === 0) {
        throw new Error("E-mail não cadastrado.");
      }

      return data[0];
    } catch (error) {
      throw new Error(error.message);
    }
  }

  function exibirMensagemLogin(texto, cor) {
    mensagemLogin.textContent = texto;
    mensagemLogin.style.color = cor;
  }
});
