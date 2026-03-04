---
title: "Python DB Manager"
description: "Academic terminal app to manage multiple MySQL tables from Python."
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
  - "Completed in parallel with Monopoly, taking on work designed for a 3-person team"
  - "Functional CRUD over multiple tables in one terminal app"
  - "Practical consolidation of Python + MySQL integration"
---

## Summary

Python DB Manager is an academic terminal application for basic database operations across multiple tables. The project connects to MySQL and allows direct data manipulation from the command line.

Although it was designed as a team assignment, I developed it independently and in parallel with Monopoly.

## Objectives

1. Implement a stable connection between Python and MySQL.
2. Support create, delete, update, and read operations from terminal.
3. Manage multiple tables within one application flow.
4. Meet all functional requirements of the academic assignment.

## Challenges

The main challenge was the lack of clear guidance from the professor on both project structure and technical implementation. I had to research autonomously how to connect, query, and update MySQL from Python.

The workload was also demanding because this project and Monopoly were both originally planned for group work.

## Technical Decisions

I chose a direct CLI flow, with operations grouped by action type to keep usage clear. The data-access layer was organized to reuse common queries and reduce duplication.

The priority was stable CRUD behavior and consistent data handling across tables.

## Highlights

- Operations to add, remove, edit, and view records.
- Simultaneous management of multiple tables from one app.
- Functional Python + MySQL integration in an academic context.
- 100% terminal implementation, no GUI.

## Results / Impact

The project was completed functionally within the expected academic scope. It demonstrated technical autonomy and ability to unblock issues without direct support.

It also strengthened my ability to work on parallel workstreams and maintain consistent delivery under constraints.

## What I Learned / What I'd Improve

I learned that clean, modular code structure significantly reduces change cost when requirements are unclear. I also confirmed that documenting technical decisions early speeds up debugging and maintenance.

In a future iteration, I would add stricter validations, improved error handling, and a small set of automated tests for critical queries.
