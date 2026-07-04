// ==============================
// BALU FOOD - LAYOUT GLOBAL
// Sidebar branca + Header reutilizável
// ==============================

// Para adicionar uma nova aba no sistema:
// 1. Crie o arquivo HTML dentro de pages/
// 2. Crie o JS dentro de js/
// 3. Adicione o link aqui em BALU_MENU_GROUPS
// 4. Adicione o título da página em getPageTitle()

var BALU_MENU_GROUPS = [
{
title: "Dashboard",
links: [
{
label: "Dashboard",
href: "dashboard.html",
icon: "layout-dashboard"
}
]
},
{
title: "Cadastros",
links: [
{
label: "Insumos",
href: "cadastro-insumos.html",
icon: "package"
},
{
label: "Embalagens",
href: "cadastro-embalagens.html",
icon: "box"
},
{
label: "Fornecedores",
href: "fornecedores.html",
icon: "truck"
},
{
label: "Produtos / Cardápio",
href: "produtos.html",
icon: "book-open"
},
{
label: "Funcionários",
href: "funcionarios.html",
icon: "users"
}
]
},
{
title: "Operação",
links: [
{
label: "Compras Realizadas",
href: "compras-realizadas.html",
icon: "shopping-cart"
},
{
label: "Vendas / Produção",
href: "vendas-producao.html",
icon: "receipt-text"
},
{
label: "Produção",
href: "producao.html",
icon: "chef-hat"
}
]
},
{
title: "Estoque e CMV",
links: [
{
label: "Inventários",
href: "inventarios.html",
icon: "clipboard-list"
},
{
label: "CMV Real Mensal",
href: "cmv-real-mensal.html",
icon: "bar-chart-3"
},
{
label: "Fichas Técnicas",
href: "fichas-tecnicas.html",
icon: "utensils"
},
{
label: "Precificação",
href: "precificacao.html",
icon: "calculator"
}
]
},
{
title: "Gestão",
links: [
{
label: "Faturamento",
href: "faturamento.html",
icon: "wallet"
},
{
label: "Relatórios",
href: "relatorios.html",
icon: "file-bar-chart"
},
{
label: "Configurações",
href: "configuracoes.html",
icon: "settings"
},
{
label: "Central de Ajuda",
href: "central-ajuda.html",
icon: "circle-help"
}
]
}
];

// ==============================
// Renderização do layout
// ==============================

function renderLayout() {
var appShell = document.querySelector(".app-shell");
var mainWrapper = document.querySelector(".main-wrapper");

if (!appShell || !mainWrapper) {
return;
}

var oldSidebar = document.getElementById("appSidebar");
var oldTopbar = document.querySelector(".topbar");
var oldOverlay = document.getElementById("mobileSidebarOverlay");

if (oldSidebar) {
oldSidebar.remove();
}

if (oldTopbar) {
oldTopbar.remove();
}

if (oldOverlay) {
oldOverlay.remove();
}

var currentPage = window.location.pathname.split("/").pop();

var sidebar = createSidebar(currentPage);
var topbar = createTopbar(currentPage);
var mobileOverlay = createMobileOverlay();

appShell.prepend(sidebar);
mainWrapper.prepend(topbar);
document.body.appendChild(mobileOverlay);

restoreSidebarState();
initSidebarEvents();
initTopbarEvents();
initClientLogoUpload();

if (window.lucide) {
lucide.createIcons();
}
}

// ==============================
// Criação da sidebar
// ==============================

function createSidebar(currentPage) {
var sidebar = document.createElement("aside");

sidebar.className = "sidebar";
sidebar.id = "appSidebar";

var menuHtml = "";

BALU_MENU_GROUPS.forEach(function (group) {
menuHtml += "<div class='menu-section'>";
menuHtml += "<div class='menu-section-title'>" + group.title + "</div>";


group.links.forEach(function (link) {
  var activeClass = currentPage === link.href ? "active" : "";

  menuHtml +=
    "<a href='" + link.href + "' class='menu-link " + activeClass + "' title='" + link.label + "'>" +
      "<i data-lucide='" + link.icon + "'></i>" +
      "<span>" + link.label + "</span>" +
    "</a>";
});

menuHtml += "</div>";


});

sidebar.innerHTML =
"<div class='sidebar-brand'>" +
"<img src='../assets/logo/logo_balu.png' alt='BALU' class='sidebar-logo'>" +


  "<div class='logo-fallback' style='display:none;'>" +
    "<strong>Balu</strong>" +
    "<span>Sistema de Gestão para Food Service</span>" +
  "</div>" +
"</div>" +

"<div class='client-logo-card'>" +
  "<input type='file' id='clientLogoInput' accept='image/*' hidden>" +

  "<label for='clientLogoInput' class='client-logo-upload'>" +
    "<img id='clientLogoPreview' class='client-logo-preview' alt='Logo do cliente'>" +

    "<div class='client-logo-placeholder'>" +
      "<i data-lucide='image'></i>" +
      "<strong>Sua marca aqui</strong>" +
      "<small>Imagem da sua empresa</small>" +
    "</div>" +
  "</label>" +
"</div>" +

"<nav class='sidebar-menu'>" +
  menuHtml +
"</nav>" +

"<div class='sidebar-footer'>" +
  "<button type='button' class='sidebar-collapse-btn' id='sidebarCollapseBtn'>" +
    "<i data-lucide='panel-left-close'></i>" +
    "<span>Recolher menu</span>" +
  "</button>" +
"</div>";


return sidebar;
}

