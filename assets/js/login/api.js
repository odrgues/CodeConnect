import { CONFIG } from "./config.js";

export const API = {
  loginUsuario: async (dados) => {
    try {
      const response = await fetch(CONFIG.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(dados),
      });

      const resposta = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(CONFIG.MESSAGES.INVALID_CREDENTIALS);
        } else if (response.status === 404) {
          throw new Error(CONFIG.MESSAGES.ENDPOINT_NOT_FOUND);
        } else if (response.status >= 500) {
          throw new Error(CONFIG.MESSAGES.SERVER_ERROR);
        } else {
          throw new Error(resposta.message || CONFIG.MESSAGES.UNKNOWN_ERROR);
        }
      }

      return resposta;
    } catch (error) {
      console.error("Erro na API:", error);
      throw error;
    }
  },
};
