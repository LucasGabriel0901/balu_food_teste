// ==============================
// BALU FOOD - CENTRAL DE AJUDA
// Conteudo visual de orientacao e feedback local
// ==============================

document.addEventListener("DOMContentLoaded", function () {
initCentralAjuda();
});

function initCentralAjuda() {
initCardsAjuda();
initFeedbackAjuda();

if (typeof baluRefreshIcons === "function") {
baluRefreshIcons();
} else if (window.lucide) {
lucide.createIcons();
}
}

function initCardsAjuda() {
document.querySelectorAll("[data-help-card]").forEach(function (card) {
var button = card.querySelector("button");
var text = card.querySelector("p");

if (!button || !text) {
return;
}

button.addEventListener("click", function () {
var aberto = card.classList.toggle("is-open");
text.style.display = aberto ? "block" : "none";
button.textContent = aberto ? "Ocultar" : "Ver";
});

text.style.display = "block";
});
}

function initFeedbackAjuda() {
var form = document.getElementById("formFeedbackAjuda");

renderFeedbackAjuda();

if (!form) {
return;
}

form.addEventListener("submit", function (event) {
event.preventDefault();

var mensagem = getValueAjuda("feedbackMensagem");

if (!mensagem) {
if (typeof showToast === "function") {
showToast("Informe o feedback antes de registrar.", "warning");
}

return;
}

var lista = carregarFeedbackAjuda();

lista.unshift({
id: "FDB-" + Date.now(),
nome: getValueAjuda("feedbackNome") || "Visitante",
modulo: getValueAjuda("feedbackModulo") || "Geral",
mensagem: mensagem,
criadoEm: new Date().toISOString()
});

localStorage.setItem("balu_feedback_ajuda", JSON.stringify(lista.slice(0, 20)));
form.reset();
renderFeedbackAjuda();

if (typeof showToast === "function") {
showToast("Feedback registrado.", "success");
}
});
}

function renderFeedbackAjuda() {
var container = document.getElementById("feedbackAjudaLista");

if (!container) {
return;
}

var lista = carregarFeedbackAjuda();

if (!lista.length) {
container.innerHTML =
"<div class='empty-state-alert'>" +
"<strong>Nenhum feedback registrado ainda.</strong>" +
"<p class='text-muted'>Os registros salvos neste navegador aparecerão aqui.</p>" +
"</div>";
return;
}

container.innerHTML = lista.map(function (item) {
return "<article class='feedback-item'>" +
"<div>" +
"<strong>" + escapeHtmlAjuda(item.modulo || "Geral") + "</strong>" +
"<span>" + escapeHtmlAjuda(item.nome || "Visitante") + " - " + formatarDataAjuda(item.criadoEm) + "</span>" +
"</div>" +
"<p>" + escapeHtmlAjuda(item.mensagem || "") + "</p>" +
"</article>";
}).join("");
}

function carregarFeedbackAjuda() {
try {
var texto = localStorage.getItem("balu_feedback_ajuda");
var lista = texto ? JSON.parse(texto) : [];
return Array.isArray(lista) ? lista : [];
} catch (erro) {
return [];
}
}

function getValueAjuda(id) {
var element = document.getElementById(id);
return element ? String(element.value || "").trim() : "";
}

function formatarDataAjuda(valor) {
if (!valor) {
return "agora";
}

var data = new Date(valor);

if (isNaN(data.getTime())) {
return "agora";
}

return data.toLocaleDateString("pt-BR");
}

function escapeHtmlAjuda(value) {
return String(value === null || value === undefined ? "" : value)
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/"/g, "&quot;")
.replace(/'/g, "&#039;");
}
