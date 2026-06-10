import { createProspect, findProspectByPhone, getProspectCount } from './prospects';

type LocalStorageProspect = {
  id: string;
  negocio: string;
  rubro: string;
  ciudad: string;
  whatsapp: string;
  email: string;
  link: string;
  fuente: string;
  nota: string;
};

function loadFromLocalStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) || [];
  } catch {
    return [];
  }
}

export type MigrationResult = {
  imported: number;
  skipped: number;
  errors: number;
  details: string[];
};

export async function migrateLocalStorageToPostgres(): Promise<MigrationResult> {
  const result: MigrationResult = { imported: 0, skipped: 0, errors: 0, details: [] };

  const campaigns = loadFromLocalStorage<{ rubro: string }>('factusys_automation_campaigns_v1');
  const prospects = loadFromLocalStorage<LocalStorageProspect>('factusys_automation_prospects_v1');

  if (!prospects.length) {
    result.details.push('No hay prospectos en localStorage para migrar.');
    return result;
  }

  const defaultRubro = campaigns?.[0]?.rubro || 'Otro';

  for (const p of prospects) {
    try {
      const phone = p.whatsapp?.replace(/\D/g, '') || '';
      if (phone) {
        const existing = await findProspectByPhone(phone);
        if (existing) {
          result.skipped++;
          continue;
        }
      }
      await createProspect({
        businessName: p.negocio,
        rubro: p.rubro || defaultRubro,
        ciudad: p.ciudad,
        phone,
        email: p.email || '',
        source: p.fuente || 'migrado',
        notes: p.nota || '',
      });
      result.imported++;
    } catch {
      result.errors++;
    }
  }

  result.details.push(`${result.imported} importados, ${result.skipped} duplicados omitidos, ${result.errors} errores.`);
  return result;
}

export async function getLocalStorageSummary(): Promise<{
  prospects: number;
  campaigns: number;
  lastMigration?: string;
}> {
  const prospects = loadFromLocalStorage<{ id: string }>('factusys_automation_prospects_v1');
  const campaigns = loadFromLocalStorage<{ id: string }>('factusys_automation_campaigns_v1');
  const pgCount = await getProspectCount().catch(() => 0);
  return {
    prospects: prospects.length,
    campaigns: campaigns.length,
    lastMigration: pgCount > 0 ? `${pgCount} registros en PostgreSQL` : undefined,
  };
}