// ==============================
// Criação do header superior
// ==============================

function createTopbar(currentPage) {
var topbar = document.createElement("header");

topbar.className = "topbar";

var pageTitle = getPageTitle(currentPage);
var perfil = obterPerfilTopbar();
var inicial = String(perfil.empresa || "C").charAt(0).toUpperCase();
var temaAtual = typeof baluGetTheme === "function" ? baluGetTheme() : document.documentElement.getAttribute("data-theme") || "dark";

topbar.innerHTML =
"<div class='topbar-left'>" +
"<button type='button' class='mobile-menu-btn' id='mobileMenuBtn'>" +
"<i data-lucide='menu'></i>" +
"</button>" +


  "<div class='topbar-title'>" +
    "<strong>" + pageTitle + "</strong>" +
    "<span>BALU Food • Sistema de Gestão para Food Service</span>" +
  "</div>" +
"</div>" +

"<div class='topbar-actions'>" +
  "<button type='button' class='topbar-icon-btn theme-toggle-btn' title='Alternar tema' id='themeToggleBtn'>" +
    "<i data-lucide='" + (temaAtual === "dark" ? "sun" : "moon") + "'></i>" +
    "<span>" + (temaAtual === "dark" ? "Claro" : "Escuro") + "</span>" +
  "</button>" +

  "<button type='button' class='topbar-icon-btn' title='Notificações'>" +
    "<i data-lucide='bell'></i>" +
  "</button>" +

  "<button type='button' class='topbar-icon-btn' title='Configurações' id='topbarSettingsBtn'>" +
    "<i data-lucide='settings'></i>" +
  "</button>" +

  "<div class='profile-menu'>" +
    "<button type='button' class='user-chip profile-menu-button' id='profileMenuBtn' aria-expanded='false'>" +
      "<div class='user-avatar'>" + escapeHtmlLayout(inicial) + "</div>" +

      "<div class='user-info'>" +
        "<strong>" + escapeHtmlLayout(perfil.empresa) + "</strong>" +
        "<span>" + escapeHtmlLayout(perfil.plano) + " - " + escapeHtmlLayout(perfil.status) + "</span>" +
      "</div>" +

      "<i data-lucide='chevron-down' class='profile-chevron'></i>" +
    "</button>" +

    "<div class='profile-dropdown' id='profileDropdown'>" +
      "<div class='profile-dropdown-header'>" +
        "<strong>" + escapeHtmlLayout(perfil.empresa) + "</strong>" +
        "<span>" + escapeHtmlLayout(perfil.status) + "</span>" +
      "</div>" +

      itemPerfilTopbar("Empresa", perfil.empresa) +
      itemPerfilTopbar("CNPJ", perfil.cnpj) +
      itemPerfilTopbar("Administrador", perfil.administrador) +
      itemPerfilTopbar("E-mail", perfil.email) +
      itemPerfilTopbar("Plano", perfil.plano) +
      itemPerfilTopbar("Status", perfil.status) +

      "<div class='profile-dropdown-actions'>" +
        "<button type='button' class='btn btn-outline btn-small' id='profileConfigBtn'><i data-lucide='settings'></i>Configurações</button>" +
        "<button type='button' class='btn btn-outline btn-small danger-soft' id='profileLogoutBtn'><i data-lucide='log-out'></i>Sair do sistema</button>" +
      "</div>" +
    "</div>" +
  "</div>" +
"</div>";


return topbar;
}

// ==============================
// Eventos do header
// ==============================

