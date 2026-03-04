---
title: "Weather App"
description: "Application météo en temps réel avec interface minimaliste, accessible et optimisée mobile/desktop."
cover: "/images/projects/weatherapp.png"
date: 2024-10-05
featured: true
stack:
  - React
  - Vite
  - TailwindCSS
  - API
links:
  live: "https://weather.joelarnaud.com/"
  github: "https://github.com/jowy99/weather-app"
role: "Solo Developer"
impact:
  - "Consultation météo en temps réel avec focus sur performance et usabilité"
  - "Implémentation des favoris et du cache pour réduire les appels API inutiles"
  - "Projet d'apprentissage clé pour consolider React, gestion d'état et consommation d'API"
---

## Résumé

Weather App est une application météo avec plusieurs fonctionnalités permettant de consulter le climat de n'importe quelle ville en temps réel. L'interface suit une approche moderne, accessible et minimaliste.

Le projet a été développé entièrement par moi avec React, Vite et TailwindCSS, en intégrant les données de weatherapi.com.

## Objectifs

1. Construire une application météo claire, rapide et responsive.
2. Pratiquer la consommation d'APIs externes et la gestion d'état en React.
3. Améliorer l'expérience utilisateur avec des fonctionnalités utiles en usage réel.
4. Consolider les bonnes pratiques UI et performance.

## Défis

L'un des principaux défis a été d'optimiser la gestion de la localisation utilisateur et du cache météo pour réduire les appels API sans perdre la fraîcheur des données.

J'ai également travaillé l'accessibilité, le responsive et les détails d'interaction pour garantir une expérience cohérente sur mobile et desktop.

## Décisions techniques

J'ai utilisé React pour l'architecture des composants, Vite pour un environnement de développement rapide et TailwindCSS pour itérer le design efficacement.

J'ai implémenté la sauvegarde de lieux favoris (jusqu'à 5) et des raccourcis clavier pour accélérer la recherche de villes.

## Points forts

- Raccourcis clavier pour la recherche rapide.
- Sauvegarde jusqu'à 5 lieux favoris.
- Bascule dynamique mode clair/sombre.
- Prévisions détaillées: humidité, pression et conditions.
- Design optimisé mobile et desktop.

## Résultats / Impact

Même s'il existe de nombreuses applications météo, ce projet a rempli son objectif comme laboratoire d'apprentissage concret. Il m'a permis d'approfondir React, l'intégration d'API et les décisions UX orientées usage quotidien.

Le résultat est une application fonctionnelle et maintenable qui a renforcé mon niveau frontend.

## Ce que j'ai appris / Ce que j'améliorerais

J'ai amélioré ma gestion de l'état et du cache dans des interfaces en temps réel, ainsi que ma capacité à prendre de petites décisions produit à fort impact sur l'usabilité.

Dans une prochaine itération, j'ajouterais des tests automatisés sur les flux critiques et une stratégie plus complète de gestion des erreurs réseau.
