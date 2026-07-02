// ==============================
// BALU FOOD - INVENTARIOS
// Contagem fisica + ajuste de estoque + base para CMV
// ==============================

var inventariosCache = [];
var inventarioInsumosCache = [];
var inventarioEmbalagensCache = [];

var BALU_INVENTARIOS_KEY =
typeof BALU_KEYS !== "undefined" && BALU_KEYS.inventarios
? BALU_KEYS.inventarios
: "balu_inventarios";

var BALU_INVENTARIO_INSUMOS_KEY =
typeof BALU_KEYS !== "undefined" && BALU_KEYS.insumos
? BALU_KEYS.insumos
: "balu_insumos";

var BALU_INVENTARIO_EMBALAGENS_KEY =
typeof BALU_KEYS !== "undefined" && BALU_KEYS.embalagens
? BALU_KEYS.embalagens
: "balu_embalagens";

document.addEventListener("DOMContentLoaded", function () {
initInventarios();
});

function initInventarios() {
inventariosCache = carregarInventariosLocal();
recarregarCadastrosInventario();

initEventosInventarios();
initImagemInventario();
resetarItensInventarioPadrao();
renderInventarios();
criarIconesInventario();
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
prepararNovoInventario(true);
});
}

if (form) {
form.addEventListener("submit", function (event) {
event.preventDefault();
salvarInventario();
});
}

if (search) {
search.addEventListener("input", renderInventarios);
}

if (filterTipo) {
filterTipo.addEventListener("change", renderInventarios);
}

if (filterStatus) {
filterStatus.addEventListener("change", renderInventarios);
}

if (btnExportar) {
btnExportar.addEventListener("click", exportarInventarios);
}

if (btnAdicionarItem) {
btnAdicionarItem.addEventListener("click", function () {
adicionarItemInventario();
});
}

if (container) {
container.addEventListener("input", function (event) {
if (campoItemInventario(event.target)) {
  atualizarPreviewInventario();
}
});

container.addEventListener("change", function (event) {
var campo = event.target;
var item = campo.closest(".inventory-item");

if (campo.classList.contains("inventarioItemTipo")) {
  atualizarSelectItemInventario(item);
}

if (campo.classList.contains("inventarioItemSelect")) {
  preencherItemInventarioSelecionado(item);
}

if (campoItemInventario(campo)) {
  atualizarPreviewInventario();
}
});

container.addEventListener("click", function (event) {
var button = event.target.closest("button");

if (!button) {
  return;
}

if (button.classList.contains("inventarioItemRemove")) {
  var item = button.closest(".inventory-item");

  if (item) {
    item.remove();
    garantirAoMenosUmItemInventario();
    atualizarPreviewInventario();
  }
}
});
}
}

function campoItemInventario(campo) {
if (!campo) {
return false;
}

return (
campo.classList.contains("inventarioItemTipo") ||
campo.classList.contains("inventarioItemSelect") ||
campo.classList.contains("inventarioItemNome") ||
campo.classList.contains("inventarioItemQuantidade") ||
campo.classList.contains("inventarioItemUnidade") ||
campo.classList.contains("inventarioItemCustoUnitario")
);
}

function recarregarCadastrosInventario() {
inventarioInsumosCache = carregarListaLocalInventario(BALU_INVENTARIO_INSUMOS_KEY);
inventarioEmbalagensCache = carregarListaLocalInventario(BALU_INVENTARIO_EMBALAGENS_KEY);
}

function initImagemInventario() {
var input = document.getElementById("inventarioImagemInput");
var preview = document.getElementById("inventarioImagemPreview");
var placeholder = document.getElementById("inventarioImagemPlaceholder");

if (!input || !preview) {
return;
}

input.addEventListener("change", function () {
var file = input.files && input.files[0];

if (!file) {
  return;
}

converterImagemInventarioBase64(file).then(function (imageBase64) {
  input.dataset.imageBase64 = imageBase64;
  preview.src = imageBase64;
  preview.style.display = "block";

  if (placeholder) {
    placeholder.style.display = "none";
  }
});
});
}

function prepararNovoInventario(abrir) {
resetarFormularioInventario();

var title = document.getElementById("drawerInventarioTitle");

if (title) {
title.textContent = "Novo Inventario";
}

setValue("inventarioData", dataAtualInput());
setValue("inventarioCompetencia", competenciaAtualInput());
setValue("inventarioTipo", "Final");
setValue("inventarioStatus", "Finalizado");
setValue("inventarioResponsavel", obterResponsavelPadraoInventario());

popularInventarioComEstoqueAtual();
atualizarPreviewInventario();

if (abrir) {
openDrawer("drawerInventario");
}
}

function resetarFormularioInventario() {
var form = document.getElementById("formInventario");
var inputImagem = document.getElementById("inventarioImagemInput");
var preview = document.getElementById("inventarioImagemPreview");
var placeholder = document.getElementById("inventarioImagemPlaceholder");

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

resetarItensInventarioPadrao();
}

