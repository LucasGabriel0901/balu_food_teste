// ==============================
// BALU FOOD - COMPRAS REALIZADAS
// Registro de compras para alimentar estoque e CMV
// Versão ajustada e sem script extra no HTML
// ==============================

var comprasCache = [];

var BALU_COMPRAS_STORAGE_KEY =
typeof BALU_KEYS !== "undefined" && BALU_KEYS.compras
? BALU_KEYS.compras
: "balu_compras";

document.addEventListener("DOMContentLoaded", function () {
initComprasRealizadas();
});

function initComprasRealizadas() {
comprasCache = carregarComprasLocal();

initEventosCompras();
initImagemCompra();
garantirAoMenosUmItemCompra();
atualizarPreviewCompra();
renderCompras();

if (window.lucide) {
lucide.createIcons();
}
}

function initEventosCompras() {
var form = document.getElementById("formCompra");
var btnNova = document.getElementById("btnNovaCompra");
var search = document.getElementById("searchCompras");
var filterTipo = document.getElementById("filterTipoCompra");
var filterStatus = document.getElementById("filterStatusCompra");
var btnExportar = document.getElementById("btnExportarCompras");
var btnAdicionarItem = document.getElementById("btnAdicionarItemCompra");
var container = document.getElementById("compraItemsContainer");

if (btnNova) {
btnNova.addEventListener("click", function () {
prepararNovaCompra();
});
}

if (form) {
form.addEventListener("submit", function (event) {
event.preventDefault();
salvarCompra();
});
}

if (search) {
search.addEventListener("input", renderCompras);
}

if (filterTipo) {
filterTipo.addEventListener("change", renderCompras);
}

if (filterStatus) {
filterStatus.addEventListener("change", renderCompras);
}

if (btnExportar) {
btnExportar.addEventListener("click", exportarCompras);
}

if (btnAdicionarItem) {
btnAdicionarItem.addEventListener("click", function () {
adicionarItemCompra();
});
}

if (container) {
container.addEventListener("input", function (event) {
if (campoItemCompra(event.target)) {
atualizarPreviewCompra();
}
});


container.addEventListener("change", function (event) {
  if (campoItemCompra(event.target)) {
    atualizarPreviewCompra();
  }
});

container.addEventListener("click", function (event) {
  var button = event.target.closest("button");

  if (!button) {
    return;
  }

  if (button.classList.contains("compraItemRemove")) {
    var item = button.closest(".compra-item");

    if (item) {
      item.remove();
      garantirAoMenosUmItemCompra();
      atualizarPreviewCompra();
    }
  }
});


}

[
"compraDesconto",
"compraFrete",
"compraImpostos",
"compraStatus",
"compraData",
"compraCompetencia",
"compraTipo"
].forEach(function (id) {
var campo = document.getElementById(id);


if (campo) {
  campo.addEventListener("input", atualizarPreviewCompra);
  campo.addEventListener("change", atualizarPreviewCompra);
}


});
}

function campoItemCompra(campo) {
if (!campo) {
return false;
}

return (
campo.classList.contains("compraItemTipo") ||
campo.classList.contains("compraItemNome") ||
campo.classList.contains("compraItemQuantidade") ||
campo.classList.contains("compraItemUnidade") ||
campo.classList.contains("compraItemValorUnitario")
);
}

function initImagemCompra() {
var input = document.getElementById("compraImagemInput");
var preview = document.getElementById("compraImagemPreview");
var placeholder = document.getElementById("compraImagemPlaceholder");

if (!input || !preview) {
return;
}

input.addEventListener("change", function () {
var file = input.files && input.files[0];


if (!file) {
  return;
}

converterImagemCompraBase64(file).then(function (imageBase64) {
  input.dataset.imageBase64 = imageBase64;

  preview.src = imageBase64;
  preview.style.display = "block";

  if (placeholder) {
    placeholder.style.display = "none";
  }
});


});
}

