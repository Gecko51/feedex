# 📄 Product Requirement Document (PRD)

## Titre du Projet
**Feedex** - Extension Google Chrome de gestion de listes de contacts LinkedIn.

## Vision & Objectifs
L'objectif de Feedex est de fournir aux utilisateurs un outil rapide et accessible directement depuis leur navigateur pour sauvegarder, organiser et retrouver des listes de contacts LinkedIn. L'extension doit offrir une expérience utilisateur (UX) fluide, avec une interface moderne et minimaliste, permettant de générer dynamiquement des accès rapides via des boutons personnalisés.

## Fonctionnalités Clés (MVP)
* **Création de liste** : Formulaire simple permettant d'entrer manuellement un nom de liste et une URL LinkedIn associée.
* **Génération dynamique de boutons** : Création immédiate d'un bouton cliquable portant le nom de la liste dès la validation du formulaire.
* **Édition à la volée** : Capacité de modifier le nom ou le lien d'une liste existante directement depuis l'interface (tous les inputs doivent être éditables).
* **Persistance des données** : Sauvegarde locale des listes via l'API `chrome.storage` pour conserver les données à la fermeture du popup.
* **Navigation** : Clic sur un bouton généré pour ouvrir le lien LinkedIn dans un nouvel onglet.

## Stack Technique
* **Cœur** : HTML5, CSS3, Vanilla JavaScript (ECMAScript 2022+).
* **Architecture** : Chrome Extension Manifest V3.
* **Logique métier** : Centralisée dans un fichier autonome `popup.js` lié au DOM de l'extension.
* **Stockage** : API `chrome.storage.local`.

## Contraintes Techniques & UI/UX
* **Design System** : 
    * **Background** : Gris foncé (ex: `#1E1E1E` ou `#121212`).
    * **Accent/Nuances** : Vert clair `#C2E476` (pour les états `:hover`, `:focus`, boutons d'action principale).
    * **Style** : UI moderne, utilisation élégante de `border-radius` (ex: `8px` ou `12px` pour les inputs et boutons).
* **Performance** : Chargement instantané du popup. Poids minimal, aucune dépendance externe lourde.
* **Sécurité** : Respect strict du Content Security Policy (CSP) imposé par le Manifest V3.

## Mentions obligatoires à inclure au développement
* **Commentaires** : Assurez-vous de toujours mettre des commentaires explicites pour détailler chaque partie importante du code (gestion des événements, appels API Chrome, manipulation du DOM). Les commentaires peuvent être supprimés seulement s’ils ne sont plus nécessaires.
* **Responsive Design** : Adopter une approche "mobile-first". Bien qu'il s'agisse d'un popup Chrome, l'interface doit s'adapter dynamiquement à la largeur définie (ex: `min-width: 320px; max-width: 400px;`) et gérer proprement les débordements de texte.
* **Documentation** : Pour tout recours à de la documentation à jour (notamment sur l'API Chrome Manifest V3), utiliser exclusivement le MCP Context7.