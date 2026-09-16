import { CAMPUS_GRAPH, getZone } from '../data/zones';
import { ZoneScoreBreakdown } from '../types';

export interface RouteCandidate {
  path: string[]; // zone ids, origin -> destination
  totalMinutes: number;
  avgScore: number;
  cost: number;
}

export function routeKeyForPath(path: string[]): string {
  return path.join('>');
}

function scoreFor(zoneId: string, breakdowns: Record<string, ZoneScoreBreakdown>): number {
  return breakdowns[zoneId]?.score ?? getZone(zoneId)?.baseline ?? 70;
}

// Enumerates simple paths (no revisits) up to maxHops, scores each by a cost
// that heavily penalizes routing through low-safety zones, then applies a
// small adjustment from past community ratings of that exact path.
export function computeSafeRoute(
  originId: string,
  destId: string,
  breakdowns: Record<string, ZoneScoreBreakdown>,
  avgRatingForRoute: (routeKey: string) => number | null,
  maxHops = 5
): RouteCandidate[] {
  const candidates: RouteCandidate[] = [];

  function dfs(current: string, path: string[], minutes: number) {
    if (path.length > maxHops + 1) return;
    if (current === destId && path.length > 1) {
      const scores = path.map((id) => scoreFor(id, breakdowns));
      const avgScore = scores.reduce((s, v) => s + v, 0) / scores.length;
      // Base cost: time plus a heavy penalty for low-safety zones along the
      // way (safety dominates minor time differences).
      const safetyPenalty = scores.reduce((s, v) => s + Math.max(0, 70 - v), 0) * 1.4;
      let cost = minutes + safetyPenalty;

      const rating = avgRatingForRoute(routeKeyForPath(path));
      if (rating != null) {
        // Past rider feedback nudges cost slightly — never dominant.
        cost -= (rating - 3) * 4;
      }

      candidates.push({ path: [...path], totalMinutes: minutes, avgScore, cost });
      return;
    }
    const edges = CAMPUS_GRAPH[current] ?? [];
    for (const edge of edges) {
      if (path.includes(edge.to)) continue; // no revisits
      dfs(edge.to, [...path, edge.to], minutes + edge.minutes);
    }
  }

  dfs(originId, [originId], 0);
  candidates.sort((a, b) => a.cost - b.cost);
  return candidates;
}
