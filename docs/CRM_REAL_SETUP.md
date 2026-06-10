# CRM FACTUSYS — Guía de conexión real

## 1. PostgreSQL local

### Requisitos
- PostgreSQL 14+ instalado y corriendo
- Base de datos creada (ej: `factusys_crm`)

### Configuración
```env
DATABASE_URL=postgres://usuario:password@localhost:5432/factusys_crm
```

### Verificar
- Ir a `/crm/settings/channels`
- PostgreSQL debe mostrar **Conectado**
- Las tablas se crean automáticamente al iniciar el servidor

---

## 2. OpenWA (WhatsApp API)

### ¿Qué es OpenWA?
OpenWA es un bridge Node.js que expone una API HTTP para enviar/recibir mensajes de WhatsApp Web.

### Instalación rápida (Docker)
```bash
docker run -d \
  --name openwa \
  -p 3001:3001 \
  -e OPENWA_API_KEY=mi-clave-secreta \
  -v openwa_data:/app/data \
  ghcr.io/open-wa/wa-automate:latest
```

### Configuración en el CRM
```env
OPENWA_API_URL=http://localhost:3001
OPENWA_API_KEY=mi-clave-secreta
```

### Escanear QR
1. Iniciar OpenWA
2. Revisar logs: `docker logs -f openwa`
3. Aparecerá un QR en los logs (o en la consola web de OpenWA)
4. Abrir WhatsApp Web en el teléfono → escanear QR
5. Una vez conectado, el estado cambia a **connected**

### Probar envío
1. Ir a `/crm/settings/channels` → pestaña "Webhook tester"
2. Seleccionar WhatsApp, elegir mensaje de ejemplo
3. Hacer clic "Enviar prueba"
4. Ir a `/crm/inbox` para ver el resultado

### Probar recepción real
1. Configurar webhook en OpenWA para que apunte a:
   ```
   https://tu-dominio.com/api/crm/inbox/openwa
   ```
2. El payload debe ser:
   ```json
   { "action": "webhook", "phone": "51987454769", "message": "Hola, me interesa" }
   ```
3. El CRM recibe el mensaje, detecta intención, sugiere respuesta

---

## 3. SMTP/IMAP (Gmail)

### Configuración SMTP (enviar)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=factusys.peru@gmail.com
SMTP_PASS=contraseña-de-aplicacion
EMAIL_FROM=factusys.peru@gmail.com
```

### Configuración IMAP (recibir)
```env
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=factusys.peru@gmail.com
IMAP_PASS=contraseña-de-aplicacion
```

### Contraseña de aplicación (Gmail)
1. Ir a https://myaccount.google.com/security
2. Activar verificación en dos pasos
3. Ir a "Contraseñas de aplicaciones"
4. Crear una para "Correo" + "Dispositivo Windows"
5. Usar esa contraseña en SMTP_PASS e IMAP_PASS

### Probar
1. Ir a `/crm/settings/channels`
2. "Probar todo" → SMTP debe mostrar "Conectado"
3. IMAP debe mostrar "Conectado"

### Recibir correos
1. Enviar un correo a `factusys.peru@gmail.com` con asunto relacionado al sistema
2. El CRM puede recibirlo vía webhook o polling IMAP
3. Se crea un hilo en inbox con intención detectada

---

## 4. Meta (Facebook Messenger + Instagram Business)

### Configuración
```env
FACEBOOK_PAGE_ID=123456789
FACEBOOK_ACCESS_TOKEN=EAAx...token
INSTAGRAM_BUSINESS_ID=987654321
META_VERIFY_TOKEN=mi-token-verificacion
META_APP_SECRET=app-secret-de-meta
```

### Obtener tokens
1. Ir a [developers.facebook.com](https://developers.facebook.com)
2. Crear una app (tipo Business)
3. Productos → Messenger → Configurar
4. Conectar página de Facebook
5. Generar Page Access Token
6. Copiar Page ID y token

### Instagram Business
1. En la misma app de Facebook, agregar Instagram Basic Display
2. Conectar cuenta de Instagram Business
3. Copiar Instagram Business ID

### Webhook
1. En la app de Meta, ir a Webhooks → Messenger
2. URL de callback:
   ```
   https://tu-dominio.com/api/crm/inbox/meta
   ```
3. Token de verificación: el mismo que `META_VERIFY_TOKEN`
4. Suscribirse a `messages` y `messaging_optins`

### Probar
1. Ir a `/crm/settings/channels` → Webhook tester
2. Seleccionar Facebook o Instagram
3. Elegir mensaje de ejemplo
4. Verificar en inbox

---

## 5. Seguridad

### Variables de entorno obligatorias
```env
# Contraseña para entrar al CRM (antes era FACTUSYS2026 hardcodeada)
CRM_ACCESS_PASSWORD=mi-contraseña-segura