function initTopbarEvents() {
var settingsBtn = document.getElementById("topbarSettingsBtn");
var profileBtn = document.getElementById("profileMenuBtn");
var profileDropdown = document.getElementById("profileDropdown");
var profileConfigBtn = document.getElementById("profileConfigBtn");
var profileLogoutBtn = document.getElementById("profileLogoutBtn");
var themeToggleBtn = document.getElementById("themeToggleBtn");

if (settingsBtn) {
settingsBtn.addEventListener("click", function () {
window.location.href = "configuracoes.html";
});
}

if (themeToggleBtn) {
themeToggleBtn.addEventListener("click", function () {
if (typeof baluToggleTheme === "function") {
baluToggleTheme();
} else {
var atual = document.documentElement.getAttribute("data-theme") || "dark";
document.documentElement.setAttribute("data-theme", atual === "dark" ? "light" : "dark");
}

atualizarBotaoTemaTopbar();
});
}

if (profileBtn && profileDropdown) {
profileBtn.addEventListener("click", function (event) {
event.stopPropagation();
var aberto = profileDropdown.classList.toggle("is-open");
profileBtn.setAttribute("aria-expanded", aberto ? "true" : "false");
});

document.addEventListener("click", function (event) {
if (!profileDropdown.contains(event.target) && !profileBtn.contains(event.target)) {
  profileDropdown.classList.remove("is-open");
  profileBtn.setAttribute("aria-expanded", "false");
}
});
}

if (profileConfigBtn) {
profileConfigBtn.addEventListener("click", function () {
window.location.href = "configuracoes.html";
});
}

if (profileLogoutBtn) {
profileLogoutBtn.addEventListener("click", function () {
if (typeof baluLogout === "function") {
  baluLogout();
  return;
}

localStorage.removeItem("balu_auth_session");
window.location.href = "login.html";
});
}
}

// ==============================
// Overlay mobile
// ==============================

function createMobileOverlay() {
var overlay = document.createElement("div");

overlay.className = "mobile-sidebar-overlay";
overlay.id = "mobileSidebarOverlay";

return overlay;
}

function obterPerfilTopbar() {
var fallback = {
empresa: "Conta Teste",
cnpj: "Não informado",
administrador: "Administrador",
email: "Não informado",
plano: "BALU Food",
status: "Ativo"
};

try {
var texto = localStorage.getItem("balu_configuracoes_empresa");
var config = texto ? JSON.parse(texto) : {};

return {
empresa: config.nomeEmpresa || fallback.empresa,
cnpj: config.cnpj || fallback.cnpj,
administrador: config.responsavel || fallback.administrador,
email: config.email || fallback.email,
plano: config.plano || fallback.plano,
status: config.statusConta || fallback.status
};
} catch (erro) {
return fallback;
}
}

function itemPerfilTopbar(label, value) {
return "<div class='profile-info-row'>" +
"<span>" + escapeHtmlLayout(label) + "</span>" +
"<strong>" + escapeHtmlLayout(value || "Não informado") + "</strong>" +
"</div>";
}

function atualizarBotaoTemaTopbar() {
var botao = document.getElementById("themeToggleBtn");

if (!botao) {
return;
}

var tema = typeof baluGetTheme === "function" ? baluGetTheme() : document.documentElement.getAttribute("data-theme") || "dark";
botao.innerHTML =
"<i data-lucide='" + (tema === "dark" ? "sun" : "moon") + "'></i>" +
"<span>" + (tema === "dark" ? "Claro" : "Escuro") + "</span>";

if (window.lucide) {
lucide.createIcons();
}
}

