'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FactusysLogoNeon } from '@/components/BrandLogo';
import InternalGuard from '@/components/InternalGuard';
import {
  Copy, Check, Search, Star, Sparkles, Film, FileText,
  Lightbulb, Monitor, MessageCircle, ClipboardList, BookOpen,
  ChevronRight, Plus, Minus, Clock, Hash, Zap
} from 'lucide-react';

/* ─── HOOK ─── */

const FAV_KEY = 'factusys_reels_favs';
const COUNT_KEY = 'factusys_reels_count';
const PROGRESS_KEY = 'factusys_reels_progress';

function useFavorites() {
  const [favs, setFavs] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch { return []; }
  });
  const toggle = useCallback((id: string) => {
    setFavs(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem(FAV_KEY, JSON.stringify(next));
      return next;
    });
  }, []);
  return { favs, toggle };
}

/* ─── COPY ─── */

function CopyBtn({ text, small }: { text: string; small?: boolean }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* */ }
  };
  return (
    <button onClick={handle} className={`flex items-center gap-1.5 rounded-lg font-medium transition-all duration-300 cursor-pointer border-none ${copied ? 'bg-[#00e676]/20 text-[#00e676]' : 'bg-white/[0.06] text-gray-400 hover:bg-white/[0.1] hover:text-white'} ${small ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'}`}>
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  );
}

/* ─── DATA ─── */

const hooksVirales = [
  '¿Todavía vendes con cuaderno?',
  'Tu negocio pierde dinero y no lo sabes',
  'Así modernizamos una ferretería',
  'Lo que ningún POS peruano te muestra',
  'Mira cómo controlamos una pollería',
  'SUNAT + caja + inventario en un solo sistema',
  'Tu restaurante necesita esto',
  'El problema NO es vender, es controlar',
  '¿Sabes cuánto vendiste ayer?',
  'Así facturas SUNAT en 5 segundos',
  'Adiós a los papelitos en cocina',
  'Controla tu negocio desde tu celular',
  '¿Todavía usas calculadora para cuadrar caja?',
  'Lo que pasa en tu negocio cuando no miras',
  'La forma más fácil de facturar en Perú',
  'Tu ferretería se merece un sistema moderno',
  'Esto es lo que NO te cuentan de los POS',
  '¿Cuánto tiempo pierdes cuadrando caja?',
  'Así funciona un restaurante sin papel',
  'Tu competencia ya se digitalizó',
  'El sistema que todo negocio peruano necesita',
  '¿Problemas con SUNAT? Esto te interesa',
  'La digitalización no es cara, es necesaria',
  'Mira esto antes de comprar un POS',
  'Tu caja no cuadra por esta razón',
  '¿Sabes cuánto inventario te roban?',
  'De la libreta al sistema en 48 horas',
  'Esto cambia todo para tu restaurante',
  'El error que cometes al facturar',
  'Tu página web puede vender 24/7',
  'Así duplicamos las ventas de una ferretería',
  'No es un gasto, es una inversión',
  'Tu negocio merece datos, no suposiciones',
  'La verdad sobre los sistemas POS baratos',
  '¿Todavía anotas pedidos en papel?',
  'Esto es lo que necesitas para facturar',
  'Tu negocio sin internet puede seguir vendiendo',
  'El secreto de los negocios que crecen',
  'Así se moderniza un negocio en Perú',
  'Lo primero que debes hacer para digitalizar tu negocio',
  '¿Sabes qué producto te deja más plata?',
  'No más pérdidas por inventario desordenado',
  'Tu facturación electrónica está a un clic',
  '¿Restaurante? Esto te va a interesar',
  'El sistema que usan los que crecen',
  'Digitalizar no es complicado',
  'Tu negocio puede ser más rentable',
  'Esto es FACTUSYS en 30 segundos',
  'La herramienta que todo dueño de negocio necesita',
  '¿Cuánto vale tener el control de tu negocio?',
];

