# Rendimiento y SEO - 2026-10-22

## Medicion

Build de produccion local, no servidor de desarrollo. Lighthouse 13.5.0,
Chrome 155 y Node 24.19.0. Configuraciones mobile por defecto y desktop,
limitacion simulada de red/CPU, cache limpia y ejecuciones secuenciales.

| Pagina | Rendimiento movil inicial | Movil final | Escritorio final | SEO final |
| --- | ---: | ---: | ---: | ---: |
| `/es/` | 94 | 100 | 100 | 100 |
| `/es/projects/` | 93 | 100 | 100 | 100 |
| `/es/projects/weather-app/` | 99 | 100 | 100 | 100 |

Accesibilidad y buenas practicas: 100 en las seis pruebas finales.
SEO y escritorio ya puntuaban 100 antes de los cambios.
La repeticion inicial movil dio 95/96/99. Tras comprimir las respuestas y ajustar
la carga de estilos/scripts, las seis auditorias finales mantienen 100 en las
cuatro categorias. Son resultados de laboratorio, no garantias para usuarios reales.

Los avisos de solicitudes bloqueantes y arbol de dependencias de red pasan
en las seis auditorias: ninguna solicitud bloqueante y ahorro pendiente de 0 ms.

| Pagina | FCP movil final | LCP movil final | CLS | TBT |
| --- | ---: | ---: | ---: | ---: |
| Inicio | 0,81 s | 1,43 s | 0 | 0 ms |
| Listado | 0,84 s | 1,58 s | 0 | 0 ms |
| Detalle | 0,80 s | 1,05 s | 0 | 0 ms |

## Cambios

- `preview:perf` ahora comprime HTML, CSS y JS con Brotli/gzip, conservando SSR.
- Gzip configurado en los vhosts de Nginx de produccion y pruebas.
- Encabezado principal `h1` y titulos `h2` en el listado, sin cambiar texto ni estilos.
- HTML y CSS del inicio: aproximadamente 233 KiB -> 39 KiB transferidos (83% menos).
- CSS generado integrado en el HTML mediante `build.inlineStylesheets: "always"`:
  elimina la peticion bloqueante sin retrasar la aplicacion de estilos.
- Scripts de entrada de Astro menores de 8 KiB integrados por el bundler:
  elimina la peticion del listado; imagenes, fuentes y otros recursos mantienen
  el limite de inlining predeterminado de Vite.
- HTML/CSS/JS del inicio tras este ultimo ajuste: 39.957 -> 39.200 bytes;
  listado: 36.478 -> 35.365 bytes, con una sola peticion en lugar de dos/tres.
- No se han cambiado imagenes, colores, textos, traducciones ni destinos de enlaces.

## Validacion

- Build, content:check, i18n:check, check:links y git diff --check: correctos.
- `test:preview`: 17 pruebas, incluyendo limites del inlining, igualdad de bytes
  descomprimidos, cuatro idiomas, SSR, 404, HEAD, 304 y cache de recursos.
- Navegador: 24 paginas, 8 recorridos de busqueda con JS y 4 sin JS; sin errores.
- Verificados canonical, hreflang, idioma, robots y encabezados de las tres rutas
  en los cuatro idiomas. No se han enviado correos.
- Las 24 paginas comprobadas no solicitan CSS ni JS externos; estilos presentes
  en el documento y capturas movil/escritorio revisadas.

## Reproducir

```bash
pnpm run preview:perf
```

En otra terminal, con Node compatible con Lighthouse (se utilizo 24.19.0):

```bash
pnpm dlx lighthouse@13.5.0 http://127.0.0.1:4322/es/ --chrome-flags="--headless" --output=html --output=json --output-path=/tmp/portfolio-mobile
pnpm dlx lighthouse@13.5.0 http://127.0.0.1:4322/es/ --preset=desktop --chrome-flags="--headless" --output=html --output=json --output-path=/tmp/portfolio-desktop
pnpm run test:preview
```

Repetir con `/es/projects/` y `/es/projects/weather-app/`.
Para comparar sin compresion, usar `pnpm run preview` sobre el mismo build.

## Limites

No se ha desplegado ni medido el dominio remoto. `start` y `preview` no incorporan
compresion propia: en produccion debe aportarla Nginx tras instalar la configuracion.
No se ha ejecutado `nginx -t`: Nginx no esta instalado en este equipo.
La vista previa negocia Brotli/gzip; los vhosts preparados utilizan gzip.
Antes de recargar el servidor remoto hay que validar su configuracion real.
Los estilos integrados se transfieren con cada documento y no tienen una cache
independiente entre paginas. Se prioriza la primera carga sin conexiones adicionales;
si crece la hoja CSS, convendra reevaluar su division por pagina.
Los apartados de desglose de LCP y terceros son informativos, no errores por si mismos.

Referencias: [compresion HTTP de Nginx](https://nginx.org/en/docs/http/ngx_http_gzip_module.html)
y [middleware compression](https://expressjs.com/en/resources/middleware/compression/).
Configuracion de estilos: [Astro inlineStylesheets](https://docs.astro.build/en/reference/configuration-reference/#buildinlinestylesheets).
