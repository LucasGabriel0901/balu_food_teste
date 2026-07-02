// ==============================
// BALU FOOD - CENTRAL DE AJUDA
// Conteúdo visual de orientação
// ==============================

document.addEventListener("DOMContentLoaded", function () {
initCentralAjuda();
});

function initCentralAjuda() {
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

if (typeof baluRefreshIcons === "function") {
baluRefreshIcons();
} else if (window.lucide) {
lucide.createIcons();
}
}
