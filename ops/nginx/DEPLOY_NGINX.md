# Deploy Nginx + HTTPS + Astro Server (`test.joelarnaud.com`)

## 1) Requisitos previos
- DNS `A/AAAA` de `test.joelarnaud.com` apuntando al servidor.
- Proyecto en `/var/www/portfolio2026`.
- Node.js 20+ instalado.
- Nginx instalado y activo.
- Certbot instalado (`python3-certbot-nginx` o `certbot` + plugin nginx).

## 2) Actualizar proyecto e instalar dependencias
```bash
cd /var/www/portfolio2026
git pull --ff-only
npm ci
```

## 3) Configurar variables de entorno (Gmail SMTP + app)
Crear `/etc/portfolio2026.env`:

```bash
PORT=4321
HOST=127.0.0.1
GMAIL_USER=tu@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
CONTACT_TO=joelarnaudcarreras@gmail.com
CONTACT_SUBJECT_PREFIX=[Portfolio]
CONTACT_RATE_LIMIT_WINDOW_MS=600000
CONTACT_RATE_LIMIT_MAX=5
CONTACT_MIN_SUBMIT_MS=3000
```

Permisos recomendados:
```bash
sudo chown root:root /etc/portfolio2026.env
sudo chmod 600 /etc/portfolio2026.env
```

## 4) Build y servicio `systemd`
```bash
cd /var/www/portfolio2026
npm run build
sudo cp /var/www/portfolio2026/ops/systemd/portfolio2026.service /etc/systemd/system/portfolio2026.service
sudo systemctl daemon-reload
sudo systemctl enable --now portfolio2026
sudo systemctl status portfolio2026
```

## 5) Instalar vhost HTTP (bootstrap)
```bash
sudo mkdir -p /var/www/certbot
sudo cp /var/www/portfolio2026/ops/nginx/test.joelarnaud.com.conf /etc/nginx/sites-available/test.joelarnaud.com.conf
sudo ln -sfn /etc/nginx/sites-available/test.joelarnaud.com.conf /etc/nginx/sites-enabled/test.joelarnaud.com.conf
sudo nginx -t
sudo systemctl reload nginx
```

## 6) Emitir certificado y forzar HTTPS
Opción recomendada (plugin nginx):
```bash
sudo certbot --nginx -d test.joelarnaud.com --redirect -m tu-email@dominio.com --agree-tos --no-eff-email
```

Si prefieres webroot:
```bash
sudo certbot certonly --webroot -w /var/www/certbot -d test.joelarnaud.com -m tu-email@dominio.com --agree-tos --no-eff-email
```

## 7) Validación
```bash
sudo systemctl status portfolio2026
sudo nginx -t
sudo systemctl reload nginx
curl -I http://test.joelarnaud.com
curl -I https://test.joelarnaud.com
```

Esperado:
- HTTP redirige a HTTPS (301/308).
- HTTPS responde `200`.
- `journalctl -u portfolio2026 -n 100` sin errores de arranque.

## 8) Renovación automática
```bash
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
```
