import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LatLng, Zone, ZoneScoreBreakdown } from '../types';
import { colors, scoreToColor } from '../theme/colors';
import { UW_CENTER, ZONES } from '../data/zones';
import { MapErrorBoundary } from './MapErrorBoundary';

let MapView: any = null;
let Polygon: any = null;
let Marker: any = null;
let Polyline: any = null;
try {
  // react-native-maps ships in Expo Go; guarded so a missing/broken native
  // module never takes the whole demo down.
  if (Platform.OS !== 'web') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const maps = require('react-native-maps');
    MapView = maps.default;
    Polygon = maps.Polygon;
    Marker = maps.Marker;
    Polyline = maps.Polyline;
  }
} catch (e) {
  console.warn('[CampusMap] react-native-maps unavailable, using placeholder', e);
}

interface Props {
  breakdowns: Record<string, ZoneScoreBreakdown>;
  onZonePress: (zoneId: string) => void;
  selectedZoneId?: string | null;
  routePath?: LatLng[];
  // When set, only these zones are rendered (all others hidden) — used by
  // Safe Route to keep the map focused on origin/destination instead of
  // showing every zone on campus.
  visibleZoneIds?: string[];
  originId?: string;
  destId?: string;
  // Current simulated position along an active route, rendered as a
  // Google/Apple-Maps-style "you are here" puck.
  livePosition?: LatLng;
}

function scoreFor(breakdowns: Record<string, ZoneScoreBreakdown>, zoneId: string, baseline: number) {
  return breakdowns[zoneId]?.score ?? baseline;
}

function EndpointTag({ kind }: { kind: 'origin' | 'destination' }) {
  return (
    <View style={[styles.endpointTag, kind === 'origin' ? styles.endpointTagFrom : styles.endpointTagTo]}>
      <Ionicons
        name={kind === 'origin' ? 'ellipse' : 'location'}
        size={10}
        color={colors.white}
      />
      <Text style={styles.endpointTagText}>{kind === 'origin' ? 'FROM' : 'TO'}</Text>
    </View>
  );
}

function PlaceholderMap({ breakdowns, onZonePress, selectedZoneId, visibleZoneIds, originId, destId, routePath }: Props) {
  const zonesToShow = visibleZoneIds ? ZONES.filter((z) => visibleZoneIds.includes(z.id)) : ZONES;
  const isFocused = !!visibleZoneIds;
  return (
    <View style={styles.placeholderWrap}>
      <Text style={styles.placeholderTitle}>Secura — Zone View</Text>
      <Text style={styles.placeholderSubtitle}>
        Map tiles unavailable in this environment — showing live zone scores.
      </Text>
      <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={styles.placeholderGrid}>
        {zonesToShow.map((zone, idx) => (
          <React.Fragment key={zone.id}>
            <TouchableOpacity
              onPress={() => onZonePress(zone.id)}
              style={[
                styles.placeholderTile,
                { borderColor: scoreToColor(scoreFor(breakdowns, zone.id, zone.baseline)) },
                selectedZoneId === zone.id && styles.placeholderTileSelected,
              ]}
            >
              {zone.id === originId && <EndpointTag kind="origin" />}
              {zone.id === destId && <EndpointTag kind="destination" />}
              <View
                style={[styles.dot, { backgroundColor: scoreToColor(scoreFor(breakdowns, zone.id, zone.baseline)) }]}
              />
              <Text style={styles.placeholderTileName}>{zone.shortName}</Text>
              <Text style={styles.placeholderTileScore}>{scoreFor(breakdowns, zone.id, zone.baseline)}</Text>
            </TouchableOpacity>
            {isFocused && routePath && idx < zonesToShow.length - 1 && (
              <Ionicons name="arrow-forward" size={20} color={colors.accent} style={{ marginHorizontal: 2 }} />
            )}
          </React.Fragment>
        ))}
      </ScrollView>
    </View>
  );
}

