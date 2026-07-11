// build.js — génère le site statique final dans /dist
// Usage : node build.js
//
// Ce script ne fait tourner AUCUN serveur : il lit les fichiers sources,
// remplace les placeholders {{HEADER}}, {{FOOTER}}, {{MENU_ITEMS}} par du
// HTML en dur, et écrit le résultat dans dist/. Le site livré/déployé est
// donc toujours du HTML statique pur, sans dépendance JS pour s'afficher.

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');
const DIST = path.join(__dirname, 'dist');

function read(relPath) {
  return fs.readFileSync(path.join(SRC, relPath), 'utf-8');
}

function copyDir(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function loadMenu() {
  const menuPath = path.join(SRC, 'data', 'menu.json');
  if (!fs.existsSync(menuPath)) return null;
  return JSON.parse(fs.readFileSync(menuPath, 'utf-8'));
}

// menu.json est édité à la main à chaque mise à jour de carte : un « & » ou
// un « < » dans un nom de plat ne doit jamais casser le HTML généré.
function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Rendu HTML par type de catégorie. Le CSS n'est pas encore défini : ce sont
// des classes neutres à styler plus tard, la structure/logique est le sujet ici.
function renderCategory(cat) {
  if (cat.type === 'simple') {
    const items = cat.items.map((item) => `
      <li class="menu-item">
        <div class="menu-item__row">
          <span class="menu-item__name">${esc(item.name)}</span>
          <span class="menu-item__dots" aria-hidden="true"></span>
          <span class="menu-item__price">${item.price.toFixed(2)} €</span>
        </div>
        ${item.description ? `<p class="menu-item__desc">${esc(item.description)}</p>` : ''}
        ${item.origin ? `<p class="menu-item__origin">Origine : ${esc(item.origin)}</p>` : ''}
      </li>`).join('');
    return `<ul class="menu-category__list">${items}</ul>`;
  }

  if (cat.type === 'tiered') {
    const head = cat.formats.map((f) => `<th scope="col">${esc(f)}</th>`).join('');
    const rows = cat.items.map((item) => {
      const cells = cat.formats
        .map((f) => `<td>${item.prices[f] !== undefined ? item.prices[f].toFixed(2) + ' €' : ''}</td>`)
        .join('');
      return `<tr><td class="menu-tiered__name">${esc(item.name)}</td>${cells}</tr>`;
    }).join('');
    return `
      <table class="menu-tiered">
        <thead><tr><th></th>${head}</tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  if (cat.type === 'formula') {
    const components = cat.components.map((c) => `<li>${esc(c)}</li>`).join('');
    return `
      <div class="menu-formula">
        <p class="menu-formula__price">${cat.price.toFixed(2)} €</p>
        <p class="menu-formula__subtitle">${esc(cat.subtitle)}</p>
        <ul class="menu-formula__components">${components}</ul>
        ${cat.supplement ? `<p class="menu-formula__supplement">${esc(cat.supplement)}</p>` : ''}
      </div>`;
  }

  if (cat.type === 'note') {
    return `<p class="menu-note">${esc(cat.text)}</p>`;
  }

  return '';
}

function buildMenuHtml() {
  const menu = loadMenu();
  if (!menu) return '<p>Menu à venir.</p>';

  const sections = menu.categories.map((cat) => `
    <section class="menu-category menu-category--${cat.type}" id="menu-${esc(cat.id)}">
      <h2 class="menu-category__title">${esc(cat.title)}</h2>
      ${renderCategory(cat)}
    </section>`).join('\n');

  const disclaimers = menu.disclaimers ? `
    <footer class="menu-disclaimers">
      <p>${esc(menu.disclaimers.prices)}</p>
      <p>${esc(menu.disclaimers.alcohol)}</p>
    </footer>` : '';

  return `${sections}\n${disclaimers}`;
}

// Sommaire ancré en haut de la page menu : la carte est longue, ces liens
// permettent de sauter directement à une catégorie.
function buildMenuToc() {
  const menu = loadMenu();
  if (!menu) return '';

  const links = menu.categories
    .map((cat) => `<li><a href="#menu-${esc(cat.id)}">${esc(cat.title)}</a></li>`)
    .join('\n      ');

  return `
    <nav class="menu-toc" aria-label="Catégories de la carte">
      <ul>
      ${links}
      </ul>
    </nav>`;
}

// Le JSON-LD schema.org ne modélise que les catégories "simple" (plats à prix
// unique) : les formats multiples (vins/bières) et les blocs formule/note
// n'ont pas d'équivalent fiable dans le vocabulaire Menu de schema.org, donc
// on les omet plutôt que de forcer une correspondance approximative.
function buildMenuSchema() {
  const menu = loadMenu();
  if (!menu) return '';

  const simpleCats = menu.categories.filter((c) => c.type === 'simple' && c.items.length > 0);
  if (simpleCats.length === 0) return '';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    hasMenuSection: simpleCats.map((cat) => ({
      '@type': 'MenuSection',
      name: cat.title,
      hasMenuItem: cat.items.map((item) => ({
        '@type': 'MenuItem',
        name: item.name,
        description: item.description || undefined,
        offers: {
          '@type': 'Offer',
          price: item.price,
          priceCurrency: 'EUR',
        },
      })),
    })),
  };

  // « < » plutôt que « < » : un texte contenant </script> ne peut pas
  // fermer prématurément le bloc JSON-LD.
  const json = JSON.stringify(schema, null, 2).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}

function build() {
  const replacements = {
    '{{HEADER}}': read('partials/header.html'),
    '{{FOOTER}}': read('partials/footer.html'),
    '{{MENU_TOC}}': buildMenuToc(),
    '{{MENU_ITEMS}}': buildMenuHtml(),
    '{{MENU_SCHEMA}}': buildMenuSchema(),
  };

  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  const pagesDir = path.join(SRC, 'pages');
  const pages = fs.readdirSync(pagesDir).filter((f) => f.endsWith('.html'));

  for (const page of pages) {
    let html = fs.readFileSync(path.join(pagesDir, page), 'utf-8');
    for (const [placeholder, value] of Object.entries(replacements)) {
      // Remplacement via fonction : un « $ » dans le HTML injecté ne doit pas
      // être interprété comme motif spécial de String.replace.
      html = html.replace(placeholder, () => value);
    }
    fs.writeFileSync(path.join(DIST, page), html);
    console.log(`  ✓ ${page}`);
  }

  for (const dir of ['css', 'js', 'images', 'fonts', 'scripts']) {
    const srcDir = path.join(SRC, dir);
    if (fs.existsSync(srcDir)) copyDir(srcDir, path.join(DIST, dir));
  }

  console.log(`\nBuild terminé -> ${DIST}`);
}

build();
