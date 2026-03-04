# Deploy Nginx + HTTPS (`test.joelarnaud.com`)

## 1) Requisitos previos
- DNS `A/AAAA` de `test.joelarnaud.com` apuntando al servidor.
- Proyecto en: `/var/www/portfolio2026`
- Nginx instalado y activo.
- Certbot instalado (`python3-certbot-nginx` o `certbot` + plugin nginx).

## 2) Actualizar proyecto y build
```bash
cd /var/www/portfolio2026
git pull --ff-only
npm ci
npm run build
```

## 3) Instalar vhost HTTP (bootstrap)
```bash
sudo mkdir -p /var/www/certbot
sudo cp /var/www/portfolio2026/ops/nginx/test.joelarnaud.com.conf /etc/nginx/sites-available/test.joelarnaud.com.conf
sudo ln -sfn /etc/nginx/sites-available/test.joelarnaud.com.conf /etc/nginx/sites-enabled/test.joelarnaud.com.conf
sudo nginx -t
sudo systemctl reload nginx
```

## 4) Emitir certificado y forzar HTTPS
Opción recomendada (plugin nginx):
```bash
sudo certbot --nginx -d test.joelarnaud.com --redirect -m tu-email@dominio.com --agree-tos --no-eff-email
```

Si prefieres webroot:
```bash
sudo certbot certonly --webroot -w /var/www/certbot -d test.joelarnaud.com -m tu-email@dominio.com --agree-tos --no-eff-email
```
Después añade manualmente el server HTTPS en Nginx con los paths de `/etc/letsencrypt/live/test.joelarnaud.com/`.

## 5) Validación
```bash
sudo nginx -t
sudo systemctl reload nginx
curl -I http://test.joelarnaud.com
curl -I https://test.joelarnaud.com
```

Esperado:
- HTTP redirige a HTTPS (301/308)
- HTTPS responde 200

## 6) Renovación automática
```bash
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
```

