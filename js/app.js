// ==============================
// BALU FOOD - APP GLOBAL
// Funções reutilizáveis do sistema
// ==============================

// Importante:
// Nesta fase, alguns cálculos estão no JS apenas para protótipo visual.
// Na versão real, os cálculos oficiais devem ficar no PHP/backend.

const BALU_KEYS = {
clientLogo: "balu_client_logo",
insumos: "balu_insumos",
embalagens: "balu_embalagens",
kitsEmbalagens: "balu_kits_embalagens",
funcionarios: "balu_funcionarios",
compras: "balu_compras_realizadas",
inventarios: "balu_inventarios",
cmv: "balu_cmv_mensal",
fichasTecnicas: "balu_fichas_tecnicas",
fichas_tecnicas: "balu_fichas_tecnicas",
vendasProducao: "balu_vendas_producao",
fornecedores: "balu_fornecedores",
faturamento: "balu_faturamento",
faturamentoMensal: "balu_faturamento_mensal",
precificacoes: "balu_precificacoes",
produtos: "balu_produtos",
producaoPlanejada: "balu_producao_planejada",
banners: "balu_publicidade_banners",
configuracoes: "balu_configuracoes_empresa"
};

const BALU_KEY_ALIASES = {
compras: ["balu_compras"],
cmv: ["balu_cmv"],
fichasTecnicas: ["balu_fichas_tecnicas_v2", "balu_fichas_tecnicas"],
vendasProducao: ["balu_vendas_manuais"],
faturamento: ["balu_faturamento_mensal"]
};

window.BALU_KEYS = BALU_KEYS;
window.BALU_KEY_ALIASES = BALU_KEY_ALIASES;

const BALU_ICON_FALLBACKS = {
"edit-3": "E",
trash: "X",
"trash-2": "X",
settings: "⚙",
bell: "!",
plus: "+",
download: "↓",
upload: "↑",
"file-down": "↓",
save: "S",
"refresh-cw": "↻",
menu: "☰",
"image-plus": "+",
image: "IMG",
power: "⏻",
"log-out": "SAIR"
};

function baluRefreshIcons() {
if (window.lucide && typeof window.lucide.createIcons === "function") {
window.lucide.createIcons();
}

baluApplyIconFallbacks();
}

function baluApplyIconFallbacks() {
document.querySelectorAll("[data-lucide]").forEach(function (icon) {
if (icon.querySelector("svg") || icon.textContent.trim()) {
  return;
}

var name = icon.getAttribute("data-lucide") || "";
icon.classList.add("icon-fallback");
icon.textContent = BALU_ICON_FALLBACKS[name] || name.slice(0, 2).toUpperCase() || "?";
});
}

if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", function () {
baluRefreshIcons();
baluWatchIconFallbacks();
});
} else {
baluRefreshIcons();
baluWatchIconFallbacks();
}

function baluWatchIconFallbacks() {
if (!window.MutationObserver || window.__baluIconObserverStarted) {
return;
}

window.__baluIconObserverStarted = true;

var timeoutId = null;
var observer = new MutationObserver(function () {
clearTimeout(timeoutId);
timeoutId = setTimeout(baluApplyIconFallbacks, 60);
});

observer.observe(document.body, {
childList: true,
subtree: true
});
}

window.baluRefreshIcons = baluRefreshIcons;

// ==============================
// Números e formatação BR
// ==============================

function safeNumber(value) {
if (typeof value === "number") {
return Number.isFinite(value) ? value : 0;
}

let cleanValue = String(value ?? "")
.trim()
.replace(/\s/g, "")
.replace("R$", "")
.replace("%", "")
.replace("x", "");

if (!cleanValue) {
return 0;
}

if (cleanValue.indexOf(",") >= 0) {
cleanValue = cleanValue.replace(/\./g, "").replace(",", ".");
} else {
const partes = cleanValue.split(".");

if (partes.length > 2) {
  cleanValue = partes.join("");
} else if (partes.length === 2 && partes[1].length === 3 && partes[0].length <= 3) {
  cleanValue = cleanValue.replace(/\./g, "");
}
}

cleanValue = cleanValue.replace(/[^\d.-]/g, "");

const number = Number(cleanValue);

return Number.isFinite(number) ? number : 0;
}

function safeDivide(numerator, denominator) {
const a = safeNumber(numerator);
const b = safeNumber(denominator);

if (b === 0) return 0;

return a / b;
}

function formatCurrency(value) {
return safeNumber(value).toLocaleString("pt-BR", {
style: "currency",
currency: "BRL",
minimumFractionDigits: 2,
maximumFractionDigits: 2
});
}

function formatNumber(value, decimals = 2) {
return safeNumber(value).toLocaleString("pt-BR", {
minimumFractionDigits: decimals,
maximumFractionDigits: decimals
});
}

