// ==============================
// BALU FOOD - COMPRAS REALIZADAS
// Registro de compras com integracao localStorage + estoque
// ==============================

var comprasCache = [];
var comprasInsumosCache = [];
var comprasEmbalagensCache = [];

var BALU_COMPRAS_STORAGE_KEY =
typeof BALU_KEYS !== "undefined" && BALU_KEYS.compras
? BALU_KEYS.compras
: "balu_compras_realizadas";

var BALU_COMPRAS_INSUMOS_KEY =
typeof BALU_KEYS !== "undefined" && BALU_KEYS.insumos
? BALU_KEYS.insumos
: "balu_insumos";

var BALU_COMPRAS_EMBALAGENS_KEY =
typeof BALU_KEYS !== "undefined" && BALU_KEYS.embalagens
? BALU_KEYS.embalagens
: "balu_embalagens";

document.addEventListener("DOMContentLoaded", function () {
initComprasRealizadas();
});

function initComprasRealizadas() {
comprasCache = carregarComprasLocal();
recarregarCadastrosCompra();

initEventosCompras();
resetarItensCompraPadrao();
initImagemCompra();
prepararNovaCompra(false);
renderCompras();
criarIconesCompra();
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
prepararNovaCompra(true);
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
var campo = event.target;

if (campo.classList.contains("compraItemTipo")) {
  atualizarSelectItemCompra(campo.closest(".compra-item"));
}

if (campo.classList.contains("compraItemSelect")) {
  preencherItemCompraSelecionado(campo.closest(".compra-item"));
}

if (campoItemCompra(campo)) {
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
campo.classList.contains("compraItemSelect") ||
campo.classList.contains("compraItemNome") ||
campo.classList.contains("compraItemQuantidade") ||
campo.classList.contains("compraItemUnidade") ||
campo.classList.contains("compraItemValorUnitario")
);
}

function recarregarCadastrosCompra() {
comprasInsumosCache = carregarListaLocalCompra(BALU_COMPRAS_INSUMOS_KEY);
comprasEmbalagensCache = carregarListaLocalCompra(BALU_COMPRAS_EMBALAGENS_KEY);
}