const guionesReels = [
  {
    title: 'Ventas con cuaderno vs FACTUSYS',
    hook: '¿Todavía vendes con cuaderno?',
    scene1: 'Mostrar cuaderno rayado, anotaciones desordenadas.',
    scene2: 'Mostrar FACTUSYS FERRO en tablet: venta rápida, producto, precio, total.',
    scene3: 'Mostrar ticket impreso y stock actualizado automáticamente.',
    cta: 'Escribe DEMO GRATIS y te muestro cómo funciona.',
  },
  {
    title: 'Facturar SUNAT en 5 segundos',
    hook: 'Así facturas SUNAT en 5 segundos.',
    scene1: 'Persona estresada facturando a mano.',
    scene2: 'Mostrar pantalla de FACTUSYS: seleccionar productos, ingresar RUC, clic.',
    scene3: 'Boleta/factura emitida. Mostrar vista previa.',
    cta: 'Solicita tu demo y factura sin estrés.',
  },
  {
    title: 'Cocina sin papel',
    hook: 'Adiós a los papelitos en cocina.',
    scene1: 'Cocina llena de papeles, meseras corriendo.',
    scene2: 'Mostrar FACTUSYS RESTO: pedido en pantalla de cocina.',
    scene3: 'Cocina organizada, pedidos claros, sin errores.',
    cta: 'Moderniza tu restaurante. Escribe RESTO.',
  },
  {
    title: 'Caja que cuadra sola',
    hook: '¿Tu caja nunca cuadra?',
    scene1: 'Persona contando billetes, calculadora, papel, frustración.',
    scene2: 'Mostrar FACTUSYS: apertura, ventas del día, egresos, cierre.',
    scene3: 'Todo cuadra solo. Sonrisa de alivio.',
    cta: 'Prueba FACTUSYS gratis y olvídate del desorden.',
  },
  {
    title: 'Inventario en tiempo real',
    hook: '¿Sabes cuánto tienes en stock AHORA MISMO?',
    scene1: 'Persona buscando producto en estantes, no encuentra.',
    scene2: 'Mostrar FACTUSYS en celular: stock actualizado, alertas de quiebre.',
    scene3: 'Compras a tiempo, pérdidas cero.',
    cta: 'Controla tu inventario desde tu celular.',
  },
  {
    title: 'Antes y después',
    hook: 'Mira la diferencia cuando usas FACTUSYS.',
    scene1: 'Antes: cuaderno, calculadora, factura manual, desorden.',
    scene2: 'Después: FACTUSYS, un clic, ticket, stock, SUNAT.',
    scene3: 'Dueño relajado viendo reportes en su celular.',
    cta: '¿Listo para el cambio? Escribe FACTUSYS.',
  },
  {
    title: 'Tu negocio sin internet',
    hook: 'Se fue el internet, ¿y tu sistema?',
    scene1: 'Persona preocupada, internet caído.',
    scene2: 'Mostrar FACTUSYS funcionando sin conexión.',
    scene3: 'Sincronización automática cuando vuelve el internet.',
    cta: 'FACTUSYS no para. Tu negocio tampoco.',
  },
  {
    title: 'Reportes que venden',
    hook: '¿Sabes qué producto te deja más plata?',
    scene1: 'Persona adivinando, sin datos claros.',
    scene2: 'Mostrar dashboard FACTUSYS: ventas por producto, ganancias, horarios.',
    scene3: 'Dueño tomando decisiones con datos reales.',
    cta: 'Decide con datos. Solicita tu demo.',
  },
  {
    title: 'Multi-usuario',
    hook: 'Varias personas, un solo control.',
    scene1: 'Cajero, cocina, administrador, dueño. Cada uno con su información.',
    scene2: 'Mostrar perfiles en FACTUSYS: cada quien accede a lo que necesita.',
    scene3: 'Dueño ve todo desde su celular.',
    cta: 'Control total desde donde estés.',
  },
  {
    title: '48 horas',
    hook: 'De cero a vendiendo en 48 horas.',
    scene1: 'Time-lapse: instalación, configuración, carga de productos.',
    scene2: 'Capacitación rápida al equipo.',
    scene3: 'Primera venta con FACTUSYS.',
    cta: 'Implementación rápida. Resultados inmediatos.',
  },
  {
    title: 'Testimonial rápido',
    hook: '"Antes perdía plata. Ahora controlo todo."',
    scene1: 'Dueño de ferretería hablando a cámara.',
    scene2: 'Mostrar su negocio con FACTUSYS funcionando.',
    scene3: 'Él sonriendo, mostrando su celular con el dashboard.',
    cta: 'Ellos ya lo hicieron. Tú puedes también.',
  },
  {
    title: 'Ferretería digital',
    hook: 'Tu ferretería puede ser 100% digital.',
    scene1: 'Ferretería tradicional, todo manual.',
    scene2: 'Mostrar FACTUSYS FERRO: ventas, inventario, clientes.',
    scene3: 'Dueño revisando reportes desde casa.',
    cta: 'FACTUSYS FERRO. Hecho para ferreterías.',
  },
  {
    title: 'Restaurante moderno',
    hook: 'Un restaurante sin papel es posible.',
    scene1: 'Restaurante en hora punta, meseras con papeles.',
    scene2: 'FACTUSYS RESTO: pedidos a cocina automáticos, mesas organizadas.',
    scene3: 'Servicio rápido, clientes contentos.',
    cta: 'FACTUSYS RESTO. Orden que se nota.',
  },
  {
    title: 'Página web + POS',
    hook: 'Tu negocio también necesita vender online.',
    scene1: 'Cliente buscando negocio en Google, no encuentra.',
    scene2: 'Mostrar página web profesional creada por FACTUSYS.',
    scene3: 'Cliente encuentra el negocio, pide cotización, compra.',
    cta: 'POS + Web. Tu negocio completo.',
  },
  {
    title: 'Objeción precio',
    hook: '"Está caro." Mira, mejor piensa en esto.',
    scene1: 'Persona dudando por el precio.',
    scene2: 'Mostrar todo lo que incluye FACTUSYS (POS, inventario, caja, SUNAT, reportes).',
    scene3: 'Mostrar cuánto ahorra al mes vs. pérdidas actuales.',
    cta: 'Invierte en tu negocio. Pide tu demo.',
  },
  {
    title: 'SUNAT fácil',
    hook: 'Facturar SUNAT nunca fue tan fácil.',
    scene1: 'Persona confundida con formularios SUNAT.',
    scene2: 'Mostrar FACTUSYS: seleccionar tipo, llenar datos, emitir.',
    scene3: 'Comprobante emitido, todo en regla.',
    cta: 'Sin vueltas. FACTUSYS y SUNAT integrados.',
  },
  {
    title: 'Todo en uno',
    hook: '¿Cuántos programas usas para tu negocio?',
    scene1: 'Persona alternando entre Excel, calculadora, facturador, cuaderno.',
    scene2: 'Mostrar FACTUSYS: POS, inventario, caja, SUNAT, reportes.',
    scene3: 'Todo en un solo lugar, una sola pantalla.',
    cta: 'Un solo sistema. Un solo control.',
  },
  {
    title: 'Escalabilidad',
    hook: '¿Y si abres otra sucursal?',
    scene1: 'Persona pensando en expandir su negocio.',
    scene2: 'Mostrar FACTUSYS multi-sucursal, mismo control.',
    scene3: 'Todas las tiendas en un solo panel.',
    cta: 'FACTUSYS crece contigo.',
  },
  {
    title: 'Cliente feliz',
    hook: 'La mejor publicidad es un cliente contento.',
    scene1: 'Cliente pagando rápido, recibe su ticket, agradece.',
    scene2: 'Mostrar cómo FACTUSYS agiliza la atención.',
    scene3: 'Cliente vuelve porque el servicio mejoró.',
    cta: 'Mejora tu servicio con FACTUSYS.',
  },
  {
    title: 'Automatización',
    hook: 'Deja que el sistema haga el trabajo pesado.',
    scene1: 'Persona haciendo tareas repetitivas: cuadrar caja, revisar stock, facturar.',
    scene2: 'Mostrar automatización en FACTUSYS: cierre automático, alertas de stock.',
    scene3: 'Persona enfocada en hacer crecer su negocio.',
    cta: 'Automatiza lo repetitivo. Enfócate en crecer.',
  },
  {
    title: 'Digitalización para todos',
    hook: 'Digitalizar no es solo para empresas grandes.',
    scene1: 'Pequeña ferretería de barrio.',
    scene2: 'Mostrar FACTUSYS funcionando en el negocio.',
    scene3: 'Dueño orgulloso mostrando su sistema.',
    cta: 'FACTUSYS es para tu negocio, sin importar el tamaño.',
  },
  {
    title: 'Control total',
    hook: 'Mira todo lo que puedes controlar desde tu celular.',
    scene1: 'Dueño fuera del negocio, preocupado.',
    scene2: 'Mostrar app FACTUSYS en celular: ventas, caja, stock, reportes.',
    scene3: 'Dueño tranquilo viendo que todo está bien.',
    cta: 'Tu negocio en la palma de tu mano.',
  },
  {
    title: 'La diferencia FACTUSYS',
    hook: 'Esto es lo que hace diferente a FACTUSYS.',
    scene1: 'Lista rápida: hecho en Perú, para negocios peruanos.',
    scene2: 'Funciona sin internet, SUNAT integrado, soporte real.',
    scene3: 'Dueño contento recomendando FACTUSYS.',
    cta: 'FACTUSYS. Hecho para ti.',
  },
  {
    title: 'Empieza hoy',
    hook: '¿Para qué esperar? Empieza hoy.',
    scene1: 'Persona postergando la decisión.',
    scene2: 'Mostrar lo fácil que es empezar: demo, configuración, capacitación.',
    scene3: 'Negocio funcionando con FACTUSYS, dueño tranquilo.',
    cta: 'El mejor momento es ahora. Escribe YA.',
  },
  {
    title: 'Landing page',
    hook: 'Tu negocio en Google empieza con una landing page.',
    scene1: 'Persona buscando un servicio en Google.',
    scene2: 'Mostrar landing page profesional creada por FACTUSYS.',
    scene3: 'Cliente encuentra, cotiza, contrata.',
    cta: 'Landing page profesional. Más clientes.',
  },
];

