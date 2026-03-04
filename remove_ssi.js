const fs = require('fs');
const path = require('path');

// 1. Modifier le HTML
const htmlPath = path.join(__dirname, 'popup', 'popup.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const ssiHtmlRegex = /<div class="stat-card">\s*<span class="stat-label">Indice SSI<\/span>\s*<span class="stat-value"><span id="stat-ssi">-<\/span><span class="stat-suffix">\/100<\/span><\/span>\s*<\/div>/;
html = html.replace(ssiHtmlRegex, '');
fs.writeFileSync(htmlPath, html);

// 2. Modifier le CSS (grid)
const cssPath = path.join(__dirname, 'popup', 'popup.css');
let css = fs.readFileSync(cssPath, 'utf8');
css = css.replace(/grid-template-columns: 1fr 1fr;/, 'grid-template-columns: 1fr 1fr 1fr;');
fs.writeFileSync(cssPath, css);

// 3. Modifier le JS
const jsPath = path.join(__dirname, 'popup', 'popup.js');
let js = fs.readFileSync(jsPath, 'utf8');

// Enlever de l'UI update
js = js.replace(/if \(stats\.ssi !== undefined\) document\.getElementById\('stat-ssi'\)\.textContent = stats\.ssi;\n\s*/g, '');

// Enlever de l'initialisation stats
js = js.replace(/ssi: null,\n\s*/g, '');

// Enlever la récupération du SSI
const ssiCodeRegex = /\/\/ 5\. SSI[\s\S]*?console\.error\("\[Feedex\] Erreur lors de la récupération du SSI:", e\);\s*\}/;
js = js.replace(ssiCodeRegex, '');

fs.writeFileSync(jsPath, js);
console.log('SSI removed from HTML, CSS and JS');
