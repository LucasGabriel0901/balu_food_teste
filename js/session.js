// ========================================
// BALU FOOD - SESSION
// Funções globais da sessão do usuário logado
// ========================================

var BALU_SESSION_KEY = "balu_auth_session";

function baluGetSession() {
var sessaoTexto = localStorage.getItem(BALU_SESSION_KEY);

if (!sessaoTexto) {
return null;
}

try {
return JSON.parse(sessaoTexto);
} catch (erro) {
localStorage.removeItem(BALU_SESSION_KEY);
return null;
}
}

function baluIsLogged() {
var sessao = baluGetSession();

if (!sessao) {
return false;
}

if (sessao.acesso_liberado === false) {
return false;
}

if (!sessao.empresa || !sessao.empresa.id) {
return false;
}

return true;
}

function baluGetEmpresaId() {
var sessao = baluGetSession();

if (!sessao || !sessao.empresa) {
return null;
}

return sessao.empresa.id;
}

function baluGetUsuarioId() {
var sessao = baluGetSession();

if (!sessao || !sessao.usuario) {
return null;
}

return sessao.usuario.id;
}

function baluGetToken() {
var sessao = baluGetSession();

if (!sessao) {
return null;
}

return sessao.token || null;
}

function baluGetEmpresaNome() {
var sessao = baluGetSession();

if (!sessao || !sessao.empresa) {
return "Empresa";
}

return sessao.empresa.nome_fantasia || "Empresa";
}

function baluGetUsuarioNome() {
var sessao = baluGetSession();

if (!sessao || !sessao.usuario) {
return "Usuário";
}

return sessao.usuario.nome || "Usuário";
}

function baluGetUsuarioEmail() {
var sessao = baluGetSession();

if (!sessao || !sessao.usuario) {
return "";
}

return sessao.usuario.email || "";
}

function baluGetPlanoNome() {
var sessao = baluGetSession();

if (!sessao || !sessao.plano) {
return "Plano";
}

return sessao.plano.nome || "Plano";
}

function baluLogout() {
localStorage.removeItem(BALU_SESSION_KEY);
window.location.href = "login.html";
}

function baluRedirectIfNotLogged() {
if (!baluIsLogged()) {
localStorage.removeItem(BALU_SESSION_KEY);
window.location.href = "login.html";
}
}

