import { localStorageProvider } from './localStorageProvider';
import { supabaseProvider } from './supabaseProvider';
import type { CrmProspectRecord, CrmStorageMode, NormalizeProspect } from './crmStorage.types';

function getStorageMode(): CrmStorageMode {
  return process.env.NEXT_PUBLIC_CRM_STORAGE === 'supabase' ? 'supabase' : 'local';
}

function getProvider() {
  return getStorageMode() === 'supabase' ? supabaseProvider : localStorageProvider;
}

export function getProspects<T extends CrmProspectRecord>(defaults: T[], normalize: NormalizeProspect<T>) {
  return getProvider().getProspects(defaults, normalize);
}

export function saveProspect<T extends CrmProspectRecord>(prospect: T, current: T[]) {
  return getProvider().saveProspect(prospect, current);
}

export function updateProspect<T extends CrmProspectRecord>(id: string, patch: Partial<T>, current: T[]) {
  return getProvider().updateProspect(id, patch, current);
}

export function deleteProspect<T extends CrmProspectRecord>(id: string, current: T[]) {
  return getProvider().deleteProspect(id, current);
}

export function importProspects<T extends CrmProspectRecord>(prospects: T[], current: T[]) {
  return getProvider().importProspects(prospects, current);
}

export function exportProspects<T extends CrmProspectRecord>(prospects: T[]) {
  return getProvider().exportProspects(prospects);
}
