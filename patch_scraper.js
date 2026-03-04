const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, 'popup', 'popup.js');
let js = fs.readFileSync(jsPath, 'utf8');

const newScraper = `async function scrapeLinkedInStats() {
  console.log("[Feedex] Début de l'extraction des statistiques...");
  try {
    const stats = {
      views: null,
      followers: null,
      impressions: null,
      ssi: null,
      reactions: null,
      comments: null,
      reposts: null
    };

    // Helper plus robuste pour trouver les éléments
    const extractNumberFromText = (textArr) => {
      const elements = document.querySelectorAll('span, h2, h3, a, div, li, strong, button');
      for (const el of elements) {
        // Ignorer les éléments cachés ou avec trop de texte
        if (el.textContent.length > 100 || el.offsetParent === null) continue;
        
        const text = el.textContent.toLowerCase().replace(/\s+/g, ' ').trim();
        for (const t of textArr) {
          if (text.includes(t.toLowerCase())) {
            // Cherche un nombre (ex: "1 234", "1,234", "12.5k", "500+")
            const match = text.match(/[\d\s,.]+[kK+M]?/);
            if (match && match[0].trim().length > 0) {
              console.log("[Feedex] Trouvé pour", t, ":", match[0].trim(), "dans", text);
              return match[0].trim();
            }
          }
        }
      }
      return null;
    };

    // 1. Abonnés / Followers
    stats.followers = extractNumberFromText(['abonné', 'follower', 'abonnés', 'followers']);

    // 2. Vues du profil
    stats.views = extractNumberFromText(['vues du profil', 'profile view', 'vues de votre profil']);

    // 3. Impressions
    stats.impressions = extractNumberFromText(['impression', 'post impression']);

    // 4. Engagement (sur les posts récents)
    // Cherche spécifiquement dans la section activité
    const activitySection = document.querySelector('.pv-recent-activity-detail__core-rail, .core-rail');
    if (activitySection) {
      const reactions = activitySection.querySelectorAll('.social-details-social-counts__reactions-count, .social-details-social-counts__count-value');
      if (reactions.length > 0) {
        const match = reactions[0].textContent.match(/[\d\s,.]+[kK+M]?/);
        if (match) stats.reactions = match[0].trim();
      }
      
      const comments = activitySection.querySelectorAll('button[aria-label*="comment"], button[aria-label*="Comment"]');
      if (comments.length > 0) {
        const match = comments[0].textContent.match(/[\d\s,.]+[kK+M]?/);
        if (match) stats.comments = match[0].trim();
      }
      
      const reposts = activitySection.querySelectorAll('button[aria-label*="repost"], button[aria-label*="partag"]');
      if (reposts.length > 0) {
        const match = reposts[0].textContent.match(/[\d\s,.]+[kK+M]?/);
        if (match) stats.reposts = match[0].trim();
      }
    }
    
    // Si on n'a rien trouvé avec les sélecteurs stricts, on essaie l'extraction texte globale
    if (!stats.reactions) stats.reactions = extractNumberFromText(['réaction', 'reaction']);
    if (!stats.comments) stats.comments = extractNumberFromText(['commentaire', 'comment']);
    if (!stats.reposts) stats.reposts = extractNumberFromText(['partage', 'repost']);

    // 5. SSI (Social Selling Index)
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
    }

    console.log("[Feedex] Statistiques finales:", stats);

    // Formater et remplacer null par "-"
    for (const key in stats) {
      if (!stats[key]) stats[key] = '-';
      else {
        // Nettoyage esthétique rapide
        stats[key] = stats[key].toString().replace(/^0+/, '');
        if (stats[key] === '') stats[key] = '0';
      }
    }

    return stats;
  } catch (error) {
    console.error("[Feedex] Erreur fatale dans le scraper:", error);
    return { error: error.message };
  }
}`;

js = js.replace(/async function scrapeLinkedInStats\(\) \{[\s\S]*?\}\s*\}\s*catch\s*\(error\)\s*\{\s*return\s*\{\s*error:\s*error\.message\s*\}\s*;\s*\}\s*\}/, newScraper);

fs.writeFileSync(jsPath, js);
console.log('Scraper patched');
