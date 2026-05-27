type NextActionInput = {
  estado: string;
  estadoConversacion?: string;
  fechaUltimoMensaje?: string;
};

function daysSince(dateText?: string) {
  if (!dateText) return null;
  const date = new Date(`${dateText}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return Math.floor((Date.now() - date.getTime()) / 86400000);
}

export function recommendNextAction(input: NextActionInput) {
  const days = daysSince(input.fechaUltimoMensaje);

  if (input.estado === 'Nuevo') {
    return 'Sugerencia: enviar primer contacto corto y ofrecer una demo de 30 días.';
  }

  if (input.estado === 'Contactado' && input.estadoConversacion === 'Sin respuesta' && days !== null && days >= 2) {
    return 'Sugerencia: hacer seguimiento amable porque ya pasaron 2 días sin respuesta.';
  }

  if (input.estado === 'Interesado') {
    return 'Sugerencia: ofrecer una demo de 30 días con una hora concreta.';
  }

  if (input.estado === 'Demo activa') {
    return 'Sugerencia: proponer cierre o reunión corta para definir si continúa.';
  }

  if (input.estado === 'Perdido') {
    return 'Sugerencia: recuperar de forma suave, sin presión y dejando salida.';
  }

  return 'Sugerencia: mantener seguimiento breve y orientado a demo.';
}
