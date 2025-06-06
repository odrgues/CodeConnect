// Função para obter o token JWT do localStorage
function getAuthToken() {
  return localStorage.getItem("jwt_token");
}

// Função para simular um redirecionamento de logout
// Idealmente, esta função pode ser mais robusta, limpando outros dados do usuário, se houver
function logoutAndRedirect() {
  console.log(
    "authUtils: Token JWT expirado ou inválido. Realizando logout e redirecionando para login."
  );
  localStorage.removeItem("jwt_token");
  localStorage.removeItem("userId"); // Limpa também o userId
  localStorage.removeItem("userName"); // Limpa também o userName
  // Redireciona para a página de login
  window.location.href = "../pages/login.html";
}

// Função fetch autenticada
async function authenticatedFetch(url, options = {}) {
  const token = getAuthToken();

  // Se não houver token, o usuário já deveria ter sido redirecionado pela lógica na página de carregamento.
  // Mas, para garantir, podemos acionar o logout se tentar usar fetch sem token.
  if (!token) {
    console.warn(
      "authUtils: Tentativa de requisição autenticada sem token. Redirecionando."
    );
    logoutAndRedirect();
    // Lança um erro para interromper a execução da função chamadora
    throw new Error("Token de autenticação não encontrado.");
  }

  // Adiciona o cabeçalho de Autorização com o token JWT
  const headers = {
    ...options.headers, // Mantém quaisquer outros cabeçalhos existentes
    Authorization: `Bearer ${token}`,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: headers,
    });

    // --- Lógica de tratamento de erro para JWT expirado/inválido ---
    // Verifica se a resposta indica um erro de autenticação/autorização
    if (response.status === 401 || response.status === 403) {
      console.error(
        `authUtils: Erro de autenticação/autorização (${response.status}). Token pode estar expirado ou inválido.`
      );
      logoutAndRedirect(); // Aciona o logout e redirecionamento
      // Lança um erro para que a função chamadora saiba que a requisição falhou devido à autenticação
      throw new Error(`Erro de autenticação: ${response.status}`);
    }
    // --- Fim da lógica de tratamento de erro ---

    return response; // Retorna a resposta se for bem-sucedida ou outro tipo de erro
  } catch (error) {
    console.error("authUtils: Erro na requisição autenticada:", error);
    // Em caso de erro de rede ou outros, não necessariamente um problema de JWT.
    // O tratamento de erro específico para 401/403 já é feito acima.
    throw error; // Relança o erro para ser tratado pela função que chamou authenticatedFetch
  }
}
