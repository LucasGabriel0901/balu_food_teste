// ==============================
// BALU FOOD - CMV REAL MENSAL
// Fechamento mensal: Estoque Inicial + Compras - Estoque Final
// ==============================

var cmvCache = [];

document.addEventListener("DOMContentLoaded", function () {
initCmvRealMensal();
});

function initCmvRealMensal() {
cmvCache = loadData(BALU_KEYS.cmv, []);

initEventosCmv();
renderCmv();

if (window.lucide) {
lucide.createIcons();
}
}

function initEventosCmv() {
var form = document.getElementById("formCmv");
var btnNovo = document.getElementById("btnNovoCmv");
var search = document.getElementById("searchCmv");
var filterStatus = document.getElementById("filterStatusCmv");
var filterClassificacao = document.getElementById("filterClassificacaoCmv");
var btnExportar = document.getElementById("btnExportarCmv");

if (btnNovo) {
btnNovo.addEventListener("click", function () {
prepararNovoCmv();
});
}

if (form) {
form.addEventListener("submit", function (event) {
event.preventDefault();
salvarCmv();
});
}

if (search) {
search.addEventListener("input", function () {
renderCmv();
});
}

if (filterStatus) {
filterStatus.addEventListener("change", function () {
renderCmv();
});
}

if (filterClassificacao) {
filterClassificacao.addEventListener("change", function () {
renderCmv();
});
}

if (btnExportar) {
btnExportar.addEventListener("click", function () {
exportarCmv();
});
}

var camposCalculo = [
"cmvCompetencia",
"cmvFaturamento",
"cmvEstoqueInicial",
"cmvCompras",
"cmvEstoqueFinal",
"cmvPerdas",
"cmvAjustes"
];

camposCalculo.forEach(function (id) {
var campo = document.getElementById(id);

if (campo) {
  campo.addEventListener("input", function () {
    atualizarPreviewCmv();
  });

  campo.addEventListener("change", function () {
    if (id === "cmvCompetencia") {
      preencherValoresAutomaticos();
    }

    atualizarPreviewCmv();
  });
}


});
}

function prepararNovoCmv() {
resetarFormularioCmv();

var title = document.getElementById("drawerCmvTitle");

if (title) {
title.textContent = "Novo Fechamento de CMV";
}

setValue("cmvCompetencia", competenciaAtualInput());
setValue("cmvDataFechamento", dataAtualInput());
setValue("cmvResponsavel", "Lucas Gabriel");
setValue("cmvStatus", "Aberto");

preencherValoresAutomaticos();
atualizarPreviewCmv();

if (typeof openDrawer === "function") {
openDrawer("drawerCmv");
}
}

function resetarFormularioCmv() {
var form = document.getElementById("formCmv");

if (form) {
form.reset();
}

setValue("cmvId", "");
}

function preencherValoresAutomaticos() {
var competencia = getValue("cmvCompetencia");

if (!competencia) {
competencia = competenciaAtualInput();
}

var inventarioInicial = pegarUltimoInventarioTotal("Inicial", competencia);
var inventarioFinal = pegarUltimoInventarioTotal("Final", competencia);
var compras = pegarTotalComprasConfirmadas(competencia);

setValue("cmvEstoqueInicial", inventarioInicial);
setValue("cmvCompras", compras);
setValue("cmvEstoqueFinal", inventarioFinal);
}

function salvarCmv() {
var id = getValue("cmvId");
var cmvExistente = id ? buscarCmvPorId(id) : null;

var competencia = getValue("cmvCompetencia");
var dataFechamento = getValue("cmvDataFechamento");
var responsavel = getValue("cmvResponsavel");

if (!competencia) {
showToast("Informe a competência do fechamento.", "warning");
return;
}

if (!dataFechamento) {
showToast("Informe a data do fechamento.", "warning");
return;
}

if (!responsavel) {
showToast("Informe o responsável pelo fechamento.", "warning");
return;
}

var resultado = calcularCmv();

var agora = new Date().toISOString();

var cmv = {
id: id || generateId("CMV"),
competencia: competencia,
dataFechamento: dataFechamento,
responsavel: responsavel,
status: getValue("cmvStatus") || "Aberto",
faturamento: resultado.faturamento,
estoqueInicial: resultado.estoqueInicial,
compras: resultado.compras,
estoqueFinal: resultado.estoqueFinal,
perdas: resultado.perdas,
ajustes: resultado.ajustes,
cmvReal: resultado.cmvReal,
cmvPercentual: resultado.cmvPercentual,
lucroBruto: resultado.lucroBruto,
margemBruta: resultado.margemBruta,
classificacao: resultado.classificacao,
leitura: resultado.leitura,
motivoAjuste: getValue("cmvMotivoAjuste"),
observacoes: getValue("cmvObservacoes"),
criadoEm: cmvExistente ? cmvExistente.criadoEm : agora,
atualizadoEm: agora
};

if (id) {
cmvCache = cmvCache.map(function (item) {
return item.id === id ? cmv : item;
});


showToast("Fechamento de CMV atualizado com sucesso.", "success");


} else {
cmvCache.push(cmv);


showToast("Fechamento de CMV salvo com sucesso.", "success");


}

saveData(BALU_KEYS.cmv, cmvCache);

if (cmv.faturamento > 0) {
localStorage.setItem(BALU_KEYS.faturamentoMensal, cmv.faturamento);
}

closeDrawer();
resetarFormularioCmv();
renderCmv();
}

