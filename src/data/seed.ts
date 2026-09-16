import { CommunityReview, IncidentReport, RouteRating } from '../types';

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const now = Date.now();

// Session-default demo content so Community/Admin tabs aren't empty on a
// fresh install. Only used as the initial value the first time the app
// runs — real submissions persist over these via AsyncStorage afterward.
export const SEED_REVIEWS: CommunityReview[] = [
  {
    id: 'seed-r1',
    zoneId: 'davis-library',
    rating: 5,
    text: 'Always well-lit and busy even at 1am during exam season. Never felt unsafe walking through.',
    timestamp: now - 25 * MIN,
  },
  {
    id: 'seed-r2',
    zoneId: 'ring-road-garage',
    rating: 2,
    text: 'Top level lighting has been out for two weeks now. Wouldn’t park there solo at night.',
    timestamp: now - 55 * MIN,
  },
  {
    id: 'seed-r3',
    zoneId: 'main-quad',
    rating: 5,
    text: 'Great during the day, tons of people around between classes.',
    timestamp: now - 2 * HOUR,
  },
  {
    id: 'seed-r4',
    zoneId: 'village-1',
    rating: 3,
    text: 'Well-lit path but sparse foot traffic at night once residences quiet down.',
    timestamp: now - 3 * HOUR,
  },
  {
    id: 'seed-r5',
    zoneId: 'cif',
    rating: 2,
    text: 'Fine during games but the walk back to the bus loop after closing is pretty dark.',
    timestamp: now - 5 * HOUR,
  },
  {
    id: 'seed-r6',
    zoneId: 'engineering',
    rating: 4,
    text: 'E7 courtyard is quiet after 10pm but there’s always a few people finishing labs.',
    timestamp: now - 7 * HOUR,
  },
  {
    id: 'seed-r7',
    zoneId: 'columbia-lake-village',
    rating: 3,
    text: 'Safe, just isolated — the walk from the bus stop is long and unlit in a few spots.',
    timestamp: now - 10 * HOUR,
  },
  {
    id: 'seed-r8',
    zoneId: 'dana-porter',
    rating: 5,
    text: 'Underrated study spot, staff around late and it’s never actually empty.',
    timestamp: now - 14 * HOUR,
  },
  {
    id: 'seed-r9',
    zoneId: 'qnc',
    rating: 3,
    text: 'Dead quiet after 8pm. Not unsafe, just very few people if something happened.',
    timestamp: now - 1 * DAY,
  },
  {
    id: 'seed-r10',
    zoneId: 'south-campus',
    rating: 3,
    text: 'Long stretch between EV3 and the bus loop could use better lighting.',
    timestamp: now - 1 * DAY - 4 * HOUR,
  },
  {
    id: 'seed-r11',
    zoneId: 'rev',
    rating: 4,
    text: 'Path lighting got fixed last month, big improvement over last year.',
    timestamp: now - 2 * DAY,
  },
  {
    id: 'seed-r12',
    zoneId: 'grebel',
    rating: 5,
    text: 'Small and quiet but always feels safe, everyone kind of knows everyone.',
    timestamp: now - 2 * DAY - 6 * HOUR,
  },
  {
    id: 'seed-r13',
    zoneId: 'uw-place',
    rating: 3,
    text: 'A bit of a walk from everything else, wish there was more lighting along the bike path.',
    timestamp: now - 3 * DAY,
  },
  {
    id: 'seed-r14',
    zoneId: 'slc-pac',
    rating: 4,
    text: 'Busy until the pool closes, then quiets down fast. Still feels fine.',
    timestamp: now - 3 * DAY - 8 * HOUR,
  },
  {
    id: 'seed-r15',
    zoneId: 'math-computer',
    rating: 4,
    text: 'MC is open super late during midterms, always a few people around the vending machines.',
    timestamp: now - 45 * MIN,
  },
  {
    id: 'seed-r16',
    zoneId: 'physics',
    rating: 3,
    text: 'Fine in the evening, but the back entrance by the loading dock is unlit and easy to miss.',
    timestamp: now - 4 * HOUR,
  },
  {
    id: 'seed-r17',
    zoneId: 'main-quad',
    rating: 4,
    text: 'Gets pretty empty after 11pm, but there’s usually campus security doing a loop.',
    timestamp: now - 8 * HOUR,
  },
  {
    id: 'seed-r18',
    zoneId: 'davis-library',
    rating: 4,
    text: 'Only ding is the bike racks outside are in a blind spot from the entrance cameras.',
    timestamp: now - 12 * HOUR,
  },
  {
    id: 'seed-r19',
    zoneId: 'engineering',
    rating: 5,
    text: 'E5 atrium is genuinely one of the better-lit spots on campus after dark.',
    timestamp: now - 16 * HOUR,
  },
  {
    id: 'seed-r20',
    zoneId: 'ring-road-garage',
    rating: 3,
    text: 'Better since they added the emergency phone on level 2, still avoid the stairwell alone.',
    timestamp: now - 1 * DAY - 1 * HOUR,
  },
  {
    id: 'seed-r21',
    zoneId: 'slc-pac',
    rating: 5,
    text: 'Turnkey desk staff are there all night, always felt like a safe place to wait for a ride.',
    timestamp: now - 1 * DAY - 10 * HOUR,
  },
  {
    id: 'seed-r22',
    zoneId: 'qnc',
    rating: 4,
    text: 'Card access after hours means you basically only see people who belong there.',
    timestamp: now - 2 * DAY - 3 * HOUR,
  },
  {
    id: 'seed-r23',
    zoneId: 'village-1',
    rating: 4,
    text: 'Courtyard lighting is solid, just wish the side path to REV was better lit.',
    timestamp: now - 2 * DAY - 14 * HOUR,
  },
  {
    id: 'seed-r24',
    zoneId: 'south-campus',
    rating: 2,
    text: 'Genuinely avoid this stretch after dark, not enough people around and it’s poorly lit.',
    timestamp: now - 4 * DAY,
  },
];