function resetarItensInventarioPadrao() {
var container = document.getElementById("inventarioItemsContainer");

if (!container) {
return;
}

container.innerHTML = "";
adicionarItemInventario();
}

function popularInventarioComEstoqueAtual() {
var container = document.getElementById("inventarioItemsContainer");

if (!container) {
return;
}

recarregarCadastrosInventario();
container.innerHTML = "";

inventarioInsumosCache.forEach(function (item) {
adicionarItemInventario(montarItemInventarioDoCadastro("Insumo", item));
});

inventarioEmbalagensCache.forEach(function (item) {
adicionarItemInventario(montarItemInventarioDoCadastro("Embalagem", item));
});

garantirAoMenosUmItemInventario();
}

function garantirAoMenosUmItemInventario() {
var container = document.getElementById("inventarioItemsContainer");

if (!container) {
return;
}

if (!container.querySelector(".inventory-item")) {
adicionarItemInventario();
}
}

function montarItemInventarioDoCadastro(tipo, cadastro) {
var estoqueSistema = numeroInventario(cadastro.estoqueAtual);
var custoUnitario = obterCustoCadastroInventario(tipo, cadastro);
var custoReferencia = obterUnidadeCustoCadastroInventario(tipo, cadastro);

return {
tipo: tipo,
itemId: cadastro.id || "",
codigo: cadastro.codigo || "",
nome: cadastro.nome || "",
quantidade: estoqueSistema,
unidade: obterUnidadeCadastroInventario(tipo, cadastro),
custoUnitario: custoUnitario,
custoReferencia: custoReferencia,
estoqueSistema: estoqueSistema,
valorSistema: calcularValorFisicoInventario(tipo, estoqueSistema, obterUnidadeCadastroInventario(tipo, cadastro), custoUnitario, custoReferencia)
};
}

function adicionarItemInventario(itemSalvo) {
var container = document.getElementById("inventarioItemsContainer");

if (!container) {
return;
}

var div = document.createElement("div");
div.className = "inventory-item";

div.innerHTML =
"<div class='inventory-item-grid'>" +
"<input type='hidden' class='inventarioItemId'>" +
"<input type='hidden' class='inventarioItemCodigo'>" +
"<input type='hidden' class='inventarioItemEstoqueSistema'>" +
"<input type='hidden' class='inventarioItemCustoReferencia'>" +
"<div class='form-field'>" +
"<label>Tipo</label>" +
"<select class='inventarioItemTipo'>" +
"<option value='Insumo'>Insumo</option>" +
"<option value='Embalagem'>Embalagem</option>" +
"<option value='Outro'>Outro</option>" +
"</select>" +
"</div>" +
"<div class='form-field'>" +
"<label>Item cadastrado</label>" +
"<select class='inventarioItemSelect'></select>" +
"</div>" +
"<div class='form-field'>" +
"<label>Nome</label>" +
"<input type='text' class='inventarioItemNome' placeholder='Selecione ou informe o item'>" +
"</div>" +
"<div class='form-field'>" +
"<label>Estoque sistema</label>" +
"<input type='text' class='inventarioItemSistema calculated-field' readonly value='0'>" +
"</div>" +
"<div class='form-field'>" +
"<label>Quantidade fisica</label>" +
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
"<label>Custo unitario</label>" +
"<input type='number' class='inventarioItemCustoUnitario' min='0' step='0.01' placeholder='0,00'>" +
"</div>" +
"<div class='form-field'>" +
"<label>Total fisico</label>" +
"<input type='text' class='inventarioItemTotal calculated-field' readonly value='R$ 0,00'>" +
"</div>" +
"<div class='form-field'>" +
"<label>Diferenca</label>" +
"<input type='text' class='inventarioItemDiferenca calculated-field' readonly value='0'>" +
"</div>" +
"<div class='form-field'>" +
"<label>Status</label>" +
"<input type='text' class='inventarioItemStatus calculated-field' readonly value='OK'>" +
"</div>" +
"<button type='button' class='btn btn-outline btn-small inventarioItemRemove'>Remover</button>" +
"</div>";

container.appendChild(div);

if (itemSalvo) {
setItemValueInventario(div, ".inventarioItemTipo", itemSalvo.tipo || "Insumo");
atualizarSelectItemInventario(div, itemSalvo);
setItemValueInventario(div, ".inventarioItemId", itemSalvo.itemId || itemSalvo.id || "");
setItemValueInventario(div, ".inventarioItemCodigo", itemSalvo.codigo || "");
setItemValueInventario(div, ".inventarioItemNome", itemSalvo.nome || "");
setItemValueInventario(div, ".inventarioItemEstoqueSistema", numeroInventario(itemSalvo.estoqueSistema));
setItemValueInventario(div, ".inventarioItemSistema", formatarNumeroInventario(itemSalvo.estoqueSistema, 2));
setItemValueInventario(div, ".inventarioItemQuantidade", itemSalvo.quantidade || "");
setItemValueInventario(div, ".inventarioItemUnidade", itemSalvo.unidade || "unidade");
setItemValueInventario(div, ".inventarioItemCustoUnitario", itemSalvo.custoUnitario || "");
setItemValueInventario(div, ".inventarioItemCustoReferencia", itemSalvo.custoReferencia || inferirUnidadeCustoInventario(itemSalvo.tipo || "Insumo", itemSalvo.unidade || "unidade"));
selecionarOpcaoItemInventario(div, itemSalvo);
} else {
atualizarSelectItemInventario(div);
}

atualizarPreviewInventario();
criarIconesInventario();
}

