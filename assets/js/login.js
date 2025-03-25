//comando pro json: json-server --watch db.json --port 3000

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
    const url = "http://localhost:3000/";

    const dados = { email, password };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dados),
      });

      if (!response.ok) {
        throw new Error("Erro ao realizar login.");
      }

      const respostaJson = await response.json();
      return respostaJson;
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

      const usuario = await login(emailDigitado);

      if (usuario.senha !== senhaDigitada) {
        throw new Error("Senha incorreta.");
      }

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

  email.addEventListener("keydown", (event) => {
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
