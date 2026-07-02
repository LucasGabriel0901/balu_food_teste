// ========================================
// BALU FOOD - AUTH GUARD DEMO
// Versão temporária sem bloqueio de login
// Para testar no GitHub Pages
// ========================================

var BALU_AUTH_SESSION_KEY = "balu_auth_session";

document.addEventListener("DOMContentLoaded", function () {
garantirSessaoDemoBalu();
preencherDadosDaSessao();

setTimeout(function () {
criarAreaUsuarioNoMenu();
iniciarBotoesLogout();
}, 150);
});

function garantirSessaoDemoBalu() {
var sessao = obterSessaoBalu();

if (sessao && sessao.acesso_liberado === true) {
return;
}

var sessaoTeste = {
token: "token_demo_balu",
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

function preencherDadosDaSessao() {
var sessao = obterSessaoBalu();

if (!sessao) {
garantirSessaoDemoBalu();
sessao = obterSessaoBalu();
}

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
garantirSessaoDemoBalu();

window.location.href = "dashboard.html";
}

function obterEmpresaIdAtual() {
var sessao = obterSessaoBalu();

if (!sessao || !sessao.empresa) {
return 1;
}

return sessao.empresa.id;
}

function obterUsuarioIdAtual() {
var sessao = obterSessaoBalu();

if (!sessao || !sessao.usuario) {
return 1;
}

return sessao.usuario.id;
}

function obterTokenAtual() {
var sessao = obterSessaoBalu();

if (!sessao) {
return "token_demo_balu";
}

return sessao.token || "token_demo_balu";
}

function obterEmpresaNomeAtual() {
var sessao = obterSessaoBalu();

if (!sessao || !sessao.empresa) {
return "Empresa Teste BALU";
}

return sessao.empresa.nome_fantasia || "Empresa Teste BALU";
}

function obterUsuarioNomeAtual() {
var sessao = obterSessaoBalu();

if (!sessao || !sessao.usuario) {
return "Lucas Gabriel";
}

return sessao.usuario.nome || "Lucas Gabriel";
}

function usuarioEstaLogado() {
return true;
}

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