const ideasContent = [
  { category: 'Ferretería', ideas: [
    'Cómo controlar el inventario de tu ferretería',
    'Vende más en tu ferretería con un POS',
    'Los productos más robados y cómo controlarlos',
    'Facturación SUNAT para ferreterías',
    'Organiza tu ferretería con tecnología',
  ]},
  { category: 'Restaurante', ideas: [
    'Cómo organizar tu restaurante en hora punta',
    'Adiós a los papelitos en cocina',
    'Controla mesas, pedidos y facturación',
    'Restaurante digital: mito o realidad',
    'Comanda digital vs. papel',
  ]},
  { category: 'Landing pages', ideas: [
    'Por qué tu negocio necesita una landing page',
    'Landing page vs. redes sociales',
    'Cómo convertir visitantes en clientes',
    'Diseño web que vende',
    'Tu página web como sucursal digital',
  ]},
  { category: 'Automatización', ideas: [
    'Automatiza el cierre de caja',
    'Alertas automáticas de stock',
    'Facturación sin hacer nada',
    'Reportes automáticos a tu correo',
    'Menos trabajo manual, más ventas',
  ]},
  { category: 'Branding', ideas: [
    'La importancia de la imagen profesional',
    'Tu marca también se ve en tu sistema',
    'Consistencia visual en tu negocio',
    'Cliente confía en negocio ordenado',
    'Primera impresión digital',
  ]},
  { category: 'Tecnología', ideas: [
    'POS funciona sin internet',
    'Datos en la nube, siempre seguros',
    'Multi-sucursal: control total',
    'Seguridad de datos para tu negocio',
    'Tecnología peruana para negocios peruanos',
  ]},
];

