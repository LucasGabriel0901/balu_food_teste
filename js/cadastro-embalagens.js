// ==============================
// BALU FOOD - CADASTRO DE EMBALAGENS
// Embalagens + Kits usando localStorage
// ==============================

var embalagensCache = [];
var kitsEmbalagensCache = [];

document.addEventListener("DOMContentLoaded", function () {
initCadastroEmbalagens();
});

function initCadastroEmbalagens() {
embalagensCache = loadData(BALU_KEYS.embalagens, []);
kitsEmbalagensCache = loadData("balu_kits_embalagens", []);

initTabsEmbalagens();
initEventosEmbalagens();
initEventosKits();
initImagemEmbalagem();
initImagemKit();

renderEmbalagens();
renderKitsEmbalagens();
renderResumoEmbalagens();

if (window.lucide) {
lucide.createIcons();
}
}

// ==============================
// ABAS
// ==============================

function initTabsEmbalagens() {
var tabs = document.querySelectorAll(".inner-tab");

tabs.forEach(function (tab) {
tab.addEventListener("click", function () {
var target = tab.getAttribute("data-tab");


  tabs.forEach(function (item) {
    item.classList.remove("active");
  });

  tab.classList.add("active");

  var tabEmbalagens = document.getElementById("tabEmbalagens");
  var tabKits = document.getElementById("tabKits");

  if (target === "embalagens") {
    if (tabEmbalagens) tabEmbalagens.style.display = "block";
    if (tabKits) tabKits.style.display = "none";
  }

  if (target === "kits") {
    if (tabEmbalagens) tabEmbalagens.style.display = "none";
    if (tabKits) tabKits.style.display = "block";
  }
});


});
}

// ==============================
// EVENTOS EMBALAGENS
// ==============================

function initEventosEmbalagens() {
var form = document.getElementById("formEmbalagem");
var btnNova = document.getElementById("btnNovaEmbalagem");
var search = document.getElementById("searchEmbalagens");
var filterCategoria = document.getElementById("filterCategoriaEmbalagem");
var filterStatus = document.getElementById("filterStatusEmbalagem");
var btnExportar = document.getElementById("btnExportarEmbalagens");

if (btnNova) {
btnNova.addEventListener("click", function () {
prepararNovaEmbalagem();
});
}

if (form) {
form.addEventListener("submit", function (event) {
event.preventDefault();
salvarEmbalagem();
});
}

if (search) {
search.addEventListener("input", function () {
renderEmbalagens();
});
}

if (filterCategoria) {
filterCategoria.addEventListener("change", function () {
renderEmbalagens();
});
}

if (filterStatus) {
filterStatus.addEventListener("change", function () {
renderEmbalagens();
});
}

if (btnExportar) {
btnExportar.addEventListener("click", function () {
exportarEmbalagens();
});
}

var camposCalculo = [
"quantidadePacote",
"embPrecoFornecedor1",
"embPrecoFornecedor2",
"embPrecoFornecedor3",
"embEstoqueAtual",
"embEstoqueMinimo",
"embEstoqueIdeal"
];

camposCalculo.forEach(function (id) {
var campo = document.getElementById(id);

if (campo) {
  campo.addEventListener("input", function () {
    atualizarPreviewEmbalagem();
  });
}


});
}

// ==============================
// EVENTOS KITS
// ==============================

function initEventosKits() {
var form = document.getElementById("formKitEmbalagem");
var btnNovoKit = document.getElementById("btnNovoKit");
var btnAdicionarItem = document.getElementById("btnAdicionarItemKit");
var searchKits = document.getElementById("searchKits");

if (btnNovoKit) {
btnNovoKit.addEventListener("click", function () {
prepararNovoKit();
});
}

if (form) {
form.addEventListener("submit", function (event) {
event.preventDefault();
salvarKitEmbalagem();
});
}

if (btnAdicionarItem) {
btnAdicionarItem.addEventListener("click", function () {
adicionarItemKit();
});
}

if (searchKits) {
searchKits.addEventListener("input", function () {
renderKitsEmbalagens();
});
}

var container = document.getElementById("kitItemsContainer");

if (container) {
container.addEventListener("input", function () {
atualizarPreviewKit();
});


container.addEventListener("change", function () {
  atualizarPreviewKit();
});

container.addEventListener("click", function (event) {
  var button = event.target.closest("button");

  if (!button) return;

  if (button.classList.contains("kitItemRemove")) {
    button.closest(".kit-item").remove();
    atualizarPreviewKit();
  }
});


}
}

