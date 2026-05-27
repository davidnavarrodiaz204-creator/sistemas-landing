import type { CrmProspectRecord, CrmStorageProvider, NormalizeProspect } from './crmStorage.types';

const STORAGE_KEY = 'factusys_crm_prospects_v3';
const LEGACY_STORAGE_KEYS = ['factusys_crm_prospects_v2', 'factusys_crm_prospects_v1'];

function canUseLocalStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function writeProspects<T extends CrmProspectRecord>(prospects: T[]) {
  if (canUseLocalStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prospects));
  }

  return prospects;
}

export const localStorageProvider: CrmStorageProvider = {
  async getProspects<T extends CrmProspectRecord>(defaults: T[], normalize: NormalizeProspect<T>) {
    if (!canUseLocalStorage()) return defaults;

    const stored = window.localStorage.getItem(STORAGE_KEY)
      || LEGACY_STORAGE_KEYS.map((key) => window.localStorage.getItem(key)).find(Boolean);

    if (!stored) return writeProspects(defaults);

    try {
      const parsed = JSON.parse(stored);
      const prospects = Array.isArray(parsed) ? parsed.map(normalize) : defaults;
      return writeProspects(prospects);
    } catch {
      return writeProspects(defaults);
    }
  },

  async saveProspect<T extends CrmProspectRecord>(prospect: T, current: T[]) {
    return writeProspects([prospect, ...current]);
  },

  async updateProspect<T extends CrmProspectRecord>(id: string, patch: Partial<T>, current: T[]) {
    return writeProspects(current.map((item) => item.id === id ? { ...item, ...patch } : item));
  },

  async deleteProspect<T extends CrmProspectRecord>(id: string, current: T[]) {
    return writeProspects(current.filter((item) => item.id !== id));
  },

  async importProspects<T extends CrmProspectRecord>(prospects: T[], current: T[]) {
    return writeProspects([...prospects, ...current]);
  },

  async exportProspects<T extends CrmProspectRecord>(prospects: T[]) {
    return writeProspects(prospects);
  },
};
