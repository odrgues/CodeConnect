function getAuthToken() {
  return localStorage.getItem("jwt_token");
}

function logoutAndRedirect() {
  console.log(
    "authUtils: Token JWT expirado ou inválido. Realizando logout e redirecionando para login."
  );
  localStorage.removeItem("jwt_token");
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");

  window.location.href = "../pages/login.html";
}

async function authenticatedFetch(url, options = {}) {
  const token = getAuthToken();

  if (!token) {
    console.warn(
      "authUtils: Tentativa de requisição autenticada sem token. Redirecionando."
    );
    logoutAndRedirect();
    throw new Error("Token de autenticação não encontrado.");
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: headers,
    });

    if (response.status === 401 || response.status === 403) {
      console.error(
        `authUtils: Erro de autenticação/autorização (${response.status}). Token pode estar expirado ou inválido.`
      );
      logoutAndRedirect();

      throw new Error(`Erro de autenticação: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error("authUtils: Erro na requisição autenticada:", error);
    throw error;
  }
}
