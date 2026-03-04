---
title: "Gestor DB Python"
description: "Aplicacion academica en terminal para gestionar multiples tablas MySQL desde Python."
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
  - "Proyecto completado en paralelo a Monopoly, asumiendo trabajo pensado para 3 personas"
  - "CRUD funcional sobre multiples tablas en una sola aplicacion de terminal"
  - "Consolidacion practica de integracion Python + MySQL"
---

## Resumen

Gestor DB Python es una aplicacion academica orientada a terminal para realizar operaciones basicas de base de datos sobre multiples tablas. El proyecto se conecta a MySQL y permite manipular datos de forma directa desde consola.

Aunque la practica estaba pensada para equipo, desarrolle el trabajo de manera individual y en paralelo con el proyecto Monopoly.

## Objetivos

1. Implementar una conexion estable entre Python y MySQL.
2. Permitir altas, bajas, ediciones y consultas desde terminal.
3. Gestionar varias tablas dentro del mismo flujo de aplicacion.
4. Cumplir todos los requisitos funcionales de la entrega academica.

## Retos

El reto principal fue la falta de orientacion clara por parte del profesor, tanto en estructura de proyecto como en implementacion tecnica. Eso obligo a investigar de forma autonoma como conectar, consultar y actualizar datos en MySQL desde Python.

Tambien hubo dificultad de carga por desarrollar este proyecto a la vez que Monopoly, ambos originalmente planteados para trabajo en grupo.

## Decisiones tecnicas

Opte por un flujo CLI directo, con operaciones separadas por tipo de accion para mantener claridad en el uso. La capa de acceso a datos se organizo para reutilizar consultas comunes y reducir duplicacion.

La prioridad fue asegurar funcionalidad estable en operaciones CRUD y manejo consistente de datos entre tablas.

## Highlights

- Operaciones para agregar, eliminar, editar y visualizar informacion.
- Gestion simultanea de multiples tablas desde una unica aplicacion.
- Integracion funcional Python + MySQL en entorno academico.
- Implementacion 100% terminal, sin interfaz grafica.

## Resultados / Impacto

El proyecto se completo de forma funcional y dentro del marco academico esperado. Permitio demostrar autonomia tecnica y capacidad para resolver bloqueos sin soporte directo.

Tambien reforzo mi capacidad para trabajar en paralelo en varios frentes y mantener entregas consistentes bajo limitaciones de contexto.

## Lo que aprendi / Que haria mejor

Aprendi que una estructura de codigo clara y modular reduce mucho el coste de cambios cuando hay requisitos difusos. Tambien confirme que documentar decisiones tecnicas desde el inicio acelera depuracion y mantenimiento.

En una siguiente iteracion anadiria validaciones mas estrictas, mejor control de errores y un pequeno set de pruebas automatizadas para consultas criticas.
