'use client';

import { useState } from 'react';
import { Copy, Smartphone, X } from 'lucide-react';
import { generateWhatsAppByType, type MessageVariantInput } from '@/lib/crm-automation/messageVariator';

type VariantOption = {
  key: string;
  label: string;
};

const VARIANTS: VariantOption[] = [
  { key: 'Nuevo', label: 'Estándar' },
  { key: 'MUY_CORTO', label: 'Muy corto' },
  { key: 'AMABLE', label: 'Amable' },
  { key: 'DIRECTO', label: 'Directo' },
  { key: 'SEGUNDO_INTENTO', label: 'Segundo intento' },
  { key: 'SEGUIMIENTO_DEMO', label: 'Post-demo' },
  { key: 'CIERRE_SUAVE', label: 'Cierre suave' },
];

const MUY_CORTO_INTROS = [
  'Hola, soy David de FACTUSYS. ¿Te interesa un sistema POS para {negocio}?',
  'Hola, soy David. ¿Vendes con boleta electrónica en {negocio}?',
  'Hola, soy David de FACTUSYS. Te doy 30 días de prueba gratis.',
  'Hola, vi {negocio} en {ciudad}. ¿Usas POS? Te ayudo.',
  'Hola, soy David. ¿Ya facturas electrónicamente en {negocio}?',
];

const AMABLE_INTROS = [
  'Hola {name}, soy David de FACTUSYS. Espero que estés teniendo un buen día. Pasaba por aquí para ver si te puedo ayudar con algo en {negocio}',
  '¡Hola {name}! David de FACTUSYS al otro lado. ¿Cómo va todo en {negocio}? Quería compartirte algo que le está sirviendo a negocios como el tuyo',
  'Hola {name}, qué gusto saludarte. Soy David de FACTUSYS y quería contarte que tenemos una ayuda para que {negocio} en {ciudad} pueda facturar y controlar sus ventas más fácil',
  'Hola {name}, un gusto. Soy David. En FACTUSYS ayudamos a negocios como {negocio} a tener todo más ordenado. ¿Te gustaría echarle un ojo?',
  'Hola {name}, ¿cómo estás? Te escribo de FACTUSYS. Quería ver si te sirve un sistema simple para {negocio}',
];

const DIRECTO_INTROS = [
  'Hola {name}, soy David de FACTUSYS. ¿Necesitas un POS para {negocio}? 30 días gratis, sin compromiso.',
  'Hola {name}. FACTUSYS: sistema POS peruano para {negocio}. Demo gratis 30 días. ¿Te interesa?',
  'Hola {name}, soy David. ¿Ya tienes POS en {negocio}? Si no, te paso una demo gratis de 30 días de FACTUSYS.',
  'Hola {name}, soy David de FACTUSYS. ¿Facturas electrónicamente? Si no, en {ciudad} ya es obligatorio en varios rubros. Te ayudo.',
  'Hola {name}. Te ofrezco 30 días de FACTUSYS gratis para {negocio}. Sin pagar nada, sin tarjeta.',
];

function getFirstName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (parts[0] || '').charAt(0).toUpperCase() + (parts[0] || '').slice(1).toLowerCase();
}

function generateByVariantKey(key: string, input: MessageVariantInput): string {
  if (key === 'MUY_CORTO') {
    const lines = MUY_CORTO_INTROS;
    const line = lines[Math.floor(Math.random() * lines.length)];
    return line.replace('{negocio}', input.negocio).replace('{ciudad}', input.ciudad);
  }
  if (key === 'AMABLE') {
    const lines = AMABLE_INTROS;
    const line = lines[Math.floor(Math.random() * lines.length)];
    return line.replace('{name}', getFirstName(input.contacto)).replace('{negocio}', input.negocio).replace('{ciudad}', input.ciudad);
  }
  if (key === 'DIRECTO') {
    const lines = DIRECTO_INTROS;
    const line = lines[Math.floor(Math.random() * lines.length)];
    return line.replace('{name}', getFirstName(input.contacto)).replace('{negocio}', input.negocio).replace('{ciudad}', input.ciudad);
  }
  return generateWhatsAppByType({ ...input, estado: key });
}

export function MessagePreviewEditor({
  negocio, rubro, ciudad, contacto, phone, product,
  onClose,
}: {
  negocio: string;
  rubro: string;
  ciudad: string;
  contacto: string;
  phone: string;
  product: 'RESTO' | 'FERRO' | 'Ambos';
  onClose: () => void;
}) {
  const [variantKey, setVariantKey] = useState('Nuevo');
  const [message, setMessage] = useState(() => {
    const input: MessageVariantInput = {
      negocio, rubro, ciudad, contacto: contacto || negocio,
      estado: 'Nuevo', channel: 'whatsapp_manual', product,
    };
    return generateByVariantKey('Nuevo', input);
  });
  const [copied, setCopied] = useState(false);

  const onVariantChange = (key: string) => {
    setVariantKey(key);
    const input: MessageVariantInput = {
      negocio, rubro, ciudad, contacto: contacto || negocio,
      estado: key, channel: 'whatsapp_manual', product,
    };
    setMessage(generateByVariantKey(key, input));
    setCopied(false);
  };

  const copyAndOpen = () => {
    navigator.clipboard.writeText(message).then(() => {
      setCopied(true);
      const cleaned = phone.replace(/\D/g, '').replace(/^0+/, '');
      const number = cleaned.startsWith('51') ? cleaned : `51${cleaned}`;
      window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank');
    }).catch(() => { /* ignore */ });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Enviar WhatsApp</p>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">{negocio}</h2>
          </div>
          <button type="button" className="rounded-xl border border-slate-300 bg-white p-2 text-slate-600 transition-all hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-[10px] font-bold uppercase text-slate-400">Variante del mensaje</label>
          <div className="flex flex-wrap gap-1.5">
            {VARIANTS.map((v) => (
              <button
                key={v.key}
                type="button"
                className={`rounded-xl border px-2.5 py-1.5 text-[11px] font-bold transition-all active:scale-[0.97] ${
                  variantKey === v.key
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => onVariantChange(v.key)}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          className="mb-4 min-h-[120px] w-full resize-none rounded-xl border-2 border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800 outline-none transition-colors focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          value={message}
          onChange={(e) => { setMessage(e.target.value); setCopied(false); }}
        />

        <p className="mb-4 text-xs text-slate-400">
          {phone ? `Enviar a: ${phone}` : 'Sin teléfono disponible'}
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-100 active:scale-[0.97]"
            onClick={() => {
              navigator.clipboard.writeText(message).then(() => setCopied(true)).catch(() => {});
            }}
          >
            {copied ? '✓ Copiado' : <><Copy size={15} /> Copiar</>}
          </button>
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-600 active:scale-[0.98]"
            onClick={copyAndOpen}
          >
            <Smartphone size={15} /> Abrir WhatsApp
          </button>
        </div>
        {copied && (
          <p className="mt-2 text-center text-xs text-emerald-600">Mensaje copiado al portapapeles. Abriendo WhatsApp...</p>
        )}
      </div>
    </div>
  );
}