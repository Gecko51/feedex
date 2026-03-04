/**
 * Feedex - Extension Chrome de gestion de listes de contacts LinkedIn
 * Logique métier principale
 */

const STORAGE_KEY = 'feedex_lists';
const CHAT_STORAGE_KEY = 'feedex_chat_settings';
let pendingDeleteId = null;
let pendingDeleteInstructionId = null;
let pendingEditInstruction = null;
let chatMessages = [];
let customInstructions = [];
let activeInstructionId = null;

/**
 * Initialise l'application au chargement du DOM
 */
document.addEventListener('DOMContentLoaded', init);

function init() {
  setupStatsHandlers();
  loadLists();
  setupFormHandler();
  setupModalHandlers();
  setupChatbotHandlers();
  loadChatSettings();
}

/**
 * Configure les gestionnaires du modal de confirmation
 */
function setupModalHandlers() {
  const modal = document.getElementById('confirm-modal');
  const cancelBtn = document.getElementById('confirm-cancel');
  const deleteBtn = document.getElementById('confirm-delete');

  cancelBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    pendingDeleteId = null;
  });

  deleteBtn.addEventListener('click', async () => {
    if (pendingDeleteId) {
      await deleteListConfirmed(pendingDeleteId);
    }
    modal.classList.add('hidden');
    pendingDeleteId = null;
  });
}

/**
 * Affiche le modal de confirmation de suppression
 * @param {string} id - ID de la liste à supprimer
 */
function showDeleteConfirm(id) {
  const modal = document.getElementById('confirm-modal');
  pendingDeleteId = id;
  modal.classList.remove('hidden');
}

/**
 * Configure le gestionnaire d'événements du formulaire de création
 */
function setupFormHandler() {
  const form = document.getElementById('list-form');
  form.addEventListener('submit', handleFormSubmit);
}

/**
 * Gère la soumission du formulaire de création de liste
 * @param {Event} event - Événement de soumission du formulaire
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  const nameInput = document.getElementById('list-name');
  const urlInput = document.getElementById('list-url');

  const name = nameInput.value.trim();
  const url = urlInput.value.trim();

  if (!name || !url) {
    return;
  }

  const newList = {
    id: generateId(),
    name: name,
    url: url,
    createdAt: Date.now()
  };

  const lists = await getLists();
  lists.push(newList);
  await saveLists(lists);

  nameInput.value = '';
  urlInput.value = '';

  renderLists(lists);
}

/**
 * Charge les listes depuis le stockage Chrome
 * @returns {Promise<Array>} Liste des listes sauvegardées
 */
async function getLists() {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      const lists = result[STORAGE_KEY] || [];
      resolve(lists);
    });
  });
}

/**
 * Sauvegarde les listes dans le stockage Chrome
 * @param {Array} lists - Tableau des listes à sauvegarder
 */
async function saveLists(lists) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: lists }, resolve);
  });
}

/**
 * Charge et affiche les listes
 */
async function loadLists() {
  const lists = await getLists();
  renderLists(lists);
}

/**
 * Affiche les listes dans le conteneur
 * @param {Array} lists - Tableau des listes à afficher
 */
function renderLists(lists) {
  const container = document.getElementById('lists-container');

  if (!lists || lists.length === 0) {
    container.innerHTML = '<p class="empty-state">Aucune liste créée. Ajoutez votre première liste ci-dessus.</p>';
    return;
  }

  container.innerHTML = '';

  lists.forEach((list) => {
    const listElement = createListElement(list);
    container.appendChild(listElement);
  });
}

/**
 * Crée un élément DOM pour une liste
 * @param {Object} list - Objet représentant une liste
 * @returns {HTMLElement} Élément DOM de la liste
 */
