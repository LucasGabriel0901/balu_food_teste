// ==============================
// BALU FOOD - INVENTÁRIOS
// Inventário inicial, parcial e final para CMV
// ==============================

var inventariosCache = [];

document.addEventListener("DOMContentLoaded", function () {
initInventarios();
});

function initInventarios() {
inventariosCache = loadData(BALU_KEYS.inventarios, []);

initEventosInventarios();
initImagemInventario();
renderInventarios();

if (window.lucide) {
lucide.createIcons();
}
}

function initEventosInventarios() {
var form = document.getElementById("formInventario");
var btnNovo = document.getElementById("btnNovoInventario");
var search = document.getElementById("searchInventarios");
var filterTipo = document.getElementById("filterTipoInventario");
var filterStatus = document.getElementById("filterStatusInventario");
var btnExportar = document.getElementById("btnExportarInventarios");
var btnAdicionarItem = document.getElementById("btnAdicionarItemInventario");
var container = document.getElementById("inventarioItemsContainer");

if (btnNovo) {
btnNovo.addEventListener("click", function () {
prepararNovoInventario();
});
}

if (form) {
form.addEventListener("submit", function (event) {
event.preventDefault();
salvarInventario();
});
}

if (search) {
search.addEventListener("input", function () {
renderInventarios();
});
}

if (filterTipo) {
filterTipo.addEventListener("change", function () {
renderInventarios();
});
}

if (filterStatus) {
filterStatus.addEventListener("change", function () {
renderInventarios();
});
}

if (btnExportar) {
btnExportar.addEventListener("click", function () {
exportarInventarios();
});
}

if (btnAdicionarItem) {
btnAdicionarItem.addEventListener("click", function () {
adicionarItemInventario();
});
}

if (container) {
container.addEventListener("input", function () {
atualizarPreviewInventario();
});


container.addEventListener("change", function () {
  atualizarPreviewInventario();
});

container.addEventListener("click", function (event) {
  var button = event.target.closest("button");

  if (!button) return;

  if (button.classList.contains("inventarioItemRemove")) {
    var item = button.closest(".inventory-item");

    if (item) {
      item.remove();
      atualizarPreviewInventario();
    }
  }
});


}
}

function initImagemInventario() {
var input = document.getElementById("inventarioImagemInput");
var preview = document.getElementById("inventarioImagemPreview");
var placeholder = document.getElementById("inventarioImagemPlaceholder");

if (!input || !preview) return;

input.addEventListener("change", function () {
var file = input.files[0];


if (!file) return;

imageToBase64(file).then(function (imageBase64) {
  input.dataset.imageBase64 = imageBase64;

  preview.src = imageBase64;
  preview.style.display = "block";

  if (placeholder) {
    placeholder.style.display = "none";
  }
});


});
}

function prepararNovoInventario() {
resetarFormularioInventario();

var title = document.getElementById("drawerInventarioTitle");

if (title) {
title.textContent = "Novo Inventário";
}

setValue("inventarioData", dataAtualInput());
setValue("inventarioCompetencia", competenciaAtualInput());

atualizarPreviewInventario();
}

function resetarFormularioInventario() {
var form = document.getElementById("formInventario");
var inputImagem = document.getElementById("inventarioImagemInput");
var preview = document.getElementById("inventarioImagemPreview");
var placeholder = document.getElementById("inventarioImagemPlaceholder");
var container = document.getElementById("inventarioItemsContainer");

if (form) {
form.reset();
}

setValue("inventarioId", "");

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
adicionarItemInventario();
}
}

