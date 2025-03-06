const loginBtn = document.getElementById("btn-login");

//simulacao de requisicao em um banco de dados
async function loginUser(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === "usuario@gmail.com" && password === "senha123") {
        resolve("Login realizado com sucesso.");
      } else {
        reject(new Error("Email ou senha incorretos."));
      }
    }, 1000);
  });
}

loginBtn.addEventListener("click", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Preencha todos os campos.");
    return;
  }

  try {
    loginBtn.disabled = true;
    loginBtn.textContent = "Carregando...";
    const response = await loginUser(email, password);
    window.location.href = "../pages/feed.html";
  } catch (error) {
    alert(error.message);
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Login";
  }
});

// async function loginUser(email, password) {
//     const url = ""; //URL da API
//     try{
//         const response = await fetch(url,{
//             method: "POST",
//             headers:{
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({email,password}),
//         });

//         if (!response.ok){
//             throw new Error ("Erro ao fazer login. Verifique seu email e senha.");
//         }
//     const data = await response.json();
//     return data;

//     }catch(error){
//         throw new Error (error.message)

//     }
// }

//como eu vou mandar um link que vai redirecionar a pessoa a conectar com seu github ou gmail, e ter sua conta criada?
//lib pronta do git e gmail

//ADICIONAR:
//validaçao de campos
//feedback visual sem alert.