function formatPercent(value) {
return `${formatNumber(value, 2)}%`;
}

function formatDateBR(date) {
if (!date) return "Não informado";

const parsedDate = new Date(date);

if (Number.isNaN(parsedDate.getTime())) {
return "Não informado";
}

return parsedDate.toLocaleDateString("pt-BR");
}

function parseBRL(value) {
return safeNumber(value);
}

function sanitizeText(value, fallback = "Não informado") {
if (value === null || value === undefined || value === "") {
return fallback;
}

return String(value);
}

function displayValue(value, fallback = "Não calculado") {
if (
value === null ||
value === undefined ||
value === "" ||
value === "NaN" ||
value === "Infinity"
) {
return fallback;
}

return value;
}

// ==============================
// LocalStorage
// ==============================

function saveData(key, data) {
try {
const storageKey = getOfficialStorageKey(key);
localStorage.setItem(storageKey, JSON.stringify(data));
return true;
} catch (error) {
console.error("Erro ao salvar dados:", error);
showToast("Erro ao salvar os dados.", "danger");
return false;
}
}

function loadData(key, fallback = []) {
try {
const storageKeys = getStorageKeysWithAliases(key);

for (let i = 0; i < storageKeys.length; i++) {
  const storageKey = storageKeys[i];
  const data = localStorage.getItem(storageKey);

  if (!data) continue;

  const parsed = JSON.parse(data);

  if (i === 0 && isEmptyStorageValue(data) && storageKeys.length > 1) {
    continue;
  }

  if (i > 0 && isEmptyStorageValue(localStorage.getItem(storageKeys[0]))) {
    localStorage.setItem(storageKeys[0], JSON.stringify(parsed));
  }

  return parsed;
}

return fallback;


} catch (error) {
console.error("Erro ao carregar dados:", error);
return fallback;
}
}

function removeData(key) {
localStorage.removeItem(getOfficialStorageKey(key));
}

function getOfficialStorageKey(key) {
if (!key) {
return "";
}

if (BALU_KEYS[key]) {
return BALU_KEYS[key];
}

return String(key);
}

function getStorageKeysWithAliases(key) {
const officialKey = getOfficialStorageKey(key);
const aliasGroup = Object.keys(BALU_KEYS).find(function (name) {
return BALU_KEYS[name] === officialKey || name === key;
});

const keys = [officialKey];

if (aliasGroup && Array.isArray(BALU_KEY_ALIASES[aliasGroup])) {
BALU_KEY_ALIASES[aliasGroup].forEach(function (alias) {
  if (alias && keys.indexOf(alias) < 0) {
    keys.push(alias);
  }
});
}

return keys;
}

function isEmptyStorageValue(value) {
if (value === null || value === undefined || value === "") {
return true;
}

try {
const parsed = JSON.parse(value);

if (Array.isArray(parsed)) {
  return parsed.length === 0;
}

return parsed === null || parsed === undefined;
} catch (error) {
return false;
}
}

function generateId(prefix = "ID") {
const timestamp = Date.now();
const random = Math.floor(Math.random() * 9999);

return `${prefix}-${timestamp}-${random}`;
}

function generateCode(prefix = "BALU") {
const number = Math.floor(Math.random() * 999999)
.toString()
.padStart(6, "0");

return `${prefix}-${number}`;
}

// ==============================
// Imagens e upload
// ==============================

function imageToBase64(file) {
return new Promise((resolve, reject) => {
if (!file) {
resolve("");
return;
}


const reader = new FileReader();

reader.onload = () => resolve(reader.result);
reader.onerror = () => reject("Erro ao converter imagem.");

reader.readAsDataURL(file);


});
}

function initImagePreview(inputId, previewId, placeholderSelector) {
const input = document.getElementById(inputId);
const preview = document.getElementById(previewId);
const placeholder = placeholderSelector
? document.querySelector(placeholderSelector)
: null;

if (!input || !preview) return;

input.addEventListener("change", async () => {
const file = input.files[0];


if (!file) return;

const imageBase64 = await imageToBase64(file);

preview.src = imageBase64;
preview.style.display = "block";

if (placeholder) {
  placeholder.style.display = "none";
}

input.dataset.imageBase64 = imageBase64;


});
}

function renderThumb(image, alt = "Imagem") {
if (!image) {
return `       <div class="item-thumb placeholder">         <i data-lucide="image"></i>       </div>
    `;
}

return `     <img src="${image}" alt="${alt}" class="item-thumb">
  `;
}

// ==============================
// Drawers laterais
// ==============================

function getDrawerOverlay() {
let overlay = document.querySelector(".drawer-overlay");

if (!overlay) {
overlay = document.createElement("div");
overlay.className = "drawer-overlay";
document.body.appendChild(overlay);


overlay.addEventListener("click", () => {
  closeDrawer();
});


}

return overlay;
}