function editarCmv(id) {
var cmv = buscarCmvPorId(id);

if (!cmv) {
showToast("Fechamento não encontrado.", "danger");
return;
}

resetarFormularioCmv();

setValue("cmvId", cmv.id);
setValue("cmvCompetencia", cmv.competencia);
setValue("cmvDataFechamento", cmv.dataFechamento);
setValue("cmvResponsavel", cmv.responsavel);
setValue("cmvStatus", cmv.status);
setValue("cmvFaturamento", cmv.faturamento);
setValue("cmvEstoqueInicial", cmv.estoqueInicial);
setValue("cmvCompras", cmv.compras);
setValue("cmvEstoqueFinal", cmv.estoqueFinal);
setValue("cmvPerdas", cmv.perdas);
setValue("cmvAjustes", cmv.ajustes);
setValue("cmvMotivoAjuste", cmv.motivoAjuste);
setValue("cmvObservacoes", cmv.observacoes);

var title = document.getElementById("drawerCmvTitle");

if (title) {
title.textContent = "Editar Fechamento de CMV";
}

atualizarPreviewCmv();

openDrawer("drawerCmv");
}

function excluirCmv(id) {
var cmv = buscarCmvPorId(id);

if (!cmv) return;

var confirmar = confirmAction("Deseja excluir este fechamento de CMV?");

if (!confirmar) return;

cmvCache = cmvCache.filter(function (item) {
return item.id !== id;
});

saveData(BALU_KEYS.cmv, cmvCache);

renderCmv();

showToast("Fechamento excluído com sucesso.", "success");
}

function buscarCmvPorId(id) {
return cmvCache.find(function (item) {
return item.id === id;
});
}

function calcularCmv() {
var faturamento = safeNumber(getValue("cmvFaturamento"));
var estoqueInicial = safeNumber(getValue("cmvEstoqueInicial"));
var compras = safeNumber(getValue("cmvCompras"));
var estoqueFinal = safeNumber(getValue("cmvEstoqueFinal"));
var perdas = safeNumber(getValue("cmvPerdas"));
var ajustes = safeNumber(getValue("cmvAjustes"));

var cmvReal = estoqueInicial + compras - estoqueFinal;

if (cmvReal < 0) {
cmvReal = 0;
}

var cmvPercentual = faturamento > 0 ? safeDivide(cmvReal, faturamento) * 100 : 0;
var lucroBruto = faturamento - cmvReal;
var margemBruta = faturamento > 0 ? safeDivide(lucroBruto, faturamento) * 100 : 0;

var classificacao = "Não calculado";
var leitura = "Aguardando dados";

if (faturamento > 0 && cmvReal > 0) {
classificacao = classifyCMV(cmvPercentual);


if (classificacao === "Excelente") {
  leitura = "Operação com bom controle de custo.";
} else if (classificacao === "Dentro do esperado") {
  leitura = "Resultado dentro de uma faixa aceitável.";
} else if (classificacao === "Atenção") {
  leitura = "Revisar compras, perdas e precificação.";
} else {
  leitura = "Custo alto comprometendo a margem.";
}


}

return {
faturamento: faturamento,
estoqueInicial: estoqueInicial,
compras: compras,
estoqueFinal: estoqueFinal,
perdas: perdas,
ajustes: ajustes,
cmvReal: cmvReal,
cmvPercentual: cmvPercentual,
lucroBruto: lucroBruto,
margemBruta: margemBruta,
classificacao: classificacao,
leitura: leitura
};
}

function atualizarPreviewCmv() {
var resultado = calcularCmv();

setText("cmvRealPreview", formatCurrency(resultado.cmvReal));
setText("cmvPercentPreview", formatPercent(resultado.cmvPercentual));
setText("lucroBrutoPreview", formatCurrency(resultado.lucroBruto));
setText("margemBrutaPreview", formatPercent(resultado.margemBruta));
setText("cmvClassificacaoPreview", resultado.classificacao);
setText("cmvLeituraPreview", resultado.leitura);
}