function createListElement(list) {
  const listItem = document.createElement('div');
  listItem.className = 'list-item';
  listItem.dataset.id = list.id;

  listItem.innerHTML = `
    <button class="list-item-btn" data-url="${escapeHtml(list.url)}" title="${escapeHtml(list.url)}">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
        <rect x="2" y="9" width="4" height="12"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
      <span>${escapeHtml(list.name)}</span>
    </button>
    <div class="list-item-actions">
      <button class="btn-icon edit" title="Modifier" data-id="${list.id}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
          <path d="m15 5 4 4"/>
        </svg>
      </button>
      <button class="btn-icon delete" title="Supprimer" data-id="${list.id}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18"/>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
          <line x1="10" x2="10" y1="11" y2="17"/>
          <line x1="14" x2="14" y1="11" y2="17"/>
        </svg>
      </button>
    </div>
  `;

  // Événement: clic sur le bouton principal pour ouvrir le lien
  const btn = listItem.querySelector('.list-item-btn');
  btn.addEventListener('click', () => {
    chrome.tabs.create({ url: list.url, active: true });
  });

  // Événement: clic sur le bouton de modification
  const editBtn = listItem.querySelector('.btn-icon.edit');
  editBtn.addEventListener('click', () => {
    enableEditMode(listItem, list);
  });

  // Événement: clic sur le bouton de suppression
  const deleteBtn = listItem.querySelector('.btn-icon.delete');
  deleteBtn.addEventListener('click', async () => {
    await deleteList(list.id);
  });

  return listItem;
}

/**
 * Active le mode édition pour une liste
 * @param {HTMLElement} listItem - Élément DOM de la liste
 * @param {Object} list - Objet représentant la liste
 */
function enableEditMode(listItem, list) {
  const currentHtml = listItem.innerHTML;

  listItem.innerHTML = `
    <div class="edit-mode">
      <input type="text" id="edit-name-${list.id}" value="${escapeHtml(list.name)}" placeholder="Nom de la liste">
      <input type="url" id="edit-url-${list.id}" value="${escapeHtml(list.url)}" placeholder="URL LinkedIn">
      <div class="edit-mode-actions">
        <button class="btn-small btn-cancel" data-id="${list.id}">Annuler</button>
        <button class="btn-small btn-save" data-id="${list.id}">Enregistrer</button>
      </div>
    </div>
  `;

  const cancelBtn = listItem.querySelector('.btn-cancel');
  cancelBtn.addEventListener('click', () => {
    listItem.innerHTML = currentHtml;
    reattachListEvents(listItem, list);
  });

  const saveBtn = listItem.querySelector('.btn-save');
  saveBtn.addEventListener('click', async () => {
    const nameInput = document.getElementById(`edit-name-${list.id}`);
    const urlInput = document.getElementById(`edit-url-${list.id}`);

    const newName = nameInput.value.trim();
    const newUrl = urlInput.value.trim();

    if (!newName || !newUrl) {
      return;
    }

    await updateList(list.id, { name: newName, url: newUrl });
  });
}

/**
 * Réattache les événements après l'annulation de l'édition
 * @param {HTMLElement} listItem - Élément DOM de la liste
 * @param {Object} list - Objet représentant la liste
 */
function reattachListEvents(listItem, list) {
  const btn = listItem.querySelector('.list-item-btn');
  btn.addEventListener('click', () => {
    chrome.tabs.create({ url: list.url, active: true });
  });

  const editBtn = listItem.querySelector('.btn-icon.edit');
  editBtn.addEventListener('click', () => {
    enableEditMode(listItem, list);
  });

  const deleteBtn = listItem.querySelector('.btn-icon.delete');
  deleteBtn.addEventListener('click', async () => {
    await deleteList(list.id);
  });
}

/**
 * Met à jour une liste existante
 * @param {string} id - ID de la liste à mettre à jour
 * @param {Object} updates - Nouvelles valeurs (name, url)
 */
async function updateList(id, updates) {
  const lists = await getLists();
  const index = lists.findIndex((list) => list.id === id);

  if (index !== -1) {
    lists[index] = { ...lists[index], ...updates };
    await saveLists(lists);
    renderLists(lists);
  }
}

/**
 * Affiche le modal de confirmation pour supprimer une liste
 * @param {string} id - ID de la liste à supprimer
 */
async function deleteList(id) {
  showDeleteConfirm(id);
}

/**
 * Confirme la suppression d'une liste
 * @param {string} id - ID de la liste à supprimer
 */
async function deleteListConfirmed(id) {
  const lists = await getLists();
  const filteredLists = lists.filter((list) => list.id !== id);
  await saveLists(filteredLists);
  renderLists(filteredLists);
}

/**
 * Génère un ID unique
 * @returns {string} ID unique basé sur timestamp + random
 */
