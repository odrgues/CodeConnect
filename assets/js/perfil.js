const CONFIG = {
  API_BUSCAR_USUARIO: {},
  API_BUSCAR_POSTS_USUARIO: {},
  API_EDITAR_USUARIO: {},
  API_BUSCAR_PROJETO: {},
  API_EDITAR_PROJETO: {},
  MESSAGE_DISPLAY_TIME: 3000,
  MIN_LOADER_TIME: 1500,
};

const DOM = {};

const MESSAGES = {
  errors: {},
  succes: {},
};

const mostrarMensagem = (texto, tipo = "erro") => {
  elementos.mensagem.textContent = texto;
};
