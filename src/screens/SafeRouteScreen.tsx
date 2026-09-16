import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, scoreToColor } from '../theme/colors';
import { CampusMap } from '../components/CampusMap';
import { SheetModal } from '../components/SheetModal';
import { StarRating } from '../components/StarRating';
import { LocationPicker } from '../components/LocationPicker';
import { useAppData } from '../context/AppDataContext';
import { getZone } from '../data/zones';
import { LatLng } from '../types';
import { computeSafeRoute, routeKeyForPath, RouteCandidate } from '../utils/routing';

function lerp(a: LatLng, b: LatLng, t: number): LatLng {
  return {
    latitude: a.latitude + (b.latitude - a.latitude) * t,
    longitude: a.longitude + (b.longitude - a.longitude) * t,
  };
}

// Real time-per-simulated-minute so a demo trip finishes in a reasonable
// amount of time on stage instead of taking as long as the real walk would.
const MS_PER_ROUTE_MINUTE = 2200;
const MIN_TRIP_DURATION_MS = 12000;

export function SafeRouteScreen() {
  const { breakdowns, avgRatingForRoute, addRouteRating } = useAppData();
  const [originId, setOriginId] = useState('main-quad');
  const [originLabel, setOriginLabel] = useState(getZone('main-quad')!.name);
  const [destId, setDestId] = useState('village-1');
  const [destLabel, setDestLabel] = useState(getZone('village-1')!.name);
  const [route, setRoute] = useState<RouteCandidate | null>(null);
  const [tripActive, setTripActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const navStartRef = useRef(0);

  const routePath = useMemo(
    () => (route ? route.path.map((id) => getZone(id)!.center) : undefined),
    [route]
  );

  const hopCount = route ? route.path.length - 1 : 0;
  const stepFloat = hopCount > 0 ? progress * hopCount : 0;
  const currentStepIndex = route ? Math.min(hopCount - 1, Math.floor(stepFloat)) : 0;
  const segmentFrac = stepFloat - currentStepIndex;
  const currentZoneId = route?.path[currentStepIndex];
  const nextZoneId = route?.path[currentStepIndex + 1];
  const arrived = progress >= 1;
  const livePosition =
    tripActive && routePath && routePath.length > 1
      ? lerp(routePath[currentStepIndex], routePath[Math.min(currentStepIndex + 1, routePath.length - 1)], segmentFrac)
      : undefined;
  const remainingMinutes = route ? Math.max(0, Math.round(route.totalMinutes * (1 - progress))) : 0;

  useEffect(() => {
    if (!tripActive || !route) return;
    const durationMs = Math.max(MIN_TRIP_DURATION_MS, route.totalMinutes * MS_PER_ROUTE_MINUTE);
    const interval = setInterval(() => {
      const p = Math.min(1, (Date.now() - navStartRef.current) / durationMs);
      setProgress(p);
      if (p >= 1) {
        clearInterval(interval);
      }
    }, 150);
    return () => clearInterval(interval);
  }, [tripActive, route]);

  useEffect(() => {
    if (arrived && tripActive) {
      endTrip();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrived]);

  function findRoute() {
    if (originId === destId) return;
    const candidates = computeSafeRoute(originId, destId, breakdowns, avgRatingForRoute);
    if (candidates.length > 0) {
      setRoute(candidates[0]);
      setProgress(0);
      navStartRef.current = Date.now();
      setTripActive(true);
    }
  }

  function endTrip() {
    setTripActive(false);
    setRatingOpen(true);
  }

  function submitRating() {
    if (route) {
      addRouteRating({
        routeKey: routeKeyForPath(route.path),
        rating: ratingValue,
        comment: ratingComment.trim() || undefined,
      });
    }
    setRatingOpen(false);
    setRatingValue(5);
    setRatingComment('');
    setRoute(null);
    setProgress(0);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Safe Route</Text>
        <Text style={styles.subtitle}>Routed through the highest Secura Score zones</Text>
      </View>

      {tripActive && route ? (
        <View style={styles.navBanner}>
          <View style={styles.navBannerRow}>
            <View style={styles.navBannerIcon}>
              <Ionicons name={arrived ? 'flag' : 'navigate'} size={18} color={colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.navInstruction} numberOfLines={1}>
                {arrived ? `You've arrived at ${destLabel}` : `Head to ${getZone(nextZoneId ?? '')?.shortName}`}
              </Text>
              <Text style={styles.navSub}>
                {arrived ? 'Trip complete' : `${remainingMinutes} min left · through ${getZone(currentZoneId ?? '')?.shortName}`}
              </Text>
            </View>
            <TouchableOpacity style={styles.navCancelBtn} onPress={endTrip}>
              <Ionicons name="close" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <View style={styles.navProgressTrack}>
            <View style={[styles.navProgressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>
      ) : (
        <View style={styles.pickerBlock}>
          <LocationPicker
            label="From"
            selectedLabel={originLabel}
            onSelect={(id, lbl) => {
              setOriginId(id);
              setOriginLabel(lbl);
            }}
            breakdowns={breakdowns}
          />
          <LocationPicker
            label="To"
            selectedLabel={destLabel}
            onSelect={(id, lbl) => {
              setDestId(id);
              setDestLabel(lbl);
            }}
            breakdowns={breakdowns}
          />
          <TouchableOpacity
            style={[styles.findBtn, originId === destId && styles.findBtnDisabled]}
            onPress={findRoute}
            disabled={originId === destId}
          >
            <Ionicons name="navigate-outline" size={16} color={colors.white} />
            <Text style={styles.findBtnText}>Find Safe Route</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.mapWrap}>
        <CampusMap
          breakdowns={breakdowns}
          onZonePress={() => {}}
          routePath={routePath}
          visibleZoneIds={[originId, destId]}
          originId={originId}
          destId={destId}
          livePosition={livePosition}
        />
      </View>

      {route && (
        <View style={styles.routeCard}>
          <ScrollView>
            <View style={styles.routeStatsRow}>
              <RouteStat label="Est. time" value={`${route.totalMinutes} min`} />
              <RouteStat label="Avg. Secura Score" value={`${Math.round(route.avgScore)}`} />
              <RouteStat label="Zones" value={`${route.path.length}`} />
            </View>
            <Text style={styles.waypointsTitle}>Waypoints</Text>
            {route.path.map((zoneId, idx) => {
              const zone = getZone(zoneId)!;
              const score = breakdowns[zoneId]?.score ?? zone.baseline;
              const isPast = tripActive && idx < currentStepIndex;
              const isCurrent = tripActive && idx === currentStepIndex;
              return (
                <View key={`${zoneId}-${idx}`} style={[styles.waypointRow, isCurrent && styles.waypointRowActive]}>
                  <View style={[styles.waypointIndexWrap, isPast && styles.waypointIndexPast]}>
                    {isPast ? (
                      <Ionicons name="checkmark" size={13} color={colors.safe} />
                    ) : (
                      <Text style={styles.waypointIndex}>{idx + 1}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.waypointName}>{zone.shortName}</Text>
                      {isCurrent && <Text style={styles.hereTag}>YOU ARE HERE</Text>}
                    </View>
                    {idx < route.path.length - 1 && (
                      <Text style={styles.waypointNext}>
                        → {getZone(route.path[idx + 1])?.shortName}
                      </Text>
                    )}
                  </View>
                  <View style={[styles.waypointScore, { borderColor: scoreToColor(score) }]}>
                    <Text style={[styles.waypointScoreText, { color: scoreToColor(score) }]}>
                      {score}
                    </Text>
                  </View>
                </View>
              );
            })}
            {tripActive ? (
              <TouchableOpacity style={styles.endTripBtn} onPress={endTrip}>
                <Text style={styles.endTripBtnText}>End Trip</Text>
              </TouchableOpacity>
            ) : null}
          </ScrollView>
        </View>
      )}

      <SheetModal visible={ratingOpen} onClose={() => setRatingOpen(false)}>
        <Text style={styles.title}>How was this route?</Text>
        <Text style={styles.subtitle}>Your rating lightly informs future routing on this path.</Text>
        <View style={styles.starsWrap}>
          <StarRating value={ratingValue} onChange={setRatingValue} size={32} />
        </View>
        <TextInput
          value={ratingComment}
          onChangeText={setRatingComment}
          placeholder="Optional comment…"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          multiline
        />
        <TouchableOpacity style={styles.findBtn} onPress={submitRating}>
          <Text style={styles.findBtnText}>Submit rating</Text>
        </TouchableOpacity>
      </SheetModal>
    </SafeAreaView>
  );
}

function RouteStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 10 },
  title: { color: colors.textPrimary, fontSize: 21, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: 11.5, marginTop: 2 },
  pickerBlock: { paddingHorizontal: 18, paddingBottom: 10 },
  navBanner: {
    marginHorizontal: 18,
    marginBottom: 10,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  navBannerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  navBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navInstruction: { color: colors.textPrimary, fontSize: 15.5, fontWeight: '700' },
  navSub: { color: colors.textMuted, fontSize: 11.5, marginTop: 2 },
  navCancelBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navProgressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  navProgressFill: { height: 5, borderRadius: 3, backgroundColor: colors.accent },
  findBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 6,
  },
  findBtnDisabled: { opacity: 0.4 },
  findBtnText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  mapWrap: { flex: 1, minHeight: 160 },
  routeCard: {
    maxHeight: '38%',
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
  },
  routeStatsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statBox: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statValue: { color: colors.textPrimary, fontSize: 17, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: 10.5, marginTop: 2 },
  waypointsTitle: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  waypointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
    borderRadius: 12,
    padding: 6,
  },
  waypointRowActive: { backgroundColor: colors.accentSoft },
  waypointIndexWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waypointIndexPast: { backgroundColor: colors.safeSoft },
  waypointIndex: { color: colors.textSecondary, fontSize: 11, fontWeight: '700' },
  waypointName: { color: colors.textPrimary, fontSize: 13.5, fontWeight: '600' },
  hereTag: { color: colors.accent, fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },
  waypointNext: { color: colors.textMuted, fontSize: 11, marginTop: 1 },
  waypointScore: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  waypointScoreText: { fontSize: 12, fontWeight: '700' },
  endTripBtn: {
    backgroundColor: colors.risk,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 10,
  },
  endTripBtnText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  starsWrap: { alignItems: 'center', marginVertical: 16 },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    color: colors.textPrimary,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 14,
    fontSize: 13,
  },
});
