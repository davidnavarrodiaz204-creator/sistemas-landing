'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InternalGuard from '@/components/InternalGuard';
import { FactusysLogoNeon } from '@/components/BrandLogo';
import {
  Copy, Check, Calendar, Video, Share2,
  HelpCircle, ClipboardList, Clock, ChevronRight,
  FileText, MessageCircle
} from 'lucide-react';

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* fallback */ }
  };
  return (
    <button
      onClick={handle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 cursor-pointer border-none ${
        copied
          ? 'bg-[#00e676]/20 text-[#00e676]'
          : 'bg-white/[0.06] text-gray-400 hover:bg-white/[0.1] hover:text-white'
      }`}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  );
}

function CopySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-white text-base font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}

function CopyCard({ label, text }: { label: string; text: string }) {
  return (
    <div className="group bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 hover:border-[#00e676]/20 transition-all duration-300">
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-gray-300 text-sm font-medium leading-relaxed whitespace-pre-wrap">{label}</p>
        <CopyBtn text={`${label}\n\n${text}`} />
      </div>
      {text && (
        <p className="text-gray-500 text-xs leading-relaxed mt-2 pt-2 border-t border-white/[0.04]">
          {text}
        </p>
      )}
    </div>
  );
}

const tabs = [
  { id: 'calendar', label: 'Calendario', icon: Calendar },
  { id: 'posts', label: 'Posts', icon: FileText },
  { id: 'reels', label: 'Reels', icon: Video },
  { id: 'facebook', label: 'Facebook', icon: Share2 },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'objections', label: 'Objeciones', icon: HelpCircle },
  { id: 'checklist', label: 'Checklist', icon: ClipboardList },
];

/* ─── DATA ─── */

const calendarData = [
  { day: 'Lunes', theme: 'Producto / Funcionalidad', format: 'Post educativo + Reel' },
  { day: 'Martes', theme: 'Caso de uso / Problema-solución', format: 'Post carrusel' },
  { day: 'Miércoles', theme: 'Tips y consejos para negocio', format: 'Reel tips + Historia' },
  { day: 'Jueves', theme: 'Prueba social / Clientes felices', format: 'Testimonio + Post' },
  { day: 'Viernes', theme: 'Demo / Sistema en acción', format: 'Reel demo + Post' },
  { day: 'Sábado', theme: 'Venta directa / Promoción', format: 'Post venta + Historia' },
  { day: 'Domingo', theme: 'Reflexión / Valor de marca', format: 'Historia + Post inspiracional' },
];

const scheduleData = [
  { time: '7:00 am', platform: 'Facebook / feed', intent: 'Educativo / tips' },
  { time: '12:00 pm', platform: 'Instagram / feed', intent: 'Casos de uso / demos' },
  { time: '6:00 pm', platform: 'Instagram / historia', intent: 'Interacción rápida' },
  { time: '8:00 pm', platform: 'Facebook / historia', intent: 'Recordatorio / CTA' },
];

const postIdeas = [
  { title: 'Por que tu ferreteria necesita un sistema POS', text: 'Si aun anotas ventas en cuaderno, estas perdiendo plata. Con FACTUSYS FERRO controlas cada clavo, cada herramienta y cada sol. Stock en tiempo real. Cierre de caja automatico. Factura SUNAT en segundos.' },
  { title: 'El error mas comun en restaurantes', text: 'Perder pedidos en hora punta es perder clientes. Con FACTUSYS RESTO los pedidos van directo a cocina. Sin papelitos. Sin confusiones. Mesas, comandas y factura en un solo sistema.' },
  { title: 'Cuanto pierdes si no controlas tu inventario', text: 'Robo interno, vencimientos, compras duplicadas. El desorden en stock te cuesta mas de lo que crees. FACTUSYS te da control total de entradas y salidas en tiempo real.' },
  { title: 'La caja diaria ya no deberia tomarte mas de 5 minutos', text: 'Con FACTUSYS el arqueo es automatico. Apertura, ingresos, egresos y cierre. Todo cuadra solo. Adios horas contando billetes.' },
  { title: 'Facturar SUNAT no deberia ser un dolor de cabeza', text: 'Con FACTUSYS emites boletas y facturas electronicas con un clic. Integrado con Nubefact. Listo para SUNAT. Sin tecnicismos.' },
  { title: 'Tu negocio merece datos, no suposiciones', text: 'Saber que producto se vende mas, que hora facturas mas, que metodo de pago prefieren. FACTUSYS te da reportes claros para decidir mejor.' },
  { title: 'Si tu sistema no funciona sin internet, no es un sistema serio', text: 'FACTUSYS opera offline y sincroniza cuando vuelves a tener conexion. Tu negocio no para, tu venta no se pierde.' },
  { title: 'La数字izacion no es para empresas grandes', text: 'Una ferreteria de barrio, una polleria de esquina, un restaurante familiar. Todos pueden usar FACTUSYS. Simple, rapido, desde S/ X al mes.' },
  { title: 'Por que FACTUSYS FERRO es diferente', text: 'No es un POS generico. Fue construido pensando en ferreterias, electronica y tiendas de retail. Con logica de inventario real, no de supermercado.' },
  { title: 'Por que FACTUSYS RESTO es diferente', text: 'No es una caja registradora. Es un sistema de restaurante: mesas, pedidos, cocina, comanda digital y factura. Todo integrado.' },
  { title: 'De la libreta al sistema en 48 horas', text: 'Implementamos FACTUSYS en tu negocio en menos de 2 dias. Te capacitamos. Y al tercer dia ya estas vendiendo con control total.' },
  { title: 'Clientes que vuelven porque el servicio mejoro', text: 'Cuando el pedido llega rapido y la cuenta esta correcta, el cliente vuelve. FACTUSYS te ayuda a dar ese nivel de servicio.' },
  { title: 'Que puede hacer un sistema POS por tu negocio', text: 'Vender mas rapido. Controlar tu caja. Saber tu inventario. Facturar sin errores. Tener reportes. En resumen: trabajar menos y ganar mas.' },
  { title: 'La facturacion electronica en Peru no es opcional', text: 'Desde 2025, mas negocios estan obligados a facturar electronicamente. Con FACTUSYS ya estas listo. Boleta y factura con un clic.' },
  { title: '5 senales de que necesitas un sistema POS', text: '1. No sabes cuanto vendiste ayer. 2. Tu inventario es un desorden. 3. Pierdes pedidos. 4. La caja no cuadra. 5. Facturas a mano. Si tienes 3 o mas, necesitas FACTUSYS.' },
  { title: 'No vendas mas, vende mejor', text: 'No se trata de tener mas clientes, sino de atender mejor a los que ya tienes. Con FACTUSYS cada venta es rapida, cada factura es correcta, cada cliente queda satisfecho.' },
  { title: 'Tu pagina web es tu nueva sucursal', text: 'Ademas de FACTUSYS, creamos landing pages y paginas web profesionales para tu negocio. Presencia digital que vende las 24 horas.' },
  { title: 'Automatiza lo repetitivo, enfocate en lo importante', text: 'FACTUSYS automatiza cierre de caja, reportes, facturacion y alertas de stock. Tu tiempo vale mas que estar haciendo tareas manuales.' },
  { title: 'La competencia ya se esta digitalizando', text: 'Mientras tu anotas en papel, otros negocios ya usan FACTUSYS y estan tomando decisiones con datos reales. No te quedes atras.' },
  { title: 'Casos de exito: Ferreteria que dejo de perder plata', text: 'Una ferreteria en Lima implemento FACTUSYS FERRO y redujo perdidas por inventario en un 40% en el primer mes. Control total de cada producto.' },
  { title: 'Casos de exito: Restaurante que acabo con el caos', text: 'Un restaurante en Arequipa empezo a usar FACTUSYS RESTO. Pedidos organizados, cocina sincronizada, caja cuadrada. El dueno ahora sale a comer con su familia.' },
  { title: 'Que incluye FACTUSYS (y que no)', text: 'Incluye: POS, inventario, caja, SUNAT, reportes, multiusuario, soporte. No incluye: contratos eternos, letra chica, costos ocultos.' },
  { title: 'El poder de los reportes en tu negocio', text: 'Saber cual producto deja mas ganancia, que dia vende mas, que empleado rinde mejor. FACTUSYS te muestra todo en graficos claros.' },
  { title: 'Multiples usuarios, un solo control', text: 'Con FACTUSYS puedes tener cajero, cocina, administrador y dueno. Cada quien con su acceso. Tu ves todo desde tu panel.' },
  { title: 'Tu negocio en la nube, siempre disponible', text: 'Todos tus datos respaldados automaticamente. Accede desde cualquier lugar. Si pasa algo con tu equipo, tu informacion esta segura.' },
  { title: 'De vendedor a empresario: el salto con FACTUSYS', text: 'Dejar de estar detras del mostrador y empezar a gestionar. FACTUSYS te da las herramientas para crecer sin volverte loco.' },
  { title: 'La atencion al cliente empieza con un buen sistema', text: 'Nada frustra mas a un cliente que esperar. Con FACTUSYS cada venta es en segundos. Tickets claros, precios correctos, vuelven.' },
  { title: 'Implementacion en 48 horas, soporte de por vida', text: 'Te instalamos, te capacitamos y te acompanamos. No te dejamos solo. FACTUSYS es socio de tu negocio.' },
  { title: 'Escalabilidad real: de 1 a 10 sucursales', text: 'FACTUSYS crece contigo. Una tienda, dos tiendas, diez tiendas. El mismo control, la misma simplicidad. Sin cambiar de sistema.' },
  { title: 'El mejor momento para digitalizarte fue ayer. El segundo mejor es hoy', text: 'Cada dia sin control es plata que podrias estar ganando. FACTUSYS esta listo para ti. Implementacion rapida. Resultados desde el dia 1.' },
];

const reelScripts = [
  {
    title: 'El problema del cuaderno',
    script: 'Abertura: "Si aun usas cuaderno para tus ventas, mira esto."\n\nPlano detalle de cuaderno rayado.\n\n"Anotas venta, borras, tachas, pierdes la cuenta."\n\nCorte a FACTUSYS FERRO en tablet.\n\n"Con FACTUSYS cada venta queda registrada, tu stock se actualiza solo y facturas SUNAT en segundos."\n\nCierre: "Deja el cuaderno. Prueba FACTUSYS gratis."',
  },
  {
    title: 'Caja que cuadra sola',
    script: 'Abertura: "Cuanto vendiste ayer?"\n\nReaccion de persona pensando.\n\n"Si no sabes exactamente, tienes un problema."\n\nMostrar pantalla de cierre de caja en FACTUSYS.\n\n"Con FACTUSYS sabes cuanto entro, cuanto salio y cuanto debe haber. Todo automatico."\n\nCierre: "Caja clara. Negocio seguro."',
  },
  {
    title: 'Adios a los papelitos en cocina',
    script: 'Abertura: Cocina llena de papeles.\n\n"Restaurante en hora punta. Todo es caos."\n\nMostrar FACTUSYS RESTO en cocina.\n\n"Con FACTUSYS los pedidos llegan directo a la pantalla de cocina. Sin papelitos. Sin errores."\n\nCierre: "Mesas, pedidos y cocina en orden."',
  },
  {
    title: 'Inventario en tiempo real',
    script: 'Abertura: "Sabes cuantas unidades te quedan de tu producto mas vendido?"\n\nSilencio incomodo.\n\n"Con FACTUSYS ves el stock en tiempo real desde tu celular."\n\nMostrar app.\n\n"Alertas cuando algo esta por agotarse. Compras a tiempo. Perdidas cero."',
  },
  {
    title: 'Facturar SUNAT en 5 segundos',
    script: 'Abertura: Reloj marcando.\n\n"Facturar SUNAT solia tomar minutos."\n\nMostrar proceso en FACTUSYS.\n\n"Con FACTUSYS es un clic. Boleta o factura. Con RUC, nombre y todo."\n\nCierre: "SUNAT lista. Tu negocio en regla."',
  },
  {
    title: 'Tu negocio sin internet',
    script: 'Abertura: "Se fue el internet... y tu sistema?"\n\nCara de preocupacion.\n\n"Con FACTUSYS sigues vendiendo normal. Cuando vuelve el internet, todo se sincroniza."\n\nCierre: "FACTUSYS no para. Tu negocio tampoco."',
  },
  {
    title: 'El poder de los datos',
    script: 'Abertura: "Sabes que producto te deja mas plata?"\n\nPantalla de reportes FACTUSYS.\n\n"FACTUSYS te muestra ventas, ganancias, productos mas vendidos y horarios pico."\n\nCierre: "Decide con datos, no con suposiciones."',
  },
  {
    title: 'Multiples usuarios, un solo negocio',
    script: 'Abertura: "Varias personas, un solo sistema."\n\nMostrar perfiles: cajero, administracion, dueno.\n\n"Cada quien con su acceso. El dueno ve todo desde su celular."\n\nCierre: "Control total desde donde estes."',
  },
  {
    title: '48 horas y ya estas vendiendo',
    script: 'Abertura: "De cero a vendiendo en 48 horas."\n\nTime-lapse de instalacion.\n\n"Te instalamos, te capacitamos y al tercer dia ya estas facturando."\n\nCierre: "Implementacion rapida. Resultados inmediatos."',
  },
  {
    title: 'Antes vs Despues',
    script: 'Abertura: Pantalla dividida.\n\nAntes: cuaderno, calculadora, factura a mano.\n\nDespues: FACTUSYS, un clic, todo automatico.\n\n"Antes perdias tiempo. Ahora vendes mas."\n\nCierre: "FACTUSYS. La diferencia es digital."',
  },
  {
    title: 'Lo que opinan nuestros clientes',
    script: 'Abertura: "Que dice la gente de FACTUSYS?"\n\nTestimonial rapido de dueno de ferreteria.\n\n"Antes no sabia cuanto tenia en stock. Ahora controlo todo desde mi celular."\n\nCierre: Resultados reales de negocios reales.',
  },
  {
    title: 'Ferreteria 100% digital',
    script: 'Abertura: "Tu ferreteria puede ser 100% digital."\n\nRecorrido por FACTUSYS FERRO.\n\n"Ventas, inventario, clientes, facturas, reportes. Todo en un solo lugar."\n\nCierre: "FACTUSYS FERRO. Hecho para ferreterias."',
  },
  {
    title: 'Restaurante sin papel',
    script: 'Abertura: "Un restaurante sin papel es posible."\n\nMostrar FACTUSYS RESTO: mesas, pedidos, cocina.\n\n"Comanda digital, pedidos a cocina automaticos, factura al instante."\n\nCierre: "FACTUSYS RESTO. Orden que se nota."',
  },
  {
    title: 'Pagina web + POS = negocio completo',
    script: 'Abertura: "No solo vendas en local. Vende tambien online."\n\nMostrar pagina web + FACTUSYS.\n\n"Ademas de FACTUSYS, creamos tu pagina web profesional para que mas clientes te encuentren."\n\nCierre: "POS + Web. Tu negocio completo."',
  },
  {
    title: 'Por que FACTUSYS',
    script: 'Abertura: "Por que elegir FACTUSYS?"\n\nLista rapida:\n- Sistema hecho en Peru\n- Para negocios peruanos\n- Funciona sin internet\n- SUNAT integrado\n- Soporte de verdad\n\nCierre: "FACTUSYS. Hecho para ti."',
  },
];

const facebookTexts = [
  { title: 'Lanzamiento de producto', text: 'Tu negocio merece un sistema moderno. FACTUSYS es POS + ERP para ferreterias, restaurantes y tiendas en Peru. Controla ventas, caja, inventario y facturacion SUNAT desde un solo lugar. Implementacion en 48 horas. Escribenos para una demo gratis.' },
  { title: 'Problema-solucion inventario', text: 'Cuanto inventario perdiste este mes? Sin control, el desorden te cuesta plata. Con FACTUSYS FERRO ves tu stock en tiempo real, recibes alertas de quiebre y controlas entradas y salidas desde cualquier lugar. Recupera el control.' },
  { title: 'Cierre de caja', text: 'Caja diaria sin dolores de cabeza. Apertura, ingresos, egresos y cierre. Todo automatico, todo cuadra. Con FACTUSYS sabes exactamente cuanto vendiste y cuanto deberia haber en caja. Caja clara, negocio seguro.' },
  { title: 'SUNAT facil', text: 'Facturar SUNAT no tiene que ser complicado. Con FACTUSYS emites boletas y facturas electronicas con un clic. Integrado con Nubefact, listo para la SUNAT. Sin vueltas, sin tecnicismos.' },
  { title: 'Restaurante organizado', text: 'Restaurante en orden es restaurante que gana plata. FACTUSYS RESTO organiza tus mesas, envios pedidos a cocina y factura al instante. Adios papelitos, hola eficiencia.' },
  { title: 'Casos de exito', text: 'Negocios peruanos que ya usan FACTUSYS estan vendiendo mas y controlando mejor. Ferreterias que no pierden stock, restaurantes que no pierden pedidos, duenos que duermen tranquilos. El siguiente puedes ser tu.' },
  { title: 'Digitaliza tu negocio', text: 'Digitalizar tu negocio no es un lujo, es una necesidad. FACTUSYS te da las herramientas para competir: POS rapido, inventario en tiempo real, reportes claros y facturacion SUNAT. Todo desde S/ X al mes.' },
  { title: 'Pagina web profesional', text: 'Ademas de FACTUSYS, creamos paginas web y landing pages para tu negocio. Presencia digital profesional que vende las 24 horas. Diseño moderno, rapido y optimizado para captar clientes.' },
  { title: 'Por que FACTUSYS FERRO', text: 'FACTUSYS FERRO no es un POS generico. Esta construido para ferreterias, tiendas de electronica y retail. Inventario real, categorias personalizadas, precios por unidad/paquete, y facturacion SUNAT.' },
  { title: 'El momento es ahora', text: 'Cada dia sin control es plata que podrias estar ganando. No necesitas ser experto en tecnologia. No necesitas una gran inversion. Necesitas FACTUSYS y 48 horas. Empecemos hoy.' },
];

const whatsappMessages = [
  { title: 'Frio 1 — introduccion', text: 'Hola [nombre], soy [nombre] de FACTUSYS. Trabajamos con ferreterias y restaurantes en Peru para ayudarlos a controlar sus ventas, inventario y facturacion en un solo sistema. Te gustaria ver una demo rapida?' },
  { title: 'Frio 2 — ferreteria', text: 'Hola [nombre], vi que tienes una ferreteria. Te comento que tenemos un sistema POS hecho especialmente para ferreterias: control de inventario, caja diaria, facturacion SUNAT y reportes. Sin contratos, implementacion en 48 horas. Te interesa conocerlo?' },
  { title: 'Frio 3 — restaurante', text: 'Hola [nombre], somos FACTUSYS. Tenemos un sistema para restaurantes que organiza mesas, pedidos, cocina y facturacion. Todo en uno. Varios restaurantes en Peru ya lo usan y estan contentos. Te comparto informacion?' },
  { title: 'Frio 4 — pagina web', text: 'Hola [nombre], ademas de sistemas POS, en FACTUSYS creamos paginas web profesionales para negocios. Tu negocio necesita presencia digital. Te cotizo sin compromiso?' },
  { title: 'Frio 5 — seguimiento', text: 'Hola [nombre], te escribi hace unos dias sobre FACTUSYS. Queria saber si tuviste chance de revisar la informacion. Si quieres te mando una demo para que veas como funciona.' },
  { title: 'Frio 6 — problema comun', text: 'Hola [nombre], muchos duenos de ferreteria nos dicen que pierden plata porque no controlan bien su inventario. Con FACTUSYS FERRO ves exactamente lo que tienes, lo que vendes y lo que necesitas comprar. Te muestro como funciona?' },
  { title: 'Frio 7 — restobar', text: 'Hola [nombre], tenemos un sistema para restaurantes y restobares que integra mesas, comanda a cocina y factura electronica. Muchos negocios en Peru ya lo usan y han mejorado su servicio. Te interesa verlo?' },
  { title: 'Frio 8 — recomendacion', text: 'Hola [nombre], [referencia] nos recomendo contactarte. Tiene un negocio similar al tuyo y esta usando FACTUSYS con buenos resultados. Quieres que te cuente como funciona?' },
  { title: 'Frio 9 — evento/feria', text: 'Hola [nombre], nos vimos en [evento/feria]. Somos FACTUSYS, desarrollamos sistemas POS y ERP para negocios peruanos. Si te interesa, puedo pasarte informacion de nuestros planes.' },
  { title: 'Frio 10 — cierre', text: 'Hola [nombre], no se si es buen momento, pero queria dejarte la info de FACTUSYS por si mas adelante necesitas un sistema para tu negocio. POS, inventario, caja, facturacion SUNAT. Cuando quieras, una demo sin compromiso.' },
];

const interestedResponses = [
  { title: 'Pide informacion general', text: 'Gracias por tu interes! FACTUSYS es un sistema POS + ERP para negocios peruanos. Te explico rapidamente: controlas ventas, inventario, caja y facturas SUNAT desde un solo lugar. La implementacion toma 48 horas e incluimos capacitacion. Te gustaria agendar una demo para que veas como funciona?' },
  { title: 'Pide precio', text: 'Claro! Tenemos planes desde S/ X al mes segun las necesidades de tu negocio. La mejor forma de saber cual se ajusta es mostrarte el sistema en una demo personalizada. Podemos agendar una llamada de 15 minutos?' },
  { title: 'Pide demo', text: 'Por supuesto! Puedo enviarte el enlace para que explores el sistema con datos de prueba. Tambien podemos hacer una videollamada rapida para mostrarte las funciones clave. Que prefieres?' },
  { title: 'Pregunta si funciona sin internet', text: 'Si, totalmente. FACTUSYS funciona offline. Cuando recuperas conexion, los datos se sincronizan automaticamente. Tu negocio no para, tus ventas no se pierden.' },
  { title: 'Pregunta por SUNAT', text: 'Si, FACTUSYS esta integrado con Nubefact para facturacion electronica. Emites boletas y facturas con un clic, todo conforme a SUNAT. Nosotros te ayudamos con la configuracion inicial.' },
];

const priceObjections = [
  { title: 'Objecion 1', text: 'Lo entiendo. Mira, nuestros planes empiezan desde S/ X al mes. Pero si lo ves como inversion, no como gasto: estas eliminando perdidas por inventario, ahorrando tiempo en cierre de caja y evitando multas de SUNAT. En un mes, el sistema se paga solo. Te parece si vemos una demo y tu mismo evaluas?' },
  { title: 'Objecion 2', text: 'Entiendo tu punto. Pero piensa en esto: cuanto pierdes al mes por no controlar tu inventario? Cuanto tiempo gastas cuadrando caja? Cuanto te costaria una multa de SUNAT? FACTUSYS resuelve todo eso. No es un gasto, es una herramienta para ganar mas.' },
  { title: 'Objecion 3', text: 'Te entiendo. Muchos clientes pensaban igual hasta que vieron cuanto podian ahorrar. Te propongo algo: te doy una demo gratuita, tu ves si funciona para tu negocio, y decides sin presion. Si no te convence, no pasa nada.' },
  { title: 'Objecion 4', text: 'Es una inversion justa para lo que ofrece. Piensa que incluye: POS, inventario, caja, facturacion SUNAT, reportes y soporte. Comparado con otros sistemas, FACTUSYS tiene mejor relacion costo-beneficio. Y no tenemos contratos largos.' },
  { title: 'Objecion 5', text: 'Entiendo que el presupuesto es importante. Mira, tenemos planes flexibles. Podemos empezar con lo basico e ir escalando. Ademas, el tiempo que ahorras con FACTUSYS te permite enfocarte en hacer crecer tu negocio. Esa inversion se recupera rapido.' },
];

const thinkAboutItResponses = [
  { title: 'Respuesta 1', text: 'Por supuesto, tomate tu tiempo. Mientras tanto, te envio el enlace de la demo para que explores el sistema a tu ritmo. Cualquier duda, aca estoy.' },
  { title: 'Respuesta 2', text: 'Tranquilo, no hay presion. Solo quiero que sepas que la implementacion es en 48 horas y el primer mes puedes ver resultados. Si quieres, en 2 semanas te escribo para saber si tuviste chance de revisarlo.' },
  { title: 'Respuesta 3', text: 'Claro, es una decision importante. Lo unico que te pido es que no dejes pasar mucho tiempo, porque mientras decides, podrias estar vendiendo con control y sin perdidas. Cuando quieras, aca estoy.' },
  { title: 'Respuesta 4', text: 'Perfecto! Aprovecho y te mando un video corto mostrando como funciona FACTUSYS en accion. Asi te haces una idea mas clara. Ves el video y me dices.' },
  { title: 'Respuesta 5', text: 'Entendible. Te dejo mi contacto directo por si mas adelante decides dar el paso. Y recuerda: FACTUSYS no te ata a contratos largos. Puedes probar y quedarte si te gusta. Sin riesgo.' },
];

const checklistItems = [
  'Identificar 10 negocios locales sin sistema POS (ferreterias, restaurantes, bodegas)',
  'Enviar 5 mensajes personalizados por WhatsApp a nuevos prospectos',
  'Publicar 1 post educativo en Facebook sobre FACTUSYS',
  'Responder todos los comentarios y mensajes de redes sociales',
  'Agendar al menos 1 demo con prospecto calificado',
  'Dar seguimiento a 3 clientes interesados de la semana anterior',
  'Grabar 1 reel corto (max 30 seg) mostrando funcionalidad del sistema',
  'Actualizar historias de Instagram con contenido del dia',
  'Revisar metricas de publicaciones de la semana anterior',
  'Enviar 1 testimonio o caso de exito a prospects en negociacion',
];

const recommendedHours = [
  { day: 'Lunes a viernes', facebook: '7:00 am - 8:00 am', instagram: '12:00 pm - 1:00 pm', whatsapp: '9:00 am - 11:00 am / 4:00 pm - 6:00 pm' },
  { day: 'Sabados', facebook: '8:00 am - 9:00 am', instagram: '10:00 am - 12:00 pm', whatsapp: '9:00 am - 1:00 pm' },
];

/* ─── COMPONENTS ─── */

function CalendarSection() {
  return (
    <div className="space-y-8">
      <CopySection title="Calendario semanal de contenido">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-3 px-3 text-gray-400 font-medium">Dia</th>
                <th className="text-left py-3 px-3 text-gray-400 font-medium">Tema</th>
                <th className="text-left py-3 px-3 text-gray-400 font-medium">Formato</th>
              </tr>
            </thead>
            <tbody>
              {calendarData.map((row, i) => (
                <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3 text-white font-medium">{row.day}</td>
                  <td className="py-3 px-3 text-gray-300">{row.theme}</td>
                  <td className="py-3 px-3 text-gray-400">{row.format}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CopySection>

      <CopySection title="Horarios recomendados para publicar">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-3 px-3 text-gray-400 font-medium">Dia</th>
                <th className="text-left py-3 px-3 text-gray-400 font-medium">Facebook</th>
                <th className="text-left py-3 px-3 text-gray-400 font-medium">Instagram</th>
                <th className="text-left py-3 px-3 text-gray-400 font-medium">WhatsApp</th>
              </tr>
            </thead>
            <tbody>
              {recommendedHours.map((row, i) => (
                <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3 text-white font-medium">{row.day}</td>
                  <td className="py-3 px-3 text-gray-400">{row.facebook}</td>
                  <td className="py-3 px-3 text-gray-400">{row.instagram}</td>
                  <td className="py-3 px-3 text-gray-400">{row.whatsapp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CopySection>

      <CopySection title="Rutina diaria de publicacion">
        <div className="space-y-2">
          {scheduleData.map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-lg px-4 py-3">
              <Clock size={16} className="text-[#00e676] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{item.time}</p>
                <p className="text-gray-500 text-xs">{item.platform}</p>
              </div>
              <span className="text-gray-400 text-xs text-right">{item.intent}</span>
            </div>
          ))}
        </div>
      </CopySection>
    </div>
  );
}

function PostsSection() {
  return (
    <div className="space-y-4">
      <p className="text-gray-500 text-sm mb-6">30 ideas de publicaciones para Facebook e Instagram. Cada una tiene copy listo para copiar y pegar.</p>
      {postIdeas.map((post, i) => (
        <CopyCard key={i} label={`${i + 1}. ${post.title}`} text={post.text} />
      ))}
    </div>
  );
}

function ReelsSection() {
  return (
    <div className="space-y-4">
      <p className="text-gray-500 text-sm mb-6">15 guiones de reels listos para grabar. Duracion recomendada: 20-45 segundos.</p>
      {reelScripts.map((reel, i) => (
        <div key={i} className="group bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 hover:border-[#00e676]/20 transition-all duration-300">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="text-white text-sm font-semibold">{i + 1}. {reel.title}</h3>
            <CopyBtn text={`${reel.title}\n\n${reel.script}`} />
          </div>
          <p className="text-gray-400 text-xs leading-relaxed whitespace-pre-wrap">{reel.script}</p>
        </div>
      ))}
    </div>
  );
}

function FacebookSection() {
  return (
    <div className="space-y-4">
      <p className="text-gray-500 text-sm mb-6">10 textos listos para publicar en Facebook. Adapta el tono segun tu audiencia.</p>
      {facebookTexts.map((item, i) => (
        <CopyCard key={i} label={item.title} text={item.text} />
      ))}
    </div>
  );
}

function WhatsAppSection() {
  return (
    <div className="space-y-4">
      <p className="text-gray-500 text-sm mb-6">10 mensajes para WhatsApp en frio. Personaliza siempre con el nombre del prospecto.</p>
      {whatsappMessages.map((msg, i) => (
        <CopyCard key={i} label={msg.title} text={msg.text} />
      ))}
    </div>
  );
}

function ObjectionsSection() {
  return (
    <div className="space-y-6">
      <CopySection title="Clientes interesados — 5 respuestas">
        <div className="space-y-3">
          {interestedResponses.map((item, i) => (
            <CopyCard key={i} label={item.title} text={item.text} />
          ))}
        </div>
      </CopySection>

      <CopySection title="Objecion de precio — 5 respuestas">
        <div className="space-y-3">
          {priceObjections.map((item, i) => (
            <CopyCard key={i} label={item.title} text={item.text} />
          ))}
        </div>
      </CopySection>

      <CopySection title="Lo voy a pensar — 5 respuestas">
        <div className="space-y-3">
          {thinkAboutItResponses.map((item, i) => (
            <CopyCard key={i} label={item.title} text={item.text} />
          ))}
        </div>
      </CopySection>
    </div>
  );
}

function ChecklistSection() {
  return (
    <div className="space-y-6">
      <CopySection title="Checklist diario de prospeccion gratis">
        <div className="space-y-2">
          {checklistItems.map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-white/[0.02] border border-white/[0.06] rounded-lg px-4 py-3">
              <span className="w-5 h-5 rounded border border-gray-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-gray-500 text-[10px] font-mono">{i + 1}</span>
              </span>
              <p className="text-gray-300 text-sm">{item}</p>
            </div>
          ))}
        </div>
      </CopySection>

      <div className="glass-card rounded-xl p-5 border-[#00e676]/10">
        <h3 className="text-white text-sm font-semibold mb-2">Estrategia organica gratis — resumen</h3>
        <ul className="space-y-1.5">
          {[
            'Publica 1 post educativo al dia en Facebook',
            'Graba 1 reel corto cada 2-3 dias mostrando el sistema',
            'Usa historias de Instagram para interaccion rapida (encuestas, preguntas)',
            'Responde todos los comentarios en menos de 2 horas',
            'Envia 5-10 mensajes personalizados de WhatsApp a diario',
            'Agrupa prospectos por tipo: ferreteria, restaurante, web',
            'Da seguimiento a los que pidieron info: 3, 7 y 14 dias',
            'Pide testimonios a clientes contentos y usalos como contenido',
            'Comparte casos de exito en historias destacadas',
            'Mide resultados cada semana y ajusta lo que no funciona',
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-gray-400 text-xs">
              <ChevronRight size={12} className="text-[#00e676] flex-shrink-0 mt-0.5" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ─── PAGE ─── */

function ContentPlanContent() {
  const [activeTab, setActiveTab] = useState('calendar');

  const sections: Record<string, React.ReactNode> = {
    calendar: <CalendarSection />,
    posts: <PostsSection />,
    reels: <ReelsSection />,
    facebook: <FacebookSection />,
    whatsapp: <WhatsAppSection />,
    objections: <ObjectionsSection />,
    checklist: <ChecklistSection />,
  };

  return (
    <InternalGuard>
    <div className="min-h-screen bg-black pt-24 pb-20">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-[#00e676]/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-5">
            <FactusysLogoNeon />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight">
            Plan de Contenido
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Estrategia de contenido organico para FACTUSYS. Copia, pega, publica.
          </p>
        </div>

        <div className="flex justify-center mb-10 overflow-x-auto pb-2">
          <div className="inline-flex bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 gap-0.5">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap cursor-pointer border-none ${
                  activeTab === tab.id
                    ? 'bg-[#00e676] text-black shadow-lg shadow-[#00e676]/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <tab.icon size={14} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {sections[activeTab]}
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 glass-card rounded-2xl p-5 border-white/[0.04]">
          <div className="flex items-start gap-3">
            <MessageCircle size={16} className="text-[#00e676] flex-shrink-0 mt-0.5" />
            <p className="text-gray-500 text-xs leading-relaxed">
              Todos los textos son personalizables segun tu tono de voz y tu audiencia.
              Adapta los mensajes de WhatsApp con el nombre del prospecto y detalles de su negocio.
              Los guiones de reels son sugerencias — ajusta la duracion y el estilo segun tu marca.
            </p>
          </div>
        </div>
      </div>
    </div>
    </InternalGuard>
  );
}

export default function ContentPlanPage() {
  return <ContentPlanContent />;
}