function resetarItensCompraPadrao() {
var container = document.getElementById("compraItemsContainer");

if (!container) {
return;
}

container.innerHTML = "";
adicionarItemCompra();
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

function prepararNovaCompra(abrir) {
resetarFormularioCompra();

var title = document.getElementById("drawerCompraTitle");

if (title) {
title.textContent = "Nova Compra";
}

setValueCompra("compraData", dataAtualInput());
setValueCompra("compraCompetencia", competenciaAtualInput());
setValueCompra("compraStatus", "Confirmada");
setValueCompra("compraFormaPagamento", "Pix");
setValueCompra("compraTipo", "Insumos");

atualizarPreviewCompra();

if (abrir) {
abrirDrawerCompra();
}
}

function resetarFormularioCompra() {
var form = document.getElementById("formCompra");
var inputImagem = document.getElementById("compraImagemInput");
var preview = document.getElementById("compraImagemPreview");
var placeholder = document.getElementById("compraImagemPlaceholder");

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

resetarItensCompraPadrao();
}

function garantirAoMenosUmItemCompra() {
var container = document.getElementById("compraItemsContainer");

if (!container) {
return;
}

if (!container.querySelector(".compra-item")) {
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
"<input type='hidden' class='compraItemId'>" +
"<input type='hidden' class='compraItemCodigo'>" +
"<div class='form-field'>" +
"<label>Tipo</label>" +
"<select class='compraItemTipo'>" +
"<option value='Insumo'>Insumo</option>" +
"<option value='Embalagem'>Embalagem</option>" +
"<option value='Outro'>Outro</option>" +
"</select>" +
"</div>" +
"<div class='form-field'>" +
"<label>Item cadastrado</label>" +
"<select class='compraItemSelect'></select>" +
"</div>" +
"<div class='form-field'>" +
"<label>Nome</label>" +
"<input type='text' class='compraItemNome' placeholder='Selecione ou informe o item'>" +
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
"<label>Valor unitario</label>" +
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
setItemValueCompra(div, ".compraItemTipo", itemSalvo.tipo || "Insumo");
atualizarSelectItemCompra(div, itemSalvo);
setItemValueCompra(div, ".compraItemId", itemSalvo.itemId || itemSalvo.id || "");
setItemValueCompra(div, ".compraItemCodigo", itemSalvo.codigo || "");
setItemValueCompra(div, ".compraItemNome", itemSalvo.nome || "");
setItemValueCompra(div, ".compraItemQuantidade", itemSalvo.quantidade || "");
setItemValueCompra(div, ".compraItemUnidade", itemSalvo.unidade || "unidade");
setItemValueCompra(div, ".compraItemValorUnitario", itemSalvo.valorUnitario || "");
selecionarOpcaoItemCompra(div, itemSalvo);
} else {
atualizarSelectItemCompra(div);
}

atualizarPreviewCompra();
criarIconesCompra();
}

function atualizarSelectItemCompra(item, itemSalvo) {
if (!item) {
return;
}

var tipo = pegarValorCampoItem(item, ".compraItemTipo") || "Insumo";
var select = item.querySelector(".compraItemSelect");

if (!select) {
return;
}

var lista = obterListaPorTipoCompra(tipo);
var html = "<option value=''>Selecione um item cadastrado</option>";

lista.forEach(function (cadastro) {
var valor = montarValorOpcaoCompra(tipo, cadastro);
var nome = limparTextoCompra(cadastro.nome || cadastro.descricao || "Item sem nome");
var codigo = limparTextoCompra(cadastro.codigo || "");
var unidade = obterUnidadeCadastroCompra(tipo, cadastro);
var preco = obterPrecoCadastroCompra(tipo, cadastro);

html += "<option value='" + escapeAttrCompra(valor) + "'>" +
escapeHtmlCompra((codigo ? codigo + " - " : "") + nome + " (" + unidade + " | " + formatarMoedaCompra(preco) + ")") +
"</option>";
});

html += "<option value='manual'>Outro / manual</option>";
select.innerHTML = html;

if (tipo === "Outro") {
select.value = "manual";
select.disabled = true;
limparVinculoItemCompra(item);
} else {
select.disabled = false;
}

if (itemSalvo) {
selecionarOpcaoItemCompra(item, itemSalvo);
}
}

function selecionarOpcaoItemCompra(item, itemSalvo) {
var select = item.querySelector(".compraItemSelect");

if (!select || !itemSalvo) {
return;
}

var valor = montarValorOpcaoCompra(itemSalvo.tipo || "Insumo", {
id: itemSalvo.itemId || itemSalvo.id,
codigo: itemSalvo.codigo,
nome: itemSalvo.nome
});

if (valor && select.querySelector("option[value='" + cssEscapeCompra(valor) + "']")) {
select.value = valor;
} else if ((itemSalvo.tipo || "") === "Outro") {
select.value = "manual";
}
}

function preencherItemCompraSelecionado(item) {
if (!item) {
return;
}

var tipo = pegarValorCampoItem(item, ".compraItemTipo") || "Insumo";
var select = item.querySelector(".compraItemSelect");
var valor = select ? select.value : "";

if (!valor || valor === "manual" || tipo === "Outro") {
limparVinculoItemCompra(item);
return;
}

var cadastro = buscarCadastroCompraPorValor(tipo, valor);

if (!cadastro) {
limparVinculoItemCompra(item);
return;
}

setItemValueCompra(item, ".compraItemId", cadastro.id || "");
setItemValueCompra(item, ".compraItemCodigo", cadastro.codigo || "");
setItemValueCompra(item, ".compraItemNome", cadastro.nome || "");
setItemValueCompra(item, ".compraItemUnidade", obterUnidadeCadastroCompra(tipo, cadastro));

var valorUnitario = obterPrecoCadastroCompra(tipo, cadastro);

if (valorUnitario > 0) {
setItemValueCompra(item, ".compraItemValorUnitario", numeroParaInputCompra(valorUnitario));
}
}

function limparVinculoItemCompra(item) {
setItemValueCompra(item, ".compraItemId", "");
setItemValueCompra(item, ".compraItemCodigo", "");
}

function salvarCompra() {
recarregarCadastrosCompra();

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
mostrarMensagemCompra("Adicione pelo menos um item com nome, quantidade e valor unitario.", "warning");
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
estoqueSincronizado: false,
movimentacoesEstoque: [],
criadoEm: compraExistente ? compraExistente.criadoEm : agora,
atualizadoEm: agora
};

sincronizarEstoqueCompra(compraExistente, compra);

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
mostrarMensagemCompra("Compra nao encontrada.", "danger");
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

var confirmar = typeof confirmAction === "function"
? confirmAction("Deseja excluir esta compra?")
: confirm("Deseja excluir esta compra?");

if (!confirmar) {
return;
}

reverterMovimentoEstoqueCompra(compra);

comprasCache = comprasCache.filter(function (item) {
return item.id !== id;
});

salvarComprasLocal();
renderCompras();
mostrarMensagemCompra("Compra excluida com sucesso.", "success");
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
var itemId = pegarValorCampoItem(item, ".compraItemId");
var codigo = pegarValorCampoItem(item, ".compraItemCodigo");
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
    itemId: itemId,
    codigo: codigo,
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
setTextCompra("compraStatusCmvPreview", status === "Confirmada" ? "Entra no CMV" : "Nao entra no CMV");
}

