export type LeadScoreInput = {
  hasPhone: boolean;
  hasEmail: boolean;
  hasFacebookLink: boolean;
  hasGoogleMapsLink: boolean;
  hasRating: boolean;
  hasCompleteName: boolean;
  hasCity: boolean;
};

export type LeadScore = {
  total: number;
  max: number;
  label: string;
  color: string;
  breakdown: Record<string, number>;
};

const WEIGHTS = {
  hasPhone: 25,
  hasEmail: 20,
  hasFacebookLink: 15,
  hasGoogleMapsLink: 10,
  hasRating: 10,
  hasCompleteName: 10,
  hasCity: 10,
};

const MAX_SCORE = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);

export function calculateLeadScore(input: LeadScoreInput): LeadScore {
  const breakdown: Record<string, number> = {};
  let total = 0;

  if (input.hasPhone) {
    total += WEIGHTS.hasPhone;
    breakdown.hasPhone = WEIGHTS.hasPhone;
  }
  if (input.hasEmail) {
    total += WEIGHTS.hasEmail;
    breakdown.hasEmail = WEIGHTS.hasEmail;
  }
  if (input.hasFacebookLink) {
    total += WEIGHTS.hasFacebookLink;
    breakdown.hasFacebookLink = WEIGHTS.hasFacebookLink;
  }
  if (input.hasGoogleMapsLink) {
    total += WEIGHTS.hasGoogleMapsLink;
    breakdown.hasGoogleMapsLink = WEIGHTS.hasGoogleMapsLink;
  }
  if (input.hasRating) {
    total += WEIGHTS.hasRating;
    breakdown.hasRating = WEIGHTS.hasRating;
  }
  if (input.hasCompleteName) {
    total += WEIGHTS.hasCompleteName;
    breakdown.hasCompleteName = WEIGHTS.hasCompleteName;
  }
  if (input.hasCity) {
    total += WEIGHTS.hasCity;
    breakdown.hasCity = WEIGHTS.hasCity;
  }

  let label: string;
  let color: string;

  if (total >= 80) {
    label = 'Caliente';
    color = '#00e676';
  } else if (total >= 50) {
    label = 'Tibio';
    color = '#fbbf24';
  } else if (total >= 25) {
    label = 'Frío';
    color = '#f87171';
  } else {
    label = 'Sin datos';
    color = '#94a3b8';
  }

  return { total, max: MAX_SCORE, label, color, breakdown };
}

export function scoreFromProspect(prospect: {
  telefono?: string;
  redSocial?: string;
  negocio?: string;
  zona?: string;
  email?: string;
  rating?: number | null;
}): LeadScore {
  return calculateLeadScore({
    hasPhone: Boolean(prospect.telefono && prospect.telefono.replace(/\D/g, '').length >= 9),
    hasEmail: Boolean(prospect.email),
    hasFacebookLink: Boolean(
      prospect.redSocial && prospect.redSocial.toLowerCase().includes('facebook'),
    ),
    hasGoogleMapsLink: Boolean(
      prospect.redSocial && prospect.redSocial.toLowerCase().includes('google'),
    ),
    hasRating: Boolean(prospect.rating && prospect.rating > 0),
    hasCompleteName: Boolean(
      prospect.negocio && prospect.negocio.trim().length >= 3,
    ),
    hasCity: Boolean(prospect.zona && prospect.zona.trim().length >= 2),
  });
}
