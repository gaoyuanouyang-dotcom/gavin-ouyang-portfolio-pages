import { content } from "./content.js";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const supportedLocales = ["en", "zh-Hant", "zh-CN"];
let locale = supportedLocales.includes(localStorage.getItem("portfolio-language")) ? localStorage.getItem("portfolio-language") : "en";
let activeCase = null;

const get = (path) => path.split(".").reduce((value, key) => value?.[key], content[locale]);
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);

function renderStaticText() {
  document.documentElement.lang = locale;
  document.title = content[locale].meta.title;
  document.querySelector('meta[name="description"]').content = content[locale].meta.description;
  document.querySelectorAll("[data-text]").forEach((element) => {
    const value = get(element.dataset.text);
    if (value !== undefined) element.textContent = value;
  });
  document.querySelectorAll("[data-rich]").forEach((element) => {
    element.innerHTML = get(element.dataset.rich).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
  });
}

function renderNavigation() {
  const nav = content[locale].nav;
  document.querySelector("[data-header] nav").innerHTML = Object.entries(nav).map(([id, label]) => `<a href="#${id}" data-nav="${id}">${escapeHtml(label)}</a>`).join("");
}

function renderCapabilities() {
  document.querySelector("[data-capabilities]").innerHTML = content[locale].capabilities.items.map((item, index) => `
    <article class="capability-card reveal" data-delay="${index % 2}">
      <div class="capability-top"><span>${item.n}</span></div>
      <h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p>
      <div class="capability-line" aria-hidden="true"></div>
    </article>`).join("");
}

function renderExperience() {
  document.querySelector("[data-experience]").innerHTML = content[locale].experience.entries.map((entry, index) => `
    <article class="timeline-entry reveal" data-delay="${index % 2}">
      <div class="timeline-identity">
        <div class="company-logo"><img src="${entry.logo}" alt="${escapeHtml(entry.logoAlt)}" loading="lazy" decoding="async" /></div>
        <div class="timeline-date">${escapeHtml(entry.date)}</div>
      </div>
      <div class="timeline-main">
        <p class="company">${escapeHtml(entry.company)}</p><h3>${escapeHtml(entry.role)}</h3><p class="scope">${escapeHtml(entry.scope)}</p>
        <p class="entry-text">${escapeHtml(entry.text)}</p>
        ${entry.points.length ? `<ul>${entry.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>` : ""}
      </div>
    </article>`).join("");
}

function caseVisual(id) {
  const visuals = {
    retail: `<div class="visual-map"><span class="map-line l1"></span><span class="map-line l2"></span><i class="node n1">ID</i><i class="node n2">MY</i><i class="node n3">TH</i><i class="node n4">HK</i><b>Site<br />context</b></div>`,
    growth: `<div class="visual-bars"><i style="--h:38%"></i><i style="--h:62%"></i><i style="--h:48%"></i><i style="--h:78%"></i><i style="--h:68%"></i><span>Signal → Decision</span></div>`,
    ai: `<div class="visual-flow"><span>INPUT</span><i>→</i><span>TEST</span><i>→</i><span>REVIEW</span><b>HUMAN<br />JUDGMENT</b></div>`,
    process: `<div class="visual-matrix"><span></span><span></span><span></span><span></span><span></span><span></span><b>OWNERSHIP<br />× RISK</b></div>`
  };
  return visuals[id];
}

function renderCases() {
  const { cases, labels } = content[locale].work;
  document.querySelector("[data-cases]").innerHTML = cases.map((item, index) => `
    <article class="case-card case-${item.id} reveal" data-delay="${index % 2}">
      <div class="case-visual" aria-hidden="true">${caseVisual(item.id)}</div>
      <div class="case-body"><div class="case-meta"><span>${item.number}</span><span>${escapeHtml(item.tag)}</span></div>
      <h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.teaser)}</p>
      <button class="case-open" type="button" data-case="${item.id}"><span>${escapeHtml(labels.open)}</span><i aria-hidden="true">↗</i></button></div>
    </article>`).join("");
  document.querySelectorAll("[data-case]").forEach((button) => button.addEventListener("click", () => openCase(button.dataset.case)));
}

function educationMap(item) {
  const isHongKong = item.mapKey === "hong-kong";
  const blocks = isHongKong
    ? `<path d="M34 47 63 31l23 13-29 17zM71 69l28-16 24 14-29 17zM111 42l25-14 22 12-25 15zM130 76l31-18 25 14-31 18z" />`
    : `<path d="M30 39 60 22l26 15-30 17zM67 67l29-17 27 15-30 18zM113 34l28-16 26 15-29 17zM132 70l30-17 27 15-30 18z" />`;
  const marker = isHongKong ? { x: 151, y: 43 } : { x: 150, y: 67 };
  return `
    <div class="education-map" role="img" aria-label="${escapeHtml(item.mapLabel)}">
      <svg viewBox="0 0 220 124" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="map-surface-${item.mapKey}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#f8fbfe"/><stop offset="1" stop-color="#e4f0fa"/>
          </linearGradient>
          <filter id="map-shadow-${item.mapKey}" x="-30%" y="-30%" width="160%" height="180%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#004182" flood-opacity=".16"/>
          </filter>
        </defs>
        <path class="map-ground" d="M15 60 104 9l101 57-91 52z" fill="url(#map-surface-${item.mapKey})"/>
        ${isHongKong ? `<path class="map-water" d="M15 60 114 118l91-52-15-8-76 43-83-49z"/>` : `<path class="map-river" d="M22 72c48-17 71 15 108-4 28-15 46-11 67-4"/>`}
        <g class="map-blocks">${blocks}</g>
        <path class="map-road" d="M39 78 127 28M78 97l92-53M54 41l102 57"/>
        <g class="map-pin" transform="translate(${marker.x} ${marker.y})" filter="url(#map-shadow-${item.mapKey})">
          <path d="M0-17c-8 0-14 6-14 14 0 11 14 24 14 24S14 8 14-3C14-11 8-17 0-17Z"/>
          <circle cx="0" cy="-3" r="4"/>
        </g>
      </svg>
      <div class="education-map-caption"><span>${escapeHtml(item.mapCity)}</span><small>${escapeHtml(item.mapArea)}</small></div>
    </div>`;
}

function renderEducation() {
  document.querySelector("[data-education]").innerHTML = content[locale].education.items.map((item, index) => `
    <article class="education-card reveal" data-delay="${index}">
      <div class="education-top"><div class="education-logo"><img src="${item.logo}" alt="${escapeHtml(item.logoAlt)}" loading="lazy" decoding="async" /></div>${educationMap(item)}</div>
      <div class="education-copy"><div class="education-meta"><span>0${index + 1}</span><span>${escapeHtml(item.place)}</span></div><h3>${escapeHtml(item.school)}</h3><p class="degree">${escapeHtml(item.degree)}</p><p class="education-date">${escapeHtml(item.date)}</p></div>
    </article>`).join("");
}

function renderContact() {
  const contact = content[locale].contact;
  const links = [
    { label: contact.email, value: "gaoyuanouyang@gmail.com", href: "mailto:gaoyuanouyang@gmail.com" },
    { label: contact.linkedIn, value: "linkedin.com/in/gavin-ou", href: "https://www.linkedin.com/in/gavin-ou", external: true },
    { label: contact.whatsApp, value: "+852 5986 7739", href: "https://wa.me/85259867739", external: true }
  ];
  document.querySelector("[data-contact-links]").innerHTML = links.map((item) => `<a class="contact-row" href="${item.href}"${item.external ? ' target="_blank" rel="noreferrer"' : ""}${item.download ? ` download="${item.download}"` : ""}><span>${escapeHtml(item.label)}</span><em>${escapeHtml(item.value)}</em><i aria-hidden="true">${item.download ? "↓" : "↗"}</i></a>`).join("");
}

function openCase(id) {
  const item = content[locale].work.cases.find((candidate) => candidate.id === id);
  if (!item) return;
  activeCase = id;
  const labels = content[locale].work.labels;
  document.querySelector("[data-dialog-content]").innerHTML = `
    <div class="dialog-meta"><span>${item.number}</span><span>${escapeHtml(item.tag)}</span></div>
    <h2 id="dialog-title">${escapeHtml(item.title)}</h2>
    <div class="dialog-grid">
      ${[[labels.context, item.context], [labels.challenge, item.challenge], [labels.role, item.role], [labels.approach, item.approach], [labels.outcome, item.outcome]].map(([label, value]) => `<section><h3>${escapeHtml(label)}</h3><p>${escapeHtml(value)}</p></section>`).join("")}
    </div>`;
  const dialog = document.querySelector("[data-dialog]");
  dialog.showModal();
  document.body.classList.add("dialog-open");
}

function renderAll() {
  renderStaticText(); renderNavigation(); renderCapabilities(); renderExperience(); renderCases(); renderEducation(); renderContact();
  document.querySelectorAll("[data-lang]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.lang === locale)));
  observeReveals(); observeSections();
  if (activeCase && document.querySelector("[data-dialog]").open) openCase(activeCase);
}

let revealObserver;
function observeReveals() {
  revealObserver?.disconnect();
  const elements = document.querySelectorAll(".reveal");
  if (reduceMotion) { elements.forEach((el) => el.classList.add("is-visible")); return; }
  revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add("is-visible"); revealObserver.unobserve(entry.target); }
  }), { threshold: 0.12 });
  elements.forEach((element) => revealObserver.observe(element));
}

