import { LatLng, Zone } from '../types';

export const UW_CENTER: LatLng = { latitude: 43.4723, longitude: -80.5449 };

function squarePolygon(center: LatLng, latRadius: number, lonRadius: number): LatLng[] {
  return [
    { latitude: center.latitude + latRadius, longitude: center.longitude - lonRadius },
    { latitude: center.latitude + latRadius, longitude: center.longitude + lonRadius },
    { latitude: center.latitude - latRadius, longitude: center.longitude + lonRadius },
    { latitude: center.latitude - latRadius, longitude: center.longitude - lonRadius },
  ];
}

interface ZoneSeed {
  id: string;
  name: string;
  shortName: string;
  description: string;
  center: LatLng;
  baseline: number;
}

const seeds: ZoneSeed[] = [
  {
    id: 'main-quad',
    name: 'Main Quad (Arts)',
    shortName: 'Main Quad',
    description: 'Central green space between Arts buildings, high foot traffic during the day.',
    center: { latitude: 43.4723, longitude: -80.5449 },
    baseline: 82,
  },
  {
    id: 'davis-library',
    name: 'Davis Centre',
    shortName: 'Davis Centre',
    description: '24-hour study space and library, busy late into the night.',
    center: { latitude: 43.4712, longitude: -80.5442 },
    baseline: 78,
  },
  {
    id: 'dana-porter',
    name: 'Dana Porter Library',
    shortName: 'Dana Porter',
    description: 'Arts library, quieter than Davis Centre once evening classes end.',
    center: { latitude: 43.4720, longitude: -80.5457 },
    baseline: 80,
  },
  {
    id: 'math-computer',
    name: 'Mathematics & Computer Building',
    shortName: 'MC',
    description: 'Math/CS classrooms and the campus’s busiest vending-machine corridor.',
    center: { latitude: 43.4730, longitude: -80.5445 },
    baseline: 75,
  },
  {
    id: 'engineering',
    name: 'Engineering 5 / E7',
    shortName: 'Engineering',
    description: 'Engineering buildings and courtyard, quieter after evening labs end.',
    center: { latitude: 43.4737, longitude: -80.5436 },
    baseline: 74,
  },
  {
    id: 'qnc',
    name: 'Quantum-Nano Centre',
    shortName: 'QNC',
    description: 'Research building, sparse foot traffic outside working hours.',
    center: { latitude: 43.4733, longitude: -80.5417 },
    baseline: 77,
  },
  {
    id: 'physics',
    name: 'Physics Building',
    shortName: 'Physics',
    description: 'Lecture halls and labs, moderate evening activity.',
    center: { latitude: 43.4742, longitude: -80.5444 },
    baseline: 73,
  },
  {
    id: 'slc-pac',
    name: 'Student Life Centre / PAC',
    shortName: 'SLC / PAC',
    description: 'Student centre and athletics complex, moderate evening activity.',
    center: { latitude: 43.4700, longitude: -80.5460 },
    baseline: 76,
  },
  {
    id: 'cif',
    name: 'Columbia Icefield (Rec Complex)',
    shortName: 'CIF',
    description: 'Playing fields and rec complex, isolated and unlit after games end.',
    center: { latitude: 43.4670, longitude: -80.5462 },
    baseline: 70,
  },
  {
    id: 'village-1',
    name: 'Village 1 Residence',
    shortName: 'Village 1',
    description: 'First-year residence buildings, quiet streets, sparse lighting at the edges.',
    center: { latitude: 43.4757, longitude: -80.5468 },
    baseline: 68,
  },
  {
    id: 'rev',
    name: 'Ron Eydt Village',
    shortName: 'REV',
    description: 'Residence complex, quiet at night with a few unlit connecting paths.',
    center: { latitude: 43.4763, longitude: -80.5478 },
    baseline: 66,
  },
  {
    id: 'uw-place',
    name: 'UW Place Residence',
    shortName: 'UW Place',
    description: 'Upper-year residence, further from the core campus.',
    center: { latitude: 43.4771, longitude: -80.5400 },
    baseline: 71,
  },
  {
    id: 'columbia-lake-village',
    name: 'Columbia Lake Village',
    shortName: 'CLV',
    description: 'Married/graduate student housing, far from campus core with long unlit stretches.',
    center: { latitude: 43.4790, longitude: -80.5545 },
    baseline: 60,
  },
  {
    id: 'ring-road-garage',
    name: 'Ring Road Parking Garage',
    shortName: 'Parking Garage',
    description: 'Multi-level parking structure, low foot traffic and visibility at night.',
    center: { latitude: 43.4739, longitude: -80.5479 },
    baseline: 58,
  },
  {
    id: 'south-campus',
    name: 'South Campus (Environment 3)',
    shortName: 'South Campus',
    description: 'Outer academic buildings, longer unlit walkways between them.',
    center: { latitude: 43.4695, longitude: -80.5425 },
    baseline: 64,
  },
  {
    id: 'grebel',
    name: 'Conrad Grebel University College',
    shortName: 'Grebel',
    description: 'Affiliated college on the east edge of campus, quiet residential feel.',
    center: { latitude: 43.4746, longitude: -80.5397 },
    baseline: 72,
  },
];

export const ZONES: Zone[] = seeds.map((s) => ({
  ...s,
  polygon: squarePolygon(s.center, 0.00075, 0.00105),
}));

export function getZone(id: string): Zone | undefined {
  return ZONES.find((z) => z.id === id);
}

// Campus path graph: zone-to-zone walkable connections with base distance
// in minutes. Safe Route walks this graph rather than a real road network.
const EDGES: [string, string, number][] = [
  ['main-quad', 'davis-library', 4],
  ['main-quad', 'dana-porter', 3],
  ['main-quad', 'math-computer', 4],
  ['main-quad', 'slc-pac', 4],
  ['main-quad', 'ring-road-garage', 5],
  ['davis-library', 'dana-porter', 3],
  ['davis-library', 'engineering', 4],
  ['davis-library', 'south-campus', 6],
  ['dana-porter', 'slc-pac', 5],
  ['math-computer', 'engineering', 3],
  ['math-computer', 'physics', 4],
  ['math-computer', 'qnc', 5],
  ['engineering', 'qnc', 4],
  ['engineering', 'village-1', 6],
  ['engineering', 'physics', 3],
  ['physics', 'qnc', 4],
  ['physics', 'grebel', 6],
  ['qnc', 'grebel', 5],
  ['qnc', 'uw-place', 6],
  ['slc-pac', 'south-campus', 5],
  ['slc-pac', 'ring-road-garage', 4],
  ['slc-pac', 'cif', 6],
  ['cif', 'ring-road-garage', 7],
  ['cif', 'columbia-lake-village', 9],
  ['village-1', 'ring-road-garage', 5],
  ['village-1', 'rev', 3],
  ['rev', 'ring-road-garage', 6],
  ['rev', 'columbia-lake-village', 10],
  ['uw-place', 'grebel', 4],
];

export const CAMPUS_GRAPH: Record<string, { to: string; minutes: number }[]> = {};
for (const zone of ZONES) CAMPUS_GRAPH[zone.id] = [];
for (const [a, b, minutes] of EDGES) {
  CAMPUS_GRAPH[a].push({ to: b, minutes });
  CAMPUS_GRAPH[b].push({ to: a, minutes });
}