function generateId() {
  return `list_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Échappe les caractères HTML pour éviter les XSS
 * @param {string} str - Chaîne à échapper
 * @returns {string} Chaîne échappée
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Configure les gestionnaires du chatbot
 */
function setupChatbotHandlers() {
  const toggleBtn = document.getElementById('chatbot-toggle');
  const closeBtn = document.getElementById('chatbot-close');
  const settingsToggleBtn = document.getElementById('chatbot-settings-toggle');
  const settingsBackBtn = document.getElementById('chatbot-settings-back');
  const newChatBtn = document.getElementById('chatbot-new-chat');
  const panel = document.getElementById('chatbot-panel');
  const settingsPanel = document.getElementById('chatbot-settings');
  const sendBtn = document.getElementById('chatbot-send');
  const input = document.getElementById('chatbot-input');
  const saveApiKeyBtn = document.getElementById('save-api-key');
  const saveInstructionBtn = document.getElementById('save-instruction');

  toggleBtn.addEventListener('click', () => {
    panel.classList.remove('hidden');
  });

  closeBtn.addEventListener('click', () => {
    panel.classList.add('hidden');
  });

  newChatBtn.addEventListener('click', startNewChat);

  settingsToggleBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('hidden');
  });

  settingsBackBtn.addEventListener('click', () => {
    settingsPanel.classList.add('hidden');
  });

  sendBtn.addEventListener('click', sendMessage);

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

saveApiKeyBtn.addEventListener('click', saveApiKey);
  saveInstructionBtn.addEventListener('click', saveInstruction);

  document.getElementById('fetch-models').addEventListener('click', fetchOpenRouterModels);
  document.getElementById('model-select').addEventListener('change', saveModelSelection);

  document.getElementById('confirm-instruction-cancel').addEventListener('click', () => {
    document.getElementById('confirm-instruction-modal').classList.add('hidden');
    pendingDeleteInstructionId = null;
  });

  document.getElementById('confirm-instruction-delete').addEventListener('click', async () => {
    if (pendingDeleteInstructionId) {
      await deleteInstruction(pendingDeleteInstructionId);
    }
    document.getElementById('confirm-instruction-modal').classList.add('hidden');
    pendingDeleteInstructionId = null;
  });

  document.getElementById('instruction-select').addEventListener('change', handleInstructionSelectChange);
}

/**
 * Sauvegarde la sélection du modèle
 */
async function saveModelSelection() {
  const model = document.getElementById('model-select').value;
  const currentSettings = await getChatSettings();
  
  const settings = {
    ...currentSettings,
    model,
    messages: chatMessages,
    customInstructions,
    activeInstructionId
  };

  chrome.storage.local.set({ [CHAT_STORAGE_KEY]: settings });
}

/**
 * Récupère la liste des modèles depuis OpenRouter
 */
async function fetchOpenRouterModels(showAlert = true) {
  const apiKey = document.getElementById('api-key').value.trim();
  
  if (!apiKey) {
    if (showAlert) {
      alert('Veuillez d\'abord entrer votre clé API OpenRouter.');
    }
    return;
  }

  const fetchBtn = document.getElementById('fetch-models');
  if (fetchBtn) {
    fetchBtn.disabled = true;
    fetchBtn.textContent = '...';
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur: ${response.status}`);
    }

    const data = await response.json();
    const models = data.data || [];

    const select = document.getElementById('model-select');
    const currentModel = select.value;
    
    select.innerHTML = '<option value="">Sélectionnez un modèle</option>';
    
    const sortedModels = models.sort((a, b) => {
      const providerA = a.id.split('/')[0] || '';
      const providerB = b.id.split('/')[0] || '';
      return providerA.localeCompare(providerB);
    });

    let currentProvider = '';
    sortedModels.forEach((model) => {
      const provider = model.id.split('/')[0] || 'Other';
      
      if (provider !== currentProvider) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = provider.charAt(0).toUpperCase() + provider.slice(1);
        select.appendChild(optgroup);
        currentProvider = provider;
      }

      const option = document.createElement('option');
      option.value = model.id;
      option.textContent = model.name || model.id;
      
      if (model.id === currentModel) {
        option.selected = true;
      }
      
      const lastOptgroup = select.querySelectorAll('optgroup:last-child')[0];
      if (lastOptgroup) {
        lastOptgroup.appendChild(option);
      } else {
        select.appendChild(option);
      }
    });

    if (showAlert) {
      alert(`${models.length} modèles chargés !`);
    }
  } catch (error) {
    if (showAlert) {
      alert('Erreur lors de la récupération des modèles: ' + error.message);
    }
  } finally {
    if (fetchBtn) {
      fetchBtn.disabled = false;
      fetchBtn.textContent = '↻';
    }
}
}