export function CampusMap(props: Props) {
  const { breakdowns, onZonePress, selectedZoneId, routePath, visibleZoneIds, originId, destId, livePosition } =
    props;

  if (!MapView) {
    return <PlaceholderMap {...props} />;
  }

  const zonesToShow = visibleZoneIds ? ZONES.filter((z) => visibleZoneIds.includes(z.id)) : ZONES;

  return (
    <MapErrorBoundary fallback={<PlaceholderMap {...props} />}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: UW_CENTER.latitude,
          longitude: UW_CENTER.longitude,
          latitudeDelta: 0.014,
          longitudeDelta: 0.014,
        }}
      >
        {routePath && routePath.length > 1 && (
          <>
            {/* Dark halo underneath, colored line on top — the classic
                turn-by-turn nav look. */}
            <Polyline coordinates={routePath} strokeColor={colors.bg} strokeWidth={8} lineCap="round" lineJoin="round" />
            <Polyline coordinates={routePath} strokeColor={colors.accent} strokeWidth={5} lineCap="round" lineJoin="round" />
          </>
        )}
        {zonesToShow.map((zone: Zone) => {
          const score = scoreFor(breakdowns, zone.id, zone.baseline);
          const color = scoreToColor(score);
          const isSelected = selectedZoneId === zone.id;
          const isOrigin = zone.id === originId;
          const isDest = zone.id === destId;
          return (
            <React.Fragment key={zone.id}>
              <Polygon
                coordinates={zone.polygon}
                fillColor={`${color}${isOrigin || isDest ? '55' : isSelected ? '4A' : '33'}`}
                strokeColor={isOrigin || isDest ? colors.accent : color}
                strokeWidth={isSelected || isOrigin || isDest ? 3 : 1.5}
                tappable
                onPress={() => onZonePress(zone.id)}
              />
              <Marker
                coordinate={zone.center}
                onPress={() => onZonePress(zone.id)}
                tracksViewChanges={false}
              >
                <View style={styles.markerWrap}>
                  {isOrigin && <EndpointTag kind="origin" />}
                  {isDest && <EndpointTag kind="destination" />}
                  <View style={[styles.markerBubble, { borderColor: color }]}>
                    {(visibleZoneIds || isOrigin || isDest) && (
                      <Text style={styles.markerName} numberOfLines={1}>
                        {zone.shortName}
                      </Text>
                    )}
                    <View style={[styles.markerDot, { backgroundColor: color }]} />
                    <Text style={styles.markerScore}>{score}</Text>
                  </View>
                </View>
              </Marker>
            </React.Fragment>
          );
        })}
        {livePosition && (
          <Marker coordinate={livePosition} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <View style={styles.livePuckHalo}>
              <View style={styles.livePuckDot} />
            </View>
          </Marker>
        )}
      </MapView>
    </MapErrorBoundary>
  );
}

const styles = StyleSheet.create({
  map: { width: '100%', height: '100%' },
  markerWrap: { alignItems: 'center' },
  markerBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 5,
  },
  markerName: { color: colors.textSecondary, fontSize: 10.5, fontWeight: '600', maxWidth: 90 },
  markerDot: { width: 8, height: 8, borderRadius: 4 },
  markerScore: { color: colors.textPrimary, fontSize: 12, fontWeight: '700' },
  livePuckHalo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(108, 122, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  livePuckDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.white,
  },
  endpointTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 3,
  },
  endpointTagFrom: { backgroundColor: colors.safe },
  endpointTagTo: { backgroundColor: colors.accent },
  endpointTagText: { color: colors.white, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  placeholderWrap: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 20,
    justifyContent: 'center',
  },
  placeholderTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  placeholderSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  placeholderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderTile: {
    width: '42%',
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  placeholderTileSelected: { backgroundColor: colors.cardAlt },
  dot: { width: 12, height: 12, borderRadius: 6, marginBottom: 4 },
  placeholderTileName: { color: colors.textPrimary, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  placeholderTileScore: { color: colors.textSecondary, fontSize: 20, fontWeight: '800' },
});
