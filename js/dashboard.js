// ==============================
// BALU FOOD - DASHBOARD
// Resumo geral da operação
// Puxa dados de insumos, embalagens, compras, inventários e CMV
// ==============================

document.addEventListener("DOMContentLoaded", function () {
initDashboard();
});

function initDashboard() {
renderDashboardData();

var refreshButton = document.querySelector(".page-actions .btn-primary");

if (refreshButton) {
refreshButton.addEventListener("click", function () {
renderDashboardData();


  if (typeof showToast === "function") {
    showToast("Dashboard atualizado com sucesso.", "success");
  }
});


}
}

function renderDashboardData() {
var insumos = carregarListaDashboard("insumos", ["balu_insumos"]);
var embalagens = carregarListaDashboard("embalagens", ["balu_embalagens"]);
var compras = carregarListaDashboard("compras", ["balu_compras"]);
var inventarios = carregarListaDashboard("inventarios", ["balu_inventarios"]);
var fechamentosCmv = carregarListaDashboard("cmv", ["balu_cmv"]);

var competenciaAtual = getCurrentCompetencia();

var resumoInsumos = calcularResumoItensDashboard(insumos, "insumos");
var resumoEmbalagens = calcularResumoItensDashboard(embalagens, "embalagens");

var valorEstoqueGeral = resumoInsumos.valorEstoque + resumoEmbalagens.valorEstoque;
var alertasEstoque = resumoInsumos.estoqueBaixo + resumoEmbalagens.estoqueBaixo;

var comprasConfirmadas = compras.filter(function (compra) {
return getCompraStatus(compra) === "Confirmada";
});

var comprasDoMes = comprasConfirmadas.filter(function (compra) {
return compraPertenceCompetencia(compra, competenciaAtual);
});

var totalCompras = comprasDoMes.reduce(function (total, compra) {
return total + getCompraTotal(compra);
}, 0);

var inventarioInicial = getInventarioTotalByTipo(inventarios, "Inicial", competenciaAtual);
var inventarioFinal = getInventarioTotalByTipo(inventarios, "Final", competenciaAtual);

var ultimoCmv = getUltimoCmv(fechamentosCmv);

var faturamento = 0;
var cmvReal = 0;

if (ultimoCmv) {
faturamento = numeroDashboard(ultimoCmv.faturamento || ultimoCmv.cmvFaturamento || ultimoCmv.receita || 0);
cmvReal = numeroDashboard(ultimoCmv.cmvReal || ultimoCmv.resultado || ultimoCmv.totalCmv || 0);
} else {
faturamento = numeroDashboard(carregarValorDashboard("faturamentoMensal", ["balu_faturamento_mensal"]));
cmvReal = Math.max(0, inventarioInicial + totalCompras - inventarioFinal);
}

var cmvPercentual = faturamento > 0 ? dividirDashboard(cmvReal, faturamento) * 100 : 0;
var classificacao = cmvReal > 0 && faturamento > 0 ? classificarCmvDashboard(cmvPercentual) : "Aguardando cálculo";

setTextDashboard("kpiFaturamento", formatarMoedaDashboard(faturamento));
setTextDashboard("kpiCompras", formatarMoedaDashboard(totalCompras));
setTextDashboard("kpiCmv", formatarMoedaDashboard(cmvReal));
setTextDashboard("kpiCmvPercent", formatarPercentualDashboard(cmvPercentual));

setTextDashboard("cmvHighlightValue", formatarMoedaDashboard(cmvReal));
setTextDashboard("dashEstoqueInicial", formatarMoedaDashboard(inventarioInicial));
setTextDashboard("dashComprasMes", formatarMoedaDashboard(totalCompras));
setTextDashboard("dashEstoqueFinal", formatarMoedaDashboard(inventarioFinal));
setTextDashboard("cmvMeterPercent", formatarNumeroDashboard(cmvPercentual, 0) + "%");

updateCmvStatus(classificacao);
renderResumoEstoqueDashboard(resumoInsumos, resumoEmbalagens, valorEstoqueGeral, alertasEstoque);
renderComprasTable(compras);
renderChartPlaceholder(fechamentosCmv);
renderAtencoesDashboard(resumoInsumos, resumoEmbalagens, alertasEstoque, valorEstoqueGeral);
renderSaudeOperacaoDashboard(insumos, embalagens, comprasDoMes, inventarios, fechamentosCmv);

if (window.lucide) {
lucide.createIcons();
}
}