function renderCmv() {
var table = document.getElementById("cmvTable");

if (!table) return;

var lista = filtrarCmv();

renderResumoCmv();

if (lista.length === 0) {
table.innerHTML =
"<tr>" +
"<td colspan='10' class='text-muted'>Nenhum fechamento de CMV encontrado.</td>" +
"</tr>";

return;


}

table.innerHTML = lista.map(function (cmv) {
return (
"<tr>" +
"<td>" + textoSeguro(cmv.competencia || "-") + "</td>" +
"<td>" + formatCurrency(cmv.faturamento) + "</td>" +
"<td>" + formatCurrency(cmv.estoqueInicial) + "</td>" +
"<td>" + formatCurrency(cmv.compras) + "</td>" +
"<td>" + formatCurrency(cmv.estoqueFinal) + "</td>" +
"<td><strong>" + formatCurrency(cmv.cmvReal) + "</strong></td>" +
"<td><strong>" + formatPercent(cmv.cmvPercentual) + "</strong></td>" +
"<td>" + criarBadgeClassificacao(cmv.classificacao) + "</td>" +
"<td>" + getStatusBadge(cmv.status || "Aberto") + "</td>" +
"<td>" +
"<div class='table-actions'>" +
"<button type='button' class='btn-icon' title='Editar' onclick='editarCmv(\"" + cmv.id + "\")'>" +
"<i data-lucide='edit-3'></i>" +
"</button>" +
"<button type='button' class='btn-icon danger' title='Excluir' onclick='excluirCmv(\"" + cmv.id + "\")'>" +
"<i data-lucide='trash-2'></i>" +
"</button>" +
"</div>" +
"</td>" +
"</tr>"
);
}).join("");

if (window.lucide) {
lucide.createIcons();
}
}

function filtrarCmv() {
var search = getValue("searchCmv").toLowerCase();
var status = getValue("filterStatusCmv");
var classificacao = getValue("filterClassificacaoCmv");

return cmvCache.filter(function (cmv) {
var texto =
String(cmv.competencia || "") + " " +
String(cmv.responsavel || "") + " " +
String(cmv.status || "") + " " +
String(cmv.classificacao || "") + " " +
String(cmv.observacoes || "");


texto = texto.toLowerCase();

var passaBusca = !search || texto.indexOf(search) >= 0;
var passaStatus = !status || cmv.status === status;
var passaClassificacao = !classificacao || cmv.classificacao === classificacao;

return passaBusca && passaStatus && passaClassificacao;


});
}

function renderResumoCmv() {
if (!cmvCache.length) {
limparResumoCmv();
return;
}

var fechamentosValidos = cmvCache.filter(function (item) {
return item.status !== "Cancelado";
});

if (!fechamentosValidos.length) {
limparResumoCmv();
return;
}

var ultimo = fechamentosValidos[fechamentosValidos.length - 1];

setText("cmvFaturamentoMes", formatCurrency(ultimo.faturamento));
setText("cmvRealMes", formatCurrency(ultimo.cmvReal));
setText("cmvPercentualMes", formatPercent(ultimo.cmvPercentual));
setText("cmvStatusMes", ultimo.classificacao || "Não calculado");

setText("cmvResultadoPrincipal", formatCurrency(ultimo.cmvReal));
setText(
"cmvResultadoDescricao",
"Competência " + textoSeguro(ultimo.competencia) + " • " + textoSeguro(ultimo.leitura)
);

setText("cmvResumoEstoqueInicial", formatCurrency(ultimo.estoqueInicial));
setText("cmvResumoCompras", formatCurrency(ultimo.compras));
setText("cmvResumoEstoqueFinal", formatCurrency(ultimo.estoqueFinal));
setText("cmvResumoResultado", formatCurrency(ultimo.cmvReal));

setText("cmvResumoPercentual", formatPercent(ultimo.cmvPercentual));
setText("cmvLucroBruto", formatCurrency(ultimo.lucroBruto));
setText("cmvMargemBruta", formatPercent(ultimo.margemBruta));

atualizarBadgeResumoCmv(ultimo.classificacao);
}