function adicionarItemInventario(itemSalvo) {
var container = document.getElementById("inventarioItemsContainer");

if (!container) return;

var div = document.createElement("div");

div.className = "inventory-item";

div.innerHTML =
"<div class='inventory-item-grid'>" +
"<div class='form-field'>" +
"<label>Tipo</label>" +
"<select class='inventarioItemTipo'>" +
"<option value='Insumo'>Insumo</option>" +
"<option value='Embalagem'>Embalagem</option>" +
"<option value='Outro'>Outro</option>" +
"</select>" +
"</div>" +


  "<div class='form-field'>" +
    "<label>Item</label>" +
    "<input type='text' class='inventarioItemNome' placeholder='Ex: Arroz, carne, marmita...'>" +
  "</div>" +

  "<div class='form-field'>" +
    "<label>Quantidade física</label>" +
    "<input type='number' class='inventarioItemQuantidade' min='0' step='0.01' placeholder='0'>" +
  "</div>" +

  "<div class='form-field'>" +
    "<label>Unidade</label>" +
    "<select class='inventarioItemUnidade'>" +
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
    "<label>Custo unitário</label>" +
    "<input type='number' class='inventarioItemCustoUnitario' min='0' step='0.01' placeholder='0,00'>" +
  "</div>" +

  "<div class='form-field'>" +
    "<label>Total</label>" +
    "<input type='text' class='inventarioItemTotal calculated-field' readonly value='R$ 0,00'>" +
  "</div>" +

  "<button type='button' class='btn btn-outline btn-small inventarioItemRemove'>Remover</button>" +
"</div>";


container.appendChild(div);

if (itemSalvo) {
var tipo = div.querySelector(".inventarioItemTipo");
var nome = div.querySelector(".inventarioItemNome");
var quantidade = div.querySelector(".inventarioItemQuantidade");
var unidade = div.querySelector(".inventarioItemUnidade");
var custoUnitario = div.querySelector(".inventarioItemCustoUnitario");

if (tipo) tipo.value = itemSalvo.tipo || "Insumo";
if (nome) nome.value = itemSalvo.nome || "";
if (quantidade) quantidade.value = itemSalvo.quantidade || "";
if (unidade) unidade.value = itemSalvo.unidade || "unidade";
if (custoUnitario) custoUnitario.value = itemSalvo.custoUnitario || "";


}

atualizarPreviewInventario();
}

function salvarInventario() {
var id = getValue("inventarioId");
var inventarioExistente = id ? buscarInventarioPorId(id) : null;

var data = getValue("inventarioData");
var competencia = getValue("inventarioCompetencia");
var tipo = getValue("inventarioTipo");
var responsavel = getValue("inventarioResponsavel");

if (!data) {
showToast("Informe a data do inventário.", "warning");
return;
}

if (!competencia) {
showToast("Informe a competência do inventário.", "warning");
return;
}

if (!tipo) {
showToast("Selecione o tipo do inventário.", "warning");
return;
}

if (!responsavel) {
showToast("Informe o responsável pelo inventário.", "warning");
return;
}

var resultado = calcularInventario();

if (resultado.itens.length === 0) {
showToast("Adicione pelo menos um item ao inventário.", "warning");
return;
}

var inputImagem = document.getElementById("inventarioImagemInput");
var imagem = inputImagem && inputImagem.dataset.imageBase64 ? inputImagem.dataset.imageBase64 : "";

if (!imagem && inventarioExistente && inventarioExistente.imagem) {
imagem = inventarioExistente.imagem;
}

var agora = new Date().toISOString();

var inventario = {
id: id || generateId("INV"),
imagem: imagem,
data: data,
competencia: competencia,
tipo: tipo,
status: getValue("inventarioStatus") || "Aberto",
responsavel: responsavel,
local: getValue("inventarioLocal"),
itens: resultado.itens,
totalItens: resultado.totalItens,
totalInsumos: resultado.totalInsumos,
totalEmbalagens: resultado.totalEmbalagens,
totalOutros: resultado.totalOutros,
totalGeral: resultado.totalGeral,
observacoes: getValue("inventarioObservacoes"),
criadoEm: inventarioExistente ? inventarioExistente.criadoEm : agora,
atualizadoEm: agora
};

if (id) {
inventariosCache = inventariosCache.map(function (item) {
return item.id === id ? inventario : item;
});


showToast("Inventário atualizado com sucesso.", "success");


} else {
inventariosCache.push(inventario);


showToast("Inventário registrado com sucesso.", "success");


}

saveData(BALU_KEYS.inventarios, inventariosCache);

closeDrawer();
resetarFormularioInventario();
renderInventarios();
}

