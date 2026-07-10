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

// Rendu HTML par type de catégorie. Le CSS n'est pas encore défini : ce sont
// des classes neutres à styler plus tard, la structure/logique est le sujet ici.
function renderCategory(cat) {
  if (cat.type === 'simple') {
    const items = cat.items.map((item) => `
      <li class="menu-item">
        <div class="menu-item__row">
          <span class="menu-item__name">${item.name}</span>
          <span class="menu-item__price">${item.price.toFixed(2)} €</span>
        </div>
        ${item.description ? `<p class="menu-item__desc">${item.description}</p>` : ''}
        ${item.origin ? `<p class="menu-item__origin">Origine : ${item.origin}</p>` : ''}
      </li>`).join('');
    return `<ul class="menu-category__list">${items}</ul>`;
  }

  if (cat.type === 'tiered') {
    const head = cat.formats.map((f) => `<th>${f}</th>`).join('');
    const rows = cat.items.map((item) => {
      const cells = cat.formats
        .map((f) => `<td>${item.prices[f] !== undefined ? item.prices[f].toFixed(2) + ' €' : ''}</td>`)
        .join('');
      return `<tr><td class="menu-tiered__name">${item.name}</td>${cells}</tr>`;
    }).join('');
    return `
      <table class="menu-tiered">
        <thead><tr><th></th>${head}</tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  if (cat.type === 'formula') {
    const components = cat.components.map((c) => `<li>${c}</li>`).join('');
    return `
      <div class="menu-formula">
        <p class="menu-formula__price">${cat.price.toFixed(2)} €</p>
        <p class="menu-formula__subtitle">${cat.subtitle}</p>
        <ul class="menu-formula__components">${components}</ul>
        ${cat.supplement ? `<p class="menu-formula__supplement">${cat.supplement}</p>` : ''}
      </div>`;
  }

  if (cat.type === 'note') {
    return `<p class="menu-note">${cat.text}</p>`;
  }

  return '';
}

function buildMenuHtml() {
  const menu = loadMenu();
  if (!menu) return '<p>Menu à venir.</p>';

  const sections = menu.categories.map((cat) => `
    <section class="menu-category menu-category--${cat.type}" id="menu-${cat.id}">
      <h2 class="menu-category__title">${cat.title}</h2>
      ${renderCategory(cat)}
    </section>`).join('\n');

  const disclaimers = menu.disclaimers ? `
    <footer class="menu-disclaimers">
      <p>${menu.disclaimers.prices}</p>
      <p>${menu.disclaimers.alcohol}</p>
    </footer>` : '';

  return `${sections}\n${disclaimers}`;
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

  return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
}

function build() {
  const header = read('partials/header.html');
  const footer = read('partials/footer.html');
  const menuItemsHtml = buildMenuHtml();
  const menuSchemaHtml = buildMenuSchema();

  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  const pagesDir = path.join(SRC, 'pages');
  const pages = fs.readdirSync(pagesDir).filter((f) => f.endsWith('.html'));

  for (const page of pages) {
    let html = fs.readFileSync(path.join(pagesDir, page), 'utf-8');
    html = html
      .replace('{{HEADER}}', header)
      .replace('{{FOOTER}}', footer)
      .replace('{{MENU_ITEMS}}', menuItemsHtml)
      .replace('{{MENU_SCHEMA}}', menuSchemaHtml);
    fs.writeFileSync(path.join(DIST, page), html);
    console.log(`  ✓ ${page}`);
  }

  copyDir(path.join(SRC, 'css'), path.join(DIST, 'css'));
  copyDir(path.join(SRC, 'js'), path.join(DIST, 'js'));
  copyDir(path.join(SRC, 'images'), path.join(DIST, 'images'));

  console.log(`\nBuild terminé -> ${DIST}`);
}

build();
