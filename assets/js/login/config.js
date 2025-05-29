// config.js
export const CONFIG = {
  API_URL: "http://localhost:8080/api/v1/usuarios/login",
  MIN_LOADER_TIME: 1500,
  MESSAGE_DISPLAY_TIME: 3000,
  FEED_PAGE: "/pages/feed.html",
  MESSAGES: {
    EMPTY_FIELDS: "Preencha todos os campos",
    INVALID_EMAIL: "E-mail inválido",
    UNKNOWN_ERROR: "Erro desconhecido",
    LOGIN_SUCCESS: "Login realizado!",
    INVALID_CREDENTIALS: "Credenciais inválidas. Verifique seu e-mail e senha.",
    ENDPOINT_NOT_FOUND: "Endpoint de login não encontrado.",
    SERVER_ERROR: "Erro interno do servidor. Tente novamente mais tarde.",
    INVALID_EMAIL_FORMAT: "Formato de e-mail inválido",
  },
};

export const IMAGES = {
  show: "../../assets/img/cadastro-login/visibility.png", // Ajuste o caminho da imagem se necessário
  hide: "../../assets/img/cadastro-login/visibility_off.png", // Ajuste o caminho da imagem se necessário
};
