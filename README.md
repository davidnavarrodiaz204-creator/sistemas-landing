# POS Perú Digital - Landing Page

Landing page moderna y optimizada para conversión de sistemas POS y ERP en Perú.

## Tecnologías

- Next.js 16
- TypeScript
- TailwindCSS
- Framer Motion
- Lucide React

## Características

- Diseño Apple/SaaS premium
- 100% responsive (móvil, tablet, desktop)
- Animaciones suaves con Framer Motion
- Optimizada para conversión (ventas)
- Prueba social y FAQ
- Navegación suave
- Glassmorphism oscuro

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
   NEXT_PUBLIC_WHATSAPP_NUMBER=51999999999
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
    ├── ComoFunciona.tsx
    ├── PruebaSocial.tsx
    ├── Planes.tsx
    ├── FAQ.tsx
    ├── Contacto.tsx
    └── Footer.tsx
```

## Secciones

1. Hero - Título, subtítulo, botones de demo y WhatsApp
2. Beneficios - 9 beneficios clave
3. Productos - FERROPOS ERP y Restaurante POS
4. Cómo funciona - 4 pasos
5. Prueba Social - Negocios que usan el sistema
6. Planes - Inicio, Pro, Premium
7. FAQ - 8 preguntas frecuentes
8. Contacto - WhatsApp y correo
