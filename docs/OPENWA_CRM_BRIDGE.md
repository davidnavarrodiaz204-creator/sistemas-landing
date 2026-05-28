# OpenWA CRM Bridge

Esta fase deja FACTUSYS CRM preparado para integrarse con `rmyndharis/OpenWA` sin habilitar envios masivos.

## Arquitectura

- OpenWA corre separado del CRM.
- El CRM nunca guarda ni muestra `OPENWA_API_KEY` en el frontend.
- La landing/CRM en Vercel llama a una ruta interna: `/api/whatsapp/send`.
- Esa ruta interna llama al bridge OpenWA solo si las variables del servidor estan configuradas.

## Variables

```env
OPENWA_API_URL=http://localhost:2785/api
OPENWA_API_KEY=tu_api_key_del_bridge
```

En Vercel estas variables deben configurarse como variables de servidor, no como `NEXT_PUBLIC_*`.

## Produccion

Para produccion, OpenWA debe estar disponible desde el servidor donde corre el CRM:

- VPS recomendado, o
- PC encendida con tunnel/bridge seguro.

Si OpenWA no esta configurado, el CRM responde en modo simulacion y no envia mensajes reales.

## Seguridad comercial

- No usar envio masivo.
- Mantener limite de 15 mensajes nuevos por dia.
- No enviar a prospectos marcados como "No contactar".
- Todo envio debe tener confirmacion manual desde el CRM.
- Registrar cada respuesta del bridge en historial del prospecto antes de considerar el contacto como enviado.

## Endpoints preparados

- `GET /api/whatsapp/send`: prueba salud/estado del bridge.
- `POST /api/whatsapp/send`: valida datos, limite diario, permiso de contacto y confirmacion manual antes de llamar OpenWA.