function prepararNovaCompra() {
resetarFormularioCompra();

var title = document.getElementById("drawerCompraTitle");

if (title) {
title.textContent = "Nova Compra";
}

setValueCompra("compraData", dataAtualInput());
setValueCompra("compraCompetencia", competenciaAtualInput());
setValueCompra("compraStatus", "Confirmada");
setValueCompra("compraFormaPagamento", "Pix");

atualizarPreviewCompra();
abrirDrawerCompra();
}

function resetarFormularioCompra() {
var form = document.getElementById("formCompra");
var inputImagem = document.getElementById("compraImagemInput");
var preview = document.getElementById("compraImagemPreview");
var placeholder = document.getElementById("compraImagemPlaceholder");
var container = document.getElementById("compraItemsContainer");

if (form) {
form.reset();
}

setValueCompra("compraId", "");

if (inputImagem) {
inputImagem.value = "";
inputImagem.dataset.imageBase64 = "";
}

if (preview) {
preview.src = "";
preview.style.display = "none";
}

if (placeholder) {
placeholder.style.display = "block";
}

if (container) {
container.innerHTML = "";
adicionarItemCompra();
}

atualizarPreviewCompra();
}

function garantirAoMenosUmItemCompra() {
var container = document.getElementById("compraItemsContainer");

if (!container) {
return;
}

var itens = container.querySelectorAll(".compra-item");

if (itens.length === 0) {
adicionarItemCompra();
}
}

function adicionarItemCompra(itemSalvo) {
var container = document.getElementById("compraItemsContainer");

if (!container) {
return;
}

var div = document.createElement("div");
div.className = "inventory-item compra-item";

div.innerHTML =
"<div class='inventory-item-grid'>" +
"<div class='form-field'>" +
"<label>Tipo</label>" +
"<select class='compraItemTipo'>" +
"<option value='Insumo'>Insumo</option>" +
"<option value='Embalagem'>Embalagem</option>" +
"<option value='Outro'>Outro</option>" +
"</select>" +
"</div>" +


  "<div class='form-field'>" +
    "<label>Item</label>" +
    "<input type='text' class='compraItemNome' placeholder='Ex: Arroz, carne, marmita...'>" +
  "</div>" +

  "<div class='form-field'>" +
    "<label>Quantidade</label>" +
    "<input type='number' class='compraItemQuantidade' min='0' step='0.01' placeholder='0'>" +
  "</div>" +

  "<div class='form-field'>" +
    "<label>Unidade</label>" +
    "<select class='compraItemUnidade'>" +
      "<option value='unidade'>Unidade</option>" +
      "<option value='kg'>Kg</option>" +
      "<option value='g'>Gramas</option>" +
      "<option value='litro'>Litro</option>" +
      "<option value='ml'>ML</option>" +
      "<option value='pacote'>Pacote</option>" +
      "<option value='caixa'>Caixa</option>" +
    "</select>" +
  "</div>" +

  "<div class='form-field'>" +
    "<label>Valor unitário</label>" +
    "<input type='number' class='compraItemValorUnitario' min='0' step='0.01' placeholder='0,00'>" +
  "</div>" +

  "<div class='form-field'>" +
    "<label>Total</label>" +
    "<input type='text' class='compraItemTotal calculated-field' readonly value='R$ 0,00'>" +
  "</div>" +

  "<button type='button' class='btn btn-outline btn-small compraItemRemove'>Remover</button>" +
"</div>";


container.appendChild(div);

if (itemSalvo) {
var tipo = div.querySelector(".compraItemTipo");
var nome = div.querySelector(".compraItemNome");
var quantidade = div.querySelector(".compraItemQuantidade");
var unidade = div.querySelector(".compraItemUnidade");
var valorUnitario = div.querySelector(".compraItemValorUnitario");


if (tipo) {
  tipo.value = itemSalvo.tipo || "Insumo";
}

if (nome) {
  nome.value = itemSalvo.nome || "";
}

if (quantidade) {
  quantidade.value = itemSalvo.quantidade || "";
}

if (unidade) {
  unidade.value = itemSalvo.unidade || "unidade";
}

if (valorUnitario) {
  valorUnitario.value = itemSalvo.valorUnitario || "";
}


}

atualizarPreviewCompra();
}

