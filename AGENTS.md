# Feedex - Agent Guidelines

This document provides guidelines for agentic coding agents working on the Feedex Chrome Extension project.

## Project Overview

Feedex is a Google Chrome extension for managing LinkedIn contact lists with an AI assistant connected to OpenRouter API. Built with vanilla JavaScript (ES2022+), HTML5, and CSS3 using Chrome Manifest V3.

## Project Structure

```
feedex/
├── manifest.json          # Chrome Extension Manifest V3 config
├── background.js          # Service worker (opens side panel)
├── popup/
│   ├── popup.html         # UI structure
│   ├── popup.js           # Main business logic
│   └── popup.css          # Styles (dark theme)
├── assets/
│   ├── Logo feedex.png    # Extension icon
│   └── icon-*.svg         # SVG icons
├── prd.md                 # Product requirements
└── AGENTS.md              # This file
```

## Build / Test Commands

### Loading the Extension

Since this is a vanilla Chrome Extension without a build system:

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `feedex` folder

### Reloading After Changes

1. Go to `chrome://extensions/`
2. Click the refresh icon on the Feedex extension card
3. Reopen the extension popup to see changes

### Testing

- **Manual testing only** - No automated test framework
- Test all user flows after making changes:
  - Create/Edit/Delete lists
  - Chatbot functionality (API key, model selection, messages)
  - Settings persistence
  - Responsive behavior (320px-400px width)

## Code Style Guidelines

### General Principles

- Write **clear, explanatory comments** for all important code sections (per PRD requirement)
- Use modern JavaScript (ES2022+) features
- Keep functions small and focused
- Use semantic HTML and meaningful variable names

### JavaScript Conventions

```javascript
// Constants - UPPER_SNAKE_CASE
const STORAGE_KEY = 'feedex_lists';
const CHAT_STORAGE_KEY = 'feedex_chat_settings';

// Functions - camelCase, descriptive names
function init() { /* ... */ }
async function getLists() { /* ... */ }

// Classes - PascalCase (if used)
// Avoid: function name() {}
// Prefer: function getLists() {}

// Use async/await for asynchronous operations
async function saveLists(lists) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: lists }, resolve);
  });
}
```

### JSDoc Comments

Document all functions with JSDoc-style comments:

```javascript
/**
 * Charge les listes depuis le stockage Chrome
 * @returns {Promise<Array>} Liste des listes sauvegardées
 */
async function getLists() { /* ... */ }

/**
 * Affiche le modal de confirmation de suppression
 * @param {string} id - ID de la liste à supprimer
 */
function showDeleteConfirm(id) { /* ... */ }
```

### HTML Conventions

- Use semantic HTML5 elements
- Use 2-space indentation
- Add `lang="fr"` attribute to `<html>`
- Use accessible attributes (`alt`, `title`, `aria-*` where appropriate)
- Quote attribute values consistently

```html
<input 
  type="text" 
  id="list-name" 
  name="listName" 
  placeholder="Ex: Prospects..."
  required
>
```

### CSS Conventions

- Use CSS custom properties (variables) for theming
- Follow the design system:
  - Background: `#1E1E1E`
  - Accent: `#C2E476`
  - Border-radius: 8px-12px
- Use BEM-like class naming for components
- Mobile-first responsive approach

```css
:root {
  --bg-primary: #1E1E1E;
  --accent: #C2E476;
  --radius: 8px;
}

.btn-primary {
  display: flex;
  gap: 8px;
}
```

### Naming Conventions

- **Files**: kebab-case (`popup.js`, `popup.css`)
- **HTML IDs/Classes**: kebab-case (`.list-item`, `#list-name`)
- **JavaScript variables/functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **DOM elements**: Descriptive names (`saveApiKeyBtn`, `listsContainer`)

### Error Handling

- Use try/catch for async operations
- Show user-friendly error messages via alerts
- Log errors appropriately for debugging

```javascript
try {
  const response = await sendToOpenRouter(apiKey, model, message);
  chatMessages.push({ role: 'assistant', content: response });
  renderChatMessages();
} catch (error) {
  addMessage('assistant', `Erreur: ${error.message}`, false, true);
}
```

### Security

- Always escape HTML to prevent XSS:
```javascript
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
```

- Use `chrome.storage.local` for data persistence
- Never expose API keys in code (stored in user storage)

### Chrome Extension Specific

- Use Manifest V3 APIs
- Handle Chrome storage with callbacks or promises
- Use appropriate permissions in manifest.json
- Follow CSP guidelines

### Import/Dependency Management

- No external dependencies or bundlers
- Load scripts in HTML with `<script src="popup.js"></script>`
- Access Chrome APIs via `chrome.*` global

## Design System Reference

| Property | Value |
|----------|-------|
| Background Primary | `#1E1E1E` |
| Background Secondary | `#121212` |
| Accent | `#C2E476` |
| Accent Hover | `#d4ed8e` |
| Text Primary | `#FFFFFF` |
| Text Secondary | `#A0A0A0` |
| Border Color | `#333333` |
| Border Radius | 8px-12px |
| Width | 320px-400px |

## Documentation

- Use Context7 MCP for Chrome Extension API documentation
- Reference: https://context7.com (search Chrome Extension APIs)
- Keep PRD.md updated if requirements change

## Git Workflow

1. Create feature branches for new features
2. Commit with descriptive messages in English or French
3. Test manually before committing
4. Push to remote and create PR if needed