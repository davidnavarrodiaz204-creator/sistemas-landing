# FACTUSYS — Brand Guide

## Identidad de Marca

FACTUSYS es un SaaS moderno para negocios peruanos: ferreterías, restaurantes, tiendas y retail.
La marca debe transmitir: **premium, tecnológico, moderno, confiable, minimalista**.

### Estructura

| Nivel | Nombre |
|-------|--------|
| Empresa principal | **FACTUSYS** |
| Subproducto 1 | **FACTUSYS FERRO** |
| Subproducto 2 | **FACTUSYS RESTO** |

---

## Paleta Oficial

| Color | Hex | Uso |
|-------|-----|-----|
| Negro profundo | `#000000` | Fondo principal |
| Superficie oscura | `#0a0a0f` | Cards, secciones |
| Azul oscuro | `#0a1628` | Acentos secundarios |
| Verde neón | `#00e676` | CTAs, acentos, highlights |
| Blanco | `#ffffff` | Texto principal |
| Gris 300 | `#d4d4d8` | Texto secundario |
| Gris 400 | `#a1a1aa` | Texto terciario |
| Gris 500 | `#71717a` | Metadatos, footnotes |
| Gris 800 | `#27272a` | Bordes sutiles |

### Prohibido
- Colores random / no definidos
- Degradados exagerados
- Colores chillones (rojo puro, amarillo neón, etc.)
- Sombras pesadas

---

## Tipografía

| Propiedad | Valor |
|-----------|-------|
| Fuente principal | **Inter** (Google Fonts) |
| Variable CSS | `--font-inter` |
| Títulos | Bold, tracking-tight, tamaños grandes |
| Cuerpo | Font-light o font-normal, leading-relaxed |
| Mono | No usar (reservado para código) |

### Jerarquía
- H1: 3xl-7xl, bold, tracking-tight
- H2: 3xl-5xl, bold
- H3: base-lg, semibold
- Body: base, light o normal
- Small: xs-sm, muted

---

## Logo

### Isotipo (Mark)
Cuadrado redondeado `rx=8` con abstracción de la letra "F" formada por 3 barras rectangulares.
Acento: círculo verde neón en esquina inferior derecha.

### Logo Horizontal
Isotipo + "FACTUSYS" en bold + tagline "SaaS para tu negocio".

### Variantes
- **Dark**: Mark blanco + texto blanco (fondo negro)
- **Light**: Mark negro + texto negro (fondo blanco) — no implementado aún
- **Neon**: Mark verde neón + texto blanco + tagline verde neón

### Archivos
- `src/components/BrandLogo.tsx` — Componentes React
- `src/app/icon.svg` — Favicon SVG

---

## Componentes Reutilizables

| Componente | Archivo | Descripción |
|------------|---------|-------------|
| FactusysMark | `BrandLogo.tsx` | Isotipo SVG |
| FactusysMarkNeon | `BrandLogo.tsx` | Isotipo verde neón |
| FactusysLogo | `BrandLogo.tsx` | Logo horizontal (dark/light) |
| FactusysLogoNeon | `BrandLogo.tsx` | Logo horizontal neón |

### Clases CSS utilitarias (globals.css)
- `.btn-neon` — Botón verde neón con hover glow
- `.btn-outline` — Botón outline blanco
- `.brand-neon-glow` — Sombra glow verde
- `.brand-gradient-text` — Texto gradiente blanco→gris
- `.brand-section-label` — Label de sección (badge outline neon)
- `.bg-neon-glow` — Radial glow verde

---

## Tono de Voz

- Profesional pero cercano
- Directo, sin rodeos
- Enfocado en beneficios para el negocio peruano
- Usar "tú" (no "usted")
- Evitar jerga técnica innecesaria
- Frases cortas y contundentes

### Ejemplos
- ✅ "Sistemas POS inteligentes para negocios que quieren vender más"
- ✅ "Controla tu caja, inventario y facturación desde un solo lugar"
- ❌ "Nuestra plataforma integral de soluciones omnicanal"
- ❌ "Maximiza la eficiencia operativa de tu negocio"

---

## Redes Sociales — Guía Visual

### Estilo General
- Fondo oscuro siempre (`#000000` o `#0a0a0f`)
- Texto blanco con jerarquía clara
- Acento verde neón (`#00e676`) para CTAs y highlights
- Sin emojis exagerados (usar icons minimalist style)
- Sin fotos de stock genéricas
- Mockups del sistema real

### Posts (Feed)
- Composición: texto grande + mockup o gráfico abstracto
- Título en blanco bold + verde neón para palabras clave
- Subtítulo en gris claro
- Formato: 1080×1080px
- Marca: isotipo FACTUSYS en esquina superior derecha, logo en footer

### Stories
- Fondo oscuro sólido o gradiente sutil
- Texto grande y legible (Inter Bold)
- Verde neón para highlights
- Formato: 1080×1920px (9:16)
- CTA al final

### Portada Facebook
- 1640×624px
- Logo + tagline + CTA a la izquierda
- Grid de features a la derecha (escritorio)

### Foto de Perfil
- 1080×1080px
- Isotipo FACTUSYS centrado sobre fondo oscuro con glow verde

---

## Kit de Redes Sociales — Componentes

### Ruta de preview
Visita `/social-kit` para ver todas las piezas en galería.

### Componentes disponibles
| Componente | Archivo | Descripción |
|------------|---------|-------------|
| `SocialCanvas` | `social/SocialCanvas.tsx` | Lienzo base con dimensiones exactas |
| `NeonBadge` | `social/NeonBadge.tsx` | Badge green neon outline |
| `LaptopMockup` | `social/MockupFrame.tsx` | Marco de laptop con barra macOS |
| `PhoneMockup` | `social/MockupFrame.tsx` | Marco de celular con notch |
| `PostPos` → `PostRestaurante` | `social/SocialPosts.tsx` | 6 posts 1080×1080 |
| `StoryDemo`, `StorySunat`, `StoryControl` | `social/SocialStories.tsx` | 3 historias 1080×1920 |
| `FacebookCoverMain` | `social/FacebookCover.tsx` | Portada 1640×624 |
| `ProfileAvatarMain` | `social/FacebookCover.tsx` | Avatar 1080×1080 |

### Piezas incluidas

| # | Pieza | Copy principal | Formato |
|---|-------|---------------|---------|
| 1 | Post POS Rápido | "Vende rápido. Cobra fácil." | 1080×1080 |
| 2 | Post Inventario | "Controla tu stock en tiempo real." | 1080×1080 |
| 3 | Post Caja | "Caja clara. Negocio seguro." | 1080×1080 |
| 4 | Post Reportes | "Decide con datos reales." | 1080×1080 |
| 5 | Post Auditoría | "Mira todo lo que hacen tus usuarios." | 1080×1080 |
| 6 | Post Restaurante | "Pedidos, mesas y cocina en orden." | 1080×1080 |
| 7 | Historia Demo | "Demo gratis" | 1080×1920 |
| 8 | Historia SUNAT | "Compatible con SUNAT" | 1080×1920 |
| 9 | Historia Control | "Control total" | 1080×1920 |
| 10 | Portada Facebook | FACTUSYS POS + ERP | 1640×624 |
| 11 | Foto de perfil | Isotipo FACTUSYS | 1080×1080 |

### Cómo exportar
1. Abrir `/social-kit`
2. Hacer clic en la pieza deseada
3. Tomar captura de pantalla (o usar DevTools → Capture node screenshot)
4. Subir directamente a la red social

### Assets exportables
Las piezas están en `src/components/social/` como componentes React listos para renderizar y capturar.