function salvarCompra() {
var id = getValueCompra("compraId");
var compraExistente = id ? buscarCompraPorId(id) : null;

var data = getValueCompra("compraData");
var fornecedor = getValueCompra("compraFornecedor");
var tipo = getValueCompra("compraTipo");

if (!data) {
mostrarMensagemCompra("Informe a data da compra.", "warning");
return;
}

if (!fornecedor) {
mostrarMensagemCompra("Informe o fornecedor.", "warning");
return;
}

if (!tipo) {
mostrarMensagemCompra("Selecione o tipo da compra.", "warning");
return;
}

var resultado = calcularCompra();

if (resultado.itens.length === 0) {
mostrarMensagemCompra("Adicione pelo menos um item com nome, quantidade e valor unitário.", "warning");
return;
}

var inputImagem = document.getElementById("compraImagemInput");
var imagem = inputImagem && inputImagem.dataset.imageBase64 ? inputImagem.dataset.imageBase64 : "";

if (!imagem && compraExistente && compraExistente.imagem) {
imagem = compraExistente.imagem;
}

var agora = new Date().toISOString();

var compra = {
id: id || gerarIdCompra(),
imagem: imagem,
data: data,
fornecedor: fornecedor,
numeroNota: getValueCompra("compraNumeroNota"),
tipo: tipo,
status: getValueCompra("compraStatus") || "Confirmada",
formaPagamento: getValueCompra("compraFormaPagamento"),
competencia: getValueCompra("compraCompetencia") || competenciaAtualInput(),
itens: resultado.itens,
subtotal: resultado.subtotal,
desconto: resultado.desconto,
frete: resultado.frete,
impostos: resultado.impostos,
ajustes: resultado.ajustes,
total: resultado.total,
observacoes: getValueCompra("compraObservacoes"),
criadoEm: compraExistente ? compraExistente.criadoEm : agora,
atualizadoEm: agora
};

if (id) {
comprasCache = comprasCache.map(function (item) {
return item.id === id ? compra : item;
});


mostrarMensagemCompra("Compra atualizada com sucesso.", "success");


} else {
comprasCache.push(compra);


mostrarMensagemCompra("Compra registrada com sucesso.", "success");


}

salvarComprasLocal();
fecharDrawerCompra();
resetarFormularioCompra();
renderCompras();
}

function editarCompra(id) {
var compra = buscarCompraPorId(id);

if (!compra) {
mostrarMensagemCompra("Compra não encontrada.", "danger");
return;
}

resetarFormularioCompra();

setValueCompra("compraId", compra.id);
setValueCompra("compraData", compra.data);
setValueCompra("compraFornecedor", compra.fornecedor);
setValueCompra("compraNumeroNota", compra.numeroNota);
setValueCompra("compraTipo", compra.tipo);
setValueCompra("compraStatus", compra.status);
setValueCompra("compraFormaPagamento", compra.formaPagamento);
setValueCompra("compraCompetencia", compra.competencia);
setValueCompra("compraDesconto", compra.desconto);
setValueCompra("compraFrete", compra.frete);
setValueCompra("compraImpostos", compra.impostos);
setValueCompra("compraObservacoes", compra.observacoes);

var title = document.getElementById("drawerCompraTitle");
var inputImagem = document.getElementById("compraImagemInput");
var preview = document.getElementById("compraImagemPreview");
var placeholder = document.getElementById("compraImagemPlaceholder");
var container = document.getElementById("compraItemsContainer");

if (title) {
title.textContent = "Editar Compra";
}

if (container) {
container.innerHTML = "";
}

if (Array.isArray(compra.itens) && compra.itens.length > 0) {
compra.itens.forEach(function (item) {
adicionarItemCompra(item);
});
} else {
adicionarItemCompra();
}

if (inputImagem) {
inputImagem.dataset.imageBase64 = compra.imagem || "";
}

if (preview && compra.imagem) {
preview.src = compra.imagem;
preview.style.display = "block";


if (placeholder) {
  placeholder.style.display = "none";
}


}

atualizarPreviewCompra();
abrirDrawerCompra();
}

