# Checklist Release

Validacion local: 2026-10-28. No se ha desplegado.
La publicacion sigue pendiente del CV definitivo, el enlace de Emotions y las
comprobaciones externas indicadas abajo.

## 1) Build, rutas y contenido
- [x] `pnpm run build` sin errores.
- [x] `content:check`: 788 textos y 28 Markdown conservados en cuatro idiomas.
- [x] `i18n:check`: es, en, ca y fr correctos.
- [x] `check:links`: estructura de los 28 proyectos sin placeholders de URL.
- [x] `test:preview`: 17 pruebas correctas (compresion, SSR, cache e inlining).
- [x] Inicio, listado y detalle Weather App accesibles en los cuatro idiomas.
- [x] Los 28 detalles de proyecto responden 200 y sus imagenes se decodifican.
- [x] La raiz `/` lleva a `/es` en navegador (redirect HTML prerenderizado).
- [x] `robots.txt` y `sitemap.xml` responden 200 con su tipo de contenido.

## 2) UX y compatibilidad
- [x] WebKit 26.5: 24 visitas (3 rutas x 4 idiomas x 2 anchos: 320 y 1440 px),
  sin errores JavaScript ni desbordamiento horizontal del documento.
- [x] 28 visitas adicionales a detalles de proyecto, sin errores.
- [x] 64 comprobaciones de interaccion: perfil, formulario simulado, busqueda,
  filtros, temas y cambio de idioma.
- [x] Perfil navegable con clic y teclado; Escape cancela los filtros sin aplicarlos.
- [x] Busqueda y borrado en vivo; filtros `stack` y `sort` aplicados por GET.
- [x] Cambio de idioma conserva la ruta del proyecto.
- [x] Temas claro, oscuro y sistema: seleccion y persistencia tras recargar;
  sistema responde al cambio de preferencia del navegador.
- [x] Sin JavaScript: todos los paneles de perfil visibles y busqueda GET funcional
  en los cuatro idiomas (390 px).
- [x] Contacto: error simulado conserva datos y exito simulado los limpia.
  Peticiones interceptadas; ningun correo enviado.
- [x] Capturas de inicio, listado y detalle revisadas en movil y escritorio.
- [ ] Firefox 153: no validado. El binario de Playwright no arranca en este equipo;
  registra `sandbox_extension_issue_file_to_process` y un fallo del compositor.
  Fallan los intentos sin ventana, con ventana y con preferencias graficas alternativas.
- [ ] Safari/iOS y dispositivos fisicos: pendientes. WebKit automatizado no sustituye
  estas pruebas ni certifica todas las versiones de Safari.
- [ ] Paginacion de varias paginas: no ejercitada con los 7 proyectos actuales.
- [ ] Entrega SMTP real: no probada en este bloque.

## 3) SEO y rendimiento
- [x] Canonical, cinco hreflang y atributo `lang` correctos en las 24 visitas principales.
- [x] Los 28 detalles conservan `og:type=article`, titulo, descripcion, imagen OG
  y Twitter card.
- [x] Sin peticiones CSS/JS externas en las 24 visitas principales.
- [x] Ultima auditoria Lighthouse local (2026-10-22): 100 en las cuatro categorias
  para inicio, listado y detalle, movil y escritorio. Ver `PERFORMANCE_REPORT.md`.
- [ ] Medicion del dominio publicado y revision manual completa de accesibilidad.

## 4) CV y enlaces externos
- [x] `/cv-joel-arnaud.pdf`: HTTP 200, `application/pdf`; ocho descargas en WebKit
  coinciden byte a byte con el archivo local.
- [ ] CV definitivo: el archivo actual tiene una pagina, 713 bytes y texto de
  ejemplo: `Joel Arnaud - CV Placeholder`. Descargar correctamente no lo hace
  apto para publicar. Se necesita el PDF definitivo del propietario.
- [x] Comprobacion HTTP publica de los 10 destinos externos unicos.
- [ ] Todos los destinos accesibles: Emotions devuelve 404 y LinkedIn bloquea
  la comprobacion automatica. No se han modificado sus URL.

| Destino | Resultado HTTP |
| --- | --- |
| https://fincasesmoli.com/es | 200 |
| https://weather.joelarnaud.com/ | 200 |
| https://github.com/jowy99 | 200 |
| https://github.com/jowy99/FestivalDeGranada | 200 |
| https://github.com/jowy99/MemoryGame | 200 |
| https://github.com/jowy99/Proyecto-Python-SQL | 200 |
| https://github.com/jowy99/monopoly | 200 |
| https://github.com/jowy99/weather-app | 200 |
| https://github.com/jowy99/emotions | 404, confirmado con dos clientes HTTP |
| https://www.linkedin.com/in/joelarnaudcarreras/ | 999, verificacion manual pendiente |

Un 404 publico de GitHub no permite distinguir entre un repositorio privado,
renombrado o eliminado. Confirmar acceso o destino antes de cambiar contenido.
Un 200 solo confirma disponibilidad HTTP, no la funcionalidad de la web externa.

## 5) Publicacion
- [x] Build local actualizado y contenido original preservado.
- [ ] Resolver CV y enlace de Emotions; verificar LinkedIn manualmente.
- [ ] Completar Firefox y pruebas en dispositivos reales.
- [ ] Validar configuracion Nginx en el servidor antes de recargarla.
- [ ] Despliegue autorizado, DNS/HTTPS y cache/CDN comprobados.
- [ ] Comprobacion final sobre el dominio publicado.

## Evidencia y alcance

Pruebas sobre produccion local comprimida, no sobre el servidor de desarrollo.
Resultados y capturas de esta ejecucion en `/tmp/joel-release-yOtY7J/` (temporales).
No se han cambiado textos, traducciones, datos, imagenes ni destinos de enlaces.
No se han creado commits ni realizado despliegues.
