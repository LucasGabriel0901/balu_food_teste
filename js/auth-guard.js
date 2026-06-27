// ========================================
// BALU FOOD - AUTH GUARD
// Proteção das páginas internas + logout
// Login simples para GitHub Pages / LocalStorage
// ========================================

var BALU_AUTH_SESSION_KEY = "balu_auth_session";

/*
IMPORTANTE:

false = obriga o usuário a fazer login normalmente.
true  = entra automaticamente sem login.

Para mandar para sua sócia testar, deixe false.
*/
var BALU_DEV_AUTO_LOGIN = false;

document.addEventListener("DOMContentLoaded", function () {
protegerPaginaInterna();
preencherDadosDaSessao();

setTimeout(function () {
criarAreaUsuarioNoMenu();
iniciarBotoesLogout();
}, 150);
});

// ========================================
// PROTEÇÃO DAS PÁGINAS INTERNAS
// ========================================

function protegerPaginaInterna() {
var paginaAtual = window.location.pathname.toLowerCase();

if (paginaAtual.indexOf("login.html") >= 0) {
return;
}

var sessao = obterSessaoBalu();

if (!sessao && BALU_DEV_AUTO_LOGIN === true) {
criarSessaoDesenvolvimento();
sessao = obterSessaoBalu();
}

if (!sessao) {
redirecionarParaLogin();
return;
}

if (sessao.acesso_liberado === false) {
localStorage.removeItem(BALU_AUTH_SESSION_KEY);
redirecionarParaLogin();
return;
}

if (!sessao.usuario || !sessao.usuario.id) {
localStorage.removeItem(BALU_AUTH_SESSION_KEY);
redirecionarParaLogin();
return;
}

if (!sessao.empresa || !sessao.empresa.id) {
localStorage.removeItem(BALU_AUTH_SESSION_KEY);
redirecionarParaLogin();
return;
}
}

function criarSessaoDesenvolvimento() {
var sessaoTeste = {
token: "token_teste_balu",
acesso_liberado: true,
motivo_bloqueio: null,
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
},
assinatura: {
status: "Ativa",
data_vencimento: "2026-12-31"
},
login_em: new Date().toISOString()
};

localStorage.setItem(BALU_AUTH_SESSION_KEY, JSON.stringify(sessaoTeste));
}

function obterSessaoBalu() {
var sessaoTexto = localStorage.getItem(BALU_AUTH_SESSION_KEY);

if (!sessaoTexto) {
return null;
}

try {
return JSON.parse(sessaoTexto);
} catch (erro) {
localStorage.removeItem(BALU_AUTH_SESSION_KEY);
return null;
}
}

function redirecionarParaLogin() {
var caminho = window.location.pathname.toLowerCase();

if (caminho.indexOf("/pages/") >= 0) {
window.location.href = "login.html";
} else {
window.location.href = "pages/login.html";
}
}

// ========================================
// PREENCHER DADOS DA SESSÃO NA TELA
// ========================================

function preencherDadosDaSessao() {
var sessao = obterSessaoBalu();

if (!sessao) {
return;
}

var usuarioNome = sessao.usuario && sessao.usuario.nome ? sessao.usuario.nome : "Usuário";
var usuarioEmail = sessao.usuario && sessao.usuario.email ? sessao.usuario.email : "";
var empresaNome = sessao.empresa && sessao.empresa.nome_fantasia ? sessao.empresa.nome_fantasia : "Empresa";
var planoNome = sessao.plano && sessao.plano.nome ? sessao.plano.nome : "Plano";

preencherTexto("[data-auth-user-name]", usuarioNome);
preencherTexto("[data-auth-user-email]", usuarioEmail);
preencherTexto("[data-auth-company-name]", empresaNome);
preencherTexto("[data-auth-plan-name]", planoNome);
}

function preencherTexto(selector, texto) {
var elementos = document.querySelectorAll(selector);

elementos.forEach(function (elemento) {
elemento.textContent = texto;
});
}

// ========================================
// ÁREA DO USUÁRIO NO MENU LATERAL
// ========================================

