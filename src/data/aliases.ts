// Additional named campus locations that aren't modeled as their own routable
// zone. Each resolves to the nearest/most relevant zone for scoring and
// routing purposes, so the Safe Route search bar can cover more of campus
// than the 16 primary zones without needing full building-level geodata.
export interface LocationAlias {
  label: string;
  zoneId: string;
}

export const LOCATION_ALIASES: LocationAlias[] = [
  { label: 'Rod Coutts Hall (STC)', zoneId: 'math-computer' },
  { label: 'Tatham Centre', zoneId: 'math-computer' },
  { label: 'Biology 1', zoneId: 'physics' },
  { label: 'Chemistry 2', zoneId: 'physics' },
  { label: 'Environment 1 (EV1)', zoneId: 'south-campus' },
  { label: 'Environment 3 (EV3)', zoneId: 'south-campus' },
  { label: 'Optometry & Vision Science', zoneId: 'physics' },
  { label: 'Renison University College', zoneId: 'grebel' },
  { label: "St. Jerome's University", zoneId: 'grebel' },
  { label: 'Claudette Millar Hall', zoneId: 'uw-place' },
  { label: 'Minota Hagey Residence', zoneId: 'grebel' },
  { label: 'ION / Bus Loop', zoneId: 'ring-road-garage' },
  { label: 'Bombshelter Pub', zoneId: 'slc-pac' },
  { label: 'Turnkey Desk', zoneId: 'slc-pac' },
  { label: 'Federation Hall', zoneId: 'slc-pac' },
  { label: 'Health Services', zoneId: 'slc-pac' },
  { label: 'PAC Pool', zoneId: 'slc-pac' },
];