function carregarListaDashboard(nomeChave, chavesAlternativas) {
var chaves = [];

if (typeof BALU_KEYS !== "undefined" && BALU_KEYS && BALU_KEYS[nomeChave]) {
chaves.push(BALU_KEYS[nomeChave]);
}

if (Array.isArray(chavesAlternativas)) {
chavesAlternativas.forEach(function (chave) {
chaves.push(chave);
});
}

for (var i = 0; i < chaves.length; i++) {
var chaveAtual = chaves[i];


if (!chaveAtual) {
  continue;
}

if (typeof loadData === "function") {
  var dadosLoad = loadData(chaveAtual, []);

  if (Array.isArray(dadosLoad) && dadosLoad.length > 0) {
    return dadosLoad;
  }
}

var texto = localStorage.getItem(chaveAtual);

if (texto) {
  try {
    var dados = JSON.parse(texto);

    if (Array.isArray(dados)) {
      return dados;
    }
  } catch (erro) {
    console.warn("Erro ao carregar dados do dashboard:", chaveAtual, erro);
  }
}


}

return [];
}

function carregarValorDashboard(nomeChave, chavesAlternativas) {
var chaves = [];

if (typeof BALU_KEYS !== "undefined" && BALU_KEYS && BALU_KEYS[nomeChave]) {
chaves.push(BALU_KEYS[nomeChave]);
}

if (Array.isArray(chavesAlternativas)) {
chavesAlternativas.forEach(function (chave) {
chaves.push(chave);
});
}

for (var i = 0; i < chaves.length; i++) {
var valor = localStorage.getItem(chaves[i]);


if (valor !== null && valor !== undefined && valor !== "") {
  return valor;
}


}

return 0;
}

function calcularResumoItensDashboard(lista, tipo) {
var total = Array.isArray(lista) ? lista.length : 0;
var valorEstoque = 0;
var estoqueBaixo = 0;
var ativos = 0;

if (!Array.isArray(lista)) {
lista = [];
}

lista.forEach(function (item) {
var statusPrincipal = String(item.status || item.embalagemStatus || item.insumoStatus || "Ativo");
var statusEstoque = String(item.statusEstoque || item.embStatusEstoque || item.status_estoque || "");


var estoqueAtual = numeroDashboard(
  item.estoqueAtual ||
  item.embEstoqueAtual ||
  item.quantidadeEstoque ||
  item.estoque ||
  0
);

var estoqueMinimo = numeroDashboard(
  item.estoqueMinimo ||
  item.embEstoqueMinimo ||
  item.minimo ||
  0
);

var valorItem = numeroDashboard(
  item.valorEstoque ||
  item.embValorEstoque ||
  item.valorEstoqueEmbalagem ||
  item.totalEstoque ||
  0
);

valorEstoque += valorItem;

if (statusPrincipal !== "Inativo") {
  ativos++;
}

var baixoPorStatus = statusEstoque === "Estoque baixo" || statusEstoque === "Crítico" || statusEstoque === "Abaixo do mínimo";
var baixoPorNumero = estoqueMinimo > 0 && estoqueAtual <= estoqueMinimo;

if (baixoPorStatus || baixoPorNumero) {
  estoqueBaixo++;
}


});

return {
tipo: tipo,
total: total,
ativos: ativos,
valorEstoque: valorEstoque,
estoqueBaixo: estoqueBaixo
};
}

