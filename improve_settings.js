const fs = require('fs');
const path = require('path');

// --- 1. Update HTML ---
const htmlPath = path.join(__dirname, 'popup', 'popup.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const oldSettingsHtml = `<div id="chatbot-settings" class="chatbot-settings hidden">
      <div class="chatbot-settings-header">
        <button id="chatbot-settings-back" class="btn-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 19-7-7 7-7"/>
            <path d="M19 12H5"/>
          </svg>
        </button>
      </div>
      <div class="form-group">
        <label for="api-key">Clé API OpenRouter</label>
        <div class="input-with-button">
          <input type="password" id="api-key" placeholder="sk-...">
          <button id="save-api-key" class="btn-small btn-primary">Enregistrer</button>
        </div>
      </div>
      <div class="form-group">
        <label for="model-select">Modèle</label>
        <div class="input-with-button">
          <select id="model-select">
            <option value="">Sélectionnez un modèle</option>
          </select>
          <button id="fetch-models" class="btn-small btn-secondary">↻</button>
        </div>
      </div>
      <div class="form-group">
        <label>Custom Instructions</label>
        <div class="custom-instruction-input">
          <input type="text" id="instruction-name" placeholder="Nom de l'instruction">
          <textarea id="instruction-content" rows="5" placeholder="Instruction..."></textarea>
          <button id="save-instruction" class="btn-small btn-primary">Ajouter</button>
        </div>
      </div>
      <div class="form-group">
        <label>Instructions enregistrées</label>
        <div id="instructions-list" class="instructions-list"></div>
      </div>
      <div id="confirm-instruction-modal" class="settings-modal hidden">`;

const newSettingsHtml = `<div id="chatbot-settings" class="chatbot-settings hidden">
      <div class="chatbot-settings-header">
        <button id="chatbot-settings-back" class="btn-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 19-7-7 7-7"/>
            <path d="M19 12H5"/>
          </svg>
        </button>
        <h3 class="settings-title">Paramètres IA</h3>
      </div>

      <div class="settings-section">
        <h4 class="section-title">Configuration API</h4>
        <div class="form-group">
          <label for="api-key">Clé API OpenRouter</label>
          <div class="input-with-button">
            <input type="password" id="api-key" placeholder="sk-...">
            <button id="save-api-key" class="btn-small btn-primary">Enregistrer</button>
          </div>
          <p class="setting-help">Nécessaire pour communiquer avec les modèles d'IA.</p>
        </div>
        <div class="form-group" style="margin-top: 8px;">
          <label for="model-select">Modèle d'IA par défaut</label>
          <div class="input-with-button">
            <select id="model-select">
              <option value="">Sélectionnez un modèle</option>
            </select>
            <button id="fetch-models" class="btn-small btn-secondary" title="Actualiser les modèles">↻</button>
          </div>
        </div>
      </div>

      <div class="divider" style="margin: 16px 0;"></div>

      <div class="settings-section">
        <h4 class="section-title">Instructions Personnalisées</h4>
        <p class="setting-help" style="margin-bottom: 12px;">Créez des "prompts" de base (ex: Résumer, Traduire, Analyser) pour guider le comportement de l'IA.</p>
        
        <div class="custom-instruction-box">
          <div class="custom-instruction-input">
            <input type="text" id="instruction-name" placeholder="Nom du raccourci (ex: Résumer)">
            <textarea id="instruction-content" rows="3" placeholder="Comporte-toi comme un expert et résume..."></textarea>
            <button id="save-instruction" class="btn-small btn-primary">Ajouter l'instruction</button>
          </div>
        </div>
        
        <div class="form-group" style="margin-top: 20px;">
          <label>Vos instructions sauvegardées</label>
          <div id="instructions-list" class="instructions-list"></div>
        </div>
      </div>

      <div id="confirm-instruction-modal" class="settings-modal hidden">`;

// Using regex for replacement to be safe with line endings
html = html.replace(/<div id="chatbot-settings" class="chatbot-settings hidden">[\s\S]*?<div id="confirm-instruction-modal" class="settings-modal hidden">/, newSettingsHtml);
fs.writeFileSync(htmlPath, html);

// --- 2. Update CSS ---
const cssPath = path.join(__dirname, 'popup', 'popup.css');
let css = fs.readFileSync(cssPath, 'utf8');

const cssToAdd = `
.settings-title {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  color: var(--text-primary);
  margin-left: 8px;
  flex: 1;
}

.settings-section {
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 12px;
  color: var(--text-primary);
  margin-bottom: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title::before {
  content: '';
  display: block;
  width: 4px;
  height: 12px;
  background-color: var(--accent);
  border-radius: 2px;
}

.setting-help {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 4px;
  line-height: 1.4;
}

.custom-instruction-box {
  background-color: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 12px;
}
`;

if (!css.includes('.settings-title')) {
  css += cssToAdd;
  fs.writeFileSync(cssPath, css);
}

console.log('Settings UI improved');