function limparResumoCmv() {
setText("cmvFaturamentoMes", formatCurrency(0));
setText("cmvRealMes", formatCurrency(0));
setText("cmvPercentualMes", formatPercent(0));
setText("cmvStatusMes", "Não calculado");

setText("cmvResultadoPrincipal", formatCurrency(0));
setText("cmvResultadoDescricao", "Nenhum fechamento mensal foi salvo ainda.");

setText("cmvResumoEstoqueInicial", formatCurrency(0));
setText("cmvResumoCompras", formatCurrency(0));
setText("cmvResumoEstoqueFinal", formatCurrency(0));
setText("cmvResumoResultado", formatCurrency(0));

setText("cmvResumoPercentual", formatPercent(0));
setText("cmvLucroBruto", formatCurrency(0));
setText("cmvMargemBruta", formatPercent(0));

atualizarBadgeResumoCmv("Aguardando dados");
}

function atualizarBadgeResumoCmv(classificacao) {
var badge = document.getElementById("cmvClassificacaoBadge");

if (!badge) return;

badge.textContent = classificacao || "Aguardando dados";
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
badge.classList.add("purple");
}
}

function criarBadgeClassificacao(classificacao) {
if (classificacao === "Excelente") {
return "<span class='finance-classification excellent'>Excelente</span>";
}

if (classificacao === "Dentro do esperado") {
return "<span class='finance-classification expected'>Dentro do esperado</span>";
}

if (classificacao === "Atenção") {
return "<span class='finance-classification warning'>Atenção</span>";
}

if (classificacao === "Crítico") {
return "<span class='finance-classification critical'>Crítico</span>";
}

return "<span class='badge purple'>Não calculado</span>";
}

function pegarUltimoInventarioTotal(tipo, competencia) {
var inventarios = loadData(BALU_KEYS.inventarios, []);

var lista = inventarios.filter(function (inventario) {
var mesmoTipo = inventario.tipo === tipo;
var mesmaCompetencia = !competencia || inventario.competencia === competencia;
var valido = inventario.status !== "Cancelado";


return mesmoTipo && mesmaCompetencia && valido;


});

if (lista.length === 0) {
return 0;
}

return safeNumber(lista[lista.length - 1].totalGeral);
}

function pegarTotalComprasConfirmadas(competencia) {
var compras = loadData(BALU_KEYS.compras, []);

return compras.reduce(function (soma, compra) {
var statusOk = compra.status === "Confirmada";
var competenciaOk = !competencia || !compra.competencia || compra.competencia === competencia;


if (statusOk && competenciaOk) {
  return soma + safeNumber(compra.total);
}

return soma;


}, 0);
}

function exportarCmv() {
if (!cmvCache.length) {
showToast("Não há fechamentos para exportar.", "warning");
return;
}

var linhas = [];

linhas.push("Competencia;Faturamento;Estoque Inicial;Compras;Estoque Final;Perdas;Ajustes;CMV Real;CMV Percentual;Lucro Bruto;Margem Bruta;Classificacao;Status");

cmvCache.forEach(function (item) {
linhas.push(
[
item.competencia || "",
formatNumber(item.faturamento, 2),
formatNumber(item.estoqueInicial, 2),
formatNumber(item.compras, 2),
formatNumber(item.estoqueFinal, 2),
formatNumber(item.perdas, 2),
formatNumber(item.ajustes, 2),
formatNumber(item.cmvReal, 2),
formatNumber(item.cmvPercentual, 2),
formatNumber(item.lucroBruto, 2),
formatNumber(item.margemBruta, 2),
item.classificacao || "",
item.status || ""
].join(";")
);
});

var blob = new Blob([linhas.join("\n")], {
type: "text/csv;charset=utf-8;"
});

var url = URL.createObjectURL(blob);
var link = document.createElement("a");

link.href = url;
link.download = "balu-cmv-real-mensal.csv";
link.click();

URL.revokeObjectURL(url);

showToast("Arquivo de CMV exportado.", "success");
}

function dataAtualInput() {
var hoje = new Date();
var ano = hoje.getFullYear();
var mes = String(hoje.getMonth() + 1).padStart(2, "0");
var dia = String(hoje.getDate()).padStart(2, "0");

return ano + "-" + mes + "-" + dia;
}

function competenciaAtualInput() {
var hoje = new Date();
var ano = hoje.getFullYear();
var mes = String(hoje.getMonth() + 1).padStart(2, "0");

return ano + "-" + mes;
}

function getValue(id) {
var element = document.getElementById(id);

if (!element) return "";

return element.value;
}

function setValue(id, value) {
var element = document.getElementById(id);

if (element) {
element.value = value === undefined || value === null ? "" : value;
}
}

function setText(id, value) {
var element = document.getElementById(id);

if (!element) return;

if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
element.value = value;
} else {
element.textContent = value;
}
}

function textoSeguro(value) {
if (value === null || value === undefined) {
return "";
}

return String(value);
}
