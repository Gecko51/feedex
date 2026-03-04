const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, 'popup', 'popup.js');
let js = fs.readFileSync(jsPath, 'utf8');

const newRefreshStats = `async function refreshLinkedInStats() {
  const refreshBtn = document.getElementById('refresh-stats');
  const spinIcon = refreshBtn.querySelector('.spin-icon');
  
  try {
    if (spinIcon) spinIcon.classList.add('spinning');
    
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
    
    if (results && results[0]) {
      const stats = results[0].result;
      console.log("Stats récupérées:", stats);
      
      if (stats && stats.error) {
        console.error("Erreur de récupération:", stats.error);
        alert("Impossible de récupérer les statistiques. Erreur: " + stats.error);
        return;
      }
      
      if (stats) {
        // Mise à jour de l'UI
        if (stats.views !== undefined) document.getElementById('stat-views').textContent = stats.views;
        if (stats.followers !== undefined) document.getElementById('stat-followers').textContent = stats.followers;
        if (stats.impressions !== undefined) document.getElementById('stat-impressions').textContent = stats.impressions;
        if (stats.ssi !== undefined) document.getElementById('stat-ssi').textContent = stats.ssi;
        
        if (stats.reactions !== undefined) document.getElementById('stat-reactions').textContent = stats.reactions;
        if (stats.comments !== undefined) document.getElementById('stat-comments').textContent = stats.comments;
        if (stats.reposts !== undefined) document.getElementById('stat-reposts').textContent = stats.reposts;
      } else {
         alert("Aucune donnée retournée par le script d'extraction.");
      }
    } else {
       alert("L'injection du script a échoué. Assurez-vous d'avoir les permissions nécessaires.");
    }
  } catch (error) {
    console.error("Erreur inattendue:", error);
    alert("Erreur lors de la mise à jour : " + error.message);
  } finally {
    if (spinIcon) spinIcon.classList.remove('spinning');
  }
}`;

js = js.replace(/async function refreshLinkedInStats\(\) \{[\s\S]*?\}\s*finally\s*\{\s*spinIcon\.classList\.remove\('spinning'\);\s*\}\s*\}/, newRefreshStats);

fs.writeFileSync(jsPath, js);
console.log('Refresh function patched for debugging');