function editarInventario(id) {
var inventario = buscarInventarioPorId(id);

if (!inventario) {
showToast("Inventário não encontrado.", "danger");
return;
}

resetarFormularioInventario();

setValue("inventarioId", inventario.id);
setValue("inventarioData", inventario.data);
setValue("inventarioCompetencia", inventario.competencia);
setValue("inventarioTipo", inventario.tipo);
setValue("inventarioStatus", inventario.status);
setValue("inventarioResponsavel", inventario.responsavel);
setValue("inventarioLocal", inventario.local);
setValue("inventarioObservacoes", inventario.observacoes);

var title = document.getElementById("drawerInventarioTitle");
var inputImagem = document.getElementById("inventarioImagemInput");
var preview = document.getElementById("inventarioImagemPreview");
var placeholder = document.getElementById("inventarioImagemPlaceholder");
var container = document.getElementById("inventarioItemsContainer");

if (title) {
title.textContent = "Editar Inventário";
}

if (container) {
container.innerHTML = "";
}

if (Array.isArray(inventario.itens)) {
inventario.itens.forEach(function (item) {
adicionarItemInventario(item);
});
}

if (inputImagem) {
inputImagem.dataset.imageBase64 = inventario.imagem || "";
}

if (preview && inventario.imagem) {
preview.src = inventario.imagem;
preview.style.display = "block";


if (placeholder) {
  placeholder.style.display = "none";
}


}

atualizarPreviewInventario();

openDrawer("drawerInventario");
}

function excluirInventario(id) {
var inventario = buscarInventarioPorId(id);

if (!inventario) return;

var confirmar = confirmAction("Deseja excluir este inventário?");

if (!confirmar) return;

inventariosCache = inventariosCache.filter(function (item) {
return item.id !== id;
});

saveData(BALU_KEYS.inventarios, inventariosCache);

renderInventarios();

showToast("Inventário excluído com sucesso.", "success");
}

function buscarInventarioPorId(id) {
return inventariosCache.find(function (item) {
return item.id === id;
});
}

function calcularInventario() {
var items = document.querySelectorAll(".inventory-item");
var itens = [];
var totalInsumos = 0;
var totalEmbalagens = 0;
var totalOutros = 0;

items.forEach(function (item) {
var tipo = pegarValorCampoItem(item, ".inventarioItemTipo");
var nome = pegarValorCampoItem(item, ".inventarioItemNome");
var quantidade = safeNumber(pegarValorCampoItem(item, ".inventarioItemQuantidade"));
var unidade = pegarValorCampoItem(item, ".inventarioItemUnidade");
var custoUnitario = safeNumber(pegarValorCampoItem(item, ".inventarioItemCustoUnitario"));
var totalItem = quantidade * custoUnitario;
var totalInput = item.querySelector(".inventarioItemTotal");


if (totalInput) {
  totalInput.value = formatCurrency(totalItem);
}

if (nome && quantidade > 0) {
  itens.push({
    tipo: tipo,
    nome: nome,
    quantidade: quantidade,
    unidade: unidade,
    custoUnitario: custoUnitario,
    total: totalItem
  });

  if (tipo === "Insumo") {
    totalInsumos += totalItem;
  } else if (tipo === "Embalagem") {
    totalEmbalagens += totalItem;
  } else {
    totalOutros += totalItem;
  }
}


});

var totalGeral = totalInsumos + totalEmbalagens + totalOutros;

return {
itens: itens,
totalItens: itens.length,
totalInsumos: totalInsumos,
totalEmbalagens: totalEmbalagens,
totalOutros: totalOutros,
totalGeral: totalGeral
};
}

function atualizarPreviewInventario() {
var resultado = calcularInventario();

setText("inventarioTotalItensPreview", resultado.totalItens);
setText("inventarioTotalInsumosPreview", formatCurrency(resultado.totalInsumos));
setText("inventarioTotalEmbalagensPreview", formatCurrency(resultado.totalEmbalagens));
setText("inventarioTotalGeralPreview", formatCurrency(resultado.totalGeral));
}

