feedex/
├── manifest.json            # Configuration centrale de l'extension Feedex (Manifest V3)
├── README.md                # Documentation du projet et instructions d'installation
├── popup/                   # Dossier contenant l'interface utilisateur autonome
│   ├── popup.html           # Structure UI (Formulaires, conteneur de boutons)
│   ├── popup.css            # Styles (Fond gris foncé, nuances #C2E476, border-radius)
│   └── popup.js             # Logique métier autonome (CRUD des listes, events, chrome.storage)
└── assets/                  # Ressources statiques
    ├── icon-16.png          # Icône d'extension (favicon)
    ├── icon-48.png          # Icône d'extension (gestion des extensions)
    └── icon-128.png         # Icône d'extension (Chrome Web Store)