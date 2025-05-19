const CONFIG = {
  API_BUSCAR_USUARIO: "http://localhost:8080/api/v1/usuarios",
  API_BUSCAR_POST_USUARIO: "http://localhost:8080/api/v1/posts/usuario",
  API_EDITAR_USUARIO: "http://localhost:8080/api/v1/usuarios",
  API_BUSCAR_PROJETO: "http://localhost:8080/api/v1/posts",
  API_EDITAR_PROJETO: "http://localhost:8080/api/v1/posts", // Adicionado para edição de projeto
  MESSAGE_DISPLAY_TIME: 5000, // Adicionado para consistência
  MIN_LOADER_TIME: 1000,
  PERFIL_PAGE: "/perfil", //TODO verificar url
};

const elementos = {
  nome: document.getElementById("nome-usuario"),
  descricao: document.getElementById("descricao-usuario"),
  listaProjetos: document.getElementById("project-list"),
  mensagem: document.getElementById("mensagem-perfil"),
  modalEditarPerfil: document.getElementById("detalhes-modal"), // Corrigido o ID
  formEditarPerfil: document.getElementById("form-editar-descricao"), // Adicionado ID do form
  nomeModalUsuario: document.getElementById("nome-usuario-modal"),
  descricaoModal: document.getElementById("descricao"),
  closeModalUsuario: document.querySelector(".modal-usuario .close-button"),
  modalProjeto: document.querySelector(".modal-projeto"),
  closeModalProjeto: document.querySelector(".modal-projeto .close-button"),
  inputUpload: document.getElementById("foto-perfil"), // Adicionado para upload de imagem
  imagemPrincipal: document.getElementById("foto-perfil-padrao"),
  nomeImagem: document.getElementById("nome-imagem"),
  form: document.getElementById("form-editar-projeto"), //formulario de editar projeto
};

const MESSAGES = {
  errors: {
    requiredFields: "Por favor, preencha todos os campos obrigatórios.",
    invalidImage: "Apenas imagens PNG, JPG e JPEG são permitidas.",
    imageTooLarge: (maxSizeMB) => `A imagem deve ter menos de ${maxSizeMB}MB.`,
    fetchError: (status) => `Erro ao buscar dados: ${status}`,
    serverError: "Ocorreu um erro no servidor. Tente novamente mais tarde.",
    postNotFound: "Projeto não encontrado",
  },
  success: {
    postCreated: "Projeto criado com sucesso!",
    profileUpdated: "Perfil atualizado com sucesso!",
    projectUpdated: "Projeto atualizado com sucesso!", //mensagem de sucesso ao editar projeto
  },
};

const mostrarMensagem = (texto, tipo = "erro") => {
  elementos.mensagem.textContent = texto;
  elementos.mensagem.className = `mensagem-${tipo}`;
  elementos.mensagem.style.display = "block";

  setTimeout(() => {
    elementos.mensagem.style.display = "none";
  }, 5000);
};

// Função para buscar projetos (usada no feed e no perfil)
async function buscarProjetos(url) {
  try {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(MESSAGES.errors.fetchError(response.status));
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar projetos:", error);
    mostrarMensagem("Erro ao carregar projetos", "erro");
    return []; // Retorna um array vazio para evitar erros em outras partes do código
  }
}

// Função para exibir os projetos
function exibirProjetos(projetos) {
  const projectListElement = elementos.listaProjetos;
  projectListElement.innerHTML = "";

  if (projetos && projetos.length > 0) {
    projetos.forEach((projeto) => {
      const projectCard = document.createElement("div");
      projectCard.classList.add("project-card");
      projectCard.style.cursor = "pointer";

      projectCard.addEventListener("click", () => {
        verDetalhesProjeto(projeto);
      });

      projectCard.innerHTML = `
              ${
                projeto.imagem
                  ? `<img src="${projeto.imagem}" alt="${projeto.titulo}">`
                  : ""
              }
              <h3>${projeto.titulo}</h3>
              <p>${projeto.nomeUsuario}</p>
              <p>${
                projeto.descricao
                  ? projeto.descricao.substring(0, 100) + "..."
                  : "Sem descrição"
              }</p>
              <p>Data de Criação: ${projeto.dataCriacaoPosts}</p>
          `;
      projectListElement.appendChild(projectCard);
    });
  } else {
    projectListElement.innerHTML =
      '<div class="no-projects">Nenhum projeto encontrado.</div>';
  }
}