function openDrawer(drawerId) {
closeDrawer();

const drawer = document.getElementById(drawerId);
const overlay = getDrawerOverlay();

if (!drawer) return;

drawer.classList.add("is-open");
overlay.classList.add("is-open");

document.body.style.overflow = "hidden";
}

function closeDrawer() {
document.querySelectorAll(".drawer").forEach((drawer) => {
drawer.classList.remove("is-open");
});

const overlay = document.querySelector(".drawer-overlay");

if (overlay) {
overlay.classList.remove("is-open");
}

document.body.style.overflow = "";
}

function resetForm(formId) {
const form = document.getElementById(formId);

if (!form) return;

form.reset();

form.querySelectorAll("img.image-preview").forEach((img) => {
img.src = "";
img.style.display = "none";
});

form.querySelectorAll("[data-image-base64]").forEach((input) => {
input.dataset.imageBase64 = "";
});

form.querySelectorAll(".image-placeholder").forEach((placeholder) => {
placeholder.style.display = "block";
});
}

// ==============================
// Toast simples
// ==============================

function showToast(message, type = "success") {
let toastContainer = document.querySelector(".toast-container");

if (!toastContainer) {
toastContainer = document.createElement("div");
toastContainer.className = "toast-container";
toastContainer.style.position = "fixed";
toastContainer.style.right = "20px";
toastContainer.style.bottom = "20px";
toastContainer.style.zIndex = "999";
toastContainer.style.display = "flex";
toastContainer.style.flexDirection = "column";
toastContainer.style.gap = "10px";
document.body.appendChild(toastContainer);
}

const toast = document.createElement("div");

const colors = {
success: {
bg: "#E9FBEF",
text: "#008C3A",
border: "#B7EFC5"
},
warning: {
bg: "#FFF4E5",
text: "#D66A00",
border: "#FFD8A8"
},
danger: {
bg: "#FFE8EA",
text: "#C9141B",
border: "#FFC2C7"
},
purple: {
bg: "#F1EAFE",
text: "#5B21B6",
border: "#D8C7FF"
}
};

const color = colors[type] || colors.success;

toast.textContent = message;
toast.style.background = color.bg;
toast.style.color = color.text;
toast.style.border = `1px solid ${color.border}`;
toast.style.padding = "12px 14px";
toast.style.borderRadius = "12px";
toast.style.fontWeight = "800";
toast.style.fontSize = "13px";
toast.style.boxShadow = "0 12px 28px rgba(13, 27, 42, 0.10)";
toast.style.opacity = "0";
toast.style.transform = "translateY(8px)";
toast.style.transition = "0.25s ease";

toastContainer.appendChild(toast);

requestAnimationFrame(() => {
toast.style.opacity = "1";
toast.style.transform = "translateY(0)";
});

setTimeout(() => {
toast.style.opacity = "0";
toast.style.transform = "translateY(8px)";


setTimeout(() => {
  toast.remove();
}, 250);


}, 3200);
}

// ==============================
// Confirmação simples
// ==============================

function confirmAction(message = "Deseja continuar?") {
return window.confirm(message);
}

// ==============================
// Badges
// ==============================

function getStatusBadge(status) {
const normalized = sanitizeText(status, "Não informado").toLowerCase();

if (
normalized.includes("ativo") ||
normalized.includes("pago") ||
normalized.includes("finalizado") ||
normalized.includes("excelente") ||
normalized.includes("em dia")
) {
return `<span class="badge success">${status}</span>`;
}

if (
normalized.includes("atenção") ||
normalized.includes("pendente") ||
normalized.includes("aberto") ||
normalized.includes("parcial") ||
normalized.includes("esperado")
) {
return `<span class="badge warning">${status}</span>`;
}

if (
normalized.includes("crítico") ||
normalized.includes("critico") ||
normalized.includes("cancelado") ||
normalized.includes("bloqueado") ||
normalized.includes("atrasado")
) {
return `<span class="badge danger">${status}</span>`;
}

return `<span class="badge purple">${status}</span>`;
}

// ==============================
// Classificações de CMV e margem
// ==============================

function classifyCMV(cmvPercentual) {
const cmv = safeNumber(cmvPercentual);

if (cmv <= 25) return "Excelente";
if (cmv <= 35) return "Dentro do esperado";
if (cmv <= 45) return "Atenção";

return "Crítico";
}

function classifyMargin(margemPercentual) {
const margem = safeNumber(margemPercentual);

if (margem >= 50) return "Saudável";
if (margem >= 30) return "Revisar preço";

return "Margem baixa";
}

// ==============================
// Eventos globais
// ==============================

document.addEventListener("DOMContentLoaded", () => {
closeDrawer();

document.addEventListener("keydown", (event) => {
if (event.key === "Escape") {
closeDrawer();
}
});
});

