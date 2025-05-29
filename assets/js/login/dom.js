// dom.js
const getElement = (id, defaultValue = {}) =>
  document.getElementById(id) || defaultValue;
const querySelector = (selector, defaultValue = {}) =>
  document.querySelector(selector) || defaultValue;

export const DOM = {
  get form() {
    return getElement("form-login", {
      addEventListener: () => {},
      requestSubmit: () => {},
    });
  },
  get btnLogin() {
    return getElement("btn-login", {
      disabled: false,
      innerHTML: "",
      textContent: "",
    });
  },
  get email() {
    return getElement("email-login", {
      value: "",
      addEventListener: () => {},
      focus: () => {},
    });
  },
  get senha() {
    return getElement("senha-login", {
      value: "",
      type: "password",
      addEventListener: () => {},
      focus: () => {},
    });
  },
  get toggleSenha() {
    return getElement("toggle-senha", {
      addEventListener: () => {},
    });
  },
  get iconeSenha() {
    return querySelector(".icone-senha-login", {
      src: "",
    });
  },
  get mensagem() {
    return getElement("mensagem-login");
  },
};