// Função para ver detalhes do projeto
async function verDetalhesProjeto(idDoProjeto) {
  const modal = elementos.modalProjeto;
  const detalheTitulo = modal.querySelector("#detalhe-titulo");
  const detalheUsuario = modal.querySelector("#detalhe-usuario");
  const detalheDescricao = modal.querySelector("#detalhe-descricao");
  const detalheData = modal.querySelector("#detalhe-data");

  if (!modal) {
    console.error("Modal não encontrado!");
    return;
  }

  modal.style.display = "flex";
  detalheTitulo.textContent = "Carregando...";
  detalheUsuario.textContent = "";
  detalheDescricao.textContent = "";
  detalheData.textContent = "";

  try {
    const projeto = await buscarProjetoPorId(idDoProjeto);
    if (!projeto) {
      mostrarMensagem(MESSAGES.errors.postNotFound);
      return;
    }

    detalheTitulo.textContent = projeto.title;
    detalheTitulo.style.color = "black";
    detalheUsuario.textContent = projeto.nomeUsuario;
    detalheDescricao.textContent = projeto.descricao;
    detalheData.textContent = projeto.dataCriacaoPosts;

    // Adiciona botão de editar ao modal
    const editarButton = document.createElement("button");
    editarButton.textContent = "Editar Projeto";
    editarButton.addEventListener("click", () => {
      abrirModalEditarProjeto(projeto); // Passa o projeto para a função
    });
    modal.querySelector(".modal-content").appendChild(editarButton);
  } catch (error) {
    console.error("Erro ao carregar detalhes:", error);
    detalheTitulo.textContent = `Erro: ${error.message}`;
    detalheTitulo.style.color = "black";
  }
}

async function buscarProjetoPorId(id) {
  try {
    const response = await fetch(`${CONFIG.API_BUSCAR_PROJETO}/${id}`);
    if (!response.ok) {
      throw new Error(MESSAGES.errors.fetchError(response.status));
    }
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar projeto por ID:", error);
    mostrarMensagem("Erro ao buscar projeto", "erro");
    return null;
  }
}