function escapeHtmlLayout(value) {
return String(value === null || value === undefined ? "" : value)
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/"/g, "&quot;")
.replace(/'/g, "&#039;");
}

// ==============================
// Título por página
// ==============================

function getPageTitle(currentPage) {
var titles = {
"dashboard.html": "Dashboard",
"cadastro-insumos.html": "Cadastro de Insumos",
"cadastro-embalagens.html": "Cadastro de Embalagens",
"fornecedores.html": "Fornecedores",
"produtos.html": "Produtos / Cardápio",
"funcionarios.html": "Funcionários e Mão de Obra",
"compras-realizadas.html": "Compras Realizadas",
"vendas-producao.html": "Vendas / Produção",
"producao.html": "Produção",
"inventarios.html": "Inventários",
"cmv-real-mensal.html": "CMV Real Mensal",
"fichas-tecnicas.html": "Fichas Técnicas",
"precificacao.html": "Precificação",
"faturamento.html": "Faturamento",
"relatorios.html": "Relatórios",
"configuracoes.html": "Configurações",
"central-ajuda.html": "Central de Ajuda"
};

return titles[currentPage] || "BALU Food";
}

// ==============================
// Eventos da sidebar
// ==============================

function initSidebarEvents() {
var appShell = document.querySelector(".app-shell");
var sidebar = document.getElementById("appSidebar");
var collapseBtn = document.getElementById("sidebarCollapseBtn");
var mobileMenuBtn = document.getElementById("mobileMenuBtn");
var mobileOverlay = document.getElementById("mobileSidebarOverlay");

if (collapseBtn && appShell) {
collapseBtn.addEventListener("click", function () {
appShell.classList.toggle("sidebar-collapsed");


  var isCollapsed = appShell.classList.contains("sidebar-collapsed");

  localStorage.setItem("balu_sidebar_collapsed", String(isCollapsed));

  updateCollapseButton(isCollapsed);
});


}

if (mobileMenuBtn && sidebar && mobileOverlay) {
mobileMenuBtn.addEventListener("click", function () {
sidebar.classList.add("is-open");
mobileOverlay.classList.add("is-open");
document.body.style.overflow = "hidden";
});
}

if (mobileOverlay && sidebar) {
mobileOverlay.addEventListener("click", function () {
sidebar.classList.remove("is-open");
mobileOverlay.classList.remove("is-open");
document.body.style.overflow = "";
});
}

var menuLinks = document.querySelectorAll(".menu-link");

menuLinks.forEach(function (link) {
link.addEventListener("click", function () {
if (typeof closeDrawer === "function") {
closeDrawer();
}


  if (window.innerWidth <= 980 && sidebar && mobileOverlay) {
    sidebar.classList.remove("is-open");
    mobileOverlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }
});


});
}

// ==============================
// Restaurar estado da sidebar
// ==============================

function restoreSidebarState() {
var appShell = document.querySelector(".app-shell");

if (!appShell) {
return;
}

var isCollapsed = localStorage.getItem("balu_sidebar_collapsed") === "true";

if (isCollapsed) {
appShell.classList.add("sidebar-collapsed");
} else {
appShell.classList.remove("sidebar-collapsed");
}

updateCollapseButton(isCollapsed);
}

// ==============================
// Atualizar botão recolher
// ==============================

function updateCollapseButton(isCollapsed) {
var collapseBtn = document.getElementById("sidebarCollapseBtn");

if (!collapseBtn) {
return;
}

if (isCollapsed) {
collapseBtn.innerHTML =
"<i data-lucide='panel-left-open'></i>" +
"<span>Expandir menu</span>";
} else {
collapseBtn.innerHTML =
"<i data-lucide='panel-left-close'></i>" +
"<span>Recolher menu</span>";
}

if (window.lucide) {
lucide.createIcons();
}
}

// ==============================
// Upload da logo do cliente
// ==============================

function initClientLogoUpload() {
var input = document.getElementById("clientLogoInput");
var preview = document.getElementById("clientLogoPreview");
var placeholder = document.querySelector(".client-logo-placeholder");

if (!input || !preview) {
return;
}

var storageKey = "balu_client_logo";

if (typeof BALU_KEYS !== "undefined" && BALU_KEYS.clientLogo) {
storageKey = BALU_KEYS.clientLogo;
}

var savedLogo = localStorage.getItem(storageKey);

if (savedLogo) {
preview.src = savedLogo;
preview.style.display = "block";


if (placeholder) {
  placeholder.style.display = "none";
}

} else {
preview.style.display = "none";


if (placeholder) {
  placeholder.style.display = "block";
}


}

input.addEventListener("change", function () {
var file = input.files[0];


if (!file) {
  return;
}

convertFileToBase64Fallback(file).then(function (imageBase64) {
  localStorage.setItem(storageKey, imageBase64);

  preview.src = imageBase64;
  preview.style.display = "block";

  if (placeholder) {
    placeholder.style.display = "none";
  }

  if (typeof showToast === "function") {
    showToast("Logo da empresa atualizado com sucesso.", "success");
  }
});


});
}

// ==============================
// Conversão de imagem para Base64
// ==============================

function convertFileToBase64Fallback(file) {
return new Promise(function (resolve, reject) {
var reader = new FileReader();


reader.onload = function () {
  resolve(reader.result);
};

reader.onerror = function () {
  reject("Erro ao converter imagem.");
};

reader.readAsDataURL(file);


});
}

// ==============================
// Inicialização
// ==============================

document.addEventListener("DOMContentLoaded", function () {
renderLayout();
});