function renderInventarios() {
var table = document.getElementById("inventariosTable");

if (!table) return;

var lista = filtrarInventarios();

renderResumoInventarios();

if (lista.length === 0) {
table.innerHTML =
"<tr>" +
"<td colspan='10' class='text-muted'>Nenhum inventário encontrado.</td>" +
"</tr>";


return;


}

table.innerHTML = lista.map(function (inventario) {
return (
"<tr>" +
"<td>" + formatDateBR(inventario.data) + "</td>" +
"<td>" + textoSeguro(inventario.competencia || "-") + "</td>" +
"<td>" + textoSeguro(inventario.tipo || "-") + "</td>" +
"<td>" + textoSeguro(inventario.responsavel || "-") + "</td>" +
"<td>" + safeNumber(inventario.totalItens) + " item(ns)</td>" +
"<td>" + formatCurrency(inventario.totalInsumos) + "</td>" +
"<td>" + formatCurrency(inventario.totalEmbalagens) + "</td>" +
"<td><strong>" + formatCurrency(inventario.totalGeral) + "</strong></td>" +
"<td>" + getStatusBadge(inventario.status || "Aberto") + "</td>" +
"<td>" +
"<div class='table-actions'>" +
"<button type='button' class='btn-icon' title='Editar' onclick='editarInventario(\"" + inventario.id + "\")'>" +
"<i data-lucide='edit-3'></i>" +
"</button>" +
"<button type='button' class='btn-icon danger' title='Excluir' onclick='excluirInventario(\"" + inventario.id + "\")'>" +
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

function filtrarInventarios() {
var search = getValue("searchInventarios").toLowerCase();
var tipo = getValue("filterTipoInventario");
var status = getValue("filterStatusInventario");

return inventariosCache.filter(function (inventario) {
var texto =
String(inventario.data || "") + " " +
String(inventario.competencia || "") + " " +
String(inventario.tipo || "") + " " +
String(inventario.status || "") + " " +
String(inventario.responsavel || "") + " " +
String(inventario.local || "") + " " +
String(inventario.observacoes || "");


texto = texto.toLowerCase();

var passaBusca = !search || texto.indexOf(search) >= 0;
var passaTipo = !tipo || inventario.tipo === tipo;
var passaStatus = !status || inventario.status === status;

return passaBusca && passaTipo && passaStatus;


});
}

function renderResumoInventarios() {
var competencia = competenciaAtualInput();

var inventarioInicial = pegarUltimoInventarioTotal("Inicial", competencia);
var inventarioFinal = pegarUltimoInventarioTotal("Final", competencia);
var comprasMes = pegarTotalComprasConfirmadas(competencia);

var diferenca = inventarioInicial - inventarioFinal;
var cmvEstimado = Math.max(0, inventarioInicial + comprasMes - inventarioFinal);

setText("inventarioInicialTotal", formatCurrency(inventarioInicial));
setText("inventarioFinalTotal", formatCurrency(inventarioFinal));
setText("totalInventarios", inventariosCache.length);
setText("diferencaInventarios", formatCurrency(diferenca));

setText("fluxoInventarioInicial", formatCurrency(inventarioInicial));
setText("fluxoComprasMes", formatCurrency(comprasMes));
setText("fluxoInventarioFinal", formatCurrency(inventarioFinal));
setText("fluxoCmvInventario", formatCurrency(cmvEstimado));
}

function pegarUltimoInventarioTotal(tipo, competencia) {
var lista = inventariosCache.filter(function (inventario) {
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

function exportarInventarios() {
if (!inventariosCache.length) {
showToast("Não há inventários para exportar.", "warning");
return;
}

var linhas = [];

linhas.push("Data;Competencia;Tipo;Responsavel;Status;Itens;Total Insumos;Total Embalagens;Total Geral");

inventariosCache.forEach(function (item) {
linhas.push(
[
item.data || "",
item.competencia || "",
item.tipo || "",
item.responsavel || "",
item.status || "",
item.totalItens || 0,
formatNumber(item.totalInsumos, 2),
formatNumber(item.totalEmbalagens, 2),
formatNumber(item.totalGeral, 2)
].join(";")
);
});

var blob = new Blob([linhas.join("\n")], {
type: "text/csv;charset=utf-8;"
});

var url = URL.createObjectURL(blob);
var link = document.createElement("a");

link.href = url;
link.download = "balu-inventarios.csv";
link.click();

URL.revokeObjectURL(url);

showToast("Arquivo de inventários exportado.", "success");
}

function pegarValorCampoItem(item, seletor) {
var campo = item.querySelector(seletor);

if (!campo) return "";

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