// ==============================
// IMAGENS
// ==============================

function initImagemEmbalagem() {
var input = document.getElementById("embalagemImagemInput");
var preview = document.getElementById("embalagemImagemPreview");
var placeholder = document.getElementById("embalagemImagemPlaceholder");

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

function initImagemKit() {
var input = document.getElementById("kitImagemInput");
var preview = document.getElementById("kitImagemPreview");
var placeholder = document.getElementById("kitImagemPlaceholder");

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

// ==============================
// NOVA EMBALAGEM
// ==============================

function prepararNovaEmbalagem() {
resetarFormularioEmbalagem();

var title = document.getElementById("drawerEmbalagemTitle");

if (title) title.textContent = "Nova Embalagem";

setValue("embalagemCodigo", generateCode("EMB"));

atualizarPreviewEmbalagem();
}

function resetarFormularioEmbalagem() {
var form = document.getElementById("formEmbalagem");
var inputImagem = document.getElementById("embalagemImagemInput");
var preview = document.getElementById("embalagemImagemPreview");
var placeholder = document.getElementById("embalagemImagemPlaceholder");

if (form) form.reset();

setValue("embalagemId", "");

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
}

function salvarEmbalagem() {
var id = getValue("embalagemId");
var embalagemExistente = id ? buscarEmbalagemPorId(id) : null;

var nome = getValue("embalagemNome");
var categoria = getValue("embalagemCategoria");

if (!nome) {
showToast("Informe o nome da embalagem.", "warning");
return;
}

if (!categoria) {
showToast("Selecione a categoria da embalagem.", "warning");
return;
}

var calculos = calcularEmbalagem();

var inputImagem = document.getElementById("embalagemImagemInput");
var imagem = inputImagem && inputImagem.dataset.imageBase64 ? inputImagem.dataset.imageBase64 : "";

if (!imagem && embalagemExistente && embalagemExistente.imagem) {
imagem = embalagemExistente.imagem;
}

var agora = new Date().toISOString();

var embalagem = {
id: id || generateId("EMB"),
imagem: imagem,
nome: nome,
codigo: getValue("embalagemCodigo") || generateCode("EMB"),
categoria: categoria,
unidade: getValue("embalagemUnidade"),
quantidadePacote: safeNumber(getValue("quantidadePacote")),
status: getValue("embalagemStatus") || "Ativo",
descricao: getValue("embalagemDescricao"),
fornecedor1: getValue("embFornecedor1"),
precoFornecedor1: safeNumber(getValue("embPrecoFornecedor1")),
fornecedor2: getValue("embFornecedor2"),
precoFornecedor2: safeNumber(getValue("embPrecoFornecedor2")),
fornecedor3: getValue("embFornecedor3"),
precoFornecedor3: safeNumber(getValue("embPrecoFornecedor3")),
precoMedioPacote: calculos.precoMedioPacote,
precoUnitario: calculos.precoUnitario,
estoqueAtual: safeNumber(getValue("embEstoqueAtual")),
estoqueMinimo: safeNumber(getValue("embEstoqueMinimo")),
estoqueIdeal: safeNumber(getValue("embEstoqueIdeal")),
valorEstoque: calculos.valorEstoque,
statusEstoque: calculos.statusEstoque,
observacoes: getValue("embObservacoes"),
criadoEm: embalagemExistente ? embalagemExistente.criadoEm : agora,
atualizadoEm: agora
};

if (id) {
embalagensCache = embalagensCache.map(function (item) {
return item.id === id ? embalagem : item;
});


showToast("Embalagem atualizada com sucesso.", "success");


} else {
embalagensCache.push(embalagem);


showToast("Embalagem cadastrada com sucesso.", "success");


}

saveData(BALU_KEYS.embalagens, embalagensCache);

closeDrawer();
resetarFormularioEmbalagem();
renderEmbalagens();
renderResumoEmbalagens();
popularSelectsKit();
}

function editarEmbalagem(id) {
var embalagem = buscarEmbalagemPorId(id);

if (!embalagem) {
showToast("Embalagem não encontrada.", "danger");
return;
}

resetarFormularioEmbalagem();

setValue("embalagemId", embalagem.id);
setValue("embalagemNome", embalagem.nome);
setValue("embalagemCodigo", embalagem.codigo);
setValue("embalagemCategoria", embalagem.categoria);
setValue("embalagemUnidade", embalagem.unidade);
setValue("quantidadePacote", embalagem.quantidadePacote);
setValue("embalagemStatus", embalagem.status);
setValue("embalagemDescricao", embalagem.descricao);
setValue("embFornecedor1", embalagem.fornecedor1);
setValue("embPrecoFornecedor1", embalagem.precoFornecedor1);
setValue("embFornecedor2", embalagem.fornecedor2);
setValue("embPrecoFornecedor2", embalagem.precoFornecedor2);
setValue("embFornecedor3", embalagem.fornecedor3);
setValue("embPrecoFornecedor3", embalagem.precoFornecedor3);
setValue("embEstoqueAtual", embalagem.estoqueAtual);
setValue("embEstoqueMinimo", embalagem.estoqueMinimo);
setValue("embEstoqueIdeal", embalagem.estoqueIdeal);
setValue("embObservacoes", embalagem.observacoes);

var title = document.getElementById("drawerEmbalagemTitle");
var inputImagem = document.getElementById("embalagemImagemInput");
var preview = document.getElementById("embalagemImagemPreview");
var placeholder = document.getElementById("embalagemImagemPlaceholder");

if (title) title.textContent = "Editar Embalagem";

if (inputImagem) {
inputImagem.dataset.imageBase64 = embalagem.imagem || "";
}

if (preview && embalagem.imagem) {
preview.src = embalagem.imagem;
preview.style.display = "block";


if (placeholder) placeholder.style.display = "none";


}

atualizarPreviewEmbalagem();

openDrawer("drawerEmbalagem");
}

function excluirEmbalagem(id) {
var embalagem = buscarEmbalagemPorId(id);

if (!embalagem) return;

var confirmar = confirmAction("Deseja excluir a embalagem " + embalagem.nome + "?");

if (!confirmar) return;

embalagensCache = embalagensCache.filter(function (item) {
return item.id !== id;
});

saveData(BALU_KEYS.embalagens, embalagensCache);

renderEmbalagens();
renderResumoEmbalagens();
popularSelectsKit();

showToast("Embalagem excluída com sucesso.", "success");
}

function buscarEmbalagemPorId(id) {
return embalagensCache.find(function (item) {
return item.id === id;
});
}

// ==============================
// CÁLCULOS EMBALAGEM
// ==============================

function atualizarPreviewEmbalagem() {
var calculos = calcularEmbalagem();

setText("embPrecoMedioPacotePreview", formatCurrency(calculos.precoMedioPacote));
setText("embPrecoUnitarioPreview", formatCurrency(calculos.precoUnitario));
setText("embValorEstoquePreview", formatCurrency(calculos.valorEstoque));
setText("embStatusEstoquePreview", calculos.statusEstoque);
}

function calcularEmbalagem() {
var preco1 = safeNumber(getValue("embPrecoFornecedor1"));
var preco2 = safeNumber(getValue("embPrecoFornecedor2"));
var preco3 = safeNumber(getValue("embPrecoFornecedor3"));
var quantidadePacote = safeNumber(getValue("quantidadePacote"));
var estoqueAtual = safeNumber(getValue("embEstoqueAtual"));
var estoqueMinimo = safeNumber(getValue("embEstoqueMinimo"));

var precos = [];

if (preco1 > 0) precos.push(preco1);
if (preco2 > 0) precos.push(preco2);
if (preco3 > 0) precos.push(preco3);

var precoMedioPacote = 0;

if (precos.length > 0) {
precoMedioPacote = precos.reduce(function (total, preco) {
return total + preco;
}, 0) / precos.length;
}

var precoUnitario = quantidadePacote > 0 ? safeDivide(precoMedioPacote, quantidadePacote) : 0;
var valorEstoque = estoqueAtual * precoUnitario;

var statusEstoque = "Ativo";

if (estoqueAtual <= 0) {
statusEstoque = "Crítico";
} else if (estoqueMinimo > 0 && estoqueAtual <= estoqueMinimo) {
statusEstoque = "Estoque baixo";
}

return {
precoMedioPacote: precoMedioPacote,
precoUnitario: precoUnitario,
valorEstoque: valorEstoque,
statusEstoque: statusEstoque
};
}

// ==============================
// RENDER EMBALAGENS
// ==============================

function renderEmbalagens() {
var table = document.getElementById("embalagensTable");

if (!table) return;

var lista = filtrarEmbalagens();

if (lista.length === 0) {
table.innerHTML =
"<tr>" +
"<td colspan='11' class='text-muted'>Nenhuma embalagem encontrada.</td>" +
"</tr>";


return;


}

table.innerHTML = lista.map(function (embalagem) {
var statusFinal = getStatusFinalEmbalagem(embalagem);


return (
  "<tr>" +
    "<td>" +
      "<div class='product-cell'>" +
        renderThumb(embalagem.imagem, embalagem.nome) +
        "<div>" +
          "<strong>" + textoSeguro(embalagem.nome) + "</strong>" +
          "<span>" + textoSeguro(embalagem.descricao || "Sem descrição") + "</span>" +
        "</div>" +
      "</div>" +
    "</td>" +
    "<td>" + textoSeguro(embalagem.codigo || "-") + "</td>" +
    "<td>" + textoSeguro(embalagem.categoria || "-") + "</td>" +
    "<td>" + textoSeguro(embalagem.unidade || "-") + "</td>" +
    "<td>" + formatNumber(embalagem.quantidadePacote, 0) + "</td>" +
    "<td><strong>" + formatCurrency(embalagem.precoMedioPacote) + "</strong></td>" +
    "<td><strong>" + formatCurrency(embalagem.precoUnitario) + "</strong></td>" +
    "<td>" + formatNumber(embalagem.estoqueAtual, 0) + "</td>" +
    "<td><strong>" + formatCurrency(embalagem.valorEstoque) + "</strong></td>" +
    "<td>" + getStatusBadge(statusFinal) + "</td>" +
    "<td>" +
      "<div class='table-actions'>" +
        "<button type='button' class='btn-icon' title='Editar' onclick='editarEmbalagem(\"" + embalagem.id + "\")'>" +
          "<i data-lucide='edit-3'></i>" +
        "</button>" +
        "<button type='button' class='btn-icon danger' title='Excluir' onclick='excluirEmbalagem(\"" + embalagem.id + "\")'>" +
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

function filtrarEmbalagens() {
var search = getValue("searchEmbalagens").toLowerCase();
var categoria = getValue("filterCategoriaEmbalagem");
var status = getValue("filterStatusEmbalagem");

return embalagensCache.filter(function (embalagem) {
var statusFinal = getStatusFinalEmbalagem(embalagem);


var texto =
  String(embalagem.nome || "") + " " +
  String(embalagem.codigo || "") + " " +
  String(embalagem.categoria || "") + " " +
  String(embalagem.descricao || "") + " " +
  String(embalagem.fornecedor1 || "");

texto = texto.toLowerCase();

var passaBusca = !search || texto.indexOf(search) >= 0;
var passaCategoria = !categoria || embalagem.categoria === categoria;
var passaStatus = !status || embalagem.status === status || statusFinal === status;

return passaBusca && passaCategoria && passaStatus;


});
}

function getStatusFinalEmbalagem(embalagem) {
if (embalagem.status === "Inativo") {
return "Inativo";
}

return embalagem.statusEstoque || embalagem.status || "Ativo";
}

function renderResumoEmbalagens() {
var total = embalagensCache.length;

var valorEstoque = embalagensCache.reduce(function (soma, embalagem) {
return soma + safeNumber(embalagem.valorEstoque);
}, 0);

var estoqueBaixo = embalagensCache.filter(function (embalagem) {
var status = getStatusFinalEmbalagem(embalagem);


return status === "Estoque baixo" || status === "Crítico";


}).length;

setText("totalEmbalagens", total);
setText("valorEstoqueEmbalagens", formatCurrency(valorEstoque));
setText("embalagensEstoqueBaixo", estoqueBaixo);
setText("totalKitsEmbalagens", kitsEmbalagensCache.length);
}

// ==============================
// KITS
// ==============================

function prepararNovoKit() {
resetarFormularioKit();

var title = document.getElementById("drawerKitTitle");

if (title) title.textContent = "Novo Kit de Embalagens";

setValue("kitCodigo", generateCode("KIT"));

popularSelectsKit();
atualizarPreviewKit();
}

function resetarFormularioKit() {
var form = document.getElementById("formKitEmbalagem");
var inputImagem = document.getElementById("kitImagemInput");
var preview = document.getElementById("kitImagemPreview");
var placeholder = document.getElementById("kitImagemPlaceholder");
var container = document.getElementById("kitItemsContainer");

if (form) form.reset();

setValue("kitId", "");

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
adicionarItemKit();
}
}

function adicionarItemKit(itemSalvo) {
var container = document.getElementById("kitItemsContainer");

if (!container) return;

var div = document.createElement("div");
div.className = "kit-item";

div.innerHTML =
"<div class='kit-item-grid'>" +
"<div class='form-field'>" +
"<label>Embalagem</label>" +
"<select class='kitItemEmbalagem'></select>" +
"</div>" +


  "<div class='form-field'>" +
    "<label>Quantidade</label>" +
    "<input type='number' class='kitItemQuantidade' min='0' step='1' placeholder='1'>" +
  "</div>" +

  "<div class='form-field'>" +
    "<label>Custo unitário</label>" +
    "<input type='text' class='kitItemCustoUnitario calculated-field' readonly value='R$ 0,00'>" +
  "</div>" +

  "<button type='button' class='btn btn-outline btn-small kitItemRemove'>Remover</button>" +
"</div>";


container.appendChild(div);

popularSelectItemKit(div.querySelector(".kitItemEmbalagem"));

if (itemSalvo) {
var select = div.querySelector(".kitItemEmbalagem");
var quantidade = div.querySelector(".kitItemQuantidade");


if (select) select.value = itemSalvo.embalagemId || "";
if (quantidade) quantidade.value = itemSalvo.quantidade || 1;


}

atualizarPreviewKit();
}

function popularSelectsKit() {
var selects = document.querySelectorAll(".kitItemEmbalagem");

selects.forEach(function (select) {
var valorAtual = select.value;


popularSelectItemKit(select);

select.value = valorAtual;


});
}

function popularSelectItemKit(select) {
if (!select) return;

select.innerHTML = "<option value=''>Selecione uma embalagem</option>";

embalagensCache.forEach(function (embalagem) {
select.innerHTML +=
"<option value='" + embalagem.id + "'>" +
textoSeguro(embalagem.nome) +
"</option>";
});
}

function atualizarPreviewKit() {
var resultado = calcularKit();

setText("kitTotalItensPreview", resultado.totalItens);
setText("kitCustoTotalPreview", formatCurrency(resultado.custoTotal));

var items = document.querySelectorAll(".kit-item");

items.forEach(function (item) {
var select = item.querySelector(".kitItemEmbalagem");
var custoInput = item.querySelector(".kitItemCustoUnitario");


if (!select || !custoInput) return;

var embalagem = buscarEmbalagemPorId(select.value);
var custoUnitario = embalagem ? safeNumber(embalagem.precoUnitario) : 0;

custoInput.value = formatCurrency(custoUnitario);


});
}

function calcularKit() {
var items = document.querySelectorAll(".kit-item");
var custoTotal = 0;
var totalItens = 0;
var itens = [];

items.forEach(function (item) {
var select = item.querySelector(".kitItemEmbalagem");
var quantidadeInput = item.querySelector(".kitItemQuantidade");

if (!select || !quantidadeInput) return;

var embalagem = buscarEmbalagemPorId(select.value);
var quantidade = safeNumber(quantidadeInput.value);

if (embalagem && quantidade > 0) {
  var custoUnitario = safeNumber(embalagem.precoUnitario);
  var totalItem = custoUnitario * quantidade;

  custoTotal += totalItem;
  totalItens += quantidade;

  itens.push({
    embalagemId: embalagem.id,
    nome: embalagem.nome,
    quantidade: quantidade,
    custoUnitario: custoUnitario,
    total: totalItem
  });
}


});

return {
custoTotal: custoTotal,
totalItens: totalItens,
itens: itens
};
}

function salvarKitEmbalagem() {
var id = getValue("kitId");
var kitExistente = id ? buscarKitPorId(id) : null;
var nome = getValue("kitNome");

if (!nome) {
showToast("Informe o nome do kit.", "warning");
return;
}

var resultado = calcularKit();

if (resultado.itens.length === 0) {
showToast("Adicione pelo menos uma embalagem ao kit.", "warning");
return;
}

var inputImagem = document.getElementById("kitImagemInput");
var imagem = inputImagem && inputImagem.dataset.imageBase64 ? inputImagem.dataset.imageBase64 : "";

if (!imagem && kitExistente && kitExistente.imagem) {
imagem = kitExistente.imagem;
}

var agora = new Date().toISOString();

var kit = {
id: id || generateId("KIT"),
imagem: imagem,
nome: nome,
codigo: getValue("kitCodigo") || generateCode("KIT"),
descricao: getValue("kitDescricao"),
itens: resultado.itens,
totalItens: resultado.totalItens,
custoTotal: resultado.custoTotal,
status: getValue("kitStatus") || "Ativo",
observacoes: getValue("kitObservacoes"),
criadoEm: kitExistente ? kitExistente.criadoEm : agora,
atualizadoEm: agora
};

if (id) {
kitsEmbalagensCache = kitsEmbalagensCache.map(function (item) {
return item.id === id ? kit : item;
});


showToast("Kit atualizado com sucesso.", "success");


} else {
kitsEmbalagensCache.push(kit);


showToast("Kit cadastrado com sucesso.", "success");


}

saveData("balu_kits_embalagens", kitsEmbalagensCache);

closeDrawer();
resetarFormularioKit();
renderKitsEmbalagens();
renderResumoEmbalagens();
}

function editarKit(id) {
var kit = buscarKitPorId(id);

if (!kit) {
showToast("Kit não encontrado.", "danger");
return;
}

resetarFormularioKit();

setValue("kitId", kit.id);
setValue("kitNome", kit.nome);
setValue("kitCodigo", kit.codigo);
setValue("kitDescricao", kit.descricao);
setValue("kitStatus", kit.status);
setValue("kitObservacoes", kit.observacoes);

var title = document.getElementById("drawerKitTitle");
var inputImagem = document.getElementById("kitImagemInput");
var preview = document.getElementById("kitImagemPreview");
var placeholder = document.getElementById("kitImagemPlaceholder");
var container = document.getElementById("kitItemsContainer");

if (title) title.textContent = "Editar Kit de Embalagens";

if (container) container.innerHTML = "";

if (Array.isArray(kit.itens)) {
kit.itens.forEach(function (item) {
adicionarItemKit(item);
});
}

if (inputImagem) {
inputImagem.dataset.imageBase64 = kit.imagem || "";
}

if (preview && kit.imagem) {
preview.src = kit.imagem;
preview.style.display = "block";


if (placeholder) placeholder.style.display = "none";


}

atualizarPreviewKit();

openDrawer("drawerKitEmbalagem");
}

function excluirKit(id) {
var kit = buscarKitPorId(id);

if (!kit) return;

var confirmar = confirmAction("Deseja excluir o kit " + kit.nome + "?");

if (!confirmar) return;

kitsEmbalagensCache = kitsEmbalagensCache.filter(function (item) {
return item.id !== id;
});

saveData("balu_kits_embalagens", kitsEmbalagensCache);

renderKitsEmbalagens();
renderResumoEmbalagens();

showToast("Kit excluído com sucesso.", "success");
}

function buscarKitPorId(id) {
return kitsEmbalagensCache.find(function (item) {
return item.id === id;
});
}

function renderKitsEmbalagens() {
var table = document.getElementById("kitsEmbalagensTable");

if (!table) return;

var search = getValue("searchKits").toLowerCase();

var lista = kitsEmbalagensCache.filter(function (kit) {
var texto =
String(kit.nome || "") + " " +
String(kit.codigo || "") + " " +
String(kit.descricao || "");


texto = texto.toLowerCase();

return !search || texto.indexOf(search) >= 0;


});

if (lista.length === 0) {
table.innerHTML =
"<tr>" +
"<td colspan='6' class='text-muted'>Nenhum kit encontrado.</td>" +
"</tr>";


return;


}

table.innerHTML = lista.map(function (kit) {
return (
"<tr>" +
"<td>" +
"<div class='product-cell'>" +
renderThumb(kit.imagem, kit.nome) +
"<div>" +
"<strong>" + textoSeguro(kit.nome) + "</strong>" +
"<span>" + textoSeguro(kit.descricao || "Sem descrição") + "</span>" +
"</div>" +
"</div>" +
"</td>" +
"<td>" + textoSeguro(kit.codigo || "-") + "</td>" +
"<td>" + formatNumber(kit.totalItens, 0) + " item(ns)</td>" +
"<td><strong>" + formatCurrency(kit.custoTotal) + "</strong></td>" +
"<td>" + getStatusBadge(kit.status || "Ativo") + "</td>" +
"<td>" +
"<div class='table-actions'>" +
"<button type='button' class='btn-icon' title='Editar' onclick='editarKit(\"" + kit.id + "\")'>" +
"<i data-lucide='edit-3'></i>" +
"</button>" +
"<button type='button' class='btn-icon danger' title='Excluir' onclick='excluirKit(\"" + kit.id + "\")'>" +
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

// ==============================
// EXPORTAÇÃO
// ==============================

function exportarEmbalagens() {
if (!embalagensCache.length) {
showToast("Não há embalagens para exportar.", "warning");
return;
}

var linhas = [];

linhas.push("Codigo;Nome;Categoria;Unidade;Qtd Pacote;Preco Pacote;Preco Unitario;Estoque;Valor Estoque;Status");

embalagensCache.forEach(function (item) {
linhas.push(
[
item.codigo || "",
item.nome || "",
item.categoria || "",
item.unidade || "",
formatNumber(item.quantidadePacote, 0),
formatNumber(item.precoMedioPacote, 2),
formatNumber(item.precoUnitario, 2),
formatNumber(item.estoqueAtual, 0),
formatNumber(item.valorEstoque, 2),
getStatusFinalEmbalagem(item)
].join(";")
);
});

var blob = new Blob([linhas.join("\n")], {
type: "text/csv;charset=utf-8;"
});

var url = URL.createObjectURL(blob);
var link = document.createElement("a");

link.href = url;
link.download = "balu-embalagens.csv";
link.click();

URL.revokeObjectURL(url);

showToast("Arquivo de embalagens exportado.", "success");
}

// ==============================
// HELPERS
// ==============================

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

// ========================================
// CORREÇÃO EXTRA - CÁLCULOS DE EMBALAGENS
// Calcula em tempo real: preço médio, preço unitário, estoque e status
// ========================================

document.addEventListener("DOMContentLoaded", function () {
baluEmbIniciarCalculos();
});

function baluEmbIniciarCalculos() {
var campos = [
"quantidadePacote",
"quantidade_pacote",
"precoFornecedor1",
"preco_fornecedor_1",
"precoFornecedor2",
"preco_fornecedor_2",
"precoFornecedor3",
"preco_fornecedor_3",
"estoqueAtual",
"estoque_atual",
"estoqueMinimo",
"estoque_minimo",
"estoqueIdeal",
"estoque_ideal"
];

campos.forEach(function (id) {
var campo = document.getElementById(id);

```
if (campo) {
  campo.addEventListener("input", baluEmbCalcularAtual);
  campo.addEventListener("change", baluEmbCalcularAtual);
}
```

});

baluEmbCalcularAtual();
}

function baluEmbCalcularAtual() {
var quantidadePacote = baluEmbPegarNumero(["quantidadePacote", "quantidade_pacote"]);

var preco1 = baluEmbPegarNumero(["precoFornecedor1", "preco_fornecedor_1"]);
var preco2 = baluEmbPegarNumero(["precoFornecedor2", "preco_fornecedor_2"]);
var preco3 = baluEmbPegarNumero(["precoFornecedor3", "preco_fornecedor_3"]);

var estoqueAtual = baluEmbPegarNumero(["estoqueAtual", "estoque_atual"]);
var estoqueMinimo = baluEmbPegarNumero(["estoqueMinimo", "estoque_minimo"]);
var estoqueIdeal = baluEmbPegarNumero(["estoqueIdeal", "estoque_ideal"]);

var precosValidos = [];

if (preco1 > 0) {
precosValidos.push(preco1);
}

if (preco2 > 0) {
precosValidos.push(preco2);
}

if (preco3 > 0) {
precosValidos.push(preco3);
}

var precoMedioPacote = 0;

if (precosValidos.length > 0) {
var soma = 0;

```
precosValidos.forEach(function (preco) {
  soma += preco;
});

precoMedioPacote = soma / precosValidos.length;
```

}

var precoUnitario = 0;

if (quantidadePacote > 0) {
precoUnitario = precoMedioPacote / quantidadePacote;
}

var valorEstoque = estoqueAtual * precoUnitario;

var statusEstoque = "Sem estoque";

if (estoqueAtual <= 0) {
statusEstoque = "Sem estoque";
} else if (estoqueMinimo > 0 && estoqueAtual < estoqueMinimo) {
statusEstoque = "Abaixo do mínimo";
} else if (estoqueIdeal > 0 && estoqueAtual >= estoqueIdeal) {
statusEstoque = "Estoque ideal";
} else {
statusEstoque = "Estoque ok";
}

baluEmbSetarValor(["precoMedioPacote", "preco_medio_pacote"], baluEmbFormatarMoeda(precoMedioPacote));
baluEmbSetarValor(["precoUnitario", "preco_unitario"], baluEmbFormatarMoeda(precoUnitario));
baluEmbSetarValor(["valorEstoque", "valor_estoque"], baluEmbFormatarMoeda(valorEstoque));
baluEmbSetarValor(["statusEstoque", "status_estoque"], statusEstoque);
}

// ========================================
// HELPERS DOS CÁLCULOS DE EMBALAGENS
// ========================================

function baluEmbPegarNumero(ids) {
for (var i = 0; i < ids.length; i++) {
var campo = document.getElementById(ids[i]);

```
if (campo) {
  return baluEmbConverterNumero(campo.value);
}
```

}

return 0;
}

function baluEmbSetarValor(ids, valor) {
for (var i = 0; i < ids.length; i++) {
var campo = document.getElementById(ids[i]);

```
if (campo) {
  if (campo.tagName === "INPUT" || campo.tagName === "SELECT" || campo.tagName === "TEXTAREA") {
    campo.value = valor;
  } else {
    campo.textContent = valor;
  }
}
```

}
}

function baluEmbConverterNumero(valor) {
if (valor === null || valor === undefined) {
return 0;
}

var texto = String(valor)
.replace("R$", "")
.replace(/./g, "")
.replace(",", ".")
.trim();

var numero = Number(texto);

if (isNaN(numero)) {
return 0;
}

return numero;
}

function baluEmbFormatarMoeda(valor) {
var numero = Number(valor);

if (isNaN(numero)) {
numero = 0;
}

return numero.toLocaleString("pt-BR", {
style: "currency",
currency: "BRL"
});
}