/**
 * Affiche la liste des instructions
 */
async function startNewChat() {
  chatMessages = [];
  
  const currentSettings = await getChatSettings();
  const settings = {
    ...currentSettings,
    messages: chatMessages
  };

  chrome.storage.local.set({ [CHAT_STORAGE_KEY]: settings }, () => {
    renderChatMessages();
  });
}



/**
 * Charge les paramètres du chatbot depuis le stockage
 */
async function loadChatSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(CHAT_STORAGE_KEY, (result) => {
      const settings = result[CHAT_STORAGE_KEY] || {};
      
      document.getElementById('api-key').value = settings.apiKey || '';
      
      const hasApiKey = settings.apiKey && settings.apiKey.length > 0;
      toggleChatInput(hasApiKey);
      
      if (hasApiKey) {
        fetchOpenRouterModels(false).then(() => {
          if (settings.model) {
            document.getElementById('model-select').value = settings.model;
          }
        });
      }
      
      chatMessages = settings.messages || [];
      customInstructions = settings.customInstructions || [];
      activeInstructionId = settings.activeInstructionId || null;
      
      renderChatMessages();
      renderInstructionsList();
      renderInstructionSelect();
      
      resolve(settings);
    });
  });
}

/**
 * Sauvegarde la clé API
 */
async function saveApiKey() {
  const apiKey = document.getElementById('api-key').value.trim();
  const model = document.getElementById('model-select').value;
  const currentSettings = await getChatSettings();

  const settings = {
    ...currentSettings,
    apiKey,
    model,
    messages: chatMessages,
    customInstructions,
    activeInstructionId
  };

  return new Promise((resolve) => {
    chrome.storage.local.set({ [CHAT_STORAGE_KEY]: settings }, () => {
      toggleChatInput(!!apiKey);
      if (apiKey) {
        fetchOpenRouterModels(true);
      }
      resolve(settings);
    });
  });
}

/**
 * Sauvegarde une custom instruction
 */
async function saveInstruction() {
  const nameInput = document.getElementById('instruction-name');
  const contentInput = document.getElementById('instruction-content');
  
  const name = nameInput.value.trim();
  const content = contentInput.value.trim();

  if (!name || !content) {
    alert('Veuillez entrer un nom et une instruction.');
    return;
  }

  const newInstruction = {
    id: generateId(),
    name,
    content
  };

  customInstructions.push(newInstruction);
  
  nameInput.value = '';
  contentInput.value = '';

  const currentSettings = await getChatSettings();
  const settings = {
    ...currentSettings,
    messages: chatMessages,
    customInstructions,
    activeInstructionId
  };

  return new Promise((resolve) => {
    chrome.storage.local.set({ [CHAT_STORAGE_KEY]: settings }, () => {
      renderInstructionsList();
      
      alert('Instruction ajoutée !');
      resolve(settings);
    });
  });
}

/**
 * Affiche la liste des instructions
 */
function renderInstructionsList() {
  const container = document.getElementById('instructions-list');
  container.innerHTML = '';

  if (customInstructions.length === 0) {
    container.innerHTML = '<p class="empty-state" style="padding: 8px 0; font-size: 12px;">Aucune instruction enregistrée</p>';
    return;
  }

  customInstructions.forEach((instruction) => {
    const item = document.createElement('div');
    item.className = 'instruction-item' + (instruction.id === activeInstructionId ? ' active' : '');
    item.innerHTML = `
      <span class="instruction-name">${escapeHtml(instruction.name)}</span>
      <div class="instruction-actions">
        <button class="btn-small btn-primary use-instruction" data-id="${instruction.id}">Utiliser</button>
        <button class="btn-small btn-secondary edit-instruction" data-id="${instruction.id}">✎</button>
        <button class="btn-small btn-danger delete-instruction" data-id="${instruction.id}">×</button>
      </div>
    `;
    container.appendChild(item);
  });

  document.querySelectorAll('.use-instruction').forEach((btn) => {
    btn.addEventListener('click', () => selectInstruction(btn.dataset.id));
  });

  document.querySelectorAll('.edit-instruction').forEach((btn) => {
    btn.addEventListener('click', () => editInstruction(btn.dataset.id));
  });

  document.querySelectorAll('.delete-instruction').forEach((btn) => {
    btn.addEventListener('click', () => showDeleteInstructionConfirm(btn.dataset.id));
  });
}