function atualizarSelectItemInventario(item, itemSalvo) {
if (!item) {
return;
}

var tipo = pegarValorCampoItem(item, ".inventarioItemTipo") || "Insumo";
var select = item.querySelector(".inventarioItemSelect");

if (!select) {
return;
}

var lista = obterListaPorTipoInventario(tipo);
var html = "<option value=''>Selecione um item cadastrado</option>";

lista.forEach(function (cadastro) {
var valor = montarValorOpcaoInventario(tipo, cadastro);
var nome = limparTextoInventario(cadastro.nome || "Item sem nome");
var codigo = limparTextoInventario(cadastro.codigo || "");
var estoque = numeroInventario(cadastro.estoqueAtual);

html += "<option value='" + escapeAttrInventario(valor) + "'>" +
escapeHtmlInventario((codigo ? codigo + " - " : "") + nome + " | estoque: " + formatarNumeroInventario(estoque, 2)) +
"</option>";
});

html += "<option value='manual'>Outro / manual</option>";
select.innerHTML = html;

if (tipo === "Outro") {
select.value = "manual";
select.disabled = true;
limparVinculoItemInventario(item);
} else {
select.disabled = false;
}

if (itemSalvo) {
selecionarOpcaoItemInventario(item, itemSalvo);
}
}

function selecionarOpcaoItemInventario(item, itemSalvo) {
var select = item.querySelector(".inventarioItemSelect");

if (!select || !itemSalvo) {
return;
}

var valor = montarValorOpcaoInventario(itemSalvo.tipo || "Insumo", {
id: itemSalvo.itemId || itemSalvo.id,
codigo: itemSalvo.codigo,
nome: itemSalvo.nome
});

var encontrado = Array.prototype.some.call(select.options, function (option) {
return option.value === valor;
});

if (encontrado) {
select.value = valor;
} else if ((itemSalvo.tipo || "") === "Outro") {
select.value = "manual";
}
}

function preencherItemInventarioSelecionado(item) {
if (!item) {
return;
}

var tipo = pegarValorCampoItem(item, ".inventarioItemTipo") || "Insumo";
var select = item.querySelector(".inventarioItemSelect");
var valor = select ? select.value : "";

if (!valor || valor === "manual" || tipo === "Outro") {
limparVinculoItemInventario(item);
return;
}

var cadastro = buscarCadastroInventarioPorValor(tipo, valor);

if (!cadastro) {
limparVinculoItemInventario(item);
return;
}

var estoqueSistema = numeroInventario(cadastro.estoqueAtual);
var custoUnitario = obterCustoCadastroInventario(tipo, cadastro);
var unidade = obterUnidadeCadastroInventario(tipo, cadastro);
var custoReferencia = obterUnidadeCustoCadastroInventario(tipo, cadastro);

setItemValueInventario(item, ".inventarioItemId", cadastro.id || "");
setItemValueInventario(item, ".inventarioItemCodigo", cadastro.codigo || "");
setItemValueInventario(item, ".inventarioItemNome", cadastro.nome || "");
setItemValueInventario(item, ".inventarioItemEstoqueSistema", estoqueSistema);
setItemValueInventario(item, ".inventarioItemSistema", formatarNumeroInventario(estoqueSistema, 2));
setItemValueInventario(item, ".inventarioItemQuantidade", estoqueSistema);
setItemValueInventario(item, ".inventarioItemUnidade", unidade);
setItemValueInventario(item, ".inventarioItemCustoUnitario", numeroParaInputInventario(custoUnitario));
setItemValueInventario(item, ".inventarioItemCustoReferencia", custoReferencia);
}

function limparVinculoItemInventario(item) {
setItemValueInventario(item, ".inventarioItemId", "");
setItemValueInventario(item, ".inventarioItemCodigo", "");
setItemValueInventario(item, ".inventarioItemEstoqueSistema", 0);
setItemValueInventario(item, ".inventarioItemSistema", "0");
setItemValueInventario(item, ".inventarioItemCustoReferencia", "");
}

