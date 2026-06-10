export type EnrichedData = {
  email: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  web: string;
};

export type EnrichSource = 'mock' | 'google_search' | 'facebook_api';

export type EnrichResult = {
  ok: boolean;
  source: EnrichSource;
  data: EnrichedData;
  message: string;
};

const FACEBOOK_PATTERNS: Record<string, string[]> = {
  Pollería: ['elpollonorteño', 'polleriaDonJose', 'pollosLaBraza', 'polleriaSanMartin', 'polleriaElBuenSabor'],
  Restaurante: ['restaurantElPaisa', 'saborPeruanoRest', 'dondeMamaOlla', 'restaurantLaNorteñita', 'cocinaDeLaAbuela'],
  Cevichería: ['cevicheriaElMero', 'marisqueriaLaCostilla', 'cevicheriaNorte', 'cevicheriaDonCeviche', 'marPeruanoCeviche'],
  Ferretería: ['ferreteriaElConstructor', 'ferremasPiura', 'ferreteriaSanJose', 'ferreteriaDelNorte', 'ferreteriaLosAndes'],
  Minimarket: ['minimarketLaEsquina', 'bodegaDonCarlos', 'minimarketSanPedro', 'tiendaLaPopular', 'minimarketElAhorro'],
};

const INSTAGRAM_PATTERNS: Record<string, string[]> = {
  Pollería: ['polleria_norteña', 'los_pollos_felices', 'pollo_braza_pe', 'pollos_don_jose'],
  Restaurante: ['sabor_peruano_pe', 'restaurant_el_paisa', 'donde_mama_olla', 'cocina_norteña_pe'],
  Cevichería: ['cevicheria_el_mero', 'marisqueria_norte', 'don_ceviche_pe', 'mar_peruano_ceviche'],
  Ferretería: ['ferreteria_constructor', 'ferremas_piura', 'ferreteria_del_norte', 'ferreteria_los_andes'],
  Minimarket: ['minimarket_esquina', 'bodega_don_carlos', 'tienda_popular_pe', 'el_ahorro_minimarket'],
};

const TIKTOK_PATTERNS: Record<string, string[]> = {
  Pollería: ['polleriadelnorte', 'pollosbraza', 'polleriaperuana', 'polloaldia'],
  Restaurante: ['saborperuano', 'cocinanorteña', 'restperuano', 'dondecomo'],
  Cevichería: ['cevicheperuano', 'marperuano', 'cevicherianorte', 'cevichealdia'],
  Ferretería: ['ferreteroaldia', 'construyendoperu', 'ferreteriadelnorte', 'herramientasperu'],
  Minimarket: ['minimarketpe', 'bodegaperuana', 'tiendaperu', 'ahorroperu'],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateFacebookUrl(pattern: string): string {
  return `https://facebook.com/${pattern}`;
}

function generateInstagramUrl(pattern: string): string {
  return `https://instagram.com/${pattern}`;
}

function generateTiktokUrl(pattern: string): string {
  return `https://tiktok.com/@${pattern}`;
}

function generateEmail(businessName: string): string {
  const name = businessName
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
  return `${name}@gmail.com`;
}

function generateWebsite(businessName: string): string {
  const name = businessName
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .replace(/\s+/g, '');
  return `https://${name}.pe`;
}

export async function enrichProspect(
  negocio: string,
  rubro: string,
  ciudad: string,
): Promise<EnrichResult> {
  const fbPatterns = FACEBOOK_PATTERNS[rubro] || FACEBOOK_PATTERNS.Pollería;
  const igPatterns = INSTAGRAM_PATTERNS[rubro] || INSTAGRAM_PATTERNS.Pollería;
  const tkPatterns = TIKTOK_PATTERNS[rubro] || TIKTOK_PATTERNS.Pollería;

  const data: EnrichedData = {
    email: generateEmail(negocio),
    facebook: generateFacebookUrl(pickRandom(fbPatterns)),
    instagram: generateInstagramUrl(pickRandom(igPatterns)),
    tiktok: generateTiktokUrl(pickRandom(tkPatterns)),
    web: generateWebsite(negocio),
  };

  return {
    ok: true,
    source: 'mock',
    data,
    message: `Datos enriquecidos para "${negocio}" en ${ciudad}. Revisa y corrige si es necesario.`,
  };
}

export async function enrichProspectBatch(
  prospects: Array<{ negocio: string; rubro: string; ciudad: string; telefono?: string }>,
): Promise<Array<{ index: number; result: EnrichResult }>> {
  const results: Array<{ index: number; result: EnrichResult }> = [];
  for (let i = 0; i < prospects.length; i++) {
    const p = prospects[i];
    const result = await enrichProspect(p.negocio, p.rubro, p.ciudad);
    results.push({ index: i, result });
  }
  return results;
}