function excluirCompra(id) {
var compra = buscarCompraPorId(id);

if (!compra) {
return;
}

var confirmar = true;

if (typeof confirmAction === "function") {
confirmar = confirmAction("Deseja excluir esta compra?");
} else {
confirmar = confirm("Deseja excluir esta compra?");
}

if (!confirmar) {
return;
}

comprasCache = comprasCache.filter(function (item) {
return item.id !== id;
});

salvarComprasLocal();
renderCompras();

mostrarMensagemCompra("Compra excluída com sucesso.", "success");
}

function buscarCompraPorId(id) {
return comprasCache.find(function (item) {
return item.id === id;
});
}

function calcularCompra() {
var items = document.querySelectorAll("#compraItemsContainer .compra-item");
var itens = [];
var subtotal = 0;

items.forEach(function (item) {
var tipo = pegarValorCampoItem(item, ".compraItemTipo") || "Insumo";
var nome = pegarValorCampoItem(item, ".compraItemNome");
var quantidade = numeroCompra(pegarValorCampoItem(item, ".compraItemQuantidade"));
var unidade = pegarValorCampoItem(item, ".compraItemUnidade") || "unidade";
var valorUnitario = numeroCompra(pegarValorCampoItem(item, ".compraItemValorUnitario"));
var totalItem = quantidade * valorUnitario;
var totalInput = item.querySelector(".compraItemTotal");


if (totalInput) {
  totalInput.value = formatarMoedaCompra(totalItem);
}

if (nome && quantidade > 0 && valorUnitario > 0) {
  itens.push({
    tipo: tipo,
    nome: nome,
    quantidade: quantidade,
    unidade: unidade,
    valorUnitario: valorUnitario,
    total: totalItem
  });

  subtotal += totalItem;
}


});

var desconto = numeroCompra(getValueCompra("compraDesconto"));
var frete = numeroCompra(getValueCompra("compraFrete"));
var impostos = numeroCompra(getValueCompra("compraImpostos"));

var ajustes = frete + impostos - desconto;
var total = subtotal + ajustes;

if (total < 0) {
total = 0;
}

return {
itens: itens,
subtotal: subtotal,
desconto: desconto,
frete: frete,
impostos: impostos,
ajustes: ajustes,
total: total
};
}

function atualizarPreviewCompra() {
var resultado = calcularCompra();
var status = getValueCompra("compraStatus") || "Confirmada";

setTextCompra("compraSubtotalPreview", formatarMoedaCompra(resultado.subtotal));
setTextCompra("compraAjustesPreview", formatarMoedaCompra(resultado.ajustes));
setTextCompra("compraTotalPreview", formatarMoedaCompra(resultado.total));

if (status === "Confirmada") {
setTextCompra("compraStatusCmvPreview", "Entra no CMV");
} else {
setTextCompra("compraStatusCmvPreview", "Não entra no CMV");
}
}

