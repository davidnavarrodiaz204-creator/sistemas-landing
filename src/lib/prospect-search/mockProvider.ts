import type { ProspectSearchInput, ProspectSearchResponse, ProspectSearchResult } from './prospectSearch.types';

const PERU_PHONES = [
  '51987454769', '51976451234', '51983456789', '51956781234',
  '51923456789', '51934567890', '51945678901', '51967890123',
  '51978901234', '51989012345', '51990123456', '51901234567',
];

const BUSINESS_NAMES = [
  'El Norteño', 'Don José', 'La Popular', 'San Martín', 'Don Carlos',
  'Mi Casita', 'El Amigo', 'La Esquina', 'Sabor Peruano', 'El Buen Precio',
  'La Norteñita', 'Don Pepito', 'La Confianza', 'San Pedro', 'Doña Olga',
  'El Campesino', 'La Ñata', 'Sabor Casero', 'El Turista', 'La Vida',
];

const FACEBOOK_SLUGS = [
  'elnorteñopollerias', 'donjose.pe', 'lapopularperu', 'sanmartinrest', 'doncarlosferretero',
  'micasitape', 'elamigorest', 'laesquinaperu', 'saborperuanope', 'elbuenpreciope',
  'lanorteñita', 'donpepitope', 'laconfianza.pe', 'sanpedroferretero', 'doñaolga.pe',
  'elcampesinope', 'lapeñata', 'saborcasero.pe', 'elturista.pe', 'lavida.pe',
];

const INSTAGRAM_SLUGS = [
  'el_norteño_pe', 'don_jose_rest', 'la_popular_pe', 'san_martin_pe', 'don_carlos_pe',
  'mi_casita_pe', 'el_amigo_pe', 'la_esquina_pe', 'sabor_peruano_pe', 'el_buen_precio_pe',
  'la_norteñita_pe', 'don_pepito_pe', 'la_confianza_pe', 'san_pedro_pe', 'doña_olga_pe',
  'el_campesino_pe', 'la_ñata_pe', 'sabor_casero_pe', 'el_turista_pe', 'la_vida_pe',
];

const TIKTOK_SLUGS = [
  'elnorteno.pe', 'donjose.pe', 'lapopular.pe', 'sanmartin.pe', 'doncarlos.pe',
  'micasita.pe', 'elamigo.pe', 'laesquina.pe', 'saborperuano.pe', 'elbuenprecio.pe',
  'lanortenita.pe', 'donpepito.pe', 'laconfianza.pe', 'sanpedro.pe', 'donaolga.pe',
  'elcampesino.pe', 'lanata.pe', 'saborcasero.pe', 'elturista.pe', 'lavida.pe',
];

const ADDRESSES = [
  'Av. Central', 'Av. Principal', 'Av. Los Olivos', 'Av. La Marina', 'Av. Grau',
  'Av. Sullana', 'Av. Panamericana', 'Jr. Lima', 'Jr. Amazonas', 'Pasaje Los Andes',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateEmail(negocio: string): string {
  const clean = negocio.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${clean}@gmail.com`;
}

export async function searchMockProspects(input: ProspectSearchInput): Promise<ProspectSearchResponse> {
  const zona = input.zona || 'Paita';
  const rubro = input.rubro || 'Pollería';
  const fuente = input.fuente || 'Google Maps';
  const maxResults = Math.min(Math.max(Number(input.maxResults) || 10, 1), 20);

  const results: ProspectSearchResult[] = Array.from({ length: maxResults }, (_, i) => {
    const name = `${pick(BUSINESS_NAMES)} ${rubro}`;
    const city = zona;
    const addrNum = Math.floor(Math.random() * 500) + 100;

    const base: ProspectSearchResult = {
      id: `mock-${Date.now().toString(36)}-${i}`,
      negocio: name,
      rubro,
      direccion: `${pick(ADDRESSES)} ${addrNum}, ${city}`,
      telefono: pick(PERU_PHONES),
      email: generateEmail(name),
      web: '',
      facebookLink: '',
      instagramLink: '',
      tiktokLink: '',
      rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
      googleMapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(`${rubro} ${city}`)}`,
      fuente: fuente,
    };

    if (fuente === 'Google Maps' || fuente === 'Todas') {
      base.googleMapsUrl = `https://www.google.com/maps/place/${encodeURIComponent(name + ' ' + city)}`;
      base.web = `https://${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.pe`;
    }

    if (fuente === 'Facebook' || fuente === 'Todas') {
      base.facebookLink = `https://facebook.com/${pick(FACEBOOK_SLUGS)}`;
    }

    if (fuente === 'Instagram' || fuente === 'Todas') {
      base.instagramLink = `https://instagram.com/${pick(INSTAGRAM_SLUGS)}`;
    }

    if (fuente === 'TikTok' || fuente === 'Todas') {
      base.tiktokLink = `https://tiktok.com/@${pick(TIKTOK_SLUGS)}`;
    }

    if (fuente === 'Web' || fuente === 'Todas') {
      base.web = `https://${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.pe`;
    }

    return base;
  });

  return {
    provider: 'mock',
    configured: false,
    mode: 'demo',
    message: results.length > 0
      ? `Modo demo: ${results.length} prospectos para "${rubro}" en "${zona}" (fuente: ${fuente}). Configura APIs reales para datos en vivo.`
      : 'Modo demo sin resultados. Ajusta el rubro o ciudad.',
    results,
  };
}
