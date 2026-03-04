# Joël Arnaud Portfolio

Portfolio construido con Astro + Tailwind v4, i18n por rutas y enfoque Astro-first (sin SPA ni React).

## Stack
- Astro 5 + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Content Collections (Markdown) para proyectos
- JS minimo en cliente: tema y reveal

## Features
- i18n por rutas: `/es`, `/en`, `/ca`, `/fr`
- Home por idioma: `/:lang`
- Listado de proyectos con GET params: `/:lang/projects`
- Detalle de proyecto por slug: `/:lang/projects/:slug`
- Tema `system | light | dark` con persistencia en `localStorage`
- SEO base por idioma:
  - `canonical`
  - `hreflang` + `x-default`
  - Open Graph + Twitter cards
  - `og:locale` y `og:locale:alternate`

## Scripts
```bash
npm run dev
npm run build
npm run preview
npm run compress:dist
npm run preview:perf
```

Puertos por defecto:
- `dev` -> `http://localhost:4321`
- `preview` -> `http://localhost:4322`

Para medir Lighthouse correctamente usa modo produccion (no `dev`):

```bash
npm run build && npm run preview
```

Luego ejecuta Lighthouse contra la URL de preview:

```bash
npx lighthouse http://localhost:4322/es --preset=mobile
```

No ejecutes Lighthouse sobre `npm run dev`.

Comprobacion rapida de que no estas auditando DEV:
- En preview no deben aparecer requests como `/@vite/client` ni `client/env.mjs`.

Si quieres auditar localmente con compresion activa (brotli/gzip), usa:

```bash
npm run preview:perf
```

Ese comando construye `dist`, genera `.br/.gz` y sirve con `Content-Encoding`.

## Notas de rendimiento
- Hero migrado a `astro:assets` con `<Picture>` responsivo (`avif/webp/jpeg`) y tamaños adaptados.
- Covers de proyectos integradas en content collection con `image()` + `<Image>` para definir dimensiones y evitar CLS.
- Eliminado `@import` remoto de Google Fonts para reducir recursos bloqueantes.
- `theme-init` sigue inline en `<head>` para evitar FOUC y el runtime de `theme toggle + reveal` se ejecuta inline en `BaseLayout` (sin request JS extra).
- Animaciones ajustadas a propiedades compuestas (`transform/opacity`) y sin handlers `unload/beforeunload` (mejor compatibilidad con bfcache).
- `devToolbar` desactivado en `astro.config.mjs` para evitar ruido en auditorias cuando alguien mida en `dev`.
- `astro preview` no aplica compresion HTTP por defecto; para validar ese punto en local usa `preview:perf` o un deploy con CDN.

## Desarrollo local
1. Instalar dependencias:
```bash
npm install
```

2. Levantar entorno:
```bash
npm run dev
```

3. Abrir:
```text
http://localhost:4321
```

## Rutas de prueba
- `http://localhost:4321/es` (dev)
- `http://localhost:4322/es` (preview)
- `http://localhost:4322/en`
- `http://localhost:4322/ca`
- `http://localhost:4322/fr`
- `http://localhost:4322/es/projects`
- `http://localhost:4322/es/projects/atlas-ui`
- `http://localhost:4322/robots.txt`

## Deploy (sitio estatico)
El build genera salida estatica en `dist/`.

```bash
npm run build
```

Sube `dist/` a Netlify, Vercel (static), Cloudflare Pages o GitHub Pages.

## SEO
- `site` configurado en `astro.config.mjs` con `https://joelarnaud.com`
- Metadatos definidos en `src/layouts/BaseLayout.astro`
- Detalles de proyecto marcados como `og:type=article`

## Publicacion
Usa el checklist de release:
- [CHECKLIST_RELEASE.md](./CHECKLIST_RELEASE.md)