let sectionObserver;
function observeSections() {
  sectionObserver?.disconnect();
  sectionObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    document.querySelectorAll("[data-nav]").forEach((link) => link.classList.toggle("active", link.dataset.nav === entry.target.id));
  }), { rootMargin: "-40% 0px -50%", threshold: 0 });
  document.querySelectorAll("main section[id]:not(#top)").forEach((section) => sectionObserver.observe(section));
}

document.querySelectorAll("[data-lang]").forEach((button) => button.addEventListener("click", () => {
  locale = button.dataset.lang;
  localStorage.setItem("portfolio-language", locale);
  renderAll();
}));

const menuButton = document.querySelector(".menu-toggle");
menuButton.addEventListener("click", () => {
  const open = document.body.classList.toggle("menu-open");
  menuButton.setAttribute("aria-expanded", String(open));
});
document.querySelector(".site-nav").addEventListener("click", (event) => {
  if (event.target.closest("a")) { document.body.classList.remove("menu-open"); menuButton.setAttribute("aria-expanded", "false"); }
});

const dialog = document.querySelector("[data-dialog]");
function closeDialog() { dialog.close(); activeCase = null; document.body.classList.remove("dialog-open"); }
document.querySelector("[data-dialog-close]").addEventListener("click", closeDialog);
dialog.addEventListener("click", (event) => { if (event.target === dialog) closeDialog(); });
dialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));

window.addEventListener("scroll", () => {
  const now = window.scrollY;
  document.querySelector("[data-header]").classList.toggle("header-scrolled", now > 24);
}, { passive: true });

document.querySelector("[data-year]").textContent = new Date().getFullYear();
renderAll();