const textosPantalla = [
  'Compatible con SUNAT',
  'Ventas rápidas',
  'Control total',
  'Caja organizada',
  'Inventario automático',
  'Pedidos a cocina',
  'Dashboard en tiempo real',
  'Factura en 5 segundos',
  'Stock actualizado',
  'Cierre automático',
  'Reportes inteligentes',
  'Multi-usuario',
  'Sin internet funciona',
  'Soporte incluido',
  '48 horas',
  'Hecho en Perú',
  'Para tu negocio',
  'Todo en uno',
  'Digitaliza tu negocio',
  'Más control, menos pérdidas',
  'Vende más, trabaja menos',
  'Tu negocio en orden',
  'Datos, no suposiciones',
  'El sistema que crece contigo',
  'Moderno, simple, peruano',
];

const ctasList = [
  'Solicita tu demo gratis',
  'Escríbeme por WhatsApp',
  'Moderniza tu negocio hoy',
  'Mira el sistema funcionando',
  'Prueba FACTUSYS gratis',
  'Escribe DEMO GRATIS',
  'Contáctame sin compromiso',
  'Descubre cómo FACTUSYS te ayuda',
  'Empieza a controlar tu negocio',
  'Cuéntame de tu negocio',
  'Agenda una llamada rápida',
  'Recibe información por WhatsApp',
  'Prueba el sistema en vivo',
  'Digitaliza tu negocio ahora',
  'Solicita cotización',
  'Mira cómo funciona en tu rubro',
  'Hablemos de tu negocio',
  'El primer paso es la demo',
  'Transforma tu negocio con FACTUSYS',
  'Empieza hoy, paga después',
  'Sin compromiso, solo resultados',
  'Tu demo te espera',
];

