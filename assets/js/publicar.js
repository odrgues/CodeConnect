fetch('../components/aside.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('aside-container').innerHTML = data;
            });

const uploadBtn = document.getElementById("upload-btn");
const inputUpload = document.getElementById("image-upload");

uploadBtn.addEventListener("click", () => {
  inputUpload.click();
});

function lerConteudoDoArquivo(arquivo) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => {
      resolve({ url: leitor.result, nome: arquivo.name });
    };

    leitor.onerror = () => {
      reject(`Erro na leitura do arquivo ${arquivo.name}`);
    };

    leitor.readAsDataURL(arquivo);
  });
}

const imagemPrincipal = document.querySelector(".main-imagem");
const nomeDaImagem = document.querySelector(".container-imagem-nome p");

inputUpload.addEventListener("change", async (evento) => {
  const arquivo = evento.target.files[0];

  if (arquivo) {
    try {
      const conteudoDoArquivo = await lerConteudoDoArquivo(arquivo);
      imagemPrincipal.src = conteudoDoArquivo.url;
      nomeDaImagem.textContent = conteudoDoArquivo.nome;
    } catch (erro) {
      console.error("Erro na leitura do arquivo");
    }
  }
});

const inputTag = document.getElementById("input-tag");
const listaTags = document.getElementById("lista-tags");

listaTags.addEventListener("click", (evento) => {
  if (evento.target.classList.contains("remove-tag")) {
    const tagQueQueremosRemover = evento.target.parentElement;
    listaTags.removeChild(tagQueQueremosRemover);
  }
});

const tagsDisponiveis = [
  "Front-end",
  "Programação",
  "Data Science",
  "Full-stack",
  "HTML",
  "CSS",
  "JavaScript",
];

async function verificaTagsDisponiveis(tagTexto) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(tagsDisponiveis.includes(tagTexto));
    }, 1000);
  });
}

// inputTag.addEventListener("keypress", (evento) => {
//   if (evento.key === "Enter") {
//     evento.preventDefault();
//     const tagTexto = inputTag.value.trim();
//     if (tagTexto !== "") {
//       const tagExiste = await verificaTagsDisponiveis;
//       const tagNova = document.createElement("li");
//       tagNova.innerHTML = `<p>${tagTexto}</p> <img src="./img/close-black.svg" class="remove-tag">`;
//       listaTags.appendChild(tagNova);
//       inputTag.value = "";
//     }
//   }
// });



