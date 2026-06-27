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
funcionarios: "balu_funcionarios",
compras: "balu_compras_realizadas",
inventarios: "balu_inventarios",
cmv: "balu_cmv_mensal",
faturamentoMensal: "balu_faturamento_mensal"
};

// ==============================
// Números e formatação BR
// ==============================

function safeNumber(value) {
if (typeof value === "number") {
return Number.isFinite(value) ? value : 0;
}

const cleanValue = String(value ?? "")
.trim()
.replace(/\s/g, "")
.replace("R$", "")
.replace("%", "")
.replace(/./g, "")
.replace(",", ".");

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
localStorage.setItem(key, JSON.stringify(data));
return true;
} catch (error) {
console.error("Erro ao salvar dados:", error);
showToast("Erro ao salvar os dados.", "danger");
return false;
}
}

function loadData(key, fallback = []) {
try {
const data = localStorage.getItem(key);


if (!data) return fallback;

return JSON.parse(data);


} catch (error) {
console.error("Erro ao carregar dados:", error);
return fallback;
}
}

function removeData(key) {
localStorage.removeItem(key);
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
