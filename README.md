# POS Perú Digital - Landing Page

Landing page moderna para sistemas POS y ERP en Perú.

## Tecnologías

- Next.js 15
- TypeScript
- TailwindCSS
- Lucide React

## Configuración

1. Clonar el repositorio
2. Copiar `.env.example` a `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

3. Editar `.env.local` con tus datos:
   ```
   NEXT_PUBLIC_DEMO_FERROPOS_URL=https://tu-demo-ferrepos.vercel.app
   NEXT_PUBLIC_DEMO_RESTAURANTE_URL=https://tu-demo-restaurante.vercel.app
   NEXT_PUBLIC_WHATSAPP_NUMBER=51987654321
   NEXT_PUBLIC_CONTACT_EMAIL=contacto@tudominio.com
   ```

## Desarrollo

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## Build

```bash
npm run build
```

## Despliegue en Vercel

1. Subir código a GitHub
2. Importar proyecto en [Vercel](https://vercel.com)
3. Configurar variables de entorno en Vercel:
   - `NEXT_PUBLIC_DEMO_FERROPOS_URL`
   - `NEXT_PUBLIC_DEMO_RESTAURANTE_URL`
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`
   - `NEXT_PUBLIC_CONTACT_EMAIL`
4. Desplegar

## Estructura

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
└── components/
    ├── Navbar.tsx
    ├── Hero.tsx
    ├── Beneficios.tsx
    ├── Productos.tsx
    ├── Planes.tsx
    ├── Contacto.tsx
    └── Footer.tsx
```