function renderInstructionSelect() {
  const select = document.getElementById('instruction-select');
  select.innerHTML = '<option value="">Sans instruction</option>';

  customInstructions.forEach((instruction) => {
    const option = document.createElement('option');
    option.value = instruction.id;
    option.textContent = instruction.name;
    
    if (instruction.id === activeInstructionId) {
      option.selected = true;
    }
    
    select.appendChild(option);
  });
}

async function handleInstructionSelectChange() {
  const select = document.getElementById('instruction-select');
  const selectedId = select.value || null;
  
  activeInstructionId = selectedId;
  
  const currentSettings = await getChatSettings();
  const settings = {
    ...currentSettings,
    messages: chatMessages,
    customInstructions,
    activeInstructionId
  };

  chrome.storage.local.set({ [CHAT_STORAGE_KEY]: settings }, () => {
    renderInstructionsList();
  });
}

/**
 * Sélectionne une instruction comme active
 */
async function selectInstruction(id) {
  activeInstructionId = id;
  
  const currentSettings = await getChatSettings();
  const settings = {
    ...currentSettings,
    messages: chatMessages,
    customInstructions,
    activeInstructionId
  };

  chrome.storage.local.set({ [CHAT_STORAGE_KEY]: settings }, () => {
    renderInstructionsList();
    renderInstructionSelect();
  });
}

/**
 * Supprime une instruction
 */
async function deleteInstruction(id) {
  customInstructions = customInstructions.filter((inst) => inst.id !== id);
  
  if (activeInstructionId === id) {
    activeInstructionId = null;
  }
  
  const currentSettings = await getChatSettings();
  const settings = {
    ...currentSettings,
    messages: chatMessages,
    customInstructions,
    activeInstructionId
  };

  chrome.storage.local.set({ [CHAT_STORAGE_KEY]: settings }, () => {
    renderInstructionsList();
    renderInstructionSelect();
  });
}

/**
 * Affiche la confirmation de suppression d'une instruction
 */
function showDeleteInstructionConfirm(id) {
  pendingDeleteInstructionId = id;
  const modal = document.getElementById('confirm-instruction-modal');
  modal.classList.remove('hidden');
}

/**
 * Modifie une instruction
 */
function editInstruction(id) {
  const instruction = customInstructions.find(inst => inst.id === id);
  if (!instruction) return;

  const nameInput = document.getElementById('instruction-name');
  const contentInput = document.getElementById('instruction-content');
  const saveBtn = document.getElementById('save-instruction');

  nameInput.value = instruction.name;
  contentInput.value = instruction.content;
  
  pendingEditInstruction = id;
  saveBtn.textContent = 'Modifier';
  
  contentInput.focus();
}

/**
 * Sauvegarde une custom instruction (création ou modification)
 */
async function saveInstruction() {
  const nameInput = document.getElementById('instruction-name');
  const contentInput = document.getElementById('instruction-content');
  const saveBtn = document.getElementById('save-instruction');
  
  const name = nameInput.value.trim();
  const content = contentInput.value.trim();

  if (!name || !content) {
    alert('Veuillez entrer un nom et une instruction.');
    return;
  }

  if (pendingEditInstruction) {
    const index = customInstructions.findIndex(inst => inst.id === pendingEditInstruction);
    if (index !== -1) {
      customInstructions[index] = {
        ...customInstructions[index],
        name,
        content
      };
    }
    pendingEditInstruction = null;
    saveBtn.textContent = 'Ajouter';
  } else {
    const newInstruction = {
      id: generateId(),
      name,
      content
    };
    customInstructions.push(newInstruction);
  }
  
  nameInput.value = '';
  contentInput.value = '';

  const currentSettings = await getChatSettings();
  const settings = {
    ...currentSettings,
    messages: chatMessages,
    customInstructions,
    activeInstructionId
  };

  return new Promise((resolve) => {
    chrome.storage.local.set({ [CHAT_STORAGE_KEY]: settings }, () => {
      renderInstructionsList();
      renderInstructionSelect();
      
      alert(pendingEditInstruction ? 'Instruction modifiée !' : 'Instruction ajoutée !');
      resolve(settings);
    });
  });
}

