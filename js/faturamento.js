// ==============================
// BALU FOOD - FATURAMENTO
// Lançamentos simples em localStorage
// ==============================

var faturamentoCache = [];
var BALU_FATURAMENTO_KEY = "balu_faturamento";

document.addEventListener("DOMContentLoaded", function () {
faturamentoCache = carregarFaturamento();
initFaturamento();
renderFaturamento();
});

function initFaturamento() {
var btnNovo = document.getElementById("btnNovoFaturamento");
var form = document.getElementById("formFaturamento");

if (btnNovo) {
btnNovo.addEventListener("click", function () {
prepararFaturamento();
});
}

if (form) {
form.addEventListener("submit", function (event) {
event.preventDefault();
salvarFaturamento();
});
}
}

function prepararFaturamento(item) {
setValueFat("fatId", item ? item.id : "");
setValueFat("fatData", item ? item.data : dataAtualFat());
setValueFat("fatCanal", item ? item.canal : "Balcão");
setValueFat("fatValor", item ? item.valor : "");
setValueFat("fatStatus", item ? item.status : "Confirmado");
setValueFat("fatObservacoes", item ? item.observacoes : "");
setTextFat("drawerFaturamentoTitle", item ? "Editar Registro" : "Novo Registro");
openDrawer("drawerFaturamento");
}

function salvarFaturamento() {
var id = getValueFat("fatId");
var valor = numeroFat(getValueFat("fatValor"));
var data = getValueFat("fatData");

if (!data || valor <= 0) {
showToast("Informe data e valor do faturamento.", "warning");
return;
}

var item = {
id: id || gerarIdFat(),
data: data,
canal: getValueFat("fatCanal"),
valor: valor,
status: getValueFat("fatStatus"),
observacoes: getValueFat("fatObservacoes"),
atualizadoEm: new Date().toISOString()
};

if (id) {
faturamentoCache = faturamentoCache.map(function (registro) {
return registro.id === id ? item : registro;
});
} else {
faturamentoCache.push(item);
}

salvarFaturamentoLocal();
closeDrawer();
renderFaturamento();
showToast("Faturamento salvo com sucesso.", "success");
}

function editarFaturamento(id) {
var item = faturamentoCache.find(function (registro) {
return registro.id === id;
});

if (item) {
prepararFaturamento(item);
}
}

function excluirFaturamento(id) {
if (!confirmAction("Deseja excluir este registro?")) {
return;
}

faturamentoCache = faturamentoCache.filter(function (item) {
return item.id !== id;
});

salvarFaturamentoLocal();
renderFaturamento();
}

function renderFaturamento() {
var table = document.getElementById("faturamentoTable");
var hoje = dataAtualFat();
var competencia = hoje.substring(0, 7);
var registrosMes = faturamentoCache.filter(function (item) {
return item.status === "Confirmado" && String(item.data || "").substring(0, 7) === competencia;
});
var totalMes = somarFat(registrosMes);
var registrosHoje = registrosMes.filter(function (item) { return item.data === hoje; });
var totalHoje = somarFat(registrosHoje);

setTextFat("fatMes", moedaFat(totalMes));
setTextFat("fatHoje", moedaFat(totalHoje));
setTextFat("fatTicket", moedaFat(registrosMes.length ? totalMes / registrosMes.length : 0));
setTextFat("fatRegistrosMes", registrosMes.length);

if (!table) return;

if (!faturamentoCache.length) {
table.innerHTML = "<tr><td colspan='6' class='text-muted'>Nenhum registro de faturamento ainda.</td></tr>";
return;
}

table.innerHTML = faturamentoCache.slice().reverse().map(function (item) {
return "<tr>" +
"<td>" + formatarDataFat(item.data) + "</td>" +
"<td>" + escapeHtmlFat(item.canal || "-") + "</td>" +
"<td><strong>" + moedaFat(item.valor) + "</strong></td>" +
"<td>" + escapeHtmlFat(item.observacoes || "-") + "</td>" +
"<td>" + getStatusBadge(item.status || "Pendente") + "</td>" +
"<td><div class='table-actions'>" +
"<button type='button' class='btn-icon' onclick='editarFaturamento(\"" + escapeAttrFat(item.id) + "\")'><i data-lucide='edit-3'></i></button>" +
"<button type='button' class='btn-icon danger' onclick='excluirFaturamento(\"" + escapeAttrFat(item.id) + "\")'><i data-lucide='trash-2'></i></button>" +
"</div></td>" +
"</tr>";
}).join("");

if (typeof baluRefreshIcons === "function") baluRefreshIcons();
}

function carregarFaturamento() {
try {
var dados = localStorage.getItem(BALU_FATURAMENTO_KEY);
var lista = dados ? JSON.parse(dados) : [];
if (Array.isArray(lista)) {
  return lista;
}
} catch (erro) {
}

try {
var legado = localStorage.getItem("balu_faturamento_mensal");
var listaLegada = legado ? JSON.parse(legado) : [];
return Array.isArray(listaLegada) ? listaLegada : [];
} catch (erroLegado) {
return [];
}
}

function salvarFaturamentoLocal() {
localStorage.setItem(BALU_FATURAMENTO_KEY, JSON.stringify(faturamentoCache));
}

function somarFat(lista) {
return lista.reduce(function (total, item) {
return total + numeroFat(item.valor);
}, 0);
}

function getValueFat(id) {
var element = document.getElementById(id);
return element ? element.value || "" : "";
}

function setValueFat(id, value) {
var element = document.getElementById(id);
if (element) element.value = value || "";
}

function setTextFat(id, value) {
var element = document.getElementById(id);
if (element) element.textContent = value || "";
}

function numeroFat(value) {
return typeof safeNumber === "function" ? safeNumber(value) : Number(value || 0) || 0;
}

function moedaFat(value) {
return numeroFat(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarDataFat(data) {
return typeof formatDateBR === "function" ? formatDateBR(data) : data || "-";
}

function dataAtualFat() {
var hoje = new Date();
return hoje.getFullYear() + "-" + String(hoje.getMonth() + 1).padStart(2, "0") + "-" + String(hoje.getDate()).padStart(2, "0");
}

function escapeHtmlFat(value) {
return String(value === null || value === undefined ? "" : value)
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/"/g, "&quot;")
.replace(/'/g, "&#039;");
}

function escapeAttrFat(value) {
return escapeHtmlFat(value);
}

function gerarIdFat() {
return "FAT-" + Date.now() + "-" + Math.floor(Math.random() * 9999);
}

window.editarFaturamento = editarFaturamento;
window.excluirFaturamento = excluirFaturamento;