export const SEED_INCIDENTS: IncidentReport[] = [
  {
    id: 'seed-i1',
    zoneId: 'ring-road-garage',
    category: 'poorly_lit',
    note: 'Two lights out on level 3 near the stairwell.',
    anonymous: true,
    timestamp: now - 40 * MIN,
  },
  {
    id: 'seed-i2',
    zoneId: 'cif',
    category: 'poorly_lit',
    anonymous: true,
    timestamp: now - 3 * HOUR,
  },
  {
    id: 'seed-i3',
    zoneId: 'south-campus',
    category: 'unsafe_crossing',
    note: 'Cars cut through the EV3 lot pretty fast, no marked crosswalk.',
    anonymous: true,
    timestamp: now - 9 * HOUR,
  },
  {
    id: 'seed-i4',
    zoneId: 'village-1',
    category: 'broken_lock',
    note: 'Side entrance door not latching properly.',
    anonymous: false,
    timestamp: now - 1 * DAY - 2 * HOUR,
  },
  {
    id: 'seed-i5',
    zoneId: 'columbia-lake-village',
    category: 'suspicious_activity',
    anonymous: true,
    timestamp: now - 2 * DAY,
  },
];

export const SEED_ROUTE_RATINGS: RouteRating[] = [
  {
    id: 'seed-rr1',
    routeKey: 'main-quad>davis-library>south-campus',
    rating: 5,
    comment: 'Felt safe the whole way, well lit.',
    timestamp: now - 6 * HOUR,
  },
  {
    id: 'seed-rr2',
    routeKey: 'village-1>ring-road-garage>slc-pac',
    rating: 3,
    comment: 'Fine but the garage stretch was a bit sketchy at night.',
    timestamp: now - 1 * DAY,
  },
];
