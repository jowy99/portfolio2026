# Joël Arnaud Portfolio

Portfolio construido con Astro + Tailwind v4, i18n por rutas y enfoque Astro-first (sin SPA ni React).

## Stack
- Astro 5 + TypeScript
- `@astrojs/node` (rutas API en servidor + páginas prerenderizadas)
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Content Collections (Markdown) para proyectos
- Resend para email transaccional (formulario de contacto)
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
npm run start
npm run preview
npm run compress:dist
npm run preview:perf
```

Puertos por defecto:
- `dev` -> `http://localhost:4321`
- `preview` -> `http://localhost:4322`
- `start` (server build) -> `http://localhost:4321` (o el puerto definido en `PORT`)

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

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

3. Rellenar al menos:
- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL`

4. Levantar entorno:
```bash
npm run dev
```

5. Abrir:
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

## Formulario de contacto (Resend)
- Endpoint backend: `POST /api/contact`
- Seguridad anti-spam incluida:
  - honeypot (`company`)
  - time-trap (`form_started_at`)
  - rate limit por IP (ventana configurable)
- Variables soportadas:
  - `RESEND_API_KEY`
  - `CONTACT_TO_EMAIL` (default: `joelarnaudcarreras@gmail.com`)
  - `CONTACT_FROM_EMAIL` (default: `Joël Arnaud Portfolio <onboarding@resend.dev>`)
  - `CONTACT_SUBJECT_PREFIX` (default: `[Portfolio]`)
  - `CONTACT_RATE_LIMIT_WINDOW_MS` (default: `600000`)
  - `CONTACT_RATE_LIMIT_MAX` (default: `5`)
  - `CONTACT_MIN_SUBMIT_MS` (default: `3000`)

Nota de Resend:
- Para pruebas iniciales puedes usar `onboarding@resend.dev`.
- En producción, configura un dominio remitente verificado y actualiza `CONTACT_FROM_EMAIL`.

## Deploy (Node + Nginx)
El build genera salida prerenderizada + server entrypoint Node.

```bash
npm run build
npm run start
```

En servidor Debian:
- Ejecuta `node dist/server/entry.mjs` (o `npm run start`) con `systemd/pm2`.
- Publica con Nginx como reverse proxy a `127.0.0.1:<puerto-node>`.
- Revisa guía en `ops/nginx/DEPLOY_NGINX.md`.

## SEO
- `site` configurado en `astro.config.mjs` con `https://joelarnaud.com`
- Metadatos definidos en `src/layouts/BaseLayout.astro`
- Detalles de proyecto marcados como `og:type=article`

## Publicacion
Usa el checklist de release:
- [CHECKLIST_RELEASE.md](./CHECKLIST_RELEASE.md)
