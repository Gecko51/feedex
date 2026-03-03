# Feedex

Extension Google Chrome de gestion de listes de contacts LinkedIn avec un assistant IA 
connecté à OpenRouter par API.

## Fonctionnalités

- **Création de listes** : Ajoutez des noms de listes avec leurs URLs LinkedIn associées
- **Accès rapide** : Génération de boutons cliquables pour ouvrir directement vos listes
- **Édition à la volée** : Modifiez le nom ou l'URL de vos listes à tout moment
- **Suppression** : Supprimez les listes dont vous n'avez plus besoin
- **Persistance** : Vos données sont sauvegardées localement via `chrome.storage`

## Installation

1. Clonez ce dépôt ou téléchargez les fichiers
2. Ouvrez Chrome et accédez à `chrome://extensions/`
3. Activez le **Mode développeur** (bouton en haut à droite)
4. Cliquez sur **Charger l'extension non empaquetée**
5. Sélectionnez le dossier contenant les fichiers de l'extension

## Structure du projet

```
feedex/
├── manifest.json       # Configuration Manifest V3
├── popup/
│   ├── popup.html     # Structure UI
│   ├── popup.css      # Styles
│   └── popup.js       # Logique métier
└── assets/
    ├── icon-16.svg    # Icône 16x16
    ├── icon-48.svg    # Icône 48x48
    └── icon-128.svg  # Icône 128x128
```

## Technologies

- HTML5, CSS3, Vanilla JavaScript (ES2022+)
- Chrome Extension Manifest V3
- API chrome.storage pour la persistance

## Design System

- **Background** : `#1E1E1E` (gris foncé)
- **Accent** : `#C2E476` (vert clair)
- **Border-radius** : 8px - 12px
- **Responsive** : 320px - 400px largeur

## License

MIT
