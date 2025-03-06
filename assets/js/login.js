const btnLogin = document.getElementById("btn-login");


async function loginUser(email, password) {
  const url = "http://localhost:3000/usuarios"; 
  try{
      const response = await fetch(url,{
          method: "POST",
          headers:{
              "Content-Type": "application/json",
          },
          body: JSON.stringify({email,password}),
      });

      if (!response.ok){
          throw new Error ("Erro ao fazer login. Verifique seu email e senha.");
      }
  const data = await response.json();
  return data;

  }catch(error){
      throw new Error (error.message)

  }
}


btnLogin.addEventListener("click", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email-login").value;
  const senha = document.getElementById("senha-login").value;

  if (!email || !senha) {
    alert("Preencha todos os campos.");
    return;
  }

  try {
    btnLogin.disabled = true;
    btnLogin.textContent = "Carregando...";
    const response = await loginUser(email, senha);
    window.location.href = "../pages/feed.html";
  } catch (error) {
    alert(error.message);
  } finally {
    btnLogin.disabled = false;
    btnLogin.textContent = "Login";
  }
});





