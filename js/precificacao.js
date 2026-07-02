// ==============================
// BALU FOOD - PRECIFICAÇÃO
// Simulador simples de preço
// ==============================

var precificacoesCache = [];
var fichasPrecificacaoCache = [];
var BALU_PRECIFICACOES_KEY = "balu_precificacoes";

document.addEventListener("DOMContentLoaded", function () {
precificacoesCache = carregarListaPrecificacao(BALU_PRECIFICACOES_KEY);
fichasPrecificacaoCache = carregarListaPrecificacao("balu_fichas_tecnicas");
initPrecificacao();
renderPrecificacao();
calcularPrecificacao();
});

function initPrecificacao() {
popularFichasPrecificacao();

["precFicha", "precCusto", "precMargem", "precTaxa", "precDespesas", "precProdutoManual"].forEach(function (id) {
var campo = document.getElementById(id);
if (campo) {
  campo.addEventListener("input", calcularPrecificacao);
  campo.addEventListener("change", calcularPrecificacao);
}
});

var btn = document.getElementById("btnSalvarPrecificacao");
if (btn) {
btn.addEventListener("click", salvarPrecificacao);
}

var btnNovo = document.getElementById("btnNovaPrecificacao");
if (btnNovo) {
btnNovo.addEventListener("click", novaPrecificacao);
}
}

function popularFichasPrecificacao() {
var select = document.getElementById("precFicha");
if (!select) return;

select.innerHTML = "<option value=''>Selecione uma ficha</option>" + fichasPrecificacaoCache.map(function (ficha) {
return "<option value='" + escapeAttrPrecificacao(ficha.id || "") + "'>" + escapeHtmlPrecificacao(ficha.nome || "Ficha sem nome") + "</option>";
}).join("");
}

function obterFichaSelecionadaPrecificacao() {
var id = getValuePrecificacao("precFicha");
return fichasPrecificacaoCache.find(function (ficha) {
return String(ficha.id || "") === id;
});
}

function calcularPrecificacao() {
var ficha = obterFichaSelecionadaPrecificacao();
var custo = numeroPrecificacao(getValuePrecificacao("precCusto"));

if (ficha && custo <= 0) {
custo = numeroPrecificacao(ficha.custoPorPorcao || ficha.custoUnitario || ficha.custoTotal);
setValuePrecificacao("precCusto", custo ? String(custo) : "");
}

var margem = numeroPrecificacao(getValuePrecificacao("precMargem"));
var taxa = numeroPrecificacao(getValuePrecificacao("precTaxa"));
var despesas = numeroPrecificacao(getValuePrecificacao("precDespesas"));
var base = custo + despesas;
var divisor = 1 - (margem / 100) - (taxa / 100);
var preco = divisor > 0 ? base / divisor : base;
var lucro = preco - base - (preco * (taxa / 100));

setTextPrecificacao("precPrecoSugerido", moedaPrecificacao(preco));
setTextPrecificacao("precLucro", moedaPrecificacao(lucro));

return {
ficha: ficha,
produto: getValuePrecificacao("precProdutoManual") || (ficha ? ficha.nome : "Produto sem nome"),
custo: custo,
margem: margem,
taxa: taxa,
despesas: despesas,
preco: preco,
lucro: lucro
};
}

function salvarPrecificacao() {
var calculo = calcularPrecificacao();

if (calculo.custo <= 0) {
showToast("Informe o custo do produto.", "warning");
return;
}

precificacoesCache.push({
id: "PRE-" + Date.now() + "-" + Math.floor(Math.random() * 9999),
produto: calculo.produto,
fichaId: calculo.ficha ? calculo.ficha.id : "",
custo: calculo.custo,
margem: calculo.margem,
taxa: calculo.taxa,
despesas: calculo.despesas,
preco: calculo.preco,
lucro: calculo.lucro,
criadoEm: new Date().toISOString()
});

localStorage.setItem(BALU_PRECIFICACOES_KEY, JSON.stringify(precificacoesCache));
renderPrecificacao();
showToast("Simulação salva com sucesso.", "success");
}

