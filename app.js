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
  const labels = {
    en: isHongKong
      ? { campus: "PolyU", area: "Hung Hom", station: "Hung Hom Station", harbour: "Victoria Harbour", landmark: "Hong Kong Coliseum", district: "Tsim Sha Tsui East", road: "Chatham Rd", scale: "500 m" }
      : { campus: "CSUST · Yuntang", area: "Tianxin", station: "Shangshuangtang", harbour: "Line 1", landmark: "Residential district", district: "Yuntang", road: "Wanjiali South Rd", northRoad: "Environmental Protection Ave", eastRoad: "Huijin Rd", scale: "1 km" },
    "zh-Hant": isHongKong
      ? { campus: "香港理工大學", area: "紅磡", station: "紅磡站", harbour: "維多利亞港", landmark: "香港體育館", district: "尖沙咀東", road: "漆咸道", scale: "500 米" }
      : { campus: "長沙理工大學 · 雲塘", area: "天心區", station: "尚雙塘站", harbour: "地鐵 1 號線", landmark: "住宅街區", district: "雲塘", road: "萬家麗南路", northRoad: "環保大道", eastRoad: "匯金路", scale: "1 公里" },
    "zh-CN": isHongKong
      ? { campus: "香港理工大学", area: "红磡", station: "红磡站", harbour: "维多利亚港", landmark: "香港体育馆", district: "尖沙咀东", road: "漆咸道", scale: "500 米" }
      : { campus: "长沙理工大学 · 云塘", area: "天心区", station: "尚双塘站", harbour: "地铁 1 号线", landmark: "住宅街区", district: "云塘", road: "万家丽南路", northRoad: "环保大道", eastRoad: "汇金路", scale: "1 公里" }
  }[locale];

  const hongKongMap = `
    <path class="map-water" d="M0 302c82-24 144-22 218-4 65 16 131 15 197-5 74-23 137-23 205-5v132H0Z"/>
    <path class="map-coast" d="M0 302c82-24 144-22 218-4 65 16 131 15 197-5 74-23 137-23 205-5"/>
    <path class="map-park" d="M66 76h112l19 63-121 20-28-39zM492 88l84 11-7 64-92 8-22-41z"/>
    <g class="map-buildings">
      <path d="M35 26h55v30H35zM99 23h42v43H99zM151 27h54v29h-54zM213 18h68v42h-68zM290 24h42v31h-42zM346 17h61v45h-61zM421 28h47v31h-47zM483 22h80v42h-80z"/>
      <path d="M29 180h45v41H29zM84 171h52v57H84zM150 178h40v37h-40zM201 168h58v58h-58zM270 178h39v38h-39zM455 185h49v35h-49zM515 176h70v47h-70z"/>
      <path d="M23 239h60v37H23zM95 242h45v33H95zM151 235h67v47h-67zM231 245h48v38h-48zM462 237h55v39h-55zM530 240h67v34h-67z"/>
    </g>
    <g class="map-minor-roads">
      <path d="M0 72h620M0 118h620M0 165h620M0 229h620M93 0v295M145 0v295M205 0v295M282 0v295M345 0v295M413 0v295M481 0v295M563 0v295"/>
      <path d="M0 45 267 287M258 0 620 242M0 263 322 0"/>
    </g>
    <path class="map-major-road" d="M372-15c-9 79-10 154 6 226 8 37 8 66 1 92"/>
    <path class="map-major-road" d="M-20 278c145-20 271-14 391 20 84 24 164 21 270-1"/>
    <path class="map-rail" d="M445-10c-12 76-20 147-8 216 7 39 6 61-7 91"/>
    <path class="map-campus" d="M246 82 358 72l47 64-29 70-132-6-28-67z"/>
    <path class="map-campus-building" d="M258 99h41v28h-41zM309 91h39v31h-39zM356 112h28v43h-28zM274 142h45v38h-45zM328 137h35v45h-35z"/>
    <ellipse class="map-landmark-shape" cx="440" cy="254" rx="36" ry="24"/>
    <g class="map-labels">
      <text class="district-label" x="52" y="105">${escapeHtml(labels.district)}</text>
      <text class="district-label" x="505" y="118">${escapeHtml(labels.area)}</text>
      <text class="road-label" x="387" y="68" transform="rotate(83 387 68)">${escapeHtml(labels.road)}</text>
      <text class="water-label" x="355" y="365">${escapeHtml(labels.harbour)}</text>
      <text class="poi-label" x="421" y="292">${escapeHtml(labels.landmark)}</text>
    </g>
    <g class="map-transit" transform="translate(435 218)"><circle r="12"/><text x="0" y="4">M</text></g>
    <text class="station-label" x="452" y="222">${escapeHtml(labels.station)}</text>
    <g class="map-pin" transform="translate(315 126)"><path d="M0-24c-11 0-19 8-19 19 0 15 19 32 19 32S19 10 19-5c0-11-8-19-19-19Z"/><circle cy="-5" r="6"/></g>
    <rect class="map-label-plate" x="277" y="153" width="118" height="25" rx="12"/><text class="campus-label" x="336" y="170">${escapeHtml(labels.campus)}</text>`;

  const changshaMap = `
    <path class="map-terrain" d="M0 0h620v420H0z"/>
    <path class="map-park" d="M420 18h200v118l-71 18-55-37-74 12zM425 320l73-44 122 12v132H437z"/>
    <path class="map-field" d="M17 30h91v54H17zM20 94h88v62H20zM505 184h95v49h-95zM505 241h95v44h-95zM505 293h95v51h-95z"/>
    <g class="map-buildings map-buildings-residential">
      <path d="M157 32h36v66h-36zM201 27h31v72h-31zM241 37h40v57h-40zM289 28h31v67h-31zM329 37h40v59h-40z"/>
      <path d="M148 118h38v50h-38zM197 115h32v57h-32zM239 121h39v46h-39zM287 113h35v57h-35zM333 122h36v45h-36z"/>
      <path d="M39 234h42v56H39zM91 231h39v61H91zM145 241h43v46h-43zM198 238h35v52h-35z"/>
    </g>
    <g class="map-minor-roads">
      <path d="M0 109h407M0 184h620M0 229h410M0 301h620M0 351h620M146 0v420M238 0v420M329 0v420M411 0v420M492 0v420"/>
      <path d="M0 386 345 0M216 420 620 56"/>
    </g>
    <path class="map-major-road" d="M178-10c8 91 4 172 8 254 3 70 1 123-7 186"/>
    <path class="map-major-road" d="M-20 321c160-7 302-7 660 3"/>
    <path class="map-major-road" d="M459-10c-10 107-10 211 0 440"/>
    <path class="map-rail" d="M183-10c4 101 5 203 2 440"/>
    <path class="map-campus" d="M316 93h174v205l-42 15-132-28z"/>
    <path class="map-campus-building" d="M337 118h45v34h-45zM394 112h54v42h-54zM336 169h54v37h-54zM402 171h63v37h-63zM339 224h42v38h-42zM396 222h66v50h-66z"/>
    <path class="map-lake" d="M370 207c22-14 50-7 61 8 10 14-5 29-29 29-26 0-52-23-32-37Z"/>
    <g class="map-labels">
      <text class="district-label" x="196" y="82">${escapeHtml(labels.landmark)}</text>
      <text class="district-label" x="512" y="95">${escapeHtml(labels.area)}</text>
      <text class="road-label" x="274" y="314">${escapeHtml(labels.road)}</text>
      <text class="road-label" x="310" y="86">${escapeHtml(labels.northRoad)}</text>
      <text class="road-label" x="503" y="126" transform="rotate(88 503 126)">${escapeHtml(labels.eastRoad)}</text>
      <text class="road-label" x="194" y="87" transform="rotate(88 194 87)">Furong South Rd</text>
      <text class="district-label" x="516" y="372">${escapeHtml(labels.district)}</text>
    </g>
    <g class="map-transit" transform="translate(184 275)"><circle r="12"/><text x="0" y="4">M</text></g>
    <text class="station-label" x="202" y="279">${escapeHtml(labels.station)}</text>
    <text class="line-label" x="139" y="208">${escapeHtml(labels.harbour)}</text>
    <g class="map-pin" transform="translate(414 180)"><path d="M0-24c-11 0-19 8-19 19 0 15 19 32 19 32S19 10 19-5c0-11-8-19-19-19Z"/><circle cy="-5" r="6"/></g>
    <rect class="map-label-plate" x="354" y="207" width="142" height="25" rx="12"/><text class="campus-label" x="425" y="224">${escapeHtml(labels.campus)}</text>`;

  return `
    <div class="education-map education-map-${item.mapKey}" role="img" aria-label="${escapeHtml(item.mapLabel)}">
      <svg viewBox="0 0 620 420" preserveAspectRatio="xMidYMin meet" aria-hidden="true" focusable="false">
        <defs>
          <filter id="map-shadow-${item.mapKey}" x="-30%" y="-30%" width="160%" height="180%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#004182" flood-opacity=".16"/>
          </filter>
        </defs>
        <rect class="map-base" width="620" height="420"/>
        ${isHongKong ? hongKongMap : changshaMap}
        <g class="map-scale" transform="translate(514 391)"><path d="M0 0h65M0-4v8M65-4v8"/><text x="32" y="-7">${escapeHtml(labels.scale)}</text></g>
        <g class="map-compass" transform="translate(580 34)"><circle r="17"/><path d="M0-12 5 5 0 2-5 5Z"/><text x="0" y="14">N</text></g>
      </svg>
      <div class="education-map-caption"><span>${escapeHtml(item.mapCity)}</span><small>${escapeHtml(item.mapArea)}</small></div>
    </div>`;
}

function renderEducation() {
  document.querySelector("[data-education]").innerHTML = content[locale].education.items.map((item, index) => `
    <article class="education-card reveal" data-delay="${index}">
      ${educationMap(item)}
      <div class="education-content"><div class="education-logo"><img src="${item.logo}" alt="${escapeHtml(item.logoAlt)}" loading="lazy" decoding="async" /></div>
      <div class="education-copy"><div class="education-meta"><span>0${index + 1}</span><span>${escapeHtml(item.place)}</span></div><h3>${escapeHtml(item.school)}</h3><p class="degree">${escapeHtml(item.degree)}</p><p class="education-date">${escapeHtml(item.date)}</p></div></div>
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
