const Auth = {
  salvarToken(token) {
    localStorage.setItem("authToken", token);
  },

  obterToken() {
    return localStorage.getItem("authToken");
  },

  removerToken() {
    localStorage.removeItem("authToken");
  },

  estaAutenticado() {
    return !!this.obterToken();
  },

  requerAutenticacao() {
    if (!this.estaAutenticado()) {
      window.location.href = "./login.js";
    }
  },
};

export default Auth;
