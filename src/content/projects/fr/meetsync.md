---
title: "MeetSync"
description: "Sondage pour convenir des dates et des destinations d'une sortie ou d'un voyage."
cover: "/images/projects/meetsync.png"
date: 2026-08-23
label: "Prototype inachevé · avec IA"
featured: false
stack:
  - Next.js
  - React
  - TypeScript
  - TailwindCSS
  - Drizzle
  - PostgreSQL
links: {}
role: "Projet personnel, Développé avec l'assistance de l'IA"
impact:
  - "Calendrier pour indiquer ses disponibilités"
  - "Choix de lieux avec commentaires"
  - "Réponses enregistrées dans PostgreSQL avec Drizzle"
---

## Résumé

- Coordonne sorties et voyages
- Chacun indique ses jours et ses lieux
- Prototype en pause, non publié

## Objectifs

- Indiquer ses disponibilités sur un calendrier
- Choisir des lieux et ajouter des commentaires
- Répondre sans créer de compte

## Défis

- Modifier sa réponse sans s'inscrire
- Prévenir clairement si la base de données échoue

## Décisions techniques

- Next.js et React avec TypeScript
- PostgreSQL avec Drizzle
- Validation côté serveur
- Identité anonyme dans le navigateur

## Points forts

- Calendrier de disponibilités
- Choix des lieux

## Résultats / Impact

- Formulaire et calendrier fonctionnels en local
- Résultats triés par votes

## Apprentissages

### Ce que j'ai appris

- Travailler avec les actions serveur
- Penser à ce qu'on voit quand quelque chose échoue

### Ce que je ferais mieux

- Créer des sondages depuis l'application
- Ajouter des tests aux résultats
