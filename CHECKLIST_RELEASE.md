# Checklist Release

## 1) Build y rutas
- [x] `pnpm build` sin errores
- [x] Rutas i18n accesibles: `/es`, `/en`, `/ca`, `/fr`
- [x] Listado y detalle accesibles por idioma
- [x] Redirect raiz `/` hacia `/es` correcto

## 2) UX funcional
- [x] Cambio de idioma mantiene ruta equivalente (`/[lang]/...`)
- [x] Tema `system/light/dark` funciona y persiste
- [x] Carrusel navega con flechas, dots y teclado
- [x] Filtros de proyectos (`q`, `stack`, `sort`) funcionan por GET
- [x] Paginacion `page=` y link `#list` funcionan

## 3) Accesibilidad
- [x] `Skip to content` operativo
- [x] Estados `focus-visible` claros
- [x] Formularios con labels y `autocomplete`
- [x] `prefers-reduced-motion` respetado
- [x] Contraste correcto en claro/oscuro

## 4) SEO minimo
- [x] `canonical` presente y correcto
- [x] `hreflang` para `es/en/ca/fr` + `x-default`
- [x] OG tags (`title`, `description`, `url`, `image`) presentes
- [x] Twitter card presente
- [x] `og:locale` y `og:locale:alternate` correctos
- [x] Detalle de proyecto marcado como `article`

## 5) Contenido y copy
- [x] Tono consistente para perfil asalariado en 4 idiomas
- [x] CTA de contacto claros y alineados con vacantes
- [x] CV descargable disponible (`/cv-joel-arnaud.pdf`)
- [ ] Enlaces externos (`live`, `github`, `LinkedIn`) validados

## 6) Publicacion
- [x] `dist/` generado con version final
- [ ] Dominio `joelarnaud.com` apuntando al provider
- [ ] HTTPS activo
- [ ] Cache/CDN invalidada tras deploy
- [ ] Verificacion final en movil y desktop

## Notas
- Validacion local completada: 2026-03-01.
- Contraste verificado con ratios WCAG (ajuste de `.muted` en modo claro a `zinc-700`).
- Script de chequeo de enlaces disponible: `pnpm check:links` (estructura OK, detecta placeholders).
- Validacion HTTP de enlaces externos no ejecutable en este entorno (red bloqueada); ademas, varios `live` son placeholders `*.example.com`.
- Pendientes externos: validacion de enlaces reales, DNS/HTTPS/CDN y verificacion visual final en dispositivos reales.