function renderResumoEstoqueDashboard(resumoInsumos, resumoEmbalagens, valorEstoqueGeral, alertasEstoque) {
var kpiGrid = document.querySelector(".kpi-grid");

if (!kpiGrid) {
return;
}

var resumo = document.getElementById("dashboardResumoEstoque");

if (!resumo) {
resumo = document.createElement("div");
resumo.id = "dashboardResumoEstoque";
resumo.className = "kpi-grid";
resumo.style.marginTop = "18px";


kpiGrid.parentNode.insertBefore(resumo, kpiGrid.nextSibling);


}

resumo.innerHTML =
"<div class='kpi-card green'>" +
"<span>Insumos cadastrados</span>" +
"<strong>" + resumoInsumos.total + "</strong>" +
"<small>" + resumoInsumos.ativos + " ativo(s) no sistema.</small>" +
"</div>" +


"<div class='kpi-card purple'>" +
  "<span>Embalagens cadastradas</span>" +
  "<strong>" + resumoEmbalagens.total + "</strong>" +
  "<small>" + resumoEmbalagens.ativos + " ativa(s) no sistema.</small>" +
"</div>" +

"<div class='kpi-card orange'>" +
  "<span>Valor total em estoque</span>" +
  "<strong>" + formatarMoedaDashboard(valorEstoqueGeral) + "</strong>" +
  "<small>Insumos + embalagens cadastradas.</small>" +
"</div>" +

"<div class='kpi-card red'>" +
  "<span>Alertas de estoque</span>" +
  "<strong>" + alertasEstoque + "</strong>" +
  "<small>Itens abaixo do mínimo ou críticos.</small>" +
"</div>";


}

function renderAtencoesDashboard(resumoInsumos, resumoEmbalagens, alertasEstoque, valorEstoqueGeral) {
var lista = document.querySelector(".attention-list");

if (!lista) {
return;
}

var mensagemEstoque = alertasEstoque > 0
? alertasEstoque + " item(ns) precisam de atenção no estoque."
: "Nenhum item crítico encontrado no estoque agora.";

lista.innerHTML =
"<div class='attention-item'>" +
"<div class='attention-icon warning'>" +
"<i data-lucide='alert-triangle'></i>" +
"</div>" +
"<div class='attention-content'>" +
"<strong>Alertas de estoque</strong>" +
"<span>" + mensagemEstoque + "</span>" +
"</div>" +
"</div>" +


"<div class='attention-item'>" +
  "<div class='attention-icon success'>" +
    "<i data-lucide='check-circle'></i>" +
  "</div>" +
  "<div class='attention-content'>" +
    "<strong>Cadastros operacionais</strong>" +
    "<span>" + resumoInsumos.total + " insumo(s) e " + resumoEmbalagens.total + " embalagem(ns) cadastrados.</span>" +
  "</div>" +
"</div>" +

"<div class='attention-item'>" +
  "<div class='attention-icon danger'>" +
    "<i data-lucide='shield-alert'></i>" +
  "</div>" +
  "<div class='attention-content'>" +
    "<strong>Valor parado em estoque</strong>" +
    "<span>O estoque cadastrado representa " + formatarMoedaDashboard(valorEstoqueGeral) + " em produtos e embalagens.</span>" +
  "</div>" +
"</div>";


}

function renderSaudeOperacaoDashboard(insumos, embalagens, comprasDoMes, inventarios, fechamentosCmv) {
var linhas = document.querySelectorAll(".operation-health .health-row");

if (!linhas || linhas.length < 3) {
return;
}

var totalCadastros = insumos.length + embalagens.length;
var percentualCadastros = totalCadastros > 0 ? 100 : 0;
var percentualCompras = comprasDoMes.length > 0 ? 100 : 0;
var percentualCmv = fechamentosCmv.length > 0 ? 100 : inventarios.length > 0 ? 50 : 0;

atualizarLinhaSaude(linhas[0], "Cadastros preenchidos", percentualCadastros);
atualizarLinhaSaude(linhas[1], "Compras registradas", percentualCompras);
atualizarLinhaSaude(linhas[2], "Fechamento CMV", percentualCmv);
}

function atualizarLinhaSaude(linha, texto, percentual) {
if (!linha) {
return;
}

var span = linha.querySelector("span");
var barra = linha.querySelector(".health-bar-fill");
var strong = linha.querySelector("strong");

if (span) {
span.textContent = texto;
}

if (barra) {
barra.style.width = percentual + "%";
}

if (strong) {
strong.textContent = percentual + "%";
}
}

function getCurrentCompetencia() {
var today = new Date();
var year = today.getFullYear();
var month = String(today.getMonth() + 1).padStart(2, "0");

return year + "-" + month;
}

function setTextDashboard(id, value) {
var element = document.getElementById(id);

if (element) {
element.textContent = value;
}
}

function getCompraStatus(compra) {
return limparTextoDashboard(
compra.status ||
compra.compraStatus ||
compra.statusCompra,
"Pendente"
);
}

