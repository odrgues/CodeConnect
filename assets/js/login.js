document.addEventListener("DOMContentLoaded", () => {
  const btnLogin = document.getElementById("btn-login");
  const email = document.getElementById("email-login");
  const senha = document.getElementById("senha-login");
  const mensagemLogin = document.getElementById("mensagem-login");
  const toggleSenha = document.getElementById("toggle-senha");

  toggleSenha.addEventListener("click", () => {
    if (senha.type === "password") {
      senha.type = "text";
      toggleSenha.textContent = "🙈";
    } else {
      senha.type = "password";
      toggleSenha.textContent = "👁️";
    }
  });

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

  async function login(email, password) {
<<<<<<< HEAD
    const url = "http://localhost:3000/";
=======
    const url = "http://localhost:8080/api/v1/usuarios/login"; // Seu endpoint de login
>>>>>>> 108d2a611fc3f2bc2203e46cfe799a34aa740aac

    const loginData = {
      email: email,
      password: password,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
<<<<<<< HEAD
        body: JSON.stringify(dados),
      });

      if (!response.ok) {
        throw new Error("Erro ao realizar login.");
      }

      const respostaJson = await response.json();
      return respostaJson;
=======
        body: JSON.stringify(loginData), // Envia o email e senha no corpo da requisição
      });

      if (!response.ok) {
        throw new Error("Erro ao verificar credenciais.");
      }

      const data = await response.json();
      return data; // O retorno será a mensagem de sucesso ou qualquer outra coisa da resposta
>>>>>>> 108d2a611fc3f2bc2203e46cfe799a34aa740aac
    } catch (error) {
      throw new Error(error.message);
    }
  }

  function mensagem(texto, cor) {
    mensagemLogin.textContent = texto;
    mensagemLogin.style.color = cor;
  }

  btn.addEventListener("click", async (event) => {
    event.preventDefault();

    const emailDigitado = email.value.trim();
    const senhaDigitada = senha.value.trim();

    if (!emailDigitado || !senhaDigitada) {
      mensagem("Preencha todos os campos.", "red");
      return;
    }

    if (!validarEmail(emailDigitado)) {
      mensagem(
        "Email inválido. Certifique-se de incluir '@' e um domínio válido.",
        "red"
      );
      return;
    }

    if (!validarSenha(senhaDigitada)) {
      mensagem(
        "A senha deve ter entre 8 e 20 caracteres, uma letra maiúscula e um caractere especial.",
        "red"
      );
      return;
    }

    try {
      btn.disabled = true;
      // btn.textContent = "Carregando...";

<<<<<<< HEAD
      const usuario = await login(emailDigitado);

      if (usuario.senha !== senhaDigitada) {
        throw new Error("Senha incorreta.");
      }
=======
      // Faz a chamada para o endpoint de login
      await login(emailDigitado, senhaDigitada);
>>>>>>> 108d2a611fc3f2bc2203e46cfe799a34aa740aac

      mensagem("Login realizado com sucesso!", "green");

      setTimeout(() => {
        window.location.href = "../pages/feed.html";
      }, 1000);
    } catch (error) {
      console.error("Erro no login:", error);
      mensagem("Email ou senha incorretos.", "red");
    } finally {
      setTimeout(() => {
        btnLogin.disabled = false;
        btnLogin.textContent = "Login";
      }, 1000);
    }
  });

<<<<<<< HEAD
  email.addEventListener("keydown", (event) => {
=======
  emailLogin.addEventListener("keydown", (event) => {
>>>>>>> 108d2a611fc3f2bc2203e46cfe799a34aa740aac
    if (event.key === "Enter") {
      event.preventDefault();
      senha.focus();
    }
  });

  senha.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      btnLogin.click();
    }
  });
});
