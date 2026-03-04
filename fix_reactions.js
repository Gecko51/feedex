const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, 'popup', 'popup.js');
let js = fs.readFileSync(jsPath, 'utf8');

const newEngagementCode = `    // 4. Engagement (sur les posts récents)
    // On cherche les blocs de compteurs sociaux n'importe où sur la page (ils sont dans la section activité)
    const countBlocks = document.querySelectorAll('.social-details-social-counts');
    
    if (countBlocks.length > 0) {
      // On prend le premier bloc de compteurs (le post le plus récent visible)
      const counts = countBlocks[0];
      
      // Réactions
      const reactionEl = counts.querySelector('.social-details-social-counts__reactions-count, button[aria-label*="reaction"], button[aria-label*="j\'aime" i], button[aria-label*="like" i]');
      if (reactionEl) {
        const match = reactionEl.textContent.match(/[\d\s,.]+[kK+M]?/);
        if (match) stats.reactions = match[0].trim();
      }
      
      // Commentaires
      const commentEl = counts.querySelector('button[aria-label*="comment" i]');
      if (commentEl) {
        const match = commentEl.textContent.match(/[\d\s,.]+[kK+M]?/);
        if (match) stats.comments = match[0].trim();
      }
      
      // Partages / Reposts
      const repostEl = counts.querySelector('button[aria-label*="repost" i], button[aria-label*="partag" i], button[aria-label*="share" i]');
      if (repostEl) {
        const match = repostEl.textContent.match(/[\d\s,.]+[kK+M]?/);
        if (match) stats.reposts = match[0].trim();
      }
    }
    
    // Si on n'a rien trouvé avec les compteurs stricts, on essaie des sélecteurs plus larges
    if (!stats.reactions) {
      const rx = document.querySelector('li.social-details-social-counts__item button');
      if (rx) {
        const match = rx.textContent.match(/[\d\s,.]+[kK+M]?/);
        if (match) stats.reactions = match[0].trim();
      }
    }
    
    // Fallback extraction texte globale au cas où
    if (!stats.reactions) stats.reactions = extractNumberFromText(['réaction', 'reaction', 'j\'aime', 'like']);
    if (!stats.comments) stats.comments = extractNumberFromText(['commentaire', 'comment']);
    if (!stats.reposts) stats.reposts = extractNumberFromText(['partage', 'repost', 'share']);
`;

js = js.replace(/\/\/ 4\. Engagement[\s\S]*?if \(\!stats\.reposts\) [^;]+;/, newEngagementCode);

fs.writeFileSync(jsPath, js);
console.log('Engagement code updated');