function getCompraTotal(compra) {
return numeroDashboard(
compra.total ||
compra.compraTotal ||
compra.totalCompra ||
compra.valorTotal ||
compra.valor ||
0
);
}

function getCompraData(compra) {
return compra.data || compra.compraData || compra.dataCompra || compra.criadoEm || "";
}

function getCompraTipo(compra) {
return limparTextoDashboard(
compra.tipo ||
compra.compraTipo ||
compra.tipoCompra,
"Compra"
);
}

function getCompraItemResumo(compra) {
if (Array.isArray(compra.itens) && compra.itens.length > 0) {
return compra.itens.length + " item(ns)";
}

return limparTextoDashboard(
compra.item ||
compra.nomeItem ||
compra.descricao,
"Itens não informados"
);
}

function compraPertenceCompetencia(compra, competencia) {
var data = getCompraData(compra);

if (!data) {
return true;
}

var texto = String(data);

if (texto.length >= 7 && texto.substring(0, 7) === competencia) {
return true;
}

return false;
}

function getInventarioTotalByTipo(inventarios, tipo, competencia) {
var inventariosFiltrados = inventarios.filter(function (inventario) {
var inventarioTipo = limparTextoDashboard(
inventario.tipo ||
inventario.inventarioTipo,
""
);


var inventarioCompetencia = limparTextoDashboard(
  inventario.competencia ||
  inventario.inventarioCompetencia,
  ""
);

var status = limparTextoDashboard(
  inventario.status ||
  inventario.inventarioStatus,
  "Finalizado"
);

var isTipoCorreto = inventarioTipo === tipo;
var isCompetenciaCorreta = !competencia || !inventarioCompetencia || inventarioCompetencia === competencia;
var isValido = status !== "Cancelado";

return isTipoCorreto && isCompetenciaCorreta && isValido;


});

if (inventariosFiltrados.length === 0) {
return 0;
}

var ultimoInventario = inventariosFiltrados[inventariosFiltrados.length - 1];

return numeroDashboard(
ultimoInventario.totalGeral ||
ultimoInventario.inventarioTotalGeral ||
ultimoInventario.total ||
ultimoInventario.valorTotal ||
0
);
}

function getUltimoCmv(fechamentosCmv) {
if (!Array.isArray(fechamentosCmv) || fechamentosCmv.length === 0) {
return null;
}

var fechamentosValidos = fechamentosCmv.filter(function (item) {
var status = limparTextoDashboard(item.status || item.cmvStatus, "Fechado");


return status !== "Cancelado";


});

if (fechamentosValidos.length === 0) {
return null;
}

return fechamentosValidos[fechamentosValidos.length - 1];
}

function updateCmvStatus(classificacao) {
var badge = document.getElementById("kpiCmvStatus");

if (!badge) {
return;
}

badge.textContent = classificacao;
badge.className = "badge";

if (classificacao === "Excelente") {
badge.classList.add("success");
} else if (classificacao === "Dentro do esperado") {
badge.classList.add("purple");
} else if (classificacao === "Atenção") {
badge.classList.add("warning");
} else if (classificacao === "Crítico") {
badge.classList.add("danger");
} else {
badge.classList.add("warning");
}
}

function renderComprasTable(compras) {
var tableBody = document.getElementById("dashboardComprasTable");

if (!tableBody) {
return;
}

if (!Array.isArray(compras) || compras.length === 0) {
tableBody.innerHTML =
"<tr>" +
"<td colspan='5' class='text-muted'>" +
"Nenhuma compra carregada ainda." +
"</td>" +
"</tr>";


return;


}

var ultimasCompras = compras.slice(-5).reverse();

tableBody.innerHTML = ultimasCompras.map(function (compra) {
var data = getCompraData(compra);
var item = getCompraItemResumo(compra);
var tipo = getCompraTipo(compra);
var total = getCompraTotal(compra);
var status = getCompraStatus(compra);


return (
  "<tr>" +
    "<td>" + formatarDataDashboard(data) + "</td>" +
    "<td>" + escaparHtmlDashboard(item) + "</td>" +
    "<td>" + escaparHtmlDashboard(tipo) + "</td>" +
    "<td><strong>" + formatarMoedaDashboard(total) + "</strong></td>" +
    "<td>" + badgeStatusDashboard(status) + "</td>" +
  "</tr>"
);


}).join("");
}

