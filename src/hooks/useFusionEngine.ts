import { useEffect, useRef, useState, useCallback } from 'react';
import { ZONES } from '../data/zones';
import { scoreToActionTier } from '../theme/colors';
import {
  CommunityReview,
  NoiseLevel,
  OutlierFlag,
  PhoneReport,
  VerkadaEvent,
  VerkadaSignalType,
  ZoneScoreBreakdown,
} from '../types';

const TICK_MS = 3500;
const HISTORY_LENGTH = 24;
const OBJECTIVE_WEIGHT = 0.9;
const COMMUNITY_WEIGHT = 0.1;

const SIGNAL_TYPES: VerkadaSignalType[] = ['motion', 'audio', 'thermal', 'access_control', 'environmental'];

function clamp(n: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, n));
}

function numericToNoiseLevel(n: number): NoiseLevel {
  if (n < 0.25) return 'quiet';
  if (n < 0.5) return 'moderate';
  if (n < 0.75) return 'loud';
  return 'very_loud';
}

function noiseLevelToNumeric(level: NoiseLevel): number {
  switch (level) {
    case 'quiet':
      return 0.12;
    case 'moderate':
      return 0.4;
    case 'loud':
      return 0.68;
    case 'very_loud':
      return 0.92;
  }
}

function gaussianJitter(spread: number) {
  // Approximate normal jitter via averaged uniforms (Irwin-Hall-ish)
  return ((Math.random() + Math.random() + Math.random()) / 3 - 0.5) * 2 * spread;
}

interface ZoneHiddenState {
  // A slowly random-walking "ground truth" risk level (0-1) that both phones
  // and Verkada sensors sample from, with independent noise. This is what
  // makes cross-corroboration meaningful in the simulation: a real spike
  // shows up (noisily) in both channels, a glitchy single phone does not.
  trueRisk: number;
  // Each zone's own resting risk level, derived from its baseline. trueRisk
  // is pulled back toward this after spikes so zones settle back into their
  // own characteristic range instead of every zone drifting toward the same
  // extreme over a long-running session.
  restingRisk: number;
  incidentPenalty: number;
  expectedPhoneCount: number;
}

export interface FusionEngineResult {
  breakdowns: Record<string, ZoneScoreBreakdown>;
  history: Record<string, { score: number; timestamp: number }[]>;
  lastPhoneReports: Record<string, PhoneReport[]>;
  lastVerkadaEvents: Record<string, VerkadaEvent[]>;
  reportIncident: (zoneId: string) => void;
}

