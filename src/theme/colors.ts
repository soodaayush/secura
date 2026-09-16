// Calm, authoritative palette — deep indigo/navy base, muted status colors.
// Deliberately avoids a red-heavy "crime map" look.
export const colors = {
  bg: '#0F1226',
  bgElevated: '#171B3A',
  card: '#1E2348',
  cardAlt: '#242A56',
  border: '#2E3566',
  textPrimary: '#F2F3FA',
  textSecondary: '#A9AFD6',
  textMuted: '#7379A8',
  accent: '#6C7AFF',
  accentSoft: 'rgba(108, 122, 255, 0.16)',

  // Status colors — muted, not alarmist
  safe: '#4FBA8C',       // muted green
  safeSoft: 'rgba(79, 186, 140, 0.18)',
  caution: '#E0AA4E',    // muted amber
  cautionSoft: 'rgba(224, 170, 78, 0.18)',
  risk: '#D9707A',       // muted coral, not pure red
  riskSoft: 'rgba(217, 112, 122, 0.18)',

  white: '#FFFFFF',
  black: '#000000',
};

export function scoreToColor(score: number): string {
  if (score >= 75) return colors.safe;
  if (score >= 50) return colors.caution;
  return colors.risk;
}

export function scoreToSoftColor(score: number): string {
  if (score >= 75) return colors.safeSoft;
  if (score >= 50) return colors.cautionSoft;
  return colors.riskSoft;
}

export function scoreToLabel(score: number): string {
  if (score >= 75) return 'Calm';
  if (score >= 50) return 'Elevated';
  return 'Active Concern';
}

export function scoreToActionTier(score: number): 'Monitor' | 'Dispatch' | 'Lockdown' {
  if (score >= 60) return 'Monitor';
  if (score >= 35) return 'Dispatch';
  return 'Lockdown';
}