function renderCompras() {
var table = document.getElementById("comprasTable");

if (!table) {
return;
}

var lista = filtrarCompras();

renderResumoCompras();

if (lista.length === 0) {
table.innerHTML =
"<tr>" +
"<td colspan='10' class='text-muted'>Nenhuma compra encontrada.</td>" +
"</tr>";


return;


}

table.innerHTML = lista.map(function (compra) {
return "" +
"<tr>" +
"<td>" + formatarDataCompra(compra.data) + "</td>" +
"<td>" + textoSeguroCompra(compra.fornecedor) + "</td>" +
"<td>" + textoSeguroCompra(compra.numeroNota || "-") + "</td>" +
"<td>" + textoSeguroCompra(compra.tipo || "-") + "</td>" +
"<td>" + getResumoItensCompra(compra) + "</td>" +
"<td>" + formatarMoedaCompra(compra.subtotal) + "</td>" +
"<td>" + formatarMoedaCompra(compra.ajustes) + "</td>" +
"<td><strong>" + formatarMoedaCompra(compra.total) + "</strong></td>" +
"<td>" + badgeStatusCompra(compra.status || "Pendente") + "</td>" +
"<td>" +
"<div class='table-actions'>" +
"<button type='button' class='btn-icon' title='Editar' data-compra-action='edit' data-compra-id='" + escapeAttrCompra(compra.id) + "'>" +
"<i data-lucide='edit-3'></i>" +
"</button>" +
"<button type='button' class='btn-icon danger' title='Excluir' data-compra-action='delete' data-compra-id='" + escapeAttrCompra(compra.id) + "'>" +
"<i data-lucide='trash-2'></i>" +
"</button>" +
"</div>" +
"</td>" +
"</tr>";
}).join("");

vincularAcoesTabelaCompras();

if (window.lucide) {
lucide.createIcons();
}
}

function vincularAcoesTabelaCompras() {
document.querySelectorAll("[data-compra-action]").forEach(function (botao) {
botao.addEventListener("click", function () {
var acao = botao.getAttribute("data-compra-action");
var id = botao.getAttribute("data-compra-id");


  if (!id) {
    return;
  }

  if (acao === "edit") {
    editarCompra(id);
  }

  if (acao === "delete") {
    excluirCompra(id);
  }
});


});
}

function filtrarCompras() {
var search = getValueCompra("searchCompras").toLowerCase();
var tipo = getValueCompra("filterTipoCompra");
var status = getValueCompra("filterStatusCompra");

return comprasCache
.filter(function (compra) {
var texto =
String(compra.fornecedor || "") + " " +
String(compra.numeroNota || "") + " " +
String(compra.tipo || "") + " " +
String(compra.status || "") + " " +
String(compra.observacoes || "") + " " +
getResumoItensCompra(compra) + " " +
getTextoItensCompra(compra);


  texto = texto.toLowerCase();

  var passaBusca = !search || texto.indexOf(search) >= 0;
  var passaTipo = !tipo || compra.tipo === tipo;
  var passaStatus = !status || compra.status === status;

  return passaBusca && passaTipo && passaStatus;
})
.sort(function (a, b) {
  return String(b.data || "").localeCompare(String(a.data || ""));
});


}

function renderResumoCompras() {
var competenciaAtual = competenciaAtualInput();

var comprasDoMes = comprasCache.filter(function (compra) {
return compraPertenceCompetenciaAtual(compra, competenciaAtual);
});

var comprasConfirmadas = comprasDoMes.filter(function (compra) {
return compra.status === "Confirmada";
});

var comprasPendentes = comprasDoMes.filter(function (compra) {
return compra.status === "Pendente";
});

var totalComprasMes = comprasConfirmadas.reduce(function (soma, compra) {
return soma + numeroCompra(compra.total);
}, 0);

var ticketMedio = comprasConfirmadas.length > 0 ? totalComprasMes / comprasConfirmadas.length : 0;

setTextCompra("totalComprasMes", formatarMoedaCompra(totalComprasMes));
setTextCompra("comprasConfirmadas", comprasConfirmadas.length);
setTextCompra("comprasPendentes", comprasPendentes.length);
setTextCompra("ticketMedioCompras", formatarMoedaCompra(ticketMedio));

setTextCompra("comprasFluxoCompras", formatarMoedaCompra(totalComprasMes));
setTextCompra("comprasFluxoEstoqueInicial", formatarMoedaCompra(0));
setTextCompra("comprasFluxoEstoqueFinal", formatarMoedaCompra(0));
setTextCompra("comprasFluxoCmv", formatarMoedaCompra(totalComprasMes));
}

