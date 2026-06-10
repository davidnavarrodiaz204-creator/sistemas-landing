import { normalizePeruPhone, normalizeEmail, normalizeText } from './prospectNormalizer';

export type DuplicateCheckResult = {
  isDuplicate: boolean;
  reasons: string[];
  matchedProspectId?: string;
};

export type ProspectForDuplicateCheck = {
  id: string;
  negocio: string;
  telefono: string;
  email?: string;
  redSocial: string;
  linkFuente?: string;
};

export function checkDuplicate(
  prospect: {
    negocio: string;
    telefono: string;
    email?: string;
    redSocial: string;
    linkFuente?: string;
  },
  existingProspects: ProspectForDuplicateCheck[],
): DuplicateCheckResult {
  const phone = normalizePeruPhone(prospect.telefono);
  const email = normalizeEmail(prospect.email || '');
  const name = normalizeText(prospect.negocio);
  const link = normalizeText(prospect.redSocial);
  const sourceLink = normalizeText(prospect.linkFuente || '');

  for (const existing of existingProspects) {
    const existingPhone = normalizePeruPhone(existing.telefono);
    const existingEmail = normalizeEmail(existing.email || '');
    const existingName = normalizeText(existing.negocio);
    const existingLink = normalizeText(existing.redSocial);
    const existingSourceLink = normalizeText(existing.linkFuente || '');

    if (phone && existingPhone && phone === existingPhone) {
      return {
        isDuplicate: true,
        reasons: ['Teléfono duplicado'],
        matchedProspectId: existing.id,
      };
    }

    if (email && existingEmail && email === existingEmail) {
      return {
        isDuplicate: true,
        reasons: ['Email duplicado'],
        matchedProspectId: existing.id,
      };
    }

    if (link && existingLink && (link === existingLink || link.includes(existingLink) || existingLink.includes(link))) {
      return {
        isDuplicate: true,
        reasons: ['Link duplicado'],
        matchedProspectId: existing.id,
      };
    }

    if (sourceLink && existingSourceLink && sourceLink === existingSourceLink) {
      return {
        isDuplicate: true,
        reasons: ['Fuente duplicada'],
        matchedProspectId: existing.id,
      };
    }

    if (name && existingName && name.length > 3 && existingName.length > 3) {
      const nameWords = name.split(/\s+/);
      const existingWords = existingName.split(/\s+/);
      const commonWords = nameWords.filter((w) => existingWords.includes(w));
      if (commonWords.length >= Math.min(nameWords.length, existingWords.length)) {
        return {
          isDuplicate: true,
          reasons: ['Nombre similar'],
          matchedProspectId: existing.id,
        };
      }
    }
  }

  return { isDuplicate: false, reasons: [] };
}

export function findDuplicatesInBatch(
  prospects: Array<{
    negocio: string;
    telefono: string;
    email?: string;
    redSocial: string;
    linkFuente?: string;
  }>,
  existingProspects: ProspectForDuplicateCheck[],
): Map<number, DuplicateCheckResult> {
  const results = new Map<number, DuplicateCheckResult>();
  for (let i = 0; i < prospects.length; i++) {
    const check = checkDuplicate(prospects[i], existingProspects);
    if (check.isDuplicate) {
      results.set(i, check);
    }
  }
  return results;
}
