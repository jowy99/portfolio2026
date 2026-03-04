---
title: "Gestionnaire DB Python"
description: "Application académique en terminal pour gérer plusieurs tables MySQL depuis Python."
cover: "/images/projects/pythondatabase.png"
date: 2023-03-25
featured: false
stack:
  - Python
  - MySQL
  - SQL
  - CLI
links:
  github: "https://github.com/jowy99/Proyecto-Python-SQL"
role: "Solo Developer"
impact:
  - "Projet mené en parallèle de Monopoly, avec une charge prévue pour une équipe de 3 personnes"
  - "CRUD fonctionnel sur plusieurs tables dans une seule application terminal"
  - "Consolidation pratique de l'intégration Python + MySQL"
---

## Résumé

Gestionnaire DB Python est une application académique orientée terminal pour effectuer des opérations de base de données sur plusieurs tables. Le projet se connecte à MySQL et permet de manipuler les données directement en console.

Bien que le travail ait été conçu pour une équipe, je l'ai développé seul, en parallèle du projet Monopoly.

## Objectifs

1. Mettre en place une connexion stable entre Python et MySQL.
2. Permettre création, suppression, édition et consultation depuis le terminal.
3. Gérer plusieurs tables dans un même flux applicatif.
4. Respecter l'ensemble des exigences fonctionnelles du rendu académique.

## Défis

Le principal défi a été le manque d'orientation claire de la part de l'enseignant, tant sur la structure du projet que sur l'implémentation technique. J'ai dû rechercher de manière autonome comment connecter, interroger et mettre à jour MySQL depuis Python.

La charge a aussi été importante, car ce projet et Monopoly étaient initialement prévus en travail de groupe.

## Décisions techniques

J'ai choisi un flux CLI direct, avec des opérations séparées par type d'action pour garder une bonne lisibilité. La couche d'accès aux données a été organisée pour réutiliser les requêtes communes et limiter la duplication.

La priorité était de garantir la stabilité des opérations CRUD et la cohérence des données entre tables.

## Points forts

- Opérations pour ajouter, supprimer, éditer et consulter des informations.
- Gestion simultanée de plusieurs tables dans une seule application.
- Intégration fonctionnelle Python + MySQL en contexte académique.
- Implémentation 100% terminal, sans interface graphique.

## Résultats / Impact

Le projet a été livré de manière fonctionnelle dans le cadre académique attendu. Il a permis de démontrer autonomie technique et capacité de résolution sans support direct.

Il a également renforcé ma capacité à travailler sur plusieurs fronts en parallèle avec une livraison cohérente.

## Ce que j'ai appris / Ce que j'améliorerais

J'ai appris qu'une structure de code claire et modulaire réduit fortement le coût des changements lorsque les exigences sont floues. J'ai aussi confirmé qu'une documentation minimale des décisions techniques accélère le débogage et la maintenance.

Dans une prochaine itération, j'ajouterais des validations plus strictes, une meilleure gestion d'erreurs et un petit socle de tests automatisés pour les requêtes critiques.