function salvarInventario() {
recarregarCadastrosInventario();

var id = getValue("inventarioId");
var inventarioExistente = id ? buscarInventarioPorId(id) : null;
var data = getValue("inventarioData");
var competencia = getValue("inventarioCompetencia");
var tipo = getValue("inventarioTipo");
var responsavel = getValue("inventarioResponsavel");

if (!data) {
showToast("Informe a data do inventario.", "warning");
return;
}

if (!competencia) {
showToast("Informe a competencia do inventario.", "warning");
return;
}

if (!tipo) {
showToast("Selecione o tipo do inventario.", "warning");
return;
}

if (!responsavel) {
showToast("Informe o responsavel pelo inventario.", "warning");
return;
}

var resultado = calcularInventario();

if (resultado.itens.length === 0) {
showToast("Adicione pelo menos um item ao inventario.", "warning");
return;
}

var inputImagem = document.getElementById("inventarioImagemInput");
var imagem = inputImagem && inputImagem.dataset.imageBase64 ? inputImagem.dataset.imageBase64 : "";

if (!imagem && inventarioExistente && inventarioExistente.imagem) {
imagem = inventarioExistente.imagem;
}

var agora = new Date().toISOString();
var status = getValue("inventarioStatus") || "Aberto";

var inventario = {
id: id || gerarIdInventario(),
imagem: imagem,
data: data,
competencia: competencia,
tipo: tipo,
status: status,
responsavel: responsavel,
local: getValue("inventarioLocal"),
itens: resultado.itens,
totalItens: resultado.totalItens,
totalInsumos: resultado.totalInsumos,
totalEmbalagens: resultado.totalEmbalagens,
totalOutros: resultado.totalOutros,
totalGeral: resultado.totalGeral,
diferencaQuantidadeTotal: resultado.diferencaQuantidadeTotal,
diferencaValorTotal: resultado.diferencaValorTotal,
observacoes: getValue("inventarioObservacoes"),
estoqueAjustado: false,
criadoEm: inventarioExistente ? inventarioExistente.criadoEm : agora,
atualizadoEm: agora
};

if (status === "Finalizado") {
inventario.estoqueAjustado = aplicarAjusteEstoqueInventario(inventario);
}

if (id) {
inventariosCache = inventariosCache.map(function (item) {
return item.id === id ? inventario : item;
});
showToast("Inventario atualizado com sucesso.", "success");
} else {
inventariosCache.push(inventario);
showToast("Inventario registrado com sucesso.", "success");
}

salvarInventariosLocal();
closeDrawer();
resetarFormularioInventario();
renderInventarios();
}

