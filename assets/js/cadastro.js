const btnCadastro = document.getElementById("btn-cadastro");

async function verificarEmailExistente(email) {
    const url = `http://localhost:3000/usuarios?email=${email}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Erro ao verificar e-mail.");
        }

        const data = await response.json();
        return data.length > 0; 
    } catch (error) {
        throw new Error(error.message);
    }
}

async function cadastroUser(nome, email, senha) {
    const url = "http://localhost:3000/usuarios";

    try {
        console.log("Enviando dados para o JSON server")
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ nome, email, senha }),
        });
        console.log("Resposta do JSON Server: ",response)

        if (!response.ok) {
            throw new Error("Erro ao cadastrar usuário.");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error(error.message);
    }
}

btnCadastro.addEventListener("click", async (event) => {
    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const emailCadastro = document.getElementById("email").value;
    const senhaCadastro = document.getElementById("senha").value;

    if (!nome || !email || !senha) {
        exibirMensagem("Preencha todos os campos.", "red");
        return;
    }

    try {
        btnCadastro.disabled = true;
        btnCadastro.textContent = "Verificando...";

        
        const emailExistente = await verificarEmailExistente(email);
        if (emailExistente) {
            throw new Error("Este e-mail já está em uso.");
        }
        btnCadastro.textContent = "Registrando...";

        const response = await cadastroUser(nome, email, senha);
        exibirMensagem("Cadastro realizado com sucesso!", "green");

        setTimeout(() => {
            window.location.href = "../pages/login.html";
        }, 2000);

    } catch (error) {
        exibirMensagem(error.message, "red");
    } finally {
        btnCadastro.disabled = false;
        btnCadastro.textContent = "Cadastrar";
    }
});

function exibirMensagem(texto, cor) {
    const mensagem = document.getElementById("mensagem");
    if (!mensagem) {
        console.error("Elemento 'mensagem' não encontrado!");
        return;
    }
    mensagem.textContent = texto;
    mensagem.style.color = cor;
}