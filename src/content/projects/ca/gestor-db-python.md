---
title: "Gestor DB Python"
description: "Aplicació acadèmica en terminal per gestionar múltiples taules MySQL des de Python."
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
  - "Projecte completat en paral·lel a Monopoly, assumint feina pensada per a 3 persones"
  - "CRUD funcional sobre múltiples taules en una sola aplicació de terminal"
  - "Consolidació pràctica de la integració Python + MySQL"
---

## Resum

Gestor DB Python és una aplicació acadèmica de terminal per fer operacions bàsiques de base de dades sobre múltiples taules. El projecte es connecta a MySQL i permet manipular dades de manera directa des de consola.

Tot i que estava plantejat per a equip, vaig desenvolupar el treball de forma individual i en paral·lel amb Monopoly.

## Objectius

1. Implementar una connexió estable entre Python i MySQL.
2. Permetre altes, baixes, edicions i consultes des de terminal.
3. Gestionar diverses taules dins d'un mateix flux d'aplicació.
4. Complir tots els requisits funcionals de l'entrega acadèmica.

## Reptes

El repte principal va ser la manca d'orientació clara per part del professor, tant en estructura de projecte com en implementació tècnica. Això em va obligar a investigar de manera autònoma com connectar, consultar i actualitzar dades a MySQL des de Python.

També hi va haver càrrega extra perquè aquest projecte i Monopoly estaven pensats inicialment per a treball en grup.

## Decisions tècniques

Vaig optar per un flux CLI directe, amb operacions separades per tipus d'acció per mantenir claredat d'ús. La capa d'accés a dades es va organitzar per reutilitzar consultes comunes i reduir duplicacions.

La prioritat va ser assegurar estabilitat en operacions CRUD i consistència de dades entre taules.

## Punts destacats

- Operacions per afegir, eliminar, editar i visualitzar informació.
- Gestió simultània de múltiples taules des d'una sola aplicació.
- Integració funcional Python + MySQL en entorn acadèmic.
- Implementació 100% terminal, sense interfície gràfica.

## Resultats / Impacte

El projecte es va completar de forma funcional dins del marc acadèmic esperat. Va permetre demostrar autonomia tècnica i capacitat de desbloqueig sense suport directe.

També va reforçar la meva capacitat de treballar en paral·lel en diversos fronts mantenint entregues consistents.

## Què vaig aprendre / Què milloraria

Vaig aprendre que una estructura de codi clara i modular redueix molt el cost de canvis quan els requisits són difusos. També vaig confirmar que documentar decisions tècniques des del principi accelera depuració i manteniment.

En una iteració següent afegiria validacions més estrictes, millor control d'errors i un petit conjunt de proves automatitzades per a consultes crítiques.