export function useFusionEngine(communityReviews: CommunityReview[]): FusionEngineResult {
  const [breakdowns, setBreakdowns] = useState<Record<string, ZoneScoreBreakdown>>({});
  const [history, setHistory] = useState<Record<string, { score: number; timestamp: number }[]>>({});
  const [lastPhoneReports, setLastPhoneReports] = useState<Record<string, PhoneReport[]>>({});
  const [lastVerkadaEvents, setLastVerkadaEvents] = useState<Record<string, VerkadaEvent[]>>({});

  const reviewsRef = useRef<CommunityReview[]>(communityReviews);
  useEffect(() => {
    reviewsRef.current = communityReviews;
  }, [communityReviews]);

  const hiddenStateRef = useRef<Record<string, ZoneHiddenState>>(
    Object.fromEntries(
      ZONES.map((z) => {
        const restingRisk = clamp(1 - z.baseline / 100, 0, 1);
        return [
          z.id,
          {
            trueRisk: restingRisk,
            restingRisk,
            incidentPenalty: 0,
            expectedPhoneCount: 5 + Math.round((z.baseline / 100) * 10),
          },
        ];
      })
    )
  );

  const historyRef = useRef<Record<string, { score: number; timestamp: number }[]>>(
    Object.fromEntries(ZONES.map((z) => [z.id, []]))
  );

  const reportIncident = useCallback((zoneId: string) => {
    const hs = hiddenStateRef.current[zoneId];
    if (hs) {
      // Incident reports nudge the score short-term; they decay over
      // subsequent ticks rather than permanently altering the zone.
      hs.incidentPenalty = clamp(hs.incidentPenalty + 9, 0, 40);
    }
  }, []);

  const communityScoreComponent = useCallback((zoneId: string): number => {
    const reviews = reviewsRef.current.filter((r) => r.zoneId === zoneId);
    if (reviews.length === 0) return 70; // neutral prior when no reviews yet
    const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    return clamp(avgRating * 20);
  }, []);

  const tick = useCallback(() => {
    const now = Date.now();
    const nextBreakdowns: Record<string, ZoneScoreBreakdown> = {};
    const nextPhoneReports: Record<string, PhoneReport[]> = {};
    const nextVerkadaEvents: Record<string, VerkadaEvent[]> = {};

    for (const zone of ZONES) {
      const hs = hiddenStateRef.current[zone.id];

      // 1. Random-walk the hidden ground-truth risk level, pulled back
      // toward this zone's own resting level so a spike decays rather than
      // permanently dragging every zone toward the same extreme.
      const reversion = (hs.restingRisk - hs.trueRisk) * 0.12;
      hs.trueRisk = clamp(hs.trueRisk + gaussianJitter(0.05) + reversion, 0, 1);
      // Rare "event" spikes to make the demo lively — occasionally a dip
      // (unusually quiet), occasionally a spike (something's happening).
      if (Math.random() < 0.05) {
        hs.trueRisk = clamp(hs.trueRisk + (Math.random() < 0.5 ? 0.3 : -0.3), 0, 1);
      }

      // 2. Simulate phone reports for this zone. Each phone independently
      // computes ONLY a noise-level bucket on-device — the underlying raw
      // audio sample is generated transiently for this simulation and
      // discarded immediately, never transmitted or stored.
      const phoneCount = Math.max(1, Math.round(hs.expectedPhoneCount + gaussianJitter(3)));
      const phoneReports: PhoneReport[] = [];
      for (let i = 0; i < phoneCount; i++) {
        const isGlitch = Math.random() < 0.08; // dropped phone, pocket rustle, etc.
        const rawNoiseSample = isGlitch
          ? clamp(Math.random(), 0, 1)
          : clamp(hs.trueRisk + gaussianJitter(0.15), 0, 1);
        const bucket = numericToNoiseLevel(rawNoiseSample);
        // console.log('[privacy] raw audio sample discarded on-device; only bucket leaves phone:', bucket);
        phoneReports.push({
          phoneId: `${zone.id}-phone-${i}`,
          zoneId: zone.id,
          noiseLevel: bucket,
          timestamp: now,
        });
      }

      // 3. Simulate Verkada sensor events for this zone — fewer, higher-trust
      // signals sampled from the same ground truth with less noise.
      const eventCount = 1 + Math.round(Math.random() * 3);
      const verkadaEvents: VerkadaEvent[] = [];
      for (let i = 0; i < eventCount; i++) {
        const signalType = SIGNAL_TYPES[Math.floor(Math.random() * SIGNAL_TYPES.length)];
        const intensity = clamp(hs.trueRisk + gaussianJitter(0.08), 0, 1);
        verkadaEvents.push({
          sensorId: `${zone.id}-sensor-${i}`,
          zoneId: zone.id,
          signalType,
          intensity,
          timestamp: now,
        });
        // console.log('[privacy] raw Verkada payload discarded after scoring; only intensity retained:', intensity.toFixed(2));
      }
      const avgVerkadaIntensity =
        verkadaEvents.reduce((s, e) => s + e.intensity, 0) / verkadaEvents.length;

      // 4. Outlier filtering: cross-check each phone's noise report against
      // the Verkada-derived activity estimate for the same zone/window. A
      // phone reporting a spike with no sensor corroboration is discounted.
      const noiseNumerics = phoneReports.map((r) => noiseLevelToNumeric(r.noiseLevel));
      const sorted = [...noiseNumerics].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
      const corroborationThreshold = 0.35;

      const discardedOutliers: OutlierFlag[] = [];
      const keptNumerics: number[] = [];
      phoneReports.forEach((report, idx) => {
        const numeric = noiseNumerics[idx];
        const deviatesFromPeers = Math.abs(numeric - median) > 0.4;
        const corroboratedBySensor = Math.abs(numeric - avgVerkadaIntensity) < corroborationThreshold;
        if (deviatesFromPeers && !corroboratedBySensor) {
          discardedOutliers.push({
            phoneId: report.phoneId,
            reason: 'outlier filtered: no sensor corroboration',
          });
        } else {
          keptNumerics.push(numeric);
        }
      });

      const correctedAvgNoise =
        keptNumerics.length > 0
          ? keptNumerics.reduce((s, n) => s + n, 0) / keptNumerics.length
          : median;
      const corroboratedPhoneCount = phoneReports.length - discardedOutliers.length;

      const phoneNoiseScore = clamp(100 - correctedAvgNoise * 100);
      const verkadaActivityScore = clamp(100 - avgVerkadaIntensity * 100);

      // 5. Fuse objective signals, then blend in the (deliberately minor)
      // community score component.
      const objectiveScore = clamp(phoneNoiseScore * 0.6 + verkadaActivityScore * 0.4);
      const communityComponent = communityScoreComponent(zone.id);
      let fusedScore = clamp(
        objectiveScore * OBJECTIVE_WEIGHT + communityComponent * COMMUNITY_WEIGHT
      );

      // 6. Apply and decay any short-term incident-report penalty.
      fusedScore = clamp(fusedScore - hs.incidentPenalty);
      hs.incidentPenalty = clamp(hs.incidentPenalty - 1.5, 0, 40);

      // 7. Update history + trend.
      const prevHistory = historyRef.current[zone.id] ?? [];
      const newHistory = [...prevHistory, { score: fusedScore, timestamp: now }].slice(
        -HISTORY_LENGTH
      );
      historyRef.current[zone.id] = newHistory;

      let trend: 'rising' | 'falling' | 'steady' = 'steady';
      if (newHistory.length >= 4) {
        const recent = newHistory.slice(-3);
        const prior = newHistory.slice(-6, -3);
        if (prior.length > 0) {
          const recentAvg = recent.reduce((s, h) => s + h.score, 0) / recent.length;
          const priorAvg = prior.reduce((s, h) => s + h.score, 0) / prior.length;
          const diff = recentAvg - priorAvg;
          if (diff > 2.5) trend = 'rising';
          else if (diff < -2.5) trend = 'falling';
        }
      }

      nextBreakdowns[zone.id] = {
        zoneId: zone.id,
        score: Math.round(fusedScore),
        timestamp: now,
        phoneCount: phoneReports.length,
        avgNoiseLevel: numericToNoiseLevel(correctedAvgNoise),
        phoneNoiseScore: Math.round(phoneNoiseScore),
        corroboratedPhoneCount,
        discardedOutliers,
        verkadaActivityScore: Math.round(verkadaActivityScore),
        communityModifier: Math.round(communityComponent - 70),
        objectiveWeightPct: OBJECTIVE_WEIGHT * 100,
        communityWeightPct: COMMUNITY_WEIGHT * 100,
        trend,
        actionTier: scoreToActionTier(fusedScore),
      };
      nextPhoneReports[zone.id] = phoneReports;
      nextVerkadaEvents[zone.id] = verkadaEvents;
    }

    setBreakdowns(nextBreakdowns);
    setHistory({ ...historyRef.current });
    setLastPhoneReports(nextPhoneReports);
    setLastVerkadaEvents(nextVerkadaEvents);
  }, [communityScoreComponent]);

  useEffect(() => {
    tick();
    const interval = setInterval(tick, TICK_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { breakdowns, history, lastPhoneReports, lastVerkadaEvents, reportIncident };
}
