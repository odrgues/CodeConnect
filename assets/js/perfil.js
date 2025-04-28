const API_URL = "http://localhost:8080/api/v1";

const elementos = {
  nome: document.getElementById("nome-usuario"),
  descricao: document.getElementById("descricao-usuario"),
  listaProjetos: document.getElementById("lista-projetos"),
  mensagem: document.getElementById("mensagem-perfil"),
};

const mostrarMensagem = (texto, tipo = "erro") => {
  elementos.mensagem.textContent = texto;
  elementos.mensagem.className = `mensagem-${tipo}`;
  elementos.mensagem.style.display = "block";

  setTimeout(() => {
    elementos.mensagem.style.display = "none";
  }, 5000);
};

const carregarPerfil = async () => {
  const idUsuario = localStorage.getItem("idUsuario");

  try {
    const respostaUsuario = await fetch(`${API_URL}/usuarios/${idUsuario}`);
    if (!respostaUsuario.ok) throw new Error("Erro ao carregar perfil");

    const usuario = await respostaUsuario.json();
    elementos.nome.textContent = usuario.nome;
    elementos.descricao.textContent = usuario.descricao || "Nenhuma descrição";

    const respostaProjetos = await fetch(
      `${API_URL}/posts?usuario_id=${idUsuario}`
    );
    if (!respostaProjetos.ok) throw new Error("Erro ao carregar projetos");

    const projetos = await respostaProjetos.json();

    if (projetos.length === 0) {
      elementos.listaProjetos.innerHTML = "<p>Nenhum projeto encontrado</p>";
    } else {
      elementos.listaProjetos.innerHTML = projetos
        .map(
          (projeto) => `
        <div class="projeto">
          ${
            projeto.imagem
              ? `<img src="${projeto.imagem}" alt="${projeto.titulo}">`
              : ""
          }
          <h3>${projeto.titulo}</h3>
          <p>${projeto.descricao}</p>
        </div>
      `
        )
        .join("");
    }
  } catch (erro) {
    console.error("Erro:", erro);
    mostrarMensagem(erro.message, "erro");
  }
};

document.addEventListener("DOMContentLoaded", carregarPerfil);