function compraPertenceCompetenciaAtual(compra, competenciaAtual) {
if (!compra) {
return false;
}

if (compra.competencia) {
return String(compra.competencia) === competenciaAtual;
}

if (compra.data) {
return String(compra.data).substring(0, 7) === competenciaAtual;
}

return true;
}

function getResumoItensCompra(compra) {
if (Array.isArray(compra.itens) && compra.itens.length > 0) {
return compra.itens.length + " item(ns)";
}

return "0 item";
}

function getTextoItensCompra(compra) {
if (!Array.isArray(compra.itens)) {
return "";
}

return compra.itens.map(function (item) {
return [
item.tipo || "",
item.nome || "",
item.quantidade || "",
item.unidade || ""
].join(" ");
}).join(" ");
}

function exportarCompras() {
if (!comprasCache.length) {
mostrarMensagemCompra("Não há compras para exportar.", "warning");
return;
}

var linhas = [];

linhas.push("Data;Fornecedor;Nota;Tipo;Itens;Subtotal;Desconto;Frete;Impostos;Ajustes;Total;Status;Competencia;Forma de pagamento;Observacoes");

comprasCache.forEach(function (item) {
linhas.push([
limparCsvCompra(item.data || ""),
limparCsvCompra(item.fornecedor || ""),
limparCsvCompra(item.numeroNota || ""),
limparCsvCompra(item.tipo || ""),
limparCsvCompra(getResumoItensCompra(item)),
formatarNumeroCompra(item.subtotal, 2),
formatarNumeroCompra(item.desconto, 2),
formatarNumeroCompra(item.frete, 2),
formatarNumeroCompra(item.impostos, 2),
formatarNumeroCompra(item.ajustes, 2),
formatarNumeroCompra(item.total, 2),
limparCsvCompra(item.status || ""),
limparCsvCompra(item.competencia || ""),
limparCsvCompra(item.formaPagamento || ""),
limparCsvCompra(item.observacoes || "")
].join(";"));
});

var blob = new Blob([linhas.join("\n")], {
type: "text/csv;charset=utf-8;"
});

var url = URL.createObjectURL(blob);
var link = document.createElement("a");

link.href = url;
link.download = "balu-compras-realizadas.csv";
link.click();

URL.revokeObjectURL(url);

mostrarMensagemCompra("Arquivo de compras exportado.", "success");
}