const checklistGrabacion = [
  { id: 'c1', label: 'Definir hook y guión' },
  { id: 'c2', label: 'Preparar escenario / fondo limpio' },
  { id: 'c3', label: 'Grabar pantalla del sistema (POS, dashboard, factura)' },
  { id: 'c4', label: 'Grabar toma del negocio / local' },
  { id: 'c5', label: 'Grabar toma de producto o servicio' },
  { id: 'c6', label: 'Grabar testimonio o reacción' },
  { id: 'c7', label: 'Grabar QR o link de contacto' },
  { id: 'c8', label: 'Grabar toma de cierre con CTA' },
  { id: 'c9', label: 'Editar en CapCut (transiciones, texto, música)' },
  { id: 'c10', label: 'Agregar textos en pantalla' },
  { id: 'c11', label: 'Agregar CTA visual' },
  { id: 'c12', label: 'Revisar duración (máx 45 seg)' },
  { id: 'c13', label: 'Subir a redes (Reels + Historia)' },
  { id: 'c14', label: 'Responder comentarios y mensajes' },
  { id: 'c15', label: 'Analizar métricas a las 24h' },
];

const estrategiaReels = [
  { title: 'Mejores horarios', icon: Clock, items: ['Lunes a viernes: 12:00 pm – 1:00 pm', 'Sábados: 10:00 am – 12:00 pm', 'Domingos: 6:00 pm – 8:00 pm'] },
  { title: 'Duración ideal', icon: Film, items: ['20 – 45 segundos máximo', 'Los primeros 3 segundos deben enganchar', 'Reels de 30 segundos tienen mejor retención'] },
  { title: 'Frecuencia recomendada', icon: Hash, items: ['Mínimo 3 reels por semana', 'Ideal: 1 reel diario', 'Publicar en hora pico para más alcance'] },
  { title: 'Hashtags recomendados', icon: Hash, items: ['#FACTUSYS', '#POSPerú', '#FacturaciónElectrónica', '#FerreteríaDigital', '#RestauranteModerno', '#SUNATPerú', '#NegociosPerú', '#TecnologíaPeruana'] },
  { title: 'Tipos de video', icon: Film, items: ['Demostración del sistema', 'Antes vs después', 'Testimonial de cliente', 'Tips rápidos', 'Respuesta a preguntas frecuentes', 'Comparación (vs Excel, vs cuaderno)'] },
  { title: 'Tips para grabar mejor', icon: Monitor, items: ['Usa buena iluminación (luz natural de frente)', 'Fondo limpio y ordenado', 'Habla claro y pausado', 'Muestra el sistema en acción', 'Usa texto en pantalla para reforzar', 'Música acorde al ritmo del video'] },
  { title: 'Cómo sonar profesional', icon: MessageCircle, items: ['Habla como si le explicaras a un amigo', 'Usa términos simples, no técnicos', 'Muestra confianza en lo que dices', 'Sonríe, la gente compra a personas', 'Termina siempre con un CTA claro'] },
];

