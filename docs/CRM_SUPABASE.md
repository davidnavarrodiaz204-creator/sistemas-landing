# CRM Supabase

El CRM ya puede trabajar con dos proveedores de almacenamiento:

- `local`: usa `localStorage`, comportamiento actual y recomendado por defecto.
- `supabase`: usa la tabla `crm_prospects` vía REST de Supabase.

## Activar Supabase

1. Ejecuta `docs/CRM_SUPABASE_SCHEMA.sql` en el SQL Editor de Supabase.
2. Configura las variables:

```env
NEXT_PUBLIC_CRM_STORAGE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
```

Si `NEXT_PUBLIC_CRM_STORAGE=supabase` está activo pero falta URL o anon key, el CRM vuelve automáticamente a `localStorage`.

## Migrar desde CSV

1. En `/crm`, exporta el CSV actual.
2. Cambia las variables a Supabase y reinicia la app.
3. En `/crm`, usa “Importar CSV”.
4. Verifica en Supabase la tabla `crm_prospects`.

## Notas

- No se eliminó `localStorage`.
- La capa está en `src/lib/crm-storage`.
- `history` guarda datos flexibles como conversación, respuesta del cliente y acciones de WhatsApp/IA.
