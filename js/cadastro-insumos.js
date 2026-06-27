// ==============================
// BALU FOOD - CADASTRO DE INSUMOS
// CRUD + cálculo + resumo + modelo CSV oficial
// ==============================

var BALU_INSUMOS_KEY = typeof BALU_KEYS !== "undefined" && BALU_KEYS.insumos ? BALU_KEYS.insumos : "balu_insumos";
var insumosCache = [];
var insumosImportacaoCache = [];
var insumoDetalheAtualId = null;

var BALU_INSUMOS_HEADERS = [
"Codigo",
"Nome",
"Grupo",
"Categoria",
"UnidadeCompra",
"UnidadeConsumo",
"PesoBruto",
"PesoLiquido",
"Fornecedor1",
"PrecoFornecedor1",
"Fornecedor2",
"PrecoFornecedor2",
"Fornecedor3",
"PrecoFornecedor3",
"EstoqueAtual",
"EstoqueMinimo",
"EstoqueIdeal",
"TipoArmazenamento",
"LocalArmazenamento",
"PosicaoArmazenamento",
"Validade",
"Lote",
"MarcaPreferida",
"ObservacaoArmazenamento",
"Status",
"Observacoes"
];

document.addEventListener("DOMContentLoaded", function () {
garantirDrawerBasico();
initCadastroInsumos();
});

function initCadastroInsumos() {
insumosCache = carregarInsumosLocal();

initEventosInsumos();
initImagemInsumo();
renderInsumos();
atualizarPreviewsInsumo();
criarIconesInsumo();

console.log("BALU Insumos CSV oficial carregado.");
}

function initEventosInsumos() {
var form = document.getElementById("formInsumo");
var btnNovo = document.getElementById("btnNovoInsumo");
var btnExportar = document.getElementById("btnExportarInsumos");
var btnConfirmarImportacao = document.getElementById("btnConfirmarImportacaoInsumos");
var btnLimparImportacao = document.getElementById("btnLimparImportacaoInsumos");
var btnEditarDetalhe = document.getElementById("btnEditarInsumoDetalhe");
var inputCsv = document.getElementById("importInsumosCsvFile");
var search = document.getElementById("searchInsumos");
var filterGrupo = document.getElementById("filterGrupoInsumo");
var filterStatus = document.getElementById("filterStatusInsumo");

if (form) {
form.addEventListener("submit", function (event) {
event.preventDefault();
salvarInsumo();
});
}

if (btnNovo) {
btnNovo.addEventListener("click", function () {
prepararNovoInsumo();
});
}

document.querySelectorAll(".btnModeloCsvInsumos").forEach(function (botao) {
botao.addEventListener("click", baixarModeloCsvInsumos);
});

if (btnExportar) {
btnExportar.addEventListener("click", exportarInsumosCsv);
}

if (btnConfirmarImportacao) {
btnConfirmarImportacao.addEventListener("click", confirmarImportacaoInsumos);
}

if (btnLimparImportacao) {
btnLimparImportacao.addEventListener("click", limparImportacaoInsumos);
}

if (btnEditarDetalhe) {
btnEditarDetalhe.addEventListener("click", function () {
if (insumoDetalheAtualId) {
editarInsumo(insumoDetalheAtualId);
}
});
}

if (inputCsv) {
inputCsv.addEventListener("change", function () {
lerArquivoCsvInsumos(inputCsv.files && inputCsv.files[0]);
});
}

if (search) {
search.addEventListener("input", renderInsumos);
}

if (filterGrupo) {
filterGrupo.addEventListener("change", renderInsumos);
}

if (filterStatus) {
filterStatus.addEventListener("change", renderInsumos);
}

[
"pesoBruto",
"pesoLiquido",
"precoFornecedor1",
"precoFornecedor2",
"precoFornecedor3",
"estoqueAtual",
"estoqueMinimo",
"estoqueIdeal"
].forEach(function (id) {
var campo = document.getElementById(id);


if (campo) {
  campo.addEventListener("input", atualizarPreviewsInsumo);
  campo.addEventListener("change", atualizarPreviewsInsumo);
  campo.addEventListener("keyup", atualizarPreviewsInsumo);
}


});
}

function initImagemInsumo() {
var input = document.getElementById("insumoImagemInput");
var preview = document.getElementById("insumoImagemPreview");
var placeholder = document.getElementById("insumoImagemPlaceholder");

if (!input || !preview) {
return;
}

input.addEventListener("change", function () {
var file = input.files && input.files[0];


if (!file) {
  return;
}

converterImagemParaBase64(file).then(function (base64) {
  input.dataset.imageBase64 = base64;
  preview.src = base64;
  preview.style.display = "block";

  if (placeholder) {
    placeholder.style.display = "none";
  }
});


});
}

function prepararNovoInsumo() {
resetarFormularioInsumo();
setText("drawerInsumoTitle", "Novo Insumo");
setValue("insumoCodigo", gerarCodigoInsumo());
atualizarPreviewsInsumo();

if (typeof openDrawer === "function") {
openDrawer("drawerInsumo");
}
}