// Função para inicializar o modal (close button)
function inicializarModal() {
  const modal = document.getElementById("detalhes-modal");
  const closeButtonX = document.querySelector(".close-button");

  if (closeButtonX) {
    closeButtonX.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
}

// Função para ler arquivo (imagem)
const lerArquivo = (arquivo) => {
  return new Promise((resolve, reject) => {
    const tiposPermitidos = ["image/png", "image/jpeg", "image/jpg"];
    if (!tiposPermitidos.includes(arquivo.type)) {
      return reject("Apenas imagens PNG, JPG e JPEG são permitidas");
    }

    const tamanhoMaximoMB = 5;
    const tamanhoMaximoBytes = tamanhoMaximoMB * 1024 * 1024;
    if (arquivo.size > tamanhoMaximoBytes) {
      return reject(`A imagem deve ter menos de ${tamanhoMaximoMB}MB`);
    }

    const leitor = new FileReader();
    leitor.onload = () => resolve({ url: leitor.result, nome: arquivo.name });
    leitor.onerror = () => reject(MESSAGES.errors.invalidImage);
    leitor.readAsDataURL(arquivo);
  });
};

// Função para buscar projetos do usuário
async function carregarPerfil() {
  const idUsuario = localStorage.getItem("idUsuario");

  try {
    const respostaUsuario = await fetch(
      `${CONFIG.API_BUSCAR_USUARIO}/${idUsuario}`
    );
    if (!respostaUsuario.ok)
      throw new Error(MESSAGES.errors.fetchError(respostaUsuario.status));
    const usuario = await respostaUsuario.json();

    elementos.nome.textContent = usuario.nome;
    elementos.descricao.textContent = usuario.descricao || "Nenhuma descrição";

    const projetos = await buscarProjetos(
      `${CONFIG.API_BUSCAR_POST_USUARIO}/${idUsuario}`
    );
    exibirProjetos(projetos);
  } catch (erro) {
    console.error("Erro:", erro);
    mostrarMensagem(erro.message, "erro");
  }
}

// Função para abrir modal de edição de perfil
async function abrirModalEditarPerfil(idUsuario) {
  const modal = elementos.modalEditarPerfil;
  const descricaoInput = elementos.descricaoModal;

  try {
    const respostaUsuario = await fetch(
      `${CONFIG.API_BUSCAR_USUARIO}/${idUsuario}`
    );
    if (!respostaUsuario.ok)
      throw new Error(MESSAGES.errors.fetchError(respostaUsuario.status));
    const usuario = await respostaUsuario.json();

    descricaoInput.value = usuario.descricao;
    elementos.nomeModalUsuario.textContent = usuario.nome;
    modal.style.display = "flex";
  } catch (error) {
    console.error("Erro:", error);
    mostrarMensagem(error.message, "erro");
  }
}

elementos.closeModalUsuario.addEventListener("click", () => {
  elementos.modalEditarPerfil.style.display = "none";
});

// Função para lidar com o envio do formulário de edição de perfil
elementos.formEditarPerfil.addEventListener("submit", async (event) => {
  event.preventDefault();

  const idUsuario = localStorage.getItem("idUsuario");
  const descricao = elementos.descricaoModal.value;
  const fotoPerfilInput = document.getElementById("foto-perfil");
  const fotoPerfil = fotoPerfilInput.files[0];

  const formData = new FormData();
  formData.append("descricao", descricao);
  if (fotoPerfil) {
    formData.append("fotoPerfil", fotoPerfil);
  }

  try {
    const resposta = await fetch(`${CONFIG.API_EDITAR_USUARIO}/${idUsuario}`, {
      method: "PUT",
      body: formData,
    });

    if (!resposta.ok)
      throw new Error(MESSAGES.errors.fetchError(resposta.status));

    const usuarioAtualizado = await resposta.json();
    elementos.descricao.textContent =
      usuarioAtualizado.descricao || "Nenhuma descrição";
    elementos.modalEditarPerfil.style.display = "none";
    mostrarMensagem(MESSAGES.success.profileUpdated, "sucesso");
  } catch (erro) {
    console.error("Erro:", erro);
    mostrarMensagem(erro.message, "erro");
  }
});

// Função para lidar com o upload da imagem
const Handlers = {
  handleUpload: async (event) => {
    const arquivo = event.target.files[0];
    if (!arquivo) return;
    try {
      const conteudo = await lerArquivo(arquivo);
      elementos.imagemPrincipal.src = conteudo.url;
      elementos.nomeImagem.textContent = conteudo.nome;
    } catch (erro) {
      mostrarMensagem(erro, "erro");
    }
  },
  limparFormulario: () => {
    //funcao de limpar formulario
    elementos.form.reset();
    elementos.imagemPrincipal.src = "/assets/img/publicacao/imagem1.png"; //TODO verificar path
    elementos.nomeImagem.textContent = "image_projeto.png";
  },

  handleSubmit: async (event) => {
    //funcao de enviar projeto
    event.preventDefault();
    const startTime = Date.now();
    try {
      if (!validarFormulario()) {
        throw new Error(MESSAGES.errors.requiredFields);
      }

      let imagem = null;
      if (elementos.inputUpload.files[0]) {
        const conteudo = await lerArquivo(elementos.inputUpload.files[0]);
        imagem = conteudo.url.split(",")[1];
      }

      const dados = {
        title: elementos.nomeProjeto.value.trim(),
        descricaoPost: elementos.descricao.value.trim(),
        usuarioId: localStorage.getItem("userId"), //TODO pegar do local storage
        imagem: imagem,
      };

      //await API.criarPublicacao(dados); //TODO criar funcao na api

      mostrarMensagem(MESSAGES.success.postCreated, "sucesso");

      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(
        CONFIG.MESSAGE_DISPLAY_TIME - elapsed,
        1000
      );

      setTimeout(() => {
        Handlers.limparFormulario(),
          1500,
          (window.location.href = CONFIG.PERFIL_PAGE); //TODO verificar url
      }, remainingTime);
    } catch (error) {
      if (error.name === "AbortError") {
        mostrarMensagem(
          elementos.mensagem,
          "A requisição demorou muito tempo. Tente novamente.",
          "erro"
        );
      } else {
        mostrarMensagem(
          elementos.mensagem,
          error.message || MESSAGES.errors.serverError,
          "erro"
        );
      }
    } finally {
      const elapsed = Date.now() - startTime;
      const remainingLoaderTime = Math.max(0, CONFIG.MIN_LOADER_TIME - elapsed);

      if (remainingLoaderTime > 0) {
        setTimeout(() => {
          //Utils.toggleLoader(DOM.btnPublicar, false); //TODO implementar
        }, remainingLoaderTime);
      } else {
        //Utils.toggleLoader(DOM.btnPublicar, false); //TODO implementar
      }
    }
  },
};

// Função para validar o formulário de criação/edição de projeto
function validarFormulario() {
  const nomeProjeto = document.getElementById("nome-projeto").value.trim(); //TODO verificar id
  const descricao = document.getElementById("descricao").value.trim();

  if (!nomeProjeto || !descricao) {
    return false;
  }
  return true;
}

// Função para filtrar projetos
function filtrarProjetos() {
  const sortBy = document.getElementById("sort-by").value;
  const idUsuario = localStorage.getItem("idUsuario"); //TODO pegar do local storage
  let listaOrdenada = [];

  if (!idUsuario) return;

  buscarProjetos(`${CONFIG.API_BUSCAR_POST_USUARIO}/${idUsuario}`).then(
    (projetos) => {
      listaOrdenada = [...projetos];
      switch (sortBy) {
        case "recentes":
          listaOrdenada.sort(
            (a, b) =>
              new Date(b.dataCriacaoPosts) - new Date(a.dataCriacaoPosts)
          );
          break;
        case "antigos":
          listaOrdenada.sort(
            (a, b) =>
              new Date(a.dataCriacaoPosts) - new Date(b.dataCriacaoPosts)
          );
          break;
        case "relevancia":
          listaOrdenada.sort((a, b) => b.likes - a.likes);
          break;
      }
      exibirProjetos(listaOrdenada);
    }
  );
}

// Função para inicializar a página
window.onload = function () {
  carregarPerfil();
  inicializarModal();
  //buscarProjetos(); // Não precisa buscar todos os projetos aqui, busca do usuario já faz isso
  elementos.inputUpload.addEventListener("change", Handlers.handleUpload);
  //elementos.form.addEventListener("submit", Handlers.handleSubmit); //TODO event listener de criar projeto
};
