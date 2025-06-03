function getAuthToken() {
  return localStorage.getItem("jwt_token");
}

function removeAuthToken() {
  localStorage.removeItem("jwt_token");
}

async function authenticatedFetch(url, options = {}) {
  const token = getAuthToken();

  if (!token) {
    removeAuthToken();
    window.location.href = "login.html";

    throw new Error("Usuário não autenticado. Redirecionando para o login.");
  }

  options.headers = options.headers || {};
  options.headers["Authorization"] = `Bearer ${token}`;

  try {
    const response = await fetch(url, options);

    if (response.status === 403) {
      alert("Sua sessão expirou ou é inválida. Faça login novamente.");
      window.location.href = "login.html";
      throw new Error("Sessão expirada ou acesso negado (403 Forbidden).");
    }

    if (!response.ok) {
      let errorMessage = `Erro na requisição para ${url}: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage += ` - ${errorData.message || JSON.stringify(errorData)}`;
      } catch (jsonError) {}
      throw new Error(errorMessage);
    }

    return response;
  } catch (error) {
    console.error("Erro em authenticatedFetch:", error);

    throw error;
  }
}