function renderChartPlaceholder(fechamentosCmv) {
var chart = document.getElementById("cmvChartPlaceholder");

if (!chart) {
return;
}

if (!Array.isArray(fechamentosCmv) || fechamentosCmv.length === 0) {
chart.innerHTML =
"<div>" +
"<strong>Nenhum histórico de CMV ainda.</strong>" +
"<br>" +
"<span>Quando os fechamentos mensais forem salvos, o comparativo aparecerá aqui.</span>" +
"</div>";

return;


}

var ultimos = fechamentosCmv.slice(-4);

chart.innerHTML =
"<div class='simple-chart'>" +
ultimos.map(function (item) {
var percentual = numeroDashboard(item.cmvPercentual || item.percentual || item.cmvPercent || 0);
var competencia = limparTextoDashboard(item.competencia || item.cmvCompetencia, "Mês");
var altura = Math.min(Math.max(percentual, 5), 100);


    return (
      "<div class='simple-chart-item'>" +
        "<div class='simple-chart-bar' style='height:" + altura + "%'></div>" +
        "<strong>" + formatarPercentualDashboard(percentual) + "</strong>" +
        "<span>" + escaparHtmlDashboard(competencia) + "</span>" +
      "</div>"
    );
  }).join("") +
"</div>";


}

function classificarCmvDashboard(percentual) {
if (typeof classifyCMV === "function") {
return classifyCMV(percentual);
}

if (percentual <= 30) {
return "Excelente";
}

if (percentual <= 35) {
return "Dentro do esperado";
}

if (percentual <= 40) {
return "Atenção";
}

return "Crítico";
}

function numeroDashboard(valor) {
if (typeof safeNumber === "function") {
return safeNumber(valor);
}

if (valor === null || valor === undefined || valor === "") {
return 0;
}

if (typeof valor === "number") {
return isNaN(valor) ? 0 : valor;
}

var texto = String(valor)
.replace("R$", "")
.replace("%", "")
.replace("x", "")
.replace(/\s/g, "")
.trim();

if (texto.indexOf(",") >= 0) {
texto = texto.replace(/./g, "").replace(",", ".");
}

var numero = Number(texto);

if (isNaN(numero)) {
return 0;
}

return numero;
}


function dividirDashboard(valor, divisor) {
if (typeof safeDivide === "function") {
return safeDivide(valor, divisor);
}

if (!divisor) {
return 0;
}

return valor / divisor;
}

function limparTextoDashboard(valor, fallback) {
if (typeof sanitizeText === "function") {
return sanitizeText(valor, fallback);
}

if (valor === null || valor === undefined || valor === "") {
return fallback || "";
}

return String(valor);
}

function formatarMoedaDashboard(valor) {
if (typeof formatCurrency === "function") {
return formatCurrency(valor);
}

var numero = numeroDashboard(valor);

return numero.toLocaleString("pt-BR", {
style: "currency",
currency: "BRL"
});
}

function formatarNumeroDashboard(valor, casas) {
if (typeof formatNumber === "function") {
return formatNumber(valor, casas);
}

var numero = numeroDashboard(valor);

return numero.toLocaleString("pt-BR", {
minimumFractionDigits: casas,
maximumFractionDigits: casas
});
}

function formatarPercentualDashboard(valor) {
if (typeof formatPercent === "function") {
return formatPercent(valor);
}

return formatarNumeroDashboard(valor, 2) + "%";
}

function formatarDataDashboard(data) {
if (typeof formatDateBR === "function") {
return formatDateBR(data);
}

if (!data) {
return "-";
}

var texto = String(data);

if (texto.indexOf("-") >= 0) {
var partes = texto.substring(0, 10).split("-");

if (partes.length === 3) {
  return partes[2] + "/" + partes[1] + "/" + partes[0];
}


}

return texto;
}

function badgeStatusDashboard(status) {
if (typeof getStatusBadge === "function") {
return getStatusBadge(status);
}

return "<span class='badge'>" + escaparHtmlDashboard(status) + "</span>";
}

function escaparHtmlDashboard(valor) {
if (valor === null || valor === undefined) {
return "";
}

return String(valor);
}
