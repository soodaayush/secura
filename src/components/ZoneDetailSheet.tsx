import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, scoreToColor, scoreToLabel } from '../theme/colors';
import { Zone, ZoneScoreBreakdown } from '../types';

interface Props {
  zone: Zone;
  breakdown?: ZoneScoreBreakdown;
  isAdmin?: boolean;
}

const TREND_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  rising: 'trending-up',
  falling: 'trending-down',
  steady: 'remove-outline',
};

const NOISE_LABEL: Record<string, string> = {
  quiet: 'Quiet',
  moderate: 'Moderate',
  loud: 'Loud',
  very_loud: 'Very loud',
};

const ACTION_COLOR: Record<string, string> = {
  Monitor: colors.safe,
  Dispatch: colors.caution,
  Lockdown: colors.risk,
};

export function ZoneDetailSheet({ zone, breakdown, isAdmin }: Props) {
  if (!breakdown) {
    return <Text style={styles.zoneName}>Loading zone data…</Text>;
  }
  const color = scoreToColor(breakdown.score);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.zoneName}>{zone.name}</Text>
          <Text style={styles.zoneDesc}>{zone.description}</Text>
        </View>
        <View style={[styles.scoreBadge, { borderColor: color }]}>
          <Text style={[styles.scoreNumber, { color }]}>{breakdown.score}</Text>
          <View style={styles.trendRow}>
            <Ionicons name={TREND_ICON[breakdown.trend]} size={13} color={colors.textMuted} />
            <Text style={styles.trendText}>{breakdown.trend}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.statusPill, { backgroundColor: `${color}22` }]}>
        <View style={[styles.statusDot, { backgroundColor: color }]} />
        <Text style={[styles.statusText, { color }]}>{scoreToLabel(breakdown.score)}</Text>
        {isAdmin && (
          <Text style={[styles.actionTierText, { color: ACTION_COLOR[breakdown.actionTier] }]}>
            {'  ·  '}
            {breakdown.actionTier}
          </Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>What's driving this Secura Score</Text>

      <View style={styles.row}>
        <Ionicons name="phone-portrait-outline" size={16} color={colors.accent} />
        <Text style={styles.rowLabel}>Phone reports</Text>
        <Text style={styles.rowValue}>
          {breakdown.phoneCount} nearby · {NOISE_LABEL[breakdown.avgNoiseLevel]}
        </Text>
      </View>
      <View style={styles.row}>
        <Ionicons name="checkmark-done-outline" size={16} color={colors.safe} />
        <Text style={styles.rowLabel}>Verkada corroboration</Text>
        <Text style={styles.rowValue}>
          {breakdown.corroboratedPhoneCount}/{breakdown.phoneCount} confirmed
        </Text>
      </View>
      {breakdown.discardedOutliers.length > 0 ? (
        <View style={styles.outlierNote}>
          <Ionicons name="alert-circle-outline" size={14} color={colors.textMuted} />
          <Text style={styles.outlierText}>
            {breakdown.discardedOutliers.length} outlier
            {breakdown.discardedOutliers.length > 1 ? 's' : ''} filtered: no sensor corroboration
          </Text>
        </View>
      ) : (
        <View style={styles.outlierNote}>
          <Ionicons name="checkmark-circle-outline" size={14} color={colors.safe} />
          <Text style={styles.outlierText}>No outliers this cycle — all reports corroborated</Text>
        </View>
      )}

      <View style={styles.mathBox}>
        <Text style={styles.mathTitle}>Show the math</Text>
        <View style={styles.mathRow}>
          <Text style={styles.mathLabel}>Phone noise signal</Text>
          <Text style={styles.mathValue}>{breakdown.phoneNoiseScore}/100</Text>
        </View>
        <View style={styles.mathRow}>
          <Text style={styles.mathLabel}>Verkada activity signal</Text>
          <Text style={styles.mathValue}>{breakdown.verkadaActivityScore}/100</Text>
        </View>
        <View style={styles.mathDivider} />
        <View style={styles.mathRow}>
          <Text style={styles.mathLabel}>Objective sensors</Text>
          <Text style={styles.mathValue}>{breakdown.objectiveWeightPct}%</Text>
        </View>
        <View style={styles.mathRow}>
          <Text style={styles.mathLabel}>Community input</Text>
          <Text style={styles.mathValue}>{breakdown.communityWeightPct}%</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  zoneName: { color: colors.textPrimary, fontSize: 19, fontWeight: '700' },
  zoneDesc: { color: colors.textMuted, fontSize: 12.5, marginTop: 3, lineHeight: 17 },
  scoreBadge: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    marginLeft: 12,
  },
  scoreNumber: { fontSize: 24, fontWeight: '800' },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  trendText: { color: colors.textMuted, fontSize: 10, textTransform: 'capitalize' },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 18,
    gap: 6,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12.5, fontWeight: '700' },
  actionTierText: { fontSize: 12.5, fontWeight: '700' },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  rowLabel: { color: colors.textPrimary, fontSize: 13.5, flex: 1 },
  rowValue: { color: colors.textSecondary, fontSize: 13 },
  outlierNote: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  outlierText: { color: colors.textMuted, fontSize: 11.5, flex: 1 },
  mathBox: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  mathTitle: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  mathRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  mathLabel: { color: colors.textSecondary, fontSize: 12.5 },
  mathValue: { color: colors.textPrimary, fontSize: 12.5, fontWeight: '700' },
  mathDivider: { height: 1, backgroundColor: colors.border, marginVertical: 6 },
});