function criarAreaUsuarioNoMenu() {
var sessao = obterSessaoBalu();

if (!sessao) {
return;
}

if (document.querySelector(".sidebar-user-card")) {
return;
}

var sidebar = encontrarSidebar();

if (!sidebar) {
return;
}

var usuarioNome = sessao.usuario && sessao.usuario.nome ? sessao.usuario.nome : "Usuário";
var usuarioEmail = sessao.usuario && sessao.usuario.email ? sessao.usuario.email : "";
var empresaNome = sessao.empresa && sessao.empresa.nome_fantasia ? sessao.empresa.nome_fantasia : "Empresa";
var planoNome = sessao.plano && sessao.plano.nome ? sessao.plano.nome : "Plano";

var card = document.createElement("div");
card.className = "sidebar-user-card";

card.innerHTML =
"<div class='sidebar-user-top'>" +
"<div class='sidebar-user-avatar'>" + pegarIniciais(usuarioNome) + "</div>" +
"<div class='sidebar-user-info'>" +
"<strong>" + escaparHtml(usuarioNome) + "</strong>" +
"<span>" + escaparHtml(usuarioEmail) + "</span>" +
"</div>" +
"</div>" +
"<div class='sidebar-company-info'>" +
"<span>" + escaparHtml(empresaNome) + "</span>" +
"<small>Plano " + escaparHtml(planoNome) + "</small>" +
"</div>" +
"<button type='button' class='sidebar-logout-btn' data-auth-logout>" +
"<i data-lucide='log-out'></i>" +
"Sair do sistema" +
"</button>";

sidebar.appendChild(card);

if (window.lucide) {
lucide.createIcons();
}
}

function encontrarSidebar() {
var seletores = [
".sidebar",
".app-sidebar",
".layout-sidebar",
".side-menu",
"aside",
"[data-sidebar]"
];

for (var i = 0; i < seletores.length; i++) {
var elemento = document.querySelector(seletores[i]);


if (elemento) {
  return elemento;
}


}

return null;
}

function pegarIniciais(nome) {
var partes = String(nome || "U").trim().split(" ");
var primeira = partes[0] ? partes[0].charAt(0) : "U";
var segunda = partes.length > 1 ? partes[partes.length - 1].charAt(0) : "";

return (primeira + segunda).toUpperCase();
}

// ========================================
// LOGOUT
// ========================================

function iniciarBotoesLogout() {
var botoes = document.querySelectorAll("[data-auth-logout]");

botoes.forEach(function (botao) {
botao.addEventListener("click", function () {
sairDoSistema();
});
});
}

function sairDoSistema() {
localStorage.removeItem(BALU_AUTH_SESSION_KEY);

if (typeof showToast === "function") {
showToast("Você saiu do sistema.", "success");
}

setTimeout(function () {
redirecionarParaLogin();
}, 300);
}

// ========================================
// FUNÇÕES PARA OUTROS MÓDULOS USAREM
// ========================================

function obterEmpresaIdAtual() {
var sessao = obterSessaoBalu();

if (!sessao || !sessao.empresa) {
return null;
}

return sessao.empresa.id;
}

function obterUsuarioIdAtual() {
var sessao = obterSessaoBalu();

if (!sessao || !sessao.usuario) {
return null;
}

return sessao.usuario.id;
}

function obterTokenAtual() {
var sessao = obterSessaoBalu();

if (!sessao) {
return null;
}

return sessao.token || null;
}

function obterEmpresaNomeAtual() {
var sessao = obterSessaoBalu();

if (!sessao || !sessao.empresa) {
return "";
}

return sessao.empresa.nome_fantasia || "";
}

function obterUsuarioNomeAtual() {
var sessao = obterSessaoBalu();

if (!sessao || !sessao.usuario) {
return "";
}

return sessao.usuario.nome || "";
}

function usuarioEstaLogado() {
var sessao = obterSessaoBalu();

return !!(sessao && sessao.acesso_liberado === true);
}

// ========================================
// SEGURANÇA DE TEXTO
// ========================================

function escaparHtml(texto) {
if (texto === null || texto === undefined) {
return "";
}

return String(texto)
.replace(/&/g, String.fromCharCode(38) + "amp;")
.replace(/</g, String.fromCharCode(38) + "lt;")
.replace(/>/g, String.fromCharCode(38) + "gt;")
.replace(/"/g, String.fromCharCode(38) + "quot;")
.replace(/'/g, String.fromCharCode(38) + "#039;");
}
