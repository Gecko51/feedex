const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, 'popup', 'popup.js');
let js = fs.readFileSync(jsPath, 'utf8');

// The code before the last modification was:
const oldReactionsCode = `    // Si on n'a rien trouvé avec les sélecteurs stricts, on essaie l'extraction texte globale
    if (!stats.reactions) stats.reactions = extractNumberFromText(['réaction', 'reaction']);
    if (!stats.comments) stats.comments = extractNumberFromText(['commentaire', 'comment']);
    if (!stats.reposts) stats.reposts = extractNumberFromText(['partage', 'repost']);`;

js = js.replace(/\/\/ Si on n'a rien trouvé avec les sélecteurs stricts[\s\S]*?if \(!stats\.reposts\) [^;]+;/, oldReactionsCode);

const oldSsiCode = `    // 5. SSI (Social Selling Index)
    try {
      console.log("[Feedex] Récupération du SSI...");
      const ssiResponse = await fetch('/sales/ssi');
      if (ssiResponse.ok) {
        const text = await ssiResponse.text();
        const match = text.match(/"score":\s*(\d{1,3})/);
        if (match) {
          stats.ssi = match[1];
          console.log("[Feedex] SSI trouvé:", stats.ssi);
        } else {
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, 'text/html');
          const scoreEl = doc.querySelector('.ssi-score__value, .social-selling-index-score');
          if (scoreEl) stats.ssi = scoreEl.textContent.trim();
        }
      }
    } catch (e) {
      console.error("[Feedex] Erreur lors de la récupération du SSI:", e);
    }`;

js = js.replace(/\/\/ 5\. SSI[\s\S]*?console\.error\("\[Feedex\] Erreur réseau lors de la récupération du SSI:", e\);\s*\}/, oldSsiCode);

fs.writeFileSync(jsPath, js);
console.log('Reverted to previous version');
