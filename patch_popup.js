const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, 'popup', 'popup.js');
let js = fs.readFileSync(jsPath, 'utf8');

if (!js.includes('setupStatsHandlers')) {
  // Insert setupStatsHandlers call in init()
  js = js.replace(/function init\(\) {/, `function init() {
  setupStatsHandlers();`);
  
  // Add the new functions at the end of the file
  const codeToAdd = `

/**
 * Configure les gestionnaires pour les statistiques LinkedIn
 */
function setupStatsHandlers() {
  const refreshBtn = document.getElementById('refresh-stats');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', refreshLinkedInStats);
  }
}

/**
 * Met à jour les statistiques depuis la page LinkedIn active
 */
async function refreshLinkedInStats() {
  const refreshBtn = document.getElementById('refresh-stats');
  const spinIcon = refreshBtn.querySelector('.spin-icon');
  
  try {
    spinIcon.classList.add('spinning');
    
    // Vérifie si on est sur LinkedIn
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url.includes('linkedin.com')) {
      alert("Veuillez vous rendre sur votre page de profil LinkedIn pour mettre à jour les statistiques.");
      return;
    }
    
    // Injecte le script pour scrapper les données
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: scrapeLinkedInStats
    });
    
    if (results && results[0] && results[0].result) {
      const stats = results[0].result;
      
      if (stats.error) {
        console.error("Erreur de récupération:", stats.error);
        alert("Impossible de récupérer les statistiques. Assurez-vous d'être sur votre profil LinkedIn.");
        return;
      }
      
      // Mise à jour de l'UI
      if (stats.views) document.getElementById('stat-views').textContent = stats.views;
      if (stats.followers) document.getElementById('stat-followers').textContent = stats.followers;
      if (stats.impressions) document.getElementById('stat-impressions').textContent = stats.impressions;
      if (stats.ssi) document.getElementById('stat-ssi').textContent = stats.ssi;
      
      if (stats.reactions) document.getElementById('stat-reactions').textContent = stats.reactions;
      if (stats.comments) document.getElementById('stat-comments').textContent = stats.comments;
      if (stats.reposts) document.getElementById('stat-reposts').textContent = stats.reposts;
    }
  } catch (error) {
    console.error("Erreur inattendue:", error);
    alert("Une erreur est survenue lors de la mise à jour des statistiques.");
  } finally {
    spinIcon.classList.remove('spinning');
  }
}

/**
 * Fonction injectée dans la page LinkedIn pour récupérer les statistiques.
 * Le DOM de LinkedIn étant complexe et changeant, cette fonction tente
 * de trouver les valeurs par mots-clés de façon "best effort".
 */
async function scrapeLinkedInStats() {
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

    // Helper: cherche un élément par son texte (case insensitive)
    const findByText = (selector, textArr) => {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        const text = el.textContent.toLowerCase();
        for (const t of textArr) {
          if (text.includes(t.toLowerCase())) return el;
        }
      }
      return null;
    };

    // 1. Abonnés / Followers
    const followerEl = findByText('li.text-body-small, span.text-body-small, .pv-top-card--list-bullet > li', ['abonné', 'follower']);
    if (followerEl) {
      const match = followerEl.textContent.match(/[\d\s,.]+/);
      if (match) stats.followers = match[0].trim();
    }

    // 2. Vues & Impressions (Analytics module)
    // On cherche les blocs analytiques
    const analyticsVueEl = findByText('.pvs-entity, .pvs-analytics-dashboard, a[href*="/analytics/"]', ['vues du profil', 'profile views']);
    if (analyticsVueEl) {
      const strong = analyticsVueEl.querySelector('strong, span[aria-hidden="true"], .text-heading-large');
      if (strong) stats.views = strong.textContent.match(/[\d\s,.]+/)?.[0].trim();
    }

    const analyticsImpEl = findByText('.pvs-entity, .pvs-analytics-dashboard, a[href*="/analytics/"]', ['impressions']);
    if (analyticsImpEl) {
      const strong = analyticsImpEl.querySelector('strong, span[aria-hidden="true"], .text-heading-large');
      if (strong) stats.impressions = strong.textContent.match(/[\d\s,.]+/)?.[0].trim();
    }

    // 3. Activité (Engagement estimé sur la page actuelle)
    // C'est basique, on prend le premier post visible sur la page ou la section activité
    const socialCounts = document.querySelectorAll('.social-details-social-counts__count-value, .social-details-social-counts__reactions-count');
    if (socialCounts.length > 0) {
      stats.reactions = socialCounts[0].textContent.match(/[\d\s,.]+/)?.[0].trim();
    }
    
    const commentsCounts = findByText('button[aria-label*="comment"]', ['comment']);
    if (commentsCounts) {
       stats.comments = commentsCounts.textContent.match(/[\d\s,.]+/)?.[0].trim() || '0';
    }
    
    const repostsCounts = findByText('button[aria-label*="repost"]', ['repost', 'partage']);
    if (repostsCounts) {
       stats.reposts = repostsCounts.textContent.match(/[\d\s,.]+/)?.[0].trim() || '0';
    }

    // 4. Récupération SSI (Appel fetch background interne)
    try {
      const ssiResponse = await fetch('/sales/ssi');
      if (ssiResponse.ok) {
        const text = await ssiResponse.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const scoreEl = doc.querySelector('.ssi-score__value, .social-selling-index-score');
        if (scoreEl) {
          stats.ssi = scoreEl.textContent.trim();
        } else {
          // regex fallback
          const match = text.match(/"score":(\d{1,3})/);
          if (match) stats.ssi = match[1];
        }
      }
    } catch (e) { console.error('Erreur SSI:', e); }

    // Remplacement des valeurs manquantes par "-"
    for (const key in stats) {
      if (!stats[key]) stats[key] = '-';
    }

    return stats;
  } catch (error) {
    return { error: error.message };
  }
}
`;
  
  fs.writeFileSync(jsPath, js + codeToAdd);
  console.log('JS updated');
}