# Token para APIs internas (opcional, protege endpoints POST)
CRM_INTERNAL_TOKEN=token-secreto-para-apis
```

### Cómo funciona
- `CRM_ACCESS_PASSWORD`: Se valida contra el servidor (no queda en el frontend). Solo quien la tiene puede acceder a `/crm/*`.
- `CRM_INTERNAL_TOKEN`: Si se configura, todos los endpoints POST del CRM requieren el header `x-internal-token: <token>`. Los webhooks de OpenWA y Meta NO requieren este token (usan sus propios mecanismos de autenticación).

### Para usar el token desde scripts externos
```bash
curl -X POST https://tu-dominio.com/api/crm/prospects \
  -H "Content-Type: application/json" \
  -H "x-internal-token: $CRM_INTERNAL_TOKEN" \
  -d '{"action":"create","businessName":"Test","rubro":"Otro"}'
```

---

## 6. Webhooks públicos

Para que OpenWA y Meta envíen webhooks al CRM, necesitas una URL pública.

### Opciones
1. **Vercel/Netlify** (si ya está deployado): ya tienes URL pública
2. **ngrok** (desarrollo local):
   ```bash
   npx ngrok http 3000
   ```
   Usar la URL que ngrok genera

### Configurar
```env
PUBLIC_WEBHOOK_URL=https://tu-dominio.com
```

---

## 7. Pruebas con Webhook Tester

El tester interno permite simular mensajes entrantes sin conexiones reales:

1. Ir a `/crm/settings/channels` → pestaña "Webhook tester"
2. Seleccionar canal (WhatsApp, Facebook, Instagram, Email)
3. Elegir mensaje de ejemplo o escribir uno propio
4. Opcional: personalizar remitente y nombre
5. Hacer clic "Enviar prueba"
6. El resultado muestra:
   - Intención detectada
   - Confianza
   - Respuesta sugerida
7. Ir a `/crm/inbox` para ver el hilo creado

---

## 8. Backup

### Exportar
```http
GET /api/crm/backup
```
Requiere: `x-internal-token` (si configurado)

Devuelve JSON con todas las tablas del CRM.

### Importar
```http
POST /api/crm/backup
Content-Type: application/json
x-internal-token: <token>

{ "backup": { "prospects": [...], "follow_ups": [...], ... } }
```

---

## 9. Modo de respuesta

| Modo | Comportamiento |
|------|---------------|
| **Manual** | Solo copiar respuesta o abrir WhatsApp externo. No se envía desde el CRM. |
| **Copiloto** (default) | Se sugiere respuesta, David edita/aprueba y luego se envía. |
| **Automático limitado** | Responde automáticamente a **PIDE_DEMO**, **PIDE_PRECIO** y **PREGUNTA_FUNCIONES**. Máximo 5 respuestas al día. No responde si detecta insultos, reclamos o soporte. |

Configurar en: `/crm/settings/channels` → "Modo de respuesta"

---

## 10. Troubleshooting

| Problema | Causa probable | Solución |
|----------|---------------|----------|
| PostgreSQL no conecta | DATABASE_URL incorrecto | Verificar credenciales, que PostgreSQL esté corriendo |
| Login no funciona | CRM_ACCESS_PASSWORD no configurado | Agregar al .env, reiniciar servidor |
| OpenWA no conecta | OPENWA_API_URL/KEY incorrectos | Verificar que OpenWA esté corriendo: `curl http://localhost:3001/health` |
| Meta webhook falla | Token expirado | Regenerar Page Access Token |
| IMAP no conecta | Contraseña de aplicación incorrecta | Generar nueva contraseña de aplicación en Gmail |
| 401 en API calls | CRM_INTERNAL_TOKEN configurado pero no enviado | Incluir `x-internal-token` header |
| Auto-respuesta no funciona | Modo no es `automatico_limitado` | Cambiar modo en settings |
| Mensaje no aparece en inbox | Webhook no configurado o payload incorrecto | Usar tester interno para verificar |

---

## 11. Resumen de estados

| Componente | Real con credenciales | Simulado (fallback) |
|-----------|----------------------|---------------------|
| PostgreSQL | ✔️ Todas las operaciones | ❌ No funciona sin DATABASE_URL |
| OpenWA | ✔️ Enviar/recibir WhatsApp | ✔️ Simula envío, recibe webhook |
| SMTP | ✔️ Envía correos reales | ✔️ Marca como "simulado" |
| IMAP | ✔️ Lee bandeja de entrada | ❌ No disponible sin configurar |
| Meta | ✔️ Webhook + envío FB/IG | ✔️ Tester interno funciona |
| ReplyAssistant | ✔️ Siempre real (regex) | — |
| Channel logs | ✔️ Guarda en automation_logs | — |
| Auto-respuesta | ✔️ Lógica real | — |
