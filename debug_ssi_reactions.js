const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, 'popup', 'popup.js');
let js = fs.readFileSync(jsPath, 'utf8');

const ssiCode = `    // 5. SSI (Social Selling Index)
    try {
      console.log("[Feedex] Récupération du SSI...");
      const ssiResponse = await fetch('https://www.linkedin.com/sales/ssi', {
        headers: {
          'Accept': 'text/html',
          'Cache-Control': 'no-cache'
        }
      });
      if (ssiResponse.ok) {
        const text = await ssiResponse.text();
        // Plus permissif sur le SSI score
        const match = text.match(/"score":\s*([\d.]+)/) || text.match(/ssi-score__value[^>]*>([\d.]+)</) || text.match(/social-selling-index-score[^>]*>([\d.]+)</);
        
        if (match && match[1]) {
          stats.ssi = Math.round(parseFloat(match[1])).toString();
          console.log("[Feedex] SSI trouvé:", stats.ssi);
        } else {
          console.log("[Feedex] Pas de match SSI trouvé dans le texte de la réponse");
          
          // Essai 2: Parse DOM
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, 'text/html');
          const scoreEl = doc.querySelector('.ssi-score__value, .social-selling-index-score, [data-test-ssi-score], h3.text-heading-large');
          if (scoreEl) {
             const m = scoreEl.textContent.match(/[\d]+/);
             if (m) stats.ssi = m[0];
          }
        }
      } else {
        console.error("[Feedex] Reponse SSI non ok:", ssiResponse.status);
      }
    } catch (e) {
      console.error("[Feedex] Erreur réseau lors de la récupération du SSI:", e);
    }`;

// Remplacement du bloc SSI (de try à la parenthèse fermante du catch)
js = js.replace(/\/\/ 5\. SSI[\s\S]*?console\.error\("\[Feedex\] Erreur lors de la récupération du SSI:", e\);\s*\}/, ssiCode);

// Correction pour les réactions (parfois sur le nom des boutons "J'aime" ou "Like" au lieu du texte visible)
const reactionsCode = `    // Si on n'a rien trouvé avec les sélecteurs stricts, on essaie l'extraction texte globale
    if (!stats.reactions) stats.reactions = extractNumberFromText(['réaction', 'reaction', 'j\'aime', 'like', 'reactions-count']);
    if (!stats.comments) stats.comments = extractNumberFromText(['commentaire', 'comment']);
    if (!stats.reposts) stats.reposts = extractNumberFromText(['partage', 'repost', 'share']);`;

js = js.replace(/\/\/ Si on n'a rien trouvé avec les sélecteurs stricts[\s\S]*?if \(\!stats\.reposts\)[^;]+;/, reactionsCode);

fs.writeFileSync(jsPath, js);
console.log('Scraper patched for SSI and reactions');