function novaPrecificacao() {
setValuePrecificacao("precFicha", "");
setValuePrecificacao("precCusto", "");
setValuePrecificacao("precMargem", "30");
setValuePrecificacao("precTaxa", "0");
setValuePrecificacao("precDespesas", "0");
setValuePrecificacao("precProdutoManual", "");
calcularPrecificacao();
}

function excluirPrecificacao(id) {
precificacoesCache = precificacoesCache.filter(function (item) {
return item.id !== id;
});
localStorage.setItem(BALU_PRECIFICACOES_KEY, JSON.stringify(precificacoesCache));
renderPrecificacao();
}

function renderPrecificacao() {
var table = document.getElementById("precificacaoTable");
var total = precificacoesCache.length;
var margemMedia = total ? somaPrecificacao("margem") / total : 0;
var maiorCusto = precificacoesCache.reduce(function (maior, item) {
return Math.max(maior, numeroPrecificacao(item.custo));
}, 0);
var precoMedio = total ? somaPrecificacao("preco") / total : 0;

setTextPrecificacao("precProdutos", total);
setTextPrecificacao("precMargemMedia", formatPercent ? formatPercent(margemMedia) : margemMedia.toFixed(2) + "%");
setTextPrecificacao("precMaiorCusto", moedaPrecificacao(maiorCusto));
setTextPrecificacao("precPrecoMedio", moedaPrecificacao(precoMedio));

if (!table) return;

if (!precificacoesCache.length) {
table.innerHTML = "<tr><td colspan='6' class='text-muted'>Nenhuma simulação salva ainda.</td></tr>";
return;
}

table.innerHTML = precificacoesCache.slice().reverse().map(function (item) {
return "<tr>" +
"<td><strong>" + escapeHtmlPrecificacao(item.produto || "-") + "</strong></td>" +
"<td>" + moedaPrecificacao(item.custo) + "</td>" +
"<td><strong>" + moedaPrecificacao(item.preco) + "</strong></td>" +
"<td>" + (formatPercent ? formatPercent(item.margem) : numeroPrecificacao(item.margem).toFixed(2) + "%") + "</td>" +
"<td>" + moedaPrecificacao(item.lucro) + "</td>" +
"<td><button type='button' class='btn-icon danger' onclick='excluirPrecificacao(\"" + escapeAttrPrecificacao(item.id) + "\")'><i data-lucide='trash-2'></i></button></td>" +
"</tr>";
}).join("");

if (typeof baluRefreshIcons === "function") baluRefreshIcons();
}

function somaPrecificacao(campo) {
return precificacoesCache.reduce(function (total, item) {
return total + numeroPrecificacao(item[campo]);
}, 0);
}

function carregarListaPrecificacao(chave) {
try {
var dados = localStorage.getItem(chave);
var lista = dados ? JSON.parse(dados) : [];
return Array.isArray(lista) ? lista : [];
} catch (erro) {
return [];
}
}

function getValuePrecificacao(id) {
var element = document.getElementById(id);
return element ? element.value || "" : "";
}

function setValuePrecificacao(id, value) {
var element = document.getElementById(id);
if (element) element.value = value || "";
}

function setTextPrecificacao(id, value) {
var element = document.getElementById(id);
if (element) element.textContent = value || "";
}

function numeroPrecificacao(value) {
return typeof safeNumber === "function" ? safeNumber(value) : Number(value || 0) || 0;
}

function moedaPrecificacao(value) {
return numeroPrecificacao(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function escapeHtmlPrecificacao(value) {
return String(value === null || value === undefined ? "" : value)
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/"/g, "&quot;")
.replace(/'/g, "&#039;");
}

function escapeAttrPrecificacao(value) {
return escapeHtmlPrecificacao(value);
}

window.excluirPrecificacao = excluirPrecificacao;