function editarInventario(id) {
var inventario = buscarInventarioPorId(id);

if (!inventario) {
showToast("Inventario nao encontrado.", "danger");
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
title.textContent = "Editar Inventario";
}

if (container) {
container.innerHTML = "";
}

if (Array.isArray(inventario.itens) && inventario.itens.length > 0) {
inventario.itens.forEach(function (item) {
  adicionarItemInventario(item);
});
} else {
adicionarItemInventario();
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

if (!inventario) {
return;
}

var confirmar = typeof confirmAction === "function"
? confirmAction("Deseja excluir este inventario?")
: confirm("Deseja excluir este inventario?");

if (!confirmar) {
return;
}

inventariosCache = inventariosCache.filter(function (item) {
return item.id !== id;
});

salvarInventariosLocal();
renderInventarios();
showToast("Inventario excluido com sucesso.", "success");
}

function buscarInventarioPorId(id) {
return inventariosCache.find(function (item) {
return item.id === id;
});
}

function calcularInventario() {
var items = document.querySelectorAll("#inventarioItemsContainer .inventory-item");
var itens = [];
var totalInsumos = 0;
var totalEmbalagens = 0;
var totalOutros = 0;
var diferencaQuantidadeTotal = 0;
var diferencaValorTotal = 0;

items.forEach(function (item) {
var tipo = pegarValorCampoItem(item, ".inventarioItemTipo") || "Insumo";
var itemId = pegarValorCampoItem(item, ".inventarioItemId");
var codigo = pegarValorCampoItem(item, ".inventarioItemCodigo");
var nome = pegarValorCampoItem(item, ".inventarioItemNome");
var estoqueSistema = numeroInventario(pegarValorCampoItem(item, ".inventarioItemEstoqueSistema"));
var quantidade = numeroInventario(pegarValorCampoItem(item, ".inventarioItemQuantidade"));
var unidade = pegarValorCampoItem(item, ".inventarioItemUnidade") || "unidade";
var custoUnitario = numeroInventario(pegarValorCampoItem(item, ".inventarioItemCustoUnitario"));
var custoReferencia = pegarValorCampoItem(item, ".inventarioItemCustoReferencia") || inferirUnidadeCustoInventario(tipo, unidade);
var totalItem = calcularValorFisicoInventario(tipo, quantidade, unidade, custoUnitario, custoReferencia);
var diferencaQuantidade = quantidade - estoqueSistema;
var diferencaValor = calcularValorFisicoInventario(tipo, diferencaQuantidade, unidade, custoUnitario, custoReferencia);
var statusDiferenca = classificarDiferencaInventario(diferencaQuantidade);

setItemValueInventario(item, ".inventarioItemSistema", formatarNumeroInventario(estoqueSistema, 2));
setItemValueInventario(item, ".inventarioItemTotal", formatarMoedaInventario(totalItem));
setItemValueInventario(item, ".inventarioItemDiferenca", formatarNumeroInventario(diferencaQuantidade, 2) + " / " + formatarMoedaInventario(diferencaValor));
setItemValueInventario(item, ".inventarioItemStatus", statusDiferenca);

if (nome && quantidade >= 0) {
  itens.push({
    tipo: tipo,
    itemId: itemId,
    codigo: codigo,
    nome: nome,
    estoqueSistema: estoqueSistema,
    quantidade: quantidade,
    unidade: unidade,
    custoUnitario: custoUnitario,
    custoReferencia: custoReferencia,
    total: totalItem,
    diferencaQuantidade: diferencaQuantidade,
    diferencaValor: diferencaValor,
    statusDiferenca: statusDiferenca
  });

  if (tipo === "Insumo") {
    totalInsumos += totalItem;
  } else if (tipo === "Embalagem") {
    totalEmbalagens += totalItem;
  } else {
    totalOutros += totalItem;
  }

  diferencaQuantidadeTotal += diferencaQuantidade;
  diferencaValorTotal += diferencaValor;
}
});

return {
itens: itens,
totalItens: itens.length,
totalInsumos: totalInsumos,
totalEmbalagens: totalEmbalagens,
totalOutros: totalOutros,
totalGeral: totalInsumos + totalEmbalagens + totalOutros,
diferencaQuantidadeTotal: diferencaQuantidadeTotal,
diferencaValorTotal: diferencaValorTotal
};
}

function atualizarPreviewInventario() {
var resultado = calcularInventario();

setText("inventarioTotalItensPreview", resultado.totalItens);
setText("inventarioTotalInsumosPreview", formatarMoedaInventario(resultado.totalInsumos));
setText("inventarioTotalEmbalagensPreview", formatarMoedaInventario(resultado.totalEmbalagens));
setText("inventarioTotalGeralPreview", formatarMoedaInventario(resultado.totalGeral));
}

function aplicarAjusteEstoqueInventario(inventario) {
var ajustou = false;
var insumos = carregarListaLocalInventario(BALU_INVENTARIO_INSUMOS_KEY);
var embalagens = carregarListaLocalInventario(BALU_INVENTARIO_EMBALAGENS_KEY);

inventario.itens.forEach(function (item) {
if (!item || item.tipo === "Outro") {
  return;
}

var lista = item.tipo === "Insumo" ? insumos : embalagens;
var cadastro = buscarItemEstoqueInventario(lista, item);

if (!cadastro) {
  return;
}

cadastro.estoqueAtual = numeroInventario(item.quantidade);
cadastro.valorEstoque = calcularValorFisicoInventario(item.tipo, item.quantidade, item.unidade, item.custoUnitario, item.custoReferencia);
cadastro.statusEstoque = calcularStatusEstoqueInventario(cadastro);
cadastro.atualizadoEm = new Date().toISOString();
ajustou = true;
});

if (ajustou) {
salvarListaLocalInventario(BALU_INVENTARIO_INSUMOS_KEY, insumos);
salvarListaLocalInventario(BALU_INVENTARIO_EMBALAGENS_KEY, embalagens);
recarregarCadastrosInventario();
}

return ajustou;
}

function renderInventarios() {
var table = document.getElementById("inventariosTable");

if (!table) {
return;
}

var lista = filtrarInventarios();
renderResumoInventarios();

if (lista.length === 0) {
table.innerHTML = "<tr><td colspan='10' class='text-muted'>Nenhum inventario encontrado.</td></tr>";
return;
}

table.innerHTML = lista.map(function (inventario) {
return "" +
"<tr>" +
"<td>" + formatarDataInventario(inventario.data) + "</td>" +
"<td>" + textoSeguro(inventario.competencia || "-") + "</td>" +
"<td>" + textoSeguro(inventario.tipo || "-") + "</td>" +
"<td>" + textoSeguro(inventario.responsavel || "-") + "</td>" +
"<td>" + numeroInventario(inventario.totalItens) + " item(ns)</td>" +
"<td>" + formatarMoedaInventario(inventario.totalInsumos) + "</td>" +
"<td>" + formatarMoedaInventario(inventario.totalEmbalagens) + "</td>" +
"<td><strong>" + formatarMoedaInventario(inventario.totalGeral) + "</strong></td>" +
"<td>" + badgeStatusInventario(inventario.status || "Aberto") + "</td>" +
"<td><div class='table-actions'>" +
"<button type='button' class='btn-icon' title='Editar' onclick='editarInventario(\"" + escapeAttrInventario(inventario.id) + "\")'><i data-lucide='edit-3'></i></button>" +
"<button type='button' class='btn-icon danger' title='Excluir' onclick='excluirInventario(\"" + escapeAttrInventario(inventario.id) + "\")'><i data-lucide='trash-2'></i></button>" +
"</div></td>" +
"</tr>";
}).join("");

criarIconesInventario();
}

function filtrarInventarios() {
var search = getValue("searchInventarios").toLowerCase();
var tipo = getValue("filterTipoInventario");
var status = getValue("filterStatusInventario");

return inventariosCache.filter(function (inventario) {
var texto = [
inventario.data,
inventario.competencia,
inventario.tipo,
inventario.status,
inventario.responsavel,
inventario.local,
inventario.observacoes
].join(" ").toLowerCase();

return (!search || texto.indexOf(search) >= 0) &&
(!tipo || inventario.tipo === tipo) &&
(!status || inventario.status === status);
});
}

function renderResumoInventarios() {
var competencia = competenciaAtualInput();
var inventarioInicial = pegarUltimoInventarioTotal("Inicial", competencia);
var inventarioFinal = pegarUltimoInventarioTotal("Final", competencia);
var comprasMes = pegarTotalComprasConfirmadas(competencia);
var diferenca = inventarioInicial - inventarioFinal;
var cmvEstimado = Math.max(0, inventarioInicial + comprasMes - inventarioFinal);

setText("inventarioInicialTotal", formatarMoedaInventario(inventarioInicial));
setText("inventarioFinalTotal", formatarMoedaInventario(inventarioFinal));
setText("totalInventarios", inventariosCache.length);
setText("diferencaInventarios", formatarMoedaInventario(diferenca));
setText("fluxoInventarioInicial", formatarMoedaInventario(inventarioInicial));
setText("fluxoComprasMes", formatarMoedaInventario(comprasMes));
setText("fluxoInventarioFinal", formatarMoedaInventario(inventarioFinal));
setText("fluxoCmvInventario", formatarMoedaInventario(cmvEstimado));
}

function pegarUltimoInventarioTotal(tipo, competencia) {
var lista = inventariosCache.filter(function (inventario) {
return inventario.tipo === tipo &&
(!competencia || inventario.competencia === competencia) &&
inventario.status !== "Cancelado";
});

if (!lista.length) {
return 0;
}

return numeroInventario(lista[lista.length - 1].totalGeral);
}

function pegarTotalComprasConfirmadas(competencia) {
var compras = typeof loadData === "function"
? loadData("compras", [])
: carregarListaLocalInventario("balu_compras_realizadas");

return compras.reduce(function (soma, compra) {
var statusOk = compra.status === "Confirmada";
var competenciaOk = !competencia || !compra.competencia || compra.competencia === competencia;
return statusOk && competenciaOk ? soma + numeroInventario(compra.total) : soma;
}, 0);
}

function exportarInventarios() {
if (!inventariosCache.length) {
showToast("Nao ha inventarios para exportar.", "warning");
return;
}

var linhas = [];
linhas.push("Data;Competencia;Tipo;Responsavel;Status;Itens;Total Insumos;Total Embalagens;Total Geral;Diferenca Valor");

inventariosCache.forEach(function (item) {
linhas.push([
item.data || "",
item.competencia || "",
item.tipo || "",
item.responsavel || "",
item.status || "",
item.totalItens || 0,
formatarNumeroInventario(item.totalInsumos, 2),
formatarNumeroInventario(item.totalEmbalagens, 2),
formatarNumeroInventario(item.totalGeral, 2),
formatarNumeroInventario(item.diferencaValorTotal, 2)
].join(";"));
});

baixarArquivoTextoInventario("balu-inventarios.csv", "\ufeff" + linhas.join("\n"), "text/csv;charset=utf-8;");
showToast("Arquivo de inventarios exportado.", "success");
}

function carregarInventariosLocal() {
if (typeof loadData === "function") {
var dados = loadData("inventarios", []);
return Array.isArray(dados) ? dados : [];
}

return carregarListaLocalInventario(BALU_INVENTARIOS_KEY);
}

function salvarInventariosLocal() {
if (typeof saveData === "function") {
saveData("inventarios", inventariosCache);
return;
}

localStorage.setItem(BALU_INVENTARIOS_KEY, JSON.stringify(inventariosCache));
}

function carregarListaLocalInventario(chave) {
try {
var texto = localStorage.getItem(chave);
var dados = texto ? JSON.parse(texto) : [];
return Array.isArray(dados) ? dados : [];
} catch (erro) {
return [];
}
}

function salvarListaLocalInventario(chave, lista) {
localStorage.setItem(chave, JSON.stringify(lista || []));
}

function obterListaPorTipoInventario(tipo) {
if (tipo === "Insumo") {
return inventarioInsumosCache;
}

if (tipo === "Embalagem") {
return inventarioEmbalagensCache;
}

return [];
}

function montarValorOpcaoInventario(tipo, item) {
return [tipo || "", item.id || "", item.codigo || "", normalizarTextoInventario(item.nome || "")].join("|");
}

function buscarCadastroInventarioPorValor(tipo, valor) {
return obterListaPorTipoInventario(tipo).find(function (item) {
return montarValorOpcaoInventario(tipo, item) === valor;
});
}

function buscarItemEstoqueInventario(lista, itemInventario) {
var itemId = String(itemInventario.itemId || itemInventario.id || "");
var codigo = normalizarTextoInventario(itemInventario.codigo || "");
var nome = normalizarTextoInventario(itemInventario.nome || "");

return lista.find(function (item) {
return (itemId && String(item.id || "") === itemId) ||
(codigo && normalizarTextoInventario(item.codigo || "") === codigo) ||
(nome && normalizarTextoInventario(item.nome || "") === nome);
});
}

function obterUnidadeCadastroInventario(tipo, item) {
return tipo === "Insumo"
? item.unidadeConsumo || item.unidadeCompra || "unidade"
: item.unidade || "unidade";
}

function obterCustoCadastroInventario(tipo, item) {
if (tipo === "Insumo") {
var unidade = normalizarUnidadeMedidaInventario(item.unidadeConsumo || item.unidadeCompra || "");
var precoMedioKg = numeroInventario(item.precoMedioKg);
var custoUnitario = numeroInventario(item.custoUnitario || item.precoUnitario);
var precoMedio = numeroInventario(item.precoMedio);

if (ehUnidadePesoInventario(unidade) && precoMedioKg > 0) {
  return precoMedioKg;
}

return custoUnitario || precoMedio || precoMedioKg || 0;
}

return numeroInventario(item.precoUnitario || item.precoMedioPacote || 0);
}

function obterUnidadeCustoCadastroInventario(tipo, item) {
if (tipo === "Insumo") {
var unidade = normalizarUnidadeMedidaInventario(item.unidadeConsumo || item.unidadeCompra || "");
var precoMedioKg = numeroInventario(item.precoMedioKg);

if (ehUnidadePesoInventario(unidade) && precoMedioKg > 0) {
  return "kg";
}

if (unidade === "un" || unidade === "unidade") {
  return "unidade";
}

return unidade || "unidade";
}

return "unidade";
}

function inferirUnidadeCustoInventario(tipo, unidade) {
var unidadeNormalizada = normalizarUnidadeMedidaInventario(unidade);

if (tipo === "Insumo" && ehUnidadePesoInventario(unidadeNormalizada)) {
return "kg";
}

return unidadeNormalizada || "unidade";
}

function calcularValorFisicoInventario(tipo, quantidade, unidadeQuantidade, custoUnitario, unidadeCusto) {
var quantidadeNumero = numeroInventario(quantidade);
var custoNumero = numeroInventario(custoUnitario);
var unidadeQtd = normalizarUnidadeMedidaInventario(unidadeQuantidade);
var unidadeValor = normalizarUnidadeMedidaInventario(unidadeCusto);

if (tipo === "Insumo" && ehUnidadePesoInventario(unidadeQtd) && unidadeValor === "kg") {
if (unidadeQtd === "g") {
  return (quantidadeNumero / 1000) * custoNumero;
}

return quantidadeNumero * custoNumero;
}

if (tipo === "Insumo" && unidadeQtd === "ml" && unidadeValor === "litro") {
return (quantidadeNumero / 1000) * custoNumero;
}

return quantidadeNumero * custoNumero;
}

function ehUnidadePesoInventario(unidade) {
var unidadeNormalizada = normalizarUnidadeMedidaInventario(unidade);
return unidadeNormalizada === "g" || unidadeNormalizada === "kg";
}

function normalizarUnidadeMedidaInventario(unidade) {
var texto = normalizarTextoInventario(unidade);

if (["g", "gr", "grama", "gramas"].indexOf(texto) >= 0) {
return "g";
}

if (["kg", "quilo", "quilos", "kilograma", "kilogramas"].indexOf(texto) >= 0) {
return "kg";
}

if (["ml", "mililitro", "mililitros"].indexOf(texto) >= 0) {
return "ml";
}

if (["l", "lt", "litro", "litros"].indexOf(texto) >= 0) {
return "litro";
}

if (["un", "und", "unid", "unidade", "unidades"].indexOf(texto) >= 0) {
return "unidade";
}

return texto || "unidade";
}

function calcularStatusEstoqueInventario(item) {
var estoqueAtual = numeroInventario(item.estoqueAtual);
var estoqueMinimo = numeroInventario(item.estoqueMinimo);
var estoqueIdeal = numeroInventario(item.estoqueIdeal);

if (item.status === "Inativo") {
return "Inativo";
}

if (estoqueAtual <= 0 || (estoqueMinimo > 0 && estoqueAtual <= estoqueMinimo)) {
return "Critico";
}

if (estoqueIdeal > 0 && estoqueAtual < estoqueIdeal) {
return "Atencao";
}

return "Estoque ok";
}

function classificarDiferencaInventario(diferenca) {
if (Math.abs(numeroInventario(diferenca)) < 0.0001) {
return "OK";
}

return diferenca > 0 ? "Sobra" : "Falta";
}

function pegarValorCampoItem(item, seletor) {
var campo = item.querySelector(seletor);
return campo ? campo.value : "";
}

function setItemValueInventario(item, seletor, valor) {
var campo = item.querySelector(seletor);

if (campo) {
campo.value = valor === undefined || valor === null ? "" : valor;
}
}

function dataAtualInput() {
var hoje = new Date();
return hoje.getFullYear() + "-" + String(hoje.getMonth() + 1).padStart(2, "0") + "-" + String(hoje.getDate()).padStart(2, "0");
}

function competenciaAtualInput() {
var hoje = new Date();
return hoje.getFullYear() + "-" + String(hoje.getMonth() + 1).padStart(2, "0");
}

function getValue(id) {
var element = document.getElementById(id);
return element ? element.value || "" : "";
}

function setValue(id, value) {
var element = document.getElementById(id);

if (element) {
element.value = value === undefined || value === null ? "" : value;
}
}

function setText(id, value) {
var element = document.getElementById(id);

if (!element) {
return;
}

if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
element.value = value === undefined || value === null ? "" : value;
} else {
element.textContent = value === undefined || value === null ? "" : value;
}
}