/**
 * Récupère les paramètres du chatbot
 */
async function getChatSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(CHAT_STORAGE_KEY, (result) => {
      resolve(result[CHAT_STORAGE_KEY] || {});
    });
  });
}

/**
 * Active/désactive l'input du chatbot
 */
function toggleChatInput(enabled) {
  const input = document.getElementById('chatbot-input');
  const sendBtn = document.getElementById('chatbot-send');
  
  input.disabled = !enabled;
  sendBtn.disabled = !enabled;
  
  if (!enabled) {
    input.placeholder = 'Veuillez configurer votre clé API';
  } else {
    input.placeholder = 'Envoyer un message...';
  }
}

/**
 * Envoie un message au chatbot
 */
async function sendMessage() {
  const input = document.getElementById('chatbot-input');
  const message = input.value.trim();
  const modelSelect = document.getElementById('model-select');
  
  if (!message) return;

  const apiKey = document.getElementById('api-key').value.trim();
  const model = modelSelect.value;
  
  if (!apiKey) {
    alert('Veuillez configurer votre clé API OpenRouter');
    return;
  }

  if (!model) {
    alert('Veuillez sélectionner un modèle');
    return;
  }

  chatMessages.push({ role: 'user', content: message });
  input.value = '';

  renderChatMessages();

  const loadingMessage = addMessage('assistant', '', true);

  try {
    const response = await sendToOpenRouter(apiKey, model, message);
    
    removeMessage(loadingMessage);
    chatMessages.push({ role: 'assistant', content: response });
    renderChatMessages();
    
    const currentSettings = await getChatSettings();
    currentSettings.messages = chatMessages;
    chrome.storage.local.set({ [CHAT_STORAGE_KEY]: currentSettings });
  } catch (error) {
    removeMessage(loadingMessage);
    addMessage('assistant', `Erreur: ${error.message}`, false, true);
  }
}

/**
 * Envoie la requête à l'API OpenRouter
 */
async function sendToOpenRouter(apiKey, model, userMessage) {
  const messages = [];
  
  const activeInstruction = customInstructions.find(inst => inst.id === activeInstructionId);
  if (activeInstruction) {
    messages.push({ role: 'system', content: activeInstruction.content });
  }
  
  messages.push(...chatMessages.filter(m => m.role !== 'system'));
  messages.push({ role: 'user', content: userMessage });

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'chrome-extension://feedex',
      'X-Title': 'Feedex'
    },
    body: JSON.stringify({
      model: model,
      messages: messages
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `Erreur API: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Ajoute un message au chat
 */
function addMessage(role, content, isLoading = false, isError = false) {
  const messagesContainer = document.getElementById('chatbot-messages');
  const messageDiv = document.createElement('div');
  
  let className = `message ${role}`;
  if (isLoading) className += ' loading';
  if (isError) className += ' error';
  
  messageDiv.className = className;
  
  if (isLoading) {
    messageDiv.innerHTML = `
      <div class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;
  } else {
    messageDiv.textContent = content;
  }
  
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  return messageDiv;
}

/**
 * Supprime un message du chat
 */
function removeMessage(element) {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

/**
 * Affiche tous les messages du chat
 */
function renderChatMessages() {
  const messagesContainer = document.getElementById('chatbot-messages');
  messagesContainer.innerHTML = '';
  
  chatMessages.forEach(msg => {
    addMessage(msg.role, msg.content);
  });
}


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
}

/**
 * Fonction injectée dans la page LinkedIn pour récupérer les statistiques.
 * Le DOM de LinkedIn étant complexe et changeant, cette fonction tente
 * de trouver les valeurs par mots-clés de façon "best effort".
 */
async function scrapeLinkedInStats() {
  console.log("[Feedex] Début de l'extraction des statistiques...");
  try {
    const stats = {
      views: null,
      followers: null,
      impressions: null,
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
}
