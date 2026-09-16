export type LatLng = { latitude: number; longitude: number };

export interface Zone {
  id: string;
  name: string;
  shortName: string;
  description: string;
  center: LatLng;
  // Polygon footprint for map overlay (roughly around center)
  polygon: LatLng[];
  // Baseline score tendency used by the simulator (higher = generally calmer)
  baseline: number;
}

// One virtual phone's periodic report. Only a noise-level BUCKET is ever
// produced/transmitted — raw audio never leaves the device.
export type NoiseLevel = 'quiet' | 'moderate' | 'loud' | 'very_loud';

export interface PhoneReport {
  phoneId: string;
  zoneId: string;
  noiseLevel: NoiseLevel;
  timestamp: number;
}

export type VerkadaSignalType = 'motion' | 'audio' | 'thermal' | 'access_control' | 'environmental';

export interface VerkadaEvent {
  sensorId: string;
  zoneId: string;
  signalType: VerkadaSignalType;
  // Normalized intensity 0-1 for this event window; raw payload is discarded
  // immediately after this score is derived.
  intensity: number;
  timestamp: number;
}

export interface OutlierFlag {
  phoneId: string;
  reason: string;
}

export interface ZoneScoreBreakdown {
  zoneId: string;
  score: number; // 0-100, final fused score
  timestamp: number;

  // Phone (crowd-sourced) signal
  phoneCount: number;
  avgNoiseLevel: NoiseLevel;
  phoneNoiseScore: number; // 0-100 contribution before fusion

  // Verkada corroboration
  corroboratedPhoneCount: number;
  discardedOutliers: OutlierFlag[];
  verkadaActivityScore: number; // 0-100

  // Community modifier (always minor)
  communityModifier: number; // small +/- adjustment
  objectiveWeightPct: number; // e.g. 90
  communityWeightPct: number; // e.g. 10

  trend: 'rising' | 'falling' | 'steady';
  actionTier: 'Monitor' | 'Dispatch' | 'Lockdown';
}

export interface IncidentReport {
  id: string;
  zoneId: string;
  category: 'poorly_lit' | 'suspicious_activity' | 'unsafe_crossing' | 'broken_lock' | 'other';
  note?: string;
  anonymous: boolean;
  timestamp: number;
}

export interface CommunityReview {
  id: string;
  zoneId: string;
  rating: number; // 1-5
  text: string;
  timestamp: number;
}

export interface RouteRating {
  id: string;
  routeKey: string; // originZoneId->destZoneId
  rating: number;
  comment?: string;
  timestamp: number;
}