function renderCompras() {
var table = document.getElementById("comprasTable");

if (!table) {
return;
}

var lista = filtrarCompras();
renderResumoCompras();

if (lista.length === 0) {
table.innerHTML = "<tr><td colspan='10' class='text-muted'>Nenhuma compra encontrada.</td></tr>";
return;
}

table.innerHTML = lista.map(function (compra) {
return "" +
"<tr>" +
"<td>" + formatarDataCompra(compra.data) + "</td>" +
"<td>" + textoSeguroCompra(compra.fornecedor) + "</td>" +
"<td>" + textoSeguroCompra(compra.numeroNota || "-") + "</td>" +
"<td>" + textoSeguroCompra(compra.tipo || "-") + "</td>" +
"<td>" + getTextoResumoItensCompra(compra) + "</td>" +
"<td>" + formatarMoedaCompra(compra.subtotal) + "</td>" +
"<td>" + formatarMoedaCompra(compra.ajustes) + "</td>" +
"<td><strong>" + formatarMoedaCompra(compra.total) + "</strong></td>" +
"<td>" + badgeStatusCompra(compra.status || "Pendente") + "</td>" +
"<td><div class='table-actions'>" +
"<button type='button' class='btn-icon' title='Editar' data-compra-action='edit' data-compra-id='" + escapeAttrCompra(compra.id) + "'><i data-lucide='edit-3'></i></button>" +
"<button type='button' class='btn-icon danger' title='Excluir' data-compra-action='delete' data-compra-id='" + escapeAttrCompra(compra.id) + "'><i data-lucide='trash-2'></i></button>" +
"</div></td>" +
"</tr>";
}).join("");

vincularAcoesTabelaCompras();
criarIconesCompra();
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
var texto = [
compra.fornecedor,
compra.numeroNota,
compra.tipo,
compra.status,
compra.observacoes,
getTextoItensCompra(compra)
].join(" ").toLowerCase();

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
var inventarioInicial = pegarUltimoInventarioTotalCompra("Inicial", competenciaAtual);
var inventarioFinal = pegarUltimoInventarioTotalCompra("Final", competenciaAtual);
var cmvEstimado = Math.max(0, inventarioInicial + totalComprasMes - inventarioFinal);

setTextCompra("totalComprasMes", formatarMoedaCompra(totalComprasMes));
setTextCompra("comprasConfirmadas", comprasConfirmadas.length);
setTextCompra("comprasPendentes", comprasPendentes.length);
setTextCompra("ticketMedioCompras", formatarMoedaCompra(ticketMedio));
setTextCompra("comprasFluxoCompras", formatarMoedaCompra(totalComprasMes));
setTextCompra("comprasFluxoEstoqueInicial", formatarMoedaCompra(inventarioInicial));
setTextCompra("comprasFluxoEstoqueFinal", formatarMoedaCompra(inventarioFinal));
setTextCompra("comprasFluxoCmv", formatarMoedaCompra(cmvEstimado));
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

function getTextoResumoItensCompra(compra) {
if (!Array.isArray(compra.itens) || compra.itens.length === 0) {
return "0 item";
}

return compra.itens.map(function (item) {
return textoSeguroCompra((item.codigo ? item.codigo + " - " : "") + item.nome + " (" + formatarNumeroCompra(item.quantidade, 2) + " " + item.unidade + ")");
}).join("<br>");
}

function getTextoItensCompra(compra) {
if (!Array.isArray(compra.itens)) {
return "";
}

return compra.itens.map(function (item) {
return [item.tipo, item.codigo, item.nome, item.quantidade, item.unidade].join(" ");
}).join(" ");
}

function sincronizarEstoqueCompra(compraAntiga, compraNova) {
if (compraAntiga && compraAntiga.estoqueSincronizado === true) {
reverterMovimentoEstoqueCompra(compraAntiga);
}

if (compraNova && compraNova.status === "Confirmada") {
var movimentacoes = aplicarMovimentoEstoqueCompra(compraNova, 1);
compraNova.movimentacoesEstoque = movimentacoes;
compraNova.estoqueSincronizado = movimentacoes.length > 0;
} else if (compraNova) {
compraNova.movimentacoesEstoque = [];
compraNova.estoqueSincronizado = false;
}
}

function reverterMovimentoEstoqueCompra(compra) {
if (!compra || compra.estoqueSincronizado !== true) {
return;
}

var base = Array.isArray(compra.movimentacoesEstoque) && compra.movimentacoesEstoque.length
? compra.movimentacoesEstoque
: compra.itens;

aplicarMovimentoEstoqueCompra({ itens: base }, -1);
}

function aplicarMovimentoEstoqueCompra(compra, direcao) {
var movimentacoes = [];

if (!compra || !Array.isArray(compra.itens)) {
return movimentacoes;
}

compra.itens.forEach(function (itemCompra) {
if (!itemCompra || itemCompra.tipo === "Outro") {
  return;
}

var movido = movimentarItemEstoqueCompra(itemCompra, direcao);

if (movido) {
  movimentacoes.push({
    tipo: itemCompra.tipo,
    itemId: itemCompra.itemId || "",
    codigo: itemCompra.codigo || "",
    nome: itemCompra.nome || "",
    quantidade: numeroCompra(itemCompra.quantidade),
    unidade: itemCompra.unidade || "unidade"
  });
}
});

return movimentacoes;
}

function movimentarItemEstoqueCompra(itemCompra, direcao) {
var tipo = itemCompra.tipo;
var chave = tipo === "Insumo" ? BALU_COMPRAS_INSUMOS_KEY : BALU_COMPRAS_EMBALAGENS_KEY;
var lista = carregarListaLocalCompra(chave);
var itemEstoque = buscarItemEstoqueCompra(lista, itemCompra);

if (!itemEstoque) {
console.warn(tipo + " nao encontrado no estoque:", itemCompra.nome);
return false;
}

var quantidade = numeroCompra(itemCompra.quantidade) * direcao;
itemEstoque.estoqueAtual = Math.max(0, numeroCompra(itemEstoque.estoqueAtual) + quantidade);

if (tipo === "Insumo") {
recalcularInsumoDepoisDaCompra(itemEstoque);
} else {
recalcularEmbalagemDepoisDaCompra(itemEstoque);
}

itemEstoque.atualizadoEm = new Date().toISOString();
salvarListaLocalCompra(chave, lista);
recarregarCadastrosCompra();
return true;
}

function buscarItemEstoqueCompra(lista, itemCompra) {
if (!Array.isArray(lista)) {
return null;
}

var itemId = String(itemCompra.itemId || itemCompra.id || "");
var codigo = normalizarNomeEstoqueCompra(itemCompra.codigo || "");
var nome = normalizarNomeEstoqueCompra(itemCompra.nome || "");

return lista.find(function (item) {
var mesmoId = itemId && String(item.id || "") === itemId;
var mesmoCodigo = codigo && normalizarNomeEstoqueCompra(item.codigo || "") === codigo;
var mesmoNome = nome && normalizarNomeEstoqueCompra(item.nome || "") === nome;

return mesmoId || mesmoCodigo || mesmoNome;
});
}

function recalcularInsumoDepoisDaCompra(insumo) {
var estoqueAtual = numeroCompra(insumo.estoqueAtual);
var estoqueMinimo = numeroCompra(insumo.estoqueMinimo);
var estoqueIdeal = numeroCompra(insumo.estoqueIdeal);
var precoMedio = numeroCompra(insumo.precoMedio);
var precoMedioKg = numeroCompra(insumo.precoMedioKg);
var custoUnitario = numeroCompra(insumo.custoUnitario);
var unidadeConsumo = String(insumo.unidadeConsumo || insumo.unidadeCompra || "").toLowerCase();

if (unidadeConsumo === "unidade") {
insumo.valorEstoque = estoqueAtual * (custoUnitario || precoMedio);
} else {
insumo.valorEstoque = (estoqueAtual / 1000) * precoMedioKg;
}

insumo.statusEstoque = calcularStatusEstoqueCompra(estoqueAtual, estoqueMinimo, estoqueIdeal, insumo.status || "Ativo");
}

function recalcularEmbalagemDepoisDaCompra(embalagem) {
var estoqueAtual = numeroCompra(embalagem.estoqueAtual);
var estoqueMinimo = numeroCompra(embalagem.estoqueMinimo);
var estoqueIdeal = numeroCompra(embalagem.estoqueIdeal);
var quantidadePacote = numeroCompra(embalagem.quantidadePacote);
var precos = [
numeroCompra(embalagem.precoFornecedor1),
numeroCompra(embalagem.precoFornecedor2),
numeroCompra(embalagem.precoFornecedor3)
].filter(function (preco) {
return preco > 0;
});

var precoMedioPacote = precos.length ? precos.reduce(function (soma, preco) {
return soma + preco;
}, 0) / precos.length : numeroCompra(embalagem.precoMedioPacote);

var precoUnitario = quantidadePacote > 0 ? precoMedioPacote / quantidadePacote : numeroCompra(embalagem.precoUnitario);

embalagem.precoMedioPacote = precoMedioPacote;
embalagem.precoUnitario = precoUnitario;
embalagem.valorEstoque = estoqueAtual * precoUnitario;
embalagem.statusEstoque = calcularStatusEstoqueCompra(estoqueAtual, estoqueMinimo, estoqueIdeal, embalagem.status || "Ativo");
}

function calcularStatusEstoqueCompra(estoqueAtual, estoqueMinimo, estoqueIdeal, statusCadastro) {
if (statusCadastro === "Inativo") {
return "Inativo";
}

if (estoqueAtual <= 0) {
return "Critico";
}

if (estoqueMinimo > 0 && estoqueAtual <= estoqueMinimo) {
return "Critico";
}

if (estoqueIdeal > 0 && estoqueAtual < estoqueIdeal) {
return "Atencao";
}

return "Estoque ok";
}

function obterListaPorTipoCompra(tipo) {
if (tipo === "Insumo") {
return comprasInsumosCache;
}

if (tipo === "Embalagem") {
return comprasEmbalagensCache;
}

return [];
}

function montarValorOpcaoCompra(tipo, item) {
return [
tipo || "",
item.id || "",
item.codigo || "",
normalizarNomeEstoqueCompra(item.nome || "")
].join("|");
}

function buscarCadastroCompraPorValor(tipo, valor) {
return obterListaPorTipoCompra(tipo).find(function (item) {
return montarValorOpcaoCompra(tipo, item) === valor;
});
}

function obterUnidadeCadastroCompra(tipo, item) {
if (tipo === "Insumo") {
return item.unidadeConsumo || item.unidadeCompra || "unidade";
}

return item.unidade || "unidade";
}

function obterPrecoCadastroCompra(tipo, item) {
if (tipo === "Insumo") {
return numeroCompra(item.custoUnitario || item.precoUnitario || item.precoMedio || item.precoMedioKg || 0);
}

return numeroCompra(item.precoUnitario || item.precoMedioPacote || 0);
}

function pegarUltimoInventarioTotalCompra(tipo, competencia) {
var inventarios = typeof loadData === "function"
? loadData("inventarios", [])
: carregarListaLocalCompra("balu_inventarios");

var lista = inventarios.filter(function (inventario) {
return inventario.tipo === tipo &&
(!competencia || inventario.competencia === competencia) &&
inventario.status !== "Cancelado";
});

if (!lista.length) {
return 0;
}

return numeroCompra(lista[lista.length - 1].totalGeral);
}

function exportarCompras() {
if (!comprasCache.length) {
mostrarMensagemCompra("Nao ha compras para exportar.", "warning");
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
limparCsvCompra(getTextoItensCompra(item)),
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

baixarArquivoTextoCompra("balu-compras-realizadas.csv", "\ufeff" + linhas.join("\n"), "text/csv;charset=utf-8;");
mostrarMensagemCompra("Arquivo de compras exportado.", "success");
}

function carregarComprasLocal() {
if (typeof loadData === "function") {
var dados = loadData("compras", []);
return Array.isArray(dados) ? dados : [];
}

var dadosLegado = carregarListaLocalCompra(BALU_COMPRAS_STORAGE_KEY);

if (!dadosLegado.length) {
dadosLegado = carregarListaLocalCompra("balu_compras");
}

return dadosLegado;
}

function salvarComprasLocal() {
if (typeof saveData === "function") {
saveData("compras", comprasCache);
return;
}

localStorage.setItem(BALU_COMPRAS_STORAGE_KEY, JSON.stringify(comprasCache));
}

function carregarListaLocalCompra(chave) {
try {
var texto = localStorage.getItem(chave);
var dados = texto ? JSON.parse(texto) : [];
return Array.isArray(dados) ? dados : [];
} catch (erro) {
console.error("Erro ao carregar storage:", chave, erro);
return [];
}
}

function salvarListaLocalCompra(chave, lista) {
localStorage.setItem(chave, JSON.stringify(lista || []));
}

function pegarValorCampoItem(item, seletor) {
var campo = item.querySelector(seletor);
return campo ? campo.value : "";
}

function setItemValueCompra(item, seletor, valor) {
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

function getValueCompra(id) {
var element = document.getElementById(id);
return element ? element.value || "" : "";
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

function numeroParaInputCompra(valor) {
var numero = numeroCompra(valor);
return numero === 0 ? "" : String(numero);
}

function formatarMoedaCompra(valor) {
return numeroCompra(valor).toLocaleString("pt-BR", {
style: "currency",
currency: "BRL"
});
}

function formatarNumeroCompra(valor, casas) {
return numeroCompra(valor).toLocaleString("pt-BR", {
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

function limparTextoCompra(value) {
return String(value || "").trim();
}

function escapeHtmlCompra(valor) {
return String(valor === null || valor === undefined ? "" : valor)
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/"/g, "&quot;")
.replace(/'/g, "&#039;");
}

function escapeAttrCompra(valor) {
return escapeHtmlCompra(valor);
}

function cssEscapeCompra(valor) {
if (window.CSS && typeof window.CSS.escape === "function") {
return window.CSS.escape(valor);
}

return String(valor || "").replace(/'/g, "\\'");
}

function limparCsvCompra(valor) {
return String(valor || "").replace(/;/g, ",").replace(/\n/g, " ").replace(/\r/g, " ").trim();
}

function normalizarNomeEstoqueCompra(valor) {
return String(valor || "")
.toLowerCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g, "")
.replace(/\s+/g, " ")
.trim();
}

function gerarIdCompra() {
if (typeof generateId === "function") {
return generateId("CMP");
}

return "CMP-" + Date.now() + "-" + Math.floor(Math.random() * 9999);
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
reader.onload = function (event) { resolve(event.target.result); };
reader.onerror = function () { reject(new Error("Erro ao converter imagem.")); };
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
drawer.classList.remove("is-open");
}
}

function baixarArquivoTextoCompra(nome, conteudo, tipo) {
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

function criarIconesCompra() {
if (window.lucide) {
lucide.createIcons();
}
}

window.editarCompra = editarCompra;
window.excluirCompra = excluirCompra;
window.atualizarPreviewCompra = atualizarPreviewCompra;
window.calcularCompra = calcularCompra;