function resetarFormularioInsumo() {
var form = document.getElementById("formInsumo");
var inputImagem = document.getElementById("insumoImagemInput");
var preview = document.getElementById("insumoImagemPreview");
var placeholder = document.getElementById("insumoImagemPlaceholder");

if (form) {
form.reset();
}

setValue("insumoId", "");

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

function salvarInsumo() {
var id = getValue("insumoId");
var nome = getValue("insumoNome");
var grupo = getValue("insumoGrupo");

if (!nome) {
mostrarMensagemInsumo("Informe o nome do insumo.", "warning");
return;
}

if (!grupo) {
mostrarMensagemInsumo("Selecione o grupo do insumo.", "warning");
return;
}

var existente = id ? buscarInsumoPorId(id) : null;
var calculos = calcularDadosInsumo({
pesoBruto: numeroInsumo(getValue("pesoBruto")),
pesoLiquido: numeroInsumo(getValue("pesoLiquido")),
precoFornecedor1: numeroInsumo(getValue("precoFornecedor1")),
precoFornecedor2: numeroInsumo(getValue("precoFornecedor2")),
precoFornecedor3: numeroInsumo(getValue("precoFornecedor3")),
estoqueAtual: numeroInsumo(getValue("estoqueAtual")),
estoqueMinimo: numeroInsumo(getValue("estoqueMinimo")),
estoqueIdeal: numeroInsumo(getValue("estoqueIdeal"))
});

var inputImagem = document.getElementById("insumoImagemInput");
var imagemNova = inputImagem && inputImagem.dataset.imageBase64 ? inputImagem.dataset.imageBase64 : "";
var agora = new Date().toISOString();

var insumo = {
id: id || gerarIdInsumo(),
imagem: imagemNova || (existente && existente.imagem ? existente.imagem : ""),
codigo: getValue("insumoCodigo") || gerarCodigoInsumo(),
nome: nome,
grupo: grupo,
categoria: getValue("insumoCategoria"),
unidadeCompra: getValue("insumoUnidadeCompra"),
unidadeConsumo: getValue("insumoUnidadeConsumo"),
descricao: getValue("insumoDescricao"),
pesoBruto: calculos.pesoBruto,
pesoLiquido: calculos.pesoLiquido,
fatorCorrecao: calculos.fatorCorrecao,
perdaPercentual: calculos.perdaPercentual,
fornecedor1: getValue("fornecedor1"),
precoFornecedor1: calculos.precoFornecedor1,
fornecedor2: getValue("fornecedor2"),
precoFornecedor2: calculos.precoFornecedor2,
fornecedor3: getValue("fornecedor3"),
precoFornecedor3: calculos.precoFornecedor3,
precoMedio: calculos.precoMedio,
precoMedioKg: calculos.precoMedioKg,
estoqueAtual: calculos.estoqueAtual,
estoqueMinimo: calculos.estoqueMinimo,
estoqueIdeal: calculos.estoqueIdeal,
valorEstoque: calculos.valorEstoque,
tipoArmazenamento: getValue("insumoTipoArmazenamento"),
localArmazenamento: getValue("insumoLocalArmazenamento"),
posicaoArmazenamento: getValue("insumoPosicaoArmazenamento"),
validade: getValue("insumoValidade"),
lote: getValue("insumoLote"),
marcaPreferida: getValue("insumoMarcaPreferida"),
observacaoArmazenamento: getValue("insumoObservacaoArmazenamento"),
status: getValue("insumoStatus") || "Ativo",
statusEstoque: calculos.statusEstoque,
observacoes: getValue("insumoObservacoes"),
criadoEm: existente && existente.criadoEm ? existente.criadoEm : agora,
atualizadoEm: agora
};

if (id) {
insumosCache = insumosCache.map(function (item) {
return item.id === id ? insumo : item;
});


mostrarMensagemInsumo("Insumo atualizado com sucesso.", "success");


} else {
insumosCache.push(insumo);
mostrarMensagemInsumo("Insumo cadastrado com sucesso.", "success");
}

salvarInsumosLocal();
resetarFormularioInsumo();
renderInsumos();

if (typeof closeDrawer === "function") {
closeDrawer();
}
}

function editarInsumo(id) {
var insumo = buscarInsumoPorId(id);

if (!insumo) {
mostrarMensagemInsumo("Insumo não encontrado.", "danger");
return;
}

resetarFormularioInsumo();

setValue("insumoId", insumo.id);
setValue("insumoCodigo", insumo.codigo);
setValue("insumoNome", insumo.nome);
setValue("insumoGrupo", insumo.grupo);
setValue("insumoCategoria", insumo.categoria);
setValue("insumoUnidadeCompra", insumo.unidadeCompra);
setValue("insumoUnidadeConsumo", insumo.unidadeConsumo);
setValue("insumoDescricao", insumo.descricao);
setValue("pesoBruto", numeroParaInputInsumo(insumo.pesoBruto));
setValue("pesoLiquido", numeroParaInputInsumo(insumo.pesoLiquido));
setValue("fornecedor1", insumo.fornecedor1);
setValue("precoFornecedor1", numeroParaInputInsumo(insumo.precoFornecedor1));
setValue("fornecedor2", insumo.fornecedor2);
setValue("precoFornecedor2", numeroParaInputInsumo(insumo.precoFornecedor2));
setValue("fornecedor3", insumo.fornecedor3);
setValue("precoFornecedor3", numeroParaInputInsumo(insumo.precoFornecedor3));
setValue("estoqueAtual", numeroParaInputInsumo(insumo.estoqueAtual));
setValue("estoqueMinimo", numeroParaInputInsumo(insumo.estoqueMinimo));
setValue("estoqueIdeal", numeroParaInputInsumo(insumo.estoqueIdeal));
setValue("insumoTipoArmazenamento", insumo.tipoArmazenamento);
setValue("insumoLocalArmazenamento", insumo.localArmazenamento);
setValue("insumoPosicaoArmazenamento", insumo.posicaoArmazenamento);
setValue("insumoValidade", normalizarDataInsumo(insumo.validade));
setValue("insumoLote", insumo.lote);
setValue("insumoMarcaPreferida", insumo.marcaPreferida);
setValue("insumoObservacaoArmazenamento", insumo.observacaoArmazenamento);
setValue("insumoStatus", insumo.status || "Ativo");
setValue("insumoObservacoes", insumo.observacoes);
setText("drawerInsumoTitle", "Editar Insumo");

var inputImagem = document.getElementById("insumoImagemInput");
var preview = document.getElementById("insumoImagemPreview");
var placeholder = document.getElementById("insumoImagemPlaceholder");

if (inputImagem) {
inputImagem.dataset.imageBase64 = insumo.imagem || "";
}

if (preview && insumo.imagem) {
preview.src = insumo.imagem;
preview.style.display = "block";


if (placeholder) {
  placeholder.style.display = "none";
}


}

atualizarPreviewsInsumo();

if (typeof openDrawer === "function") {
openDrawer("drawerInsumo");
}
}

function excluirInsumo(id) {
var insumo = buscarInsumoPorId(id);

if (!insumo) {
return;
}

var confirmar = true;

if (typeof confirmAction === "function") {
confirmar = confirmAction("Deseja excluir o insumo " + insumo.nome + "?");
} else {
confirmar = confirm("Deseja excluir o insumo " + insumo.nome + "?");
}

if (!confirmar) {
return;
}

insumosCache = insumosCache.filter(function (item) {
return item.id !== id;
});

salvarInsumosLocal();
renderInsumos();
mostrarMensagemInsumo("Insumo excluído com sucesso.", "success");
}

function buscarInsumoPorId(id) {
return insumosCache.find(function (item) {
return item.id === id;
});
}

function atualizarPreviewsInsumo() {
var calculos = calcularDadosInsumo({
pesoBruto: numeroInsumo(getValue("pesoBruto")),
pesoLiquido: numeroInsumo(getValue("pesoLiquido")),
precoFornecedor1: numeroInsumo(getValue("precoFornecedor1")),
precoFornecedor2: numeroInsumo(getValue("precoFornecedor2")),
precoFornecedor3: numeroInsumo(getValue("precoFornecedor3")),
estoqueAtual: numeroInsumo(getValue("estoqueAtual")),
estoqueMinimo: numeroInsumo(getValue("estoqueMinimo")),
estoqueIdeal: numeroInsumo(getValue("estoqueIdeal"))
});

setText("fatorCorrecao", calculos.fatorCorrecao > 0 ? formatarNumeroBRInsumo(calculos.fatorCorrecao, 4) : "Não calculado");
setText("perdaPercentual", formatarPercentualInsumo(calculos.perdaPercentual));
setText("precoMedioPreview", formatarMoedaInsumo(calculos.precoMedio));
setText("precoMedioKgPreview", formatarMoedaInsumo(calculos.precoMedioKg));
setText("valorEstoquePreview", formatarMoedaInsumo(calculos.valorEstoque));
setText("statusEstoquePreview", calculos.statusEstoque);
}

function calcularDadosInsumo(dados) {
var pesoBruto = numeroInsumo(dados.pesoBruto);
var pesoLiquido = numeroInsumo(dados.pesoLiquido);
var precoFornecedor1 = numeroInsumo(dados.precoFornecedor1);
var precoFornecedor2 = numeroInsumo(dados.precoFornecedor2);
var precoFornecedor3 = numeroInsumo(dados.precoFornecedor3);
var estoqueAtual = numeroInsumo(dados.estoqueAtual);
var estoqueMinimo = numeroInsumo(dados.estoqueMinimo);
var estoqueIdeal = numeroInsumo(dados.estoqueIdeal);

var precos = [];

[precoFornecedor1, precoFornecedor2, precoFornecedor3].forEach(function (preco) {
if (preco > 0) {
precos.push(preco);
}
});

var precoMedio = 0;

if (precos.length) {
precoMedio = precos.reduce(function (soma, preco) {
return soma + preco;
}, 0) / precos.length;
}

var fatorCorrecao = pesoLiquido > 0 ? pesoBruto / pesoLiquido : 0;
var perdaPercentual = pesoBruto > 0 ? ((pesoBruto - pesoLiquido) / pesoBruto) * 100 : 0;

if (perdaPercentual < 0) {
perdaPercentual = 0;
}

var pesoLiquidoKg = pesoLiquido > 0 ? pesoLiquido / 1000 : 0;
var precoMedioKg = pesoLiquidoKg > 0 ? precoMedio / pesoLiquidoKg : precoMedio;
var valorEstoque = estoqueAtual * precoMedioKg;
var statusEstoque = "Estoque ok";

if (estoqueAtual <= 0) {
statusEstoque = "Crítico";
} else if (estoqueMinimo > 0 && estoqueAtual <= estoqueMinimo) {
statusEstoque = "Estoque baixo";
} else if (estoqueIdeal > 0 && estoqueAtual >= estoqueIdeal) {
statusEstoque = "Estoque ideal";
}

return {
pesoBruto: pesoBruto,
pesoLiquido: pesoLiquido,
precoFornecedor1: precoFornecedor1,
precoFornecedor2: precoFornecedor2,
precoFornecedor3: precoFornecedor3,
estoqueAtual: estoqueAtual,
estoqueMinimo: estoqueMinimo,
estoqueIdeal: estoqueIdeal,
precoMedio: precoMedio,
precoMedioKg: precoMedioKg,
fatorCorrecao: fatorCorrecao,
perdaPercentual: perdaPercentual,
valorEstoque: valorEstoque,
statusEstoque: statusEstoque
};
}

function renderInsumos() {
var table = document.getElementById("insumosTable");

if (!table) {
return;
}

var lista = filtrarInsumos();
renderResumoInsumos();

if (!lista.length) {
table.innerHTML = "<tr><td colspan='11' class='text-muted'>Nenhum insumo encontrado.</td></tr>";
return;
}

table.innerHTML = lista.map(function (insumo) {
var statusFinal = getStatusFinalInsumo(insumo);
var localizacao = [insumo.tipoArmazenamento, insumo.localArmazenamento, insumo.posicaoArmazenamento].filter(Boolean).join(" / ");


return "<tr class='clickable-row' onclick='abrirDetalheInsumo(\"" + escapeAttr(insumo.id) + "\")'>" +
  "<td><div class='product-cell'>" + renderThumbInsumo(insumo.imagem, insumo.nome) + "<div><strong>" + escapeHtml(insumo.nome) + "</strong><span>" + escapeHtml(insumo.categoria || "Sem categoria") + "</span></div></div></td>" +
  "<td>" + escapeHtml(insumo.codigo || "-") + "</td>" +
  "<td>" + escapeHtml(insumo.grupo || "-") + "</td>" +
  "<td>" + escapeHtml(insumo.unidadeConsumo || insumo.unidadeCompra || "-") + "</td>" +
  "<td><strong>" + formatarMoedaInsumo(insumo.precoMedio) + "</strong></td>" +
  "<td><strong>" + formatarMoedaInsumo(insumo.precoMedioKg) + "</strong></td>" +
  "<td>" + formatarNumeroBRInsumo(insumo.estoqueAtual, 2) + "</td>" +
  "<td>" + escapeHtml(localizacao || "-") + "</td>" +
  "<td><strong>" + formatarMoedaInsumo(insumo.valorEstoque) + "</strong></td>" +
  "<td>" + badgeStatusInsumo(statusFinal) + "</td>" +
  "<td onclick='event.stopPropagation()'><div class='table-actions'>" +
  "<button type='button' class='btn-icon' title='Editar' onclick='editarInsumo(\"" + escapeAttr(insumo.id) + "\")'><i data-lucide='edit-3'></i></button>" +
  "<button type='button' class='btn-icon danger' title='Excluir' onclick='excluirInsumo(\"" + escapeAttr(insumo.id) + "\")'><i data-lucide='trash-2'></i></button>" +
  "</div></td>" +
  "</tr>";


}).join("");

criarIconesInsumo();
}

function filtrarInsumos() {
var search = getValue("searchInsumos").toLowerCase();
var grupo = getValue("filterGrupoInsumo");
var status = getValue("filterStatusInsumo");

return insumosCache.filter(function (insumo) {
var statusFinal = getStatusFinalInsumo(insumo);
var texto = [
insumo.nome,
insumo.codigo,
insumo.grupo,
insumo.categoria,
insumo.descricao,
insumo.tipoArmazenamento,
insumo.localArmazenamento,
insumo.posicaoArmazenamento,
insumo.lote,
insumo.marcaPreferida
].join(" ").toLowerCase();

var passaBusca = !search || texto.indexOf(search) >= 0;
var passaGrupo = !grupo || insumo.grupo === grupo;
var passaStatus = !status || insumo.status === status || statusFinal === status;

return passaBusca && passaGrupo && passaStatus;


});
}

function renderResumoInsumos() {
var total = insumosCache.length;
var valorEstoque = insumosCache.reduce(function (soma, item) {
return soma + numeroInsumo(item.valorEstoque);
}, 0);

var estoqueBaixo = insumosCache.filter(function (item) {
var status = getStatusFinalInsumo(item);
return status === "Estoque baixo" || status === "Crítico";
}).length;

var precoMedioGeral = total ? insumosCache.reduce(function (soma, item) {
return soma + numeroInsumo(item.precoMedio);
}, 0) / total : 0;

setText("totalInsumos", total);
setText("valorEstoqueInsumos", formatarMoedaInsumo(valorEstoque));
setText("insumosEstoqueBaixo", estoqueBaixo);
setText("precoMedioGeral", formatarMoedaInsumo(precoMedioGeral));
}

function abrirDetalheInsumo(id) {
var insumo = buscarInsumoPorId(id);

if (!insumo) {
mostrarMensagemInsumo("Insumo não encontrado.", "warning");
return;
}

insumoDetalheAtualId = id;
setText("detalheInsumoTitulo", insumo.nome || "Resumo do Insumo");
setText("detalheInsumoSubtitulo", (insumo.codigo || "Sem código") + " • " + (insumo.grupo || "Sem grupo") + " • " + getStatusFinalInsumo(insumo));

var conteudo = document.getElementById("detalheInsumoConteudo");

if (conteudo) {
conteudo.innerHTML = montarHtmlDetalheInsumo(insumo);
}

if (typeof openDrawer === "function") {
openDrawer("drawerDetalheInsumo");
}

criarIconesInsumo();
}

function montarHtmlDetalheInsumo(insumo) {
return "<div class='form-section'><div class='product-cell'>" + renderThumbInsumo(insumo.imagem, insumo.nome) + "<div><strong>" + escapeHtml(insumo.nome || "-") + "</strong><span>" + escapeHtml(insumo.descricao || "Sem descrição cadastrada.") + "</span></div></div></div>" +
"<div class='calculated-box'><h4 class='calculated-box-title'>Resumo financeiro e estoque</h4><div class='calculated-grid'>" +
detalheItemInsumo("Preço médio", formatarMoedaInsumo(insumo.precoMedio)) +
detalheItemInsumo("Preço médio por kg", formatarMoedaInsumo(insumo.precoMedioKg)) +
detalheItemInsumo("Estoque atual", formatarNumeroBRInsumo(insumo.estoqueAtual, 2) + " " + escapeHtml(insumo.unidadeConsumo || "")) +
detalheItemInsumo("Valor em estoque", formatarMoedaInsumo(insumo.valorEstoque)) +
detalheItemInsumo("Status do estoque", getStatusFinalInsumo(insumo)) +
detalheItemInsumo("Status cadastro", insumo.status || "-") +
"</div></div>" +
"<div class='calculated-box'><h4 class='calculated-box-title'>Rendimento</h4><div class='calculated-grid'>" +
detalheItemInsumo("Peso bruto", formatarNumeroBRInsumo(insumo.pesoBruto, 2) + "g") +
detalheItemInsumo("Peso líquido", formatarNumeroBRInsumo(insumo.pesoLiquido, 2) + "g") +
detalheItemInsumo("Fator de correção", formatarNumeroBRInsumo(insumo.fatorCorrecao, 4)) +
detalheItemInsumo("Perda", formatarPercentualInsumo(insumo.perdaPercentual)) +
"</div></div>" +
"<div class='calculated-box'><h4 class='calculated-box-title'>Armazenamento e localização</h4><div class='calculated-grid'>" +
detalheItemInsumo("Tipo", insumo.tipoArmazenamento || "-") +
detalheItemInsumo("Local", insumo.localArmazenamento || "-") +
detalheItemInsumo("Posição", insumo.posicaoArmazenamento || "-") +
detalheItemInsumo("Validade", formatarDataInsumo(insumo.validade)) +
detalheItemInsumo("Lote", insumo.lote || "-") +
detalheItemInsumo("Marca preferida", insumo.marcaPreferida || "-") +
"</div><p class='text-muted' style='margin:14px 0 0;'>" + escapeHtml(insumo.observacaoArmazenamento || "Sem observação de armazenamento.") + "</p></div>" +
"<div class='calculated-box'><h4 class='calculated-box-title'>Fornecedores</h4>" + montarFornecedoresDetalheInsumo(insumo) + "</div>" +
"<div class='form-section'><h3 class='form-section-title'>Observações internas</h3><p class='text-muted'>" + escapeHtml(insumo.observacoes || "Nenhuma observação cadastrada.") + "</p></div>";
}

function detalheItemInsumo(label, valor) {
return "<div class='calculated-item'><span>" + escapeHtml(label) + "</span><strong>" + escapeHtml(valor || "-") + "</strong></div>";
}

function montarFornecedoresDetalheInsumo(insumo) {
var fornecedores = [
{ nome: insumo.fornecedor1, preco: insumo.precoFornecedor1 },
{ nome: insumo.fornecedor2, preco: insumo.precoFornecedor2 },
{ nome: insumo.fornecedor3, preco: insumo.precoFornecedor3 }
].filter(function (item) {
return item.nome || numeroInsumo(item.preco) > 0;
});

if (!fornecedores.length) {
return "<p class='text-muted'>Nenhum fornecedor cadastrado.</p>";
}

return fornecedores.map(function (item, index) {
return "<div class='supplier-card supplier-readonly'><div class='supplier-card-header'><strong>Fornecedor " + (index + 1) + "</strong></div><div class='supplier-grid'><div class='form-field'><label>Nome</label><input type='text' readonly value='" + escapeAttr(item.nome || "-") + "'></div><div class='form-field'><label>Preço</label><input type='text' readonly value='" + formatarMoedaInsumo(item.preco) + "'></div></div></div>";
}).join("");
}

function baixarModeloCsvInsumos() {
var linhas = [];

linhas.push(BALU_INSUMOS_HEADERS.join(";"));
linhas.push(csvLinhaInsumo([
"INS-0001",
"Carne bovina",
"Carnes",
"Proteínas",
"kg",
"kg",
"1000",
"850",
"Açougue Central",
"35,90",
"",
"",
"",
"",
"20",
"5",
"30",
"Refrigerado",
"Geladeira",
"Geladeira 2 / Prateleira 3",
"2026-12-31",
"LOTE-001",
"Marca Exemplo",
"Manter fechado após aberto",
"Ativo",
"Produto usado nas principais receitas"
]));

linhas.push(csvLinhaInsumo([
"INS-0002",
"Arroz branco",
"Secos",
"Grãos",
"kg",
"kg",
"1000",
"1000",
"Atacado Exemplo",
"6,50",
"",
"",
"",
"",
"50",
"10",
"80",
"Seco",
"Estoque principal",
"Prateleira 1",
"",
"",
"",
"Manter em local seco",
"Ativo",
""
]));

baixarArquivoTexto("modelo-insumos-balu.csv", "\ufeff" + linhas.join("\n"), "text/csv;charset=utf-8;");
mostrarMensagemInsumo("Modelo CSV baixado.", "success");
}

function lerArquivoCsvInsumos(file) {
if (!file) {
return;
}

var nome = String(file.name || "").toLowerCase();

if (!nome.endsWith(".csv")) {
mostrarMensagemInsumo("Envie apenas arquivo CSV.", "warning");
return;
}

var reader = new FileReader();

reader.onload = function (event) {
try {
processarCsvInsumos(String(event.target.result || ""));
} catch (erro) {
console.error(erro);
mostrarMensagemInsumo("Erro ao ler o CSV. Baixe o modelo oficial e tente novamente.", "danger");
}
};

reader.readAsText(file, "UTF-8");
}

function processarCsvInsumos(texto) {
texto = texto.replace(/^\uFEFF/, "");

var linhas = parseCsvTexto(texto);

if (!linhas.length) {
limparImportacaoInsumos();
mostrarMensagemInsumo("CSV vazio.", "warning");
return;
}

var headers = linhas[0].map(function (header) {
return limparTextoInsumo(header);
});

var validacao = validarCabecalhoCsv(headers);

if (!validacao.ok) {
limparImportacaoInsumos();
setText("importInsumosStatus", "Modelo inválido. Coluna ausente: " + validacao.coluna);
mostrarMensagemInsumo("Modelo inválido. Baixe o modelo CSV oficial do BALU.", "danger");
return;
}

var objetos = [];

for (var i = 1; i < linhas.length; i++) {
var linha = linhas[i];
var vazio = linha.every(function (valor) {
return !limparTextoInsumo(valor);
});


if (vazio) {
  continue;
}

var obj = {};

headers.forEach(function (header, index) {
  obj[header] = linha[index] || "";
});

var insumo = montarInsumoDoCsv(obj);

if (insumo.nome && insumo.grupo) {
  objetos.push(insumo);
}


}

insumosImportacaoCache = objetos;
renderPreviewImportacaoInsumos();
setText("importInsumosStatus", objetos.length + " insumo(s) encontrados no CSV. Confira a prévia e clique em Importar Insumos.");
mostrarMensagemInsumo("CSV carregado com sucesso.", "success");
}

function validarCabecalhoCsv(headers) {
for (var i = 0; i < BALU_INSUMOS_HEADERS.length; i++) {
if (headers.indexOf(BALU_INSUMOS_HEADERS[i]) < 0) {
return { ok: false, coluna: BALU_INSUMOS_HEADERS[i] };
}
}

return { ok: true, coluna: "" };
}

function montarInsumoDoCsv(obj) {
var calculos = calcularDadosInsumo({
pesoBruto: numeroInsumo(obj.PesoBruto),
pesoLiquido: numeroInsumo(obj.PesoLiquido),
precoFornecedor1: numeroInsumo(obj.PrecoFornecedor1),
precoFornecedor2: numeroInsumo(obj.PrecoFornecedor2),
precoFornecedor3: numeroInsumo(obj.PrecoFornecedor3),
estoqueAtual: numeroInsumo(obj.EstoqueAtual),
estoqueMinimo: numeroInsumo(obj.EstoqueMinimo),
estoqueIdeal: numeroInsumo(obj.EstoqueIdeal)
});

return {
id: "",
imagem: "",
codigo: limparTextoInsumo(obj.Codigo),
nome: limparTextoInsumo(obj.Nome),
grupo: normalizarGrupoInsumo(obj.Grupo),
categoria: limparTextoInsumo(obj.Categoria),
unidadeCompra: normalizarUnidadeInsumo(obj.UnidadeCompra),
unidadeConsumo: normalizarUnidadeInsumo(obj.UnidadeConsumo),
descricao: "",
pesoBruto: calculos.pesoBruto,
pesoLiquido: calculos.pesoLiquido,
fatorCorrecao: calculos.fatorCorrecao,
perdaPercentual: calculos.perdaPercentual,
fornecedor1: limparTextoInsumo(obj.Fornecedor1),
precoFornecedor1: calculos.precoFornecedor1,
fornecedor2: limparTextoInsumo(obj.Fornecedor2),
precoFornecedor2: calculos.precoFornecedor2,
fornecedor3: limparTextoInsumo(obj.Fornecedor3),
precoFornecedor3: calculos.precoFornecedor3,
precoMedio: calculos.precoMedio,
precoMedioKg: calculos.precoMedioKg,
estoqueAtual: calculos.estoqueAtual,
estoqueMinimo: calculos.estoqueMinimo,
estoqueIdeal: calculos.estoqueIdeal,
valorEstoque: calculos.valorEstoque,
tipoArmazenamento: limparTextoInsumo(obj.TipoArmazenamento),
localArmazenamento: limparTextoInsumo(obj.LocalArmazenamento),
posicaoArmazenamento: limparTextoInsumo(obj.PosicaoArmazenamento),
validade: normalizarDataInsumo(obj.Validade),
lote: limparTextoInsumo(obj.Lote),
marcaPreferida: limparTextoInsumo(obj.MarcaPreferida),
observacaoArmazenamento: limparTextoInsumo(obj.ObservacaoArmazenamento),
status: limparTextoInsumo(obj.Status) || "Ativo",
statusEstoque: calculos.statusEstoque,
observacoes: limparTextoInsumo(obj.Observacoes)
};
}

function renderPreviewImportacaoInsumos() {
var table = document.getElementById("importInsumosPreviewTable");

if (!table) {
return;
}

if (!insumosImportacaoCache.length) {
table.innerHTML = "<tr><td colspan='7' class='text-muted'>Carregue o modelo CSV preenchido para visualizar a prévia.</td></tr>";
return;
}

table.innerHTML = insumosImportacaoCache.slice(0, 30).map(function (item) {
return "<tr>" +
"<td><strong>" + escapeHtml(item.nome) + "</strong><br><small>" + escapeHtml(item.codigo || "Sem código") + "</small></td>" +
"<td>" + escapeHtml(item.grupo || "-") + "</td>" +
"<td>" + escapeHtml(item.unidadeConsumo || item.unidadeCompra || "-") + "</td>" +
"<td>" + formatarMoedaInsumo(item.precoMedio) + "</td>" +
"<td>" + formatarNumeroBRInsumo(item.estoqueAtual, 2) + "</td>" +
"<td>" + escapeHtml([item.tipoArmazenamento, item.localArmazenamento].filter(Boolean).join(" / ") || "-") + "</td>" +
"<td>" + badgeStatusInsumo(item.statusEstoque) + "</td>" +
"</tr>";
}).join("");

criarIconesInsumo();
}

function confirmarImportacaoInsumos() {
if (!insumosImportacaoCache.length) {
mostrarMensagemInsumo("Carregue um CSV antes de importar.", "warning");
return;
}

var novos = 0;
var atualizados = 0;
var agora = new Date().toISOString();

insumosImportacaoCache.forEach(function (item) {
var existente = encontrarInsumoExistente(item);


if (existente) {
  var atualizado = Object.assign({}, existente, item, {
    id: existente.id,
    imagem: existente.imagem || "",
    criadoEm: existente.criadoEm || agora,
    atualizadoEm: agora
  });

  insumosCache = insumosCache.map(function (insumo) {
    return insumo.id === existente.id ? atualizado : insumo;
  });

  atualizados = atualizados + 1;
} else {
  item.id = gerarIdInsumo();
  item.codigo = item.codigo || gerarCodigoInsumo();
  item.criadoEm = agora;
  item.atualizadoEm = agora;
  insumosCache.push(item);
  novos = novos + 1;
}


});

salvarInsumosLocal();
renderInsumos();
limparImportacaoInsumos();

if (typeof closeDrawer === "function") {
closeDrawer();
}

mostrarMensagemInsumo("Importação concluída: " + novos + " novo(s), " + atualizados + " atualizado(s).", "success");
}

function limparImportacaoInsumos() {
insumosImportacaoCache = [];

var input = document.getElementById("importInsumosCsvFile");

if (input) {
input.value = "";
}

setText("importInsumosStatus", "Nenhum arquivo carregado.");
renderPreviewImportacaoInsumos();
}

function encontrarInsumoExistente(item) {
return insumosCache.find(function (insumo) {
var mesmoCodigo = item.codigo && insumo.codigo && normalizarTextoInsumo(item.codigo) === normalizarTextoInsumo(insumo.codigo);
var mesmoNome = item.nome && insumo.nome && normalizarTextoInsumo(item.nome) === normalizarTextoInsumo(insumo.nome);


return mesmoCodigo || mesmoNome;


});
}

function exportarInsumosCsv() {
if (!insumosCache.length) {
mostrarMensagemInsumo("Não há insumos para exportar.", "warning");
return;
}

var linhas = [];
linhas.push(BALU_INSUMOS_HEADERS.join(";"));

insumosCache.forEach(function (item) {
linhas.push(csvLinhaInsumo([
item.codigo || "",
item.nome || "",
item.grupo || "",
item.categoria || "",
item.unidadeCompra || "",
item.unidadeConsumo || "",
numeroExportInsumo(item.pesoBruto),
numeroExportInsumo(item.pesoLiquido),
item.fornecedor1 || "",
numeroExportInsumo(item.precoFornecedor1),
item.fornecedor2 || "",
numeroExportInsumo(item.precoFornecedor2),
item.fornecedor3 || "",
numeroExportInsumo(item.precoFornecedor3),
numeroExportInsumo(item.estoqueAtual),
numeroExportInsumo(item.estoqueMinimo),
numeroExportInsumo(item.estoqueIdeal),
item.tipoArmazenamento || "",
item.localArmazenamento || "",
item.posicaoArmazenamento || "",
item.validade || "",
item.lote || "",
item.marcaPreferida || "",
item.observacaoArmazenamento || "",
item.status || "Ativo",
item.observacoes || ""
]));
});

baixarArquivoTexto("balu-insumos-exportados.csv", "\ufeff" + linhas.join("\n"), "text/csv;charset=utf-8;");
mostrarMensagemInsumo("Dados exportados em CSV.", "success");
}

function parseCsvTexto(texto) {
var primeiraLinha = texto.split(/\r?\n/)[0] || "";
var qtdPontoVirgula = (primeiraLinha.match(/;/g) || []).length;
var qtdVirgula = (primeiraLinha.match(/,/g) || []).length;
var delimitador = qtdPontoVirgula >= qtdVirgula ? ";" : ",";
var linhas = [];
var linha = [];
var campo = "";
var dentroAspas = false;

for (var i = 0; i < texto.length; i++) {
var char = texto[i];
var proximo = texto[i + 1];


if (char === '"') {
  if (dentroAspas && proximo === '"') {
    campo = campo + '"';
    i = i + 1;
  } else {
    dentroAspas = !dentroAspas;
  }
} else if (char === delimitador && !dentroAspas) {
  linha.push(campo);
  campo = "";
} else if ((char === "\n" || char === "\r") && !dentroAspas) {
  if (char === "\r" && proximo === "\n") {
    i = i + 1;
  }

  linha.push(campo);
  campo = "";

  if (linha.some(function (valor) { return String(valor).trim() !== ""; })) {
    linhas.push(linha);
  }

  linha = [];
} else {
  campo = campo + char;
}


}

if (campo !== "" || linha.length) {
linha.push(campo);


if (linha.some(function (valor) { return String(valor).trim() !== ""; })) {
  linhas.push(linha);
}


}

return linhas;
}

function csvLinhaInsumo(valores) {
return valores.map(function (valor) {
var texto = valor === null || valor === undefined ? "" : String(valor);


if (texto.indexOf('"') >= 0) {
  texto = texto.replace(/"/g, '""');
}

if (texto.indexOf(";") >= 0 || texto.indexOf("\n") >= 0 || texto.indexOf("\r") >= 0 || texto.indexOf('"') >= 0) {
  texto = '"' + texto + '"';
}

return texto;


}).join(";");
}

function baixarArquivoTexto(nomeArquivo, conteudo, tipo) {
var blob = new Blob([conteudo], { type: tipo || "text/plain;charset=utf-8;" });
var url = URL.createObjectURL(blob);
var link = document.createElement("a");

link.href = url;
link.download = nomeArquivo;
document.body.appendChild(link);
link.click();
document.body.removeChild(link);

URL.revokeObjectURL(url);
}

function getStatusFinalInsumo(insumo) {
if (insumo.status === "Inativo") {
return "Inativo";
}

return insumo.statusEstoque || insumo.status || "Ativo";
}

function carregarInsumosLocal() {
if (typeof loadData === "function") {
return loadData(BALU_INSUMOS_KEY, []);
}

try {
var texto = localStorage.getItem(BALU_INSUMOS_KEY) || localStorage.getItem("balu_insumos");
var dados = texto ? JSON.parse(texto) : [];
return Array.isArray(dados) ? dados : [];
} catch (erro) {
return [];
}
}

function salvarInsumosLocal() {
if (typeof saveData === "function") {
saveData(BALU_INSUMOS_KEY, insumosCache);
}

localStorage.setItem(BALU_INSUMOS_KEY, JSON.stringify(insumosCache));
localStorage.setItem("balu_insumos", JSON.stringify(insumosCache));
}

function getValue(id) {
var element = document.getElementById(id);
return element ? String(element.value || "").trim() : "";
}

function setValue(id, valor) {
var element = document.getElementById(id);

if (element) {
element.value = valor === null || valor === undefined ? "" : valor;
}
}

function setText(id, valor) {
var element = document.getElementById(id);

if (!element) {
return;
}

if (element.tagName === "INPUT" || element.tagName === "TEXTAREA" || element.tagName === "SELECT") {
element.value = valor === null || valor === undefined ? "" : valor;
} else {
element.textContent = valor === null || valor === undefined ? "" : valor;
}
}

function numeroInsumo(valor) {
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

if (texto.indexOf(",") >= 0) {
texto = texto.replace(/./g, "").replace(",", ".");
}

var numero = Number(texto);
return isNaN(numero) ? 0 : numero;
}

function numeroParaInputInsumo(valor) {
var numero = numeroInsumo(valor);
return numero === 0 ? "" : String(numero).replace(",", ".");
}

function numeroExportInsumo(valor) {
return numeroInsumo(valor).toFixed(2).replace(".", ",");
}

function formatarMoedaInsumo(valor) {
return numeroInsumo(valor).toLocaleString("pt-BR", {
style: "currency",
currency: "BRL"
});
}

function formatarNumeroBRInsumo(valor, casas) {
return numeroInsumo(valor).toLocaleString("pt-BR", {
minimumFractionDigits: casas,
maximumFractionDigits: casas
});
}

function formatarPercentualInsumo(valor) {
return formatarNumeroBRInsumo(valor, 2) + "%";
}

function normalizarDataInsumo(valor) {
if (!valor) {
return "";
}

var texto = String(valor).trim();

if (texto.length === 10 && texto.charAt(4) === "-" && texto.charAt(7) === "-") {
return texto;
}

if (texto.length === 10 && texto.charAt(2) === "/" && texto.charAt(5) === "/") {
var partes = texto.split("/");
return partes[2] + "-" + partes[1] + "-" + partes[0];
}

return texto;
}

function formatarDataInsumo(valor) {
if (!valor) {
return "-";
}

var data = normalizarDataInsumo(valor);
var partes = String(data).substring(0, 10).split("-");

if (partes.length === 3) {
return partes[2] + "/" + partes[1] + "/" + partes[0];
}

return valor;
}

function limparTextoInsumo(valor) {
if (valor === null || valor === undefined) {
return "";
}

return String(valor).trim();
}

function normalizarTextoInsumo(valor) {
return limparTextoInsumo(valor)
.toLowerCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g, "")
.replace(/[^a-z0-9]+/g, " ")
.trim();
}

function normalizarGrupoInsumo(valor) {
var texto = limparTextoInsumo(valor);

if (!texto) {
return "Outros";
}

return texto;
}

function normalizarUnidadeInsumo(valor) {
var textoOriginal = limparTextoInsumo(valor);
var texto = normalizarTextoInsumo(valor);

if (!texto) {
return "";
}

if (["kg", "quilo", "quilograma", "kilograma"].indexOf(texto) >= 0) {
return "kg";
}

if (["g", "grama", "gramas"].indexOf(texto) >= 0) {
return "g";
}

if (["l", "litro", "litros"].indexOf(texto) >= 0) {
return "litro";
}

if (["ml", "mililitro", "mililitros"].indexOf(texto) >= 0) {
return "ml";
}

if (["un", "und", "unidade", "unidades"].indexOf(texto) >= 0) {
return "unidade";
}

if (["pct", "pacote", "pacotes"].indexOf(texto) >= 0) {
return "pacote";
}

if (["cx", "caixa", "caixas"].indexOf(texto) >= 0) {
return "caixa";
}

return textoOriginal;
}

function gerarIdInsumo() {
if (typeof generateId === "function") {
return generateId("INS");
}

return "INS-" + Date.now() + "-" + Math.floor(Math.random() * 9999);
}

function gerarCodigoInsumo() {
if (typeof generateCode === "function") {
return generateCode("INS");
}

return "INS-" + Math.floor(100000 + Math.random() * 900000);
}

function mostrarMensagemInsumo(mensagem, tipo) {
if (typeof showToast === "function") {
showToast(mensagem, tipo || "info");
return;
}

alert(mensagem);
}

function converterImagemParaBase64(file) {
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

function renderThumbInsumo(imagem, nome) {
if (typeof renderThumb === "function") {
return renderThumb(imagem, nome);
}

var inicial = String(nome || "I").charAt(0).toUpperCase();

if (imagem) {
return "<img class='product-thumb' src='" + imagem + "' alt='" + escapeAttr(nome) + "'>";
}

return "<div class='product-thumb placeholder'>" + escapeHtml(inicial) + "</div>";
}

function badgeStatusInsumo(status) {
if (typeof getStatusBadge === "function") {
return getStatusBadge(status);
}

var texto = String(status || "Ativo");
var classe = "neutral";
var lower = texto.toLowerCase();

if (lower.indexOf("ideal") >= 0 || lower.indexOf("ok") >= 0 || lower.indexOf("ativo") >= 0) {
classe = "success";
}

if (lower.indexOf("baixo") >= 0) {
classe = "warning";
}

if (lower.indexOf("crítico") >= 0 || lower.indexOf("critico") >= 0 || lower.indexOf("inativo") >= 0) {
classe = "danger";
}

return "<span class='badge " + classe + "'>" + escapeHtml(texto) + "</span>";
}

function escapeHtml(valor) {
if (valor === null || valor === undefined) {
return "";
}

return String(valor)
.replace(/&/g, String.fromCharCode(38) + "amp;")
.replace(/</g, String.fromCharCode(38) + "lt;")
.replace(/>/g, String.fromCharCode(38) + "gt;")
.replace(/"/g, String.fromCharCode(38) + "quot;")
.replace(/'/g, String.fromCharCode(38) + "#039;");
}

function escapeAttr(valor) {
return escapeHtml(valor).replace(/`/g, String.fromCharCode(38) + "#096;");
}

function escapeAttr(valor) {
return escapeHtml(valor).replace(/`/g, "`");
}

function criarIconesInsumo() {
if (window.lucide) {
lucide.createIcons();
}
}

function garantirDrawerBasico() {
if (typeof window.openDrawer !== "function") {
window.openDrawer = function (id) {
document.querySelectorAll(".drawer").forEach(function (drawer) {
drawer.classList.remove("is-open", "open", "active");
});


  var drawerAtual = document.getElementById(id);

  if (drawerAtual) {
    drawerAtual.classList.add("is-open");
  }
};


}

if (typeof window.closeDrawer !== "function") {
window.closeDrawer = function () {
document.querySelectorAll(".drawer").forEach(function (drawer) {
drawer.classList.remove("is-open", "open", "active");
});
};
}
}
