---
title: "Weather App"
description: "Aplicació del temps en temps real amb interfície minimalista, accessible i optimitzada per a mòbil i escriptori."
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
  - "Consulta de clima en temps real amb focus en rendiment i usabilitat"
  - "Implementació de favorits i memòria cau per reduir peticions innecessàries"
  - "Projecte clau d'aprenentatge per consolidar React, estat i consum d'APIs"
---

## Resum

Weather App és una aplicació del temps amb múltiples funcionalitats per consultar el clima de qualsevol ciutat en temps real. La interfície segueix una línia moderna, accessible i minimalista.

El projecte va ser desenvolupat completament per mi amb React, Vite i TailwindCSS, integrant dades de weatherapi.com.

## Objectius

1. Construir una aplicació meteo clara, ràpida i responsive.
2. Practicar consum d'APIs externes i gestió d'estat amb React.
3. Millorar l'experiència d'usuari amb funcionalitats útils en ús real.
4. Consolidar bones pràctiques de UI i rendiment.

## Reptes

Un dels reptes principals va ser optimitzar la gestió d'ubicació de l'usuari i la memòria cau de dades meteorològiques per reduir peticions sense perdre frescor de la informació.

També vaig treballar accessibilitat, adaptació responsive i detalls d'interacció per garantir consistència en mòbil i escriptori.

## Decisions tècniques

Vaig utilitzar React per a l'arquitectura de components, Vite per a un entorn de desenvolupament ràpid i TailwindCSS per iterar disseny de forma eficient.

Vaig implementar emmagatzematge de favorits (fins a 5 ubicacions) i dreceres de teclat per accelerar la cerca de ciutats.

## Punts destacats

- Dreceres de teclat per cerca ràpida.
- Emmagatzematge de fins a 5 ubicacions favorites.
- Canvi dinàmic entre mode clar i fosc.
- Pronòstic detallat amb humitat, pressió i condicions.
- Disseny optimitzat per mòbil i escriptori.

## Resultats / Impacte

Tot i existir moltes apps meteo, aquest projecte va complir el seu objectiu com a laboratori real d'aprenentatge. Em va permetre aprofundir en React, consum d'APIs i decisions de UX orientades a ús diari.

El resultat és una aplicació funcional i mantenible que em va ajudar a pujar nivell tècnic en frontend modern.

## Què vaig aprendre / Què milloraria

Vaig aprendre a gestionar millor estat i caché en interfícies amb dades en temps real, i a prendre petites decisions de producte que milloren molt la usabilitat.

En una iteració següent afegiria proves automatitzades per als fluxos crítics i una estratègia més completa de gestió d'errors de xarxa.