function numeroInventario(valor) {
if (typeof safeNumber === "function") {
return safeNumber(valor);
}

if (valor === null || valor === undefined || valor === "") {
return 0;
}

if (typeof valor === "number") {
return isNaN(valor) ? 0 : valor;
}

var texto = String(valor).replace("R$", "").replace("%", "").replace(/\s/g, "").trim();

if (texto.indexOf(",") >= 0) {
texto = texto.replace(/\./g, "").replace(",", ".");
}

var numero = Number(texto);
return isNaN(numero) ? 0 : numero;
}

function numeroParaInputInventario(valor) {
var numero = numeroInventario(valor);
return numero === 0 ? "" : String(numero);
}

function formatarMoedaInventario(valor) {
return numeroInventario(valor).toLocaleString("pt-BR", {
style: "currency",
currency: "BRL"
});
}

function formatarNumeroInventario(valor, casas) {
return numeroInventario(valor).toLocaleString("pt-BR", {
minimumFractionDigits: casas,
maximumFractionDigits: casas
});
}

function formatarDataInventario(data) {
if (typeof formatDateBR === "function") {
return formatDateBR(data);
}

if (!data) {
return "-";
}

var partes = String(data).substring(0, 10).split("-");
return partes.length === 3 ? partes[2] + "/" + partes[1] + "/" + partes[0] : String(data);
}