/* ─── COMPONENTS ─── */

function TabBtn({ active, icon: Icon, label, onClick }: { active: boolean; icon: React.ComponentType<{ size?: number }>; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap cursor-pointer border-none ${active ? 'bg-[#00e676] text-black shadow-lg shadow-[#00e676]/20' : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'}`}>
      <Icon size={14} />
      <span>{label}</span>
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-white text-lg font-semibold mb-4">{children}</h2>;
}

function FavBtn({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`p-1.5 rounded-lg transition-all cursor-pointer border-none ${active ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-600 hover:text-gray-400'}`}>
      <Star size={13} fill={active ? 'currentColor' : 'none'} />
    </button>
  );
}

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative max-w-md">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="Buscar hooks, guiones..." className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder:text-gray-600 outline-none focus:border-[#00e676]/30 focus:bg-white/[0.06] transition-all" />
    </div>
  );
}

/* ─── TABS ─── */

function HooksTab({ search }: { search: string }) {
  const { favs, toggle } = useFavorites();
  const filtered = useMemo(() => hooksVirales.filter(h => h.toLowerCase().includes(search.toLowerCase())), [search]);
  return (
    <div>
      <SectionTitle>Hooks virales ({filtered.length})</SectionTitle>
      <p className="text-gray-500 text-xs mb-5">Usa estos hooks como apertura de tus reels. Enganchan en los primeros 3 segundos.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {filtered.map((h, i) => (
          <div key={i} className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 hover:border-[#00e676]/20 transition-all group">
            <FavBtn active={favs.includes(`hook-${i}`)} onClick={() => toggle(`hook-${i}`)} />
            <p className="flex-1 text-gray-300 text-sm">{h}</p>
            <CopyBtn text={h} small />
          </div>
        ))}
      </div>
    </div>
  );
}

function GuionesTab({ search }: { search: string }) {
  const { favs, toggle } = useFavorites();
  const filtered = useMemo(() => guionesReels.filter(g => g.title.toLowerCase().includes(search.toLowerCase()) || g.hook.toLowerCase().includes(search.toLowerCase())), [search]);
  return (
    <div>
      <SectionTitle>Guiones de reels ({filtered.length})</SectionTitle>
      <p className="text-gray-500 text-xs mb-5">25 guiones completos con hook, escenas y CTA. Copia cada sección por separado.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((g, i) => {
          const fullText = `HOOK: ${g.hook}\n\nESCENA 1: ${g.scene1}\n\nESCENA 2: ${g.scene2}\n\nESCENA 3: ${g.scene3}\n\nCTA: ${g.cta}`;
          return (
            <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 hover:border-[#00e676]/20 transition-all group">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-start gap-2">
                  <FavBtn active={favs.includes(`guion-${i}`)} onClick={() => toggle(`guion-${i}`)} />
                  <h3 className="text-white text-sm font-semibold">{g.title}</h3>
                </div>
                <CopyBtn text={fullText} small />
              </div>
              <div className="space-y-1.5 text-xs text-gray-400 ml-6">
                <p><span className="text-[#00e676] font-medium">Hook:</span> {g.hook}</p>
                <p><span className="text-gray-500">1.</span> {g.scene1}</p>
                <p><span className="text-gray-500">2.</span> {g.scene2}</p>
                <p><span className="text-gray-500">3.</span> {g.scene3}</p>
                <p className="pt-1"><span className="text-[#00e676] font-medium">CTA:</span> {g.cta}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IdeasTab() {
  return (
    <div>
      <SectionTitle>Ideas de contenido por categoría</SectionTitle>
      <p className="text-gray-500 text-xs mb-5">30 ideas organizadas por rubro. Úsalas para planificar tu calendario de reels.</p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ideasContent.map((cat, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 hover:border-[#00e676]/20 transition-all">
            <h3 className="text-[#00e676] text-sm font-semibold mb-3">{cat.category}</h3>
            <ul className="space-y-2">
              {cat.ideas.map((idea, j) => (
                <li key={j} className="flex items-start gap-2 text-gray-400 text-xs">
                  <ChevronRight size={12} className="text-gray-600 flex-shrink-0 mt-0.5" />
                  <span>{idea}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function TextosTab() {
  return (
    <div>
      <SectionTitle>Textos en pantalla para reels</SectionTitle>
      <p className="text-gray-500 text-xs mb-5">Textos cortos que aparecen en pantalla durante el reel. Refuerzan el mensaje visual.</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {textosPantalla.map((t, i) => (
          <div key={i} className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 hover:border-[#00e676]/20 transition-all group">
            <p className="flex-1 text-gray-300 text-sm">{t}</p>
            <CopyBtn text={t} small />
          </div>
        ))}
      </div>
    </div>
  );
}

function CTAsTab() {
  return (
    <div>
      <SectionTitle>Call to Actions ({ctasList.length})</SectionTitle>
      <p className="text-gray-500 text-xs mb-5">CTAs para el cierre de tus reels. Copia y pega al final de cada video.</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {ctasList.map((c, i) => (
          <div key={i} className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 hover:border-[#00e676]/20 transition-all group">
            <Zap size={14} className="text-[#00e676] flex-shrink-0" />
            <p className="flex-1 text-gray-300 text-sm">{c}</p>
            <CopyBtn text={c} small />
          </div>
        ))}
      </div>
    </div>
  );
}

function ChecklistTab() {
  const [checked, setChecked] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]'); } catch { return []; }
  });

  const toggleItem = (id: string) => {
    setChecked(prev => {
      const next = prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id];
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const pct = Math.round((checked.length / checklistGrabacion.length) * 100);

  return (
    <div>
      <SectionTitle>Checklist de grabación</SectionTitle>
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
          <div className="h-full bg-[#00e676] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-gray-400 text-xs font-mono">{checked.length}/{checklistGrabacion.length}</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {checklistGrabacion.map(item => (
          <button
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`flex items-center gap-3 text-left rounded-xl px-4 py-3 border transition-all cursor-pointer ${
              checked.includes(item.id)
                ? 'bg-[#00e676]/10 border-[#00e676]/30 text-[#00e676]'
                : 'bg-white/[0.02] border-white/[0.06] text-gray-400 hover:border-white/20'
            }`}
          >
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              checked.includes(item.id) ? 'bg-[#00e676] border-[#00e676]' : 'border-gray-600'
            }`}>
              {checked.includes(item.id) && <Check size={10} className="text-black" />}
            </div>
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function EstrategiaTab() {
  return (
    <div>
      <SectionTitle>Estrategia de reels</SectionTitle>
      <p className="text-gray-500 text-xs mb-5">Guía completa para crear reels que vendan. Horarios, duración, frecuencia y tips.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {estrategiaReels.map((item, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 hover:border-[#00e676]/20 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <item.icon size={16} className="text-[#00e676]" />
              <h3 className="text-white text-sm font-semibold">{item.title}</h3>
            </div>
            <ul className="space-y-1.5">
              {item.items.map((t, j) => (
                <li key={j} className="flex items-start gap-2 text-gray-400 text-xs">
                  <ChevronRight size={11} className="text-gray-600 flex-shrink-0 mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── REEL COUNTER ─── */

function ReelCounter() {
  const [count, setCount] = useState(() => {
    if (typeof window === 'undefined') return 0;
    try { return Number(localStorage.getItem(COUNT_KEY)) || 0; } catch { return 0; }
  });

  const adjust = (delta: number) => {
    const next = Math.max(0, count + delta);
    setCount(next);
    localStorage.setItem(COUNT_KEY, String(next));
  };

  return (
    <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2">
      <div className="text-right">
        <p className="text-2xl font-bold text-[#00e676] tabular-nums">{count}</p>
        <p className="text-gray-500 text-[10px] leading-tight">reels creados</p>
      </div>
      <div className="flex flex-col gap-1">
        <button onClick={() => adjust(1)} className="p-0.5 rounded bg-white/[0.06] hover:bg-white/[0.1] text-gray-400 transition cursor-pointer border-none"><Plus size={12} /></button>
        <button onClick={() => adjust(-1)} className="p-0.5 rounded bg-white/[0.06] hover:bg-white/[0.1] text-gray-400 transition cursor-pointer border-none"><Minus size={12} /></button>
      </div>
    </div>
  );
}

/* ─── PAGE ─── */

const tabs = [
  { id: 'hooks', label: 'Hooks', icon: Sparkles },
  { id: 'guiones', label: 'Guiones', icon: Film },
  { id: 'ideas', label: 'Ideas', icon: Lightbulb },
  { id: 'textos', label: 'Textos', icon: FileText },
  { id: 'ctas', label: 'CTAs', icon: MessageCircle },
  { id: 'checklist', label: 'Checklist', icon: ClipboardList },
  { id: 'estrategia', label: 'Estrategia', icon: BookOpen },
];

function ReelsStudioContent() {
  const [activeTab, setActiveTab] = useState('hooks');
  const [search, setSearch] = useState('');

  const renderTab = () => {
    switch (activeTab) {
      case 'hooks': return <HooksTab search={search} />;
      case 'guiones': return <GuionesTab search={search} />;
      case 'ideas': return <IdeasTab />;
      case 'textos': return <TextosTab />;
      case 'ctas': return <CTAsTab />;
      case 'checklist': return <ChecklistTab />;
      case 'estrategia': return <EstrategiaTab />;
      default: return null;
    }
  };

  return (
    <InternalGuard>
      <div className="min-h-screen bg-black pt-24 pb-20">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-[#00e676]/[0.03] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/[0.02] rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <FactusysLogoNeon />
              <div className="hidden sm:block w-px h-8 bg-white/[0.06]" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Reels Studio</h1>
                <p className="text-gray-500 text-xs">Crea, organiza y publica contenido viral</p>
              </div>
            </div>
            <ReelCounter />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex gap-1 overflow-x-auto pb-1 w-full sm:w-auto">
              <div className="flex bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 gap-0.5">
                {tabs.map(t => (
                  <TabBtn key={t.id} active={activeTab === t.id} icon={t.icon} label={t.label} onClick={() => setActiveTab(t.id)} />
                ))}
              </div>
            </div>
            {(activeTab === 'hooks' || activeTab === 'guiones') && (
              <SearchBar value={search} onChange={setSearch} />
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {renderTab()}
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 glass-card rounded-2xl p-5 border-white/[0.04]">
            <div className="flex items-start gap-3">
              <Sparkles size={16} className="text-[#00e676] flex-shrink-0 mt-0.5" />
              <p className="text-gray-500 text-xs leading-relaxed">
                Usa este panel para planificar tu contenido semanal de reels. 
                Marca tus favoritos, sigue el checklist de grabación y lleva la cuenta de reels publicados.
                Todo se guarda automáticamente en tu navegador.
              </p>
            </div>
          </div>
        </div>
      </div>
    </InternalGuard>
  );
}

export default function ReelsStudioPage() {
  return <ReelsStudioContent />;
}
