// ========================================
// BALU FOOD - LOGIN DEMONSTRATIVO
// Funciona no GitHub Pages usando localStorage
// ========================================

var BALU_AUTH_SESSION_KEY = "balu_auth_session";

var BALU_USUARIOS_TESTE = [
{
email: "[lucas@balufood.com.br](mailto:lucas@balufood.com.br)",
senha: "Balu12345",
usuario: {
id: 1,
nome: "Lucas Gabriel",
email: "[lucas@balufood.com.br](mailto:lucas@balufood.com.br)",
perfil: "Administrador",
status: "Ativo"
},
empresa: {
id: 1,
nome_fantasia: "Empresa Teste BALU",
slug: "empresa-teste-balu",
status: "Ativo",
status_pagamento: "Em dia"
},
plano: {
id: 2,
nome: "Pro",
valor: 350
}
},
{
email: "[socia@balufood.com.br](mailto:socia@balufood.com.br)",
senha: "Balu12345",
usuario: {
id: 2,
nome: "Sócia BALU",
email: "[socia@balufood.com.br](mailto:socia@balufood.com.br)",
perfil: "Sócia / Administradora",
status: "Ativo"
},
empresa: {
id: 1,
nome_fantasia: "Empresa Teste BALU",
slug: "empresa-teste-balu",
status: "Ativo",
status_pagamento: "Em dia"
},
plano: {
id: 2,
nome: "Pro",
valor: 350
}
},
{
email: "[barbara@balufood.com.br](mailto:barbara@balufood.com.br)",
senha: "Balu12345",
usuario: {
id: 3,
nome: "Bárbara",
email: "[barbara@balufood.com.br](mailto:barbara@balufood.com.br)",
perfil: "Sócia / Administradora",
status: "Ativo"
},
empresa: {
id: 1,
nome_fantasia: "Empresa Teste BALU",
slug: "empresa-teste-balu",
status: "Ativo",
status_pagamento: "Em dia"
},
plano: {
id: 2,
nome: "Pro",
valor: 350
}
}
];

document.addEventListener("DOMContentLoaded", function () {
iniciarLoginBalu();
});

function iniciarLoginBalu() {
var form = document.getElementById("loginForm");

if (!form) {
return;
}

verificarSessaoExistente();

form.addEventListener("submit", function (event) {
event.preventDefault();
fazerLoginBalu();
});

iniciarBotoesPreencherTeste();

console.log("Login BALU carregado.");
}

function verificarSessaoExistente() {
var sessao = obterSessaoLoginBalu();

if (sessao && sessao.acesso_liberado === true) {
window.location.href = "dashboard.html";
}
}

function fazerLoginBalu() {
var email = getLoginValue("loginEmail").toLowerCase();
var senha = getLoginValue("loginPassword");

if (!email || !senha) {
mostrarMensagemLogin("Informe e-mail e senha.", "warning");
return;
}

var usuarioEncontrado = BALU_USUARIOS_TESTE.find(function (item) {
return item.email.toLowerCase() === email && item.senha === senha;
});

if (!usuarioEncontrado) {
mostrarMensagemLogin("E-mail ou senha inválidos.", "danger");
return;
}

if (
usuarioEncontrado.usuario.status !== "Ativo" ||
usuarioEncontrado.empresa.status !== "Ativo"
) {
mostrarMensagemLogin("Conta bloqueada ou inativa.", "danger");
return;
}

var sessao = {
token: gerarTokenLoginBalu(),
acesso_liberado: true,
motivo_bloqueio: null,
usuario: usuarioEncontrado.usuario,
empresa: usuarioEncontrado.empresa,
plano: usuarioEncontrado.plano,
assinatura: {
status: "Ativa",
data_vencimento: "2026-12-31"
},
login_em: new Date().toISOString()
};

localStorage.setItem(BALU_AUTH_SESSION_KEY, JSON.stringify(sessao));

mostrarMensagemLogin("Login realizado com sucesso.", "success");

setTimeout(function () {
window.location.href = "dashboard.html";
}, 500);
}

function iniciarBotoesPreencherTeste() {
var loginBox = document.querySelector(".login-test-box");

if (!loginBox) {
return;
}

var botoesExistentes = loginBox.querySelector(".login-test-actions");

if (botoesExistentes) {
return;
}

var actions = document.createElement("div");
actions.className = "login-test-actions";

actions.innerHTML =
"<button type='button' class='login-test-btn' data-login-demo='lucas@balufood.com.br'>Entrar como Lucas</button>" +
"<button type='button' class='login-test-btn' data-login-demo='socia@balufood.com.br'>Entrar como Sócia</button>" +
"<button type='button' class='login-test-btn' data-login-demo='barbara@balufood.com.br'>Entrar como Bárbara</button>";

loginBox.appendChild(actions);

var botoes = document.querySelectorAll("[data-login-demo]");

botoes.forEach(function (botao) {
botao.addEventListener("click", function () {
var email = botao.getAttribute("data-login-demo");


  setLoginValue("loginEmail", email);
  setLoginValue("loginPassword", "Balu12345");
});


});
}

function obterSessaoLoginBalu() {
var texto = localStorage.getItem(BALU_AUTH_SESSION_KEY);

if (!texto) {
return null;
}

try {
return JSON.parse(texto);
} catch (erro) {
localStorage.removeItem(BALU_AUTH_SESSION_KEY);
return null;
}
}

function getLoginValue(id) {
var campo = document.getElementById(id);

if (!campo) {
return "";
}

return String(campo.value || "").trim();
}

function setLoginValue(id, valor) {
var campo = document.getElementById(id);

if (!campo) {
return;
}

campo.value = valor === null || valor === undefined ? "" : valor;
}

function gerarTokenLoginBalu() {
return "token_balu_" + Date.now() + "_" + Math.floor(Math.random() * 999999);
}

function mostrarMensagemLogin(mensagem, tipo) {
if (typeof showToast === "function") {
showToast(mensagem, tipo || "info");
return;
}

var alertaExistente = document.querySelector(".login-alert");

if (alertaExistente) {
alertaExistente.remove();
}

var form = document.getElementById("loginForm");

if (!form) {
alert(mensagem);
return;
}

var alerta = document.createElement("div");
alerta.className = "login-alert login-alert-" + (tipo || "info");
alerta.textContent = mensagem;

form.insertBefore(alerta, form.firstChild);

setTimeout(function () {
if (alerta && alerta.parentNode) {
alerta.remove();
}
}, 3500);
}

function baluLogoutLoginPage() {
localStorage.removeItem(BALU_AUTH_SESSION_KEY);
}

function limparSessaoLoginTeste() {
localStorage.removeItem(BALU_AUTH_SESSION_KEY);
mostrarMensagemLogin("Sessão limpa. Faça login novamente.", "success");
}