function pegarValorCampoItem(item, seletor) {
var campo = item.querySelector(seletor);

if (!campo) {
return "";
}

return campo.value;
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

function getValueCompra(id) {
var element = document.getElementById(id);

if (!element) {
return "";
}

return element.value || "";
}

function setValueCompra(id, value) {
var element = document.getElementById(id);

if (element) {
element.value = value === undefined || value === null ? "" : value;
}
}

function setTextCompra(id, value) {
var element = document.getElementById(id);

if (!element) {
return;
}

if (element.tagName === "INPUT" || element.tagName === "TEXTAREA" || element.tagName === "SELECT") {
element.value = value === undefined || value === null ? "" : value;
} else {
element.textContent = value === undefined || value === null ? "" : value;
}
}

function numeroCompra(valor) {
if (valor === null || valor === undefined || valor === "") {
return 0;
}

if (typeof valor === "number") {
return isNaN(valor) ? 0 : valor;
}

var texto = String(valor)
.replace("R$", "")
.replace("%", "")
.replace(/\s/g, "")
.trim();

if (!texto) {
return 0;
}

if (texto.indexOf(",") >= 0) {
texto = texto.replace(/./g, "").replace(",", ".");
}

var numero = Number(texto);

if (isNaN(numero)) {
return 0;
}

return numero;
}


function formatarMoedaCompra(valor) {
var numero = numeroCompra(valor);

return numero.toLocaleString("pt-BR", {
style: "currency",
currency: "BRL"
});
}

function formatarNumeroCompra(valor, casas) {
var numero = numeroCompra(valor);

return numero.toLocaleString("pt-BR", {
minimumFractionDigits: casas,
maximumFractionDigits: casas
});
}

function formatarDataCompra(data) {
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

function badgeStatusCompra(status) {
var classe = "badge";

if (status === "Confirmada") {
classe += " success";
} else if (status === "Pendente") {
classe += " warning";
} else if (status === "Cancelada") {
classe += " danger";
}

return "<span class='" + classe + "'>" + textoSeguroCompra(status) + "</span>";
}

function textoSeguroCompra(value) {
return escapeHtmlCompra(value);
}

function escapeHtmlCompra(valor) {
var texto = String(valor === null || valor === undefined ? "" : valor);

var amp = String.fromCharCode(38);
var menor = String.fromCharCode(60);
var maior = String.fromCharCode(62);
var aspasDuplas = String.fromCharCode(34);
var aspasSimples = String.fromCharCode(39);

texto = texto.split(amp).join(amp + "amp;");
texto = texto.split(menor).join(amp + "lt;");
texto = texto.split(maior).join(amp + "gt;");
texto = texto.split(aspasDuplas).join(amp + "quot;");
texto = texto.split(aspasSimples).join(amp + "#039;");

return texto;
}

function escapeAttrCompra(valor) {
return escapeHtmlCompra(valor);
}





function limparCsvCompra(valor) {
return String(valor || "")
.replace(/;/g, ",")
.replace(/\n/g, " ")
.replace(/\r/g, " ")
.trim();
}

function carregarComprasLocal() {
if (typeof loadData === "function") {
return loadData(BALU_COMPRAS_STORAGE_KEY, []);
}

var texto = localStorage.getItem(BALU_COMPRAS_STORAGE_KEY);

if (!texto) {
return [];
}

try {
var dados = JSON.parse(texto);


if (Array.isArray(dados)) {
  return dados;
}

return [];


} catch (erro) {
console.error("Erro ao carregar compras:", erro);
return [];
}
}

function salvarComprasLocal() {
if (typeof saveData === "function") {
saveData(BALU_COMPRAS_STORAGE_KEY, comprasCache);
return;
}

localStorage.setItem(BALU_COMPRAS_STORAGE_KEY, JSON.stringify(comprasCache));
}

function gerarIdCompra() {
if (typeof generateId === "function") {
return generateId("CMP");
}

return "CMP-" + Date.now();
}

function mostrarMensagemCompra(mensagem, tipo) {
if (typeof showToast === "function") {
showToast(mensagem, tipo || "success");
return;
}

alert(mensagem);
}

function converterImagemCompraBase64(file) {
if (typeof imageToBase64 === "function") {
return imageToBase64(file);
}

return new Promise(function (resolve, reject) {
var reader = new FileReader();


reader.onload = function (event) {
  resolve(event.target.result);
};

reader.onerror = function () {
  reject(new Error("Erro ao converter imagem."));
};

reader.readAsDataURL(file);


});
}

function abrirDrawerCompra() {
if (typeof openDrawer === "function") {
openDrawer("drawerCompra");
return;
}

var drawer = document.getElementById("drawerCompra");

if (drawer) {
drawer.classList.add("active");
drawer.classList.add("open");
drawer.classList.add("is-open");
}
}

function fecharDrawerCompra() {
if (typeof closeDrawer === "function") {
closeDrawer();
return;
}

var drawer = document.getElementById("drawerCompra");

if (drawer) {
drawer.classList.remove("active");
drawer.classList.remove("open");
drawer.classList.remove("is-open");
}
}

window.editarCompra = editarCompra;
window.excluirCompra = excluirCompra;
window.atualizarPreviewCompra = atualizarPreviewCompra;
window.calcularCompra = calcularCompra;