function badgeStatusInventario(status) {
if (typeof getStatusBadge === "function") {
return getStatusBadge(status);
}

return "<span class='badge'>" + escapeHtmlInventario(status) + "</span>";
}

function textoSeguro(value) {
return escapeHtmlInventario(value);
}

function limparTextoInventario(value) {
return String(value || "").trim();
}

function normalizarTextoInventario(valor) {
return String(valor || "")
.toLowerCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g, "")
.replace(/\s+/g, " ")
.trim();
}

function escapeHtmlInventario(valor) {
return String(valor === null || valor === undefined ? "" : valor)
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/"/g, "&quot;")
.replace(/'/g, "&#039;");
}

function escapeAttrInventario(valor) {
return escapeHtmlInventario(valor);
}

function gerarIdInventario() {
if (typeof generateId === "function") {
return generateId("INV");
}

return "INV-" + Date.now() + "-" + Math.floor(Math.random() * 9999);
}

function converterImagemInventarioBase64(file) {
if (typeof imageToBase64 === "function") {
return imageToBase64(file);
}

return new Promise(function (resolve, reject) {
var reader = new FileReader();
reader.onload = function (event) { resolve(event.target.result); };
reader.onerror = function () { reject(new Error("Erro ao converter imagem.")); };
reader.readAsDataURL(file);
});
}

function baixarArquivoTextoInventario(nome, conteudo, tipo) {
var blob = new Blob([conteudo], { type: tipo || "text/plain;charset=utf-8;" });
var url = URL.createObjectURL(blob);
var link = document.createElement("a");

link.href = url;
link.download = nome;
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
URL.revokeObjectURL(url);
}

function obterResponsavelPadraoInventario() {
if (typeof baluGetUsuarioNome === "function") {
return baluGetUsuarioNome();
}

return "Lucas Gabriel";
}

function criarIconesInventario() {
if (window.lucide) {
lucide.createIcons();
}
}

window.editarInventario = editarInventario;
window.excluirInventario = excluirInventario;
window.calcularInventario = calcularInventario;
window.atualizarPreviewInventario = atualizarPreviewInventario;
