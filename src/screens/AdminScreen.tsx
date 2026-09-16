import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, scoreToColor } from '../theme/colors';
import { SheetModal } from '../components/SheetModal';
import { ZoneDetailSheet } from '../components/ZoneDetailSheet';
import { useAppData } from '../context/AppDataContext';
import { ZONES, getZone } from '../data/zones';
import { IncidentReport } from '../types';

const ACTION_COLOR: Record<string, string> = {
  Monitor: colors.safe,
  Dispatch: colors.caution,
  Lockdown: colors.risk,
};

const CATEGORY_LABEL: Record<IncidentReport['category'], string> = {
  poorly_lit: 'Poorly lit',
  suspicious_activity: 'Suspicious activity',
  unsafe_crossing: 'Unsafe crossing',
  broken_lock: 'Broken lock',
  other: 'Other',
};

function timeAgo(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function AdminScreen() {
  const { breakdowns, incidents, lastPhoneReports, lastVerkadaEvents } = useAppData();
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const selectedZone = selectedZoneId ? getZone(selectedZoneId) : undefined;

  const sortedIncidents = useMemo(
    () => [...incidents].sort((a, b) => b.timestamp - a.timestamp),
    [incidents]
  );

  const tierCounts = useMemo(() => {
    const counts = { Monitor: 0, Dispatch: 0, Lockdown: 0 };
    Object.values(breakdowns).forEach((b) => {
      counts[b.actionTier] += 1;
    });
    return counts;
  }, [breakdowns]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin / Security</Text>
        <Text style={styles.subtitle}>Full sensor + phone-aggregate breakdown</Text>
      </View>

      <View style={styles.tierSummaryRow}>
        {(['Monitor', 'Dispatch', 'Lockdown'] as const).map((tier) => (
          <View key={tier} style={styles.tierSummaryBox}>
            <Text style={[styles.tierSummaryCount, { color: ACTION_COLOR[tier] }]}>
              {tierCounts[tier]}
            </Text>
            <Text style={styles.tierSummaryLabel}>{tier}</Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.zoneList}>
        <Text style={styles.sectionTitle}>Zones</Text>
        {ZONES.map((zone) => {
          const b = breakdowns[zone.id];
          const score = b?.score ?? zone.baseline;
          const color = scoreToColor(score);
          const phones = lastPhoneReports[zone.id]?.length ?? 0;
          const verkada = lastVerkadaEvents[zone.id]?.length ?? 0;
          return (
            <TouchableOpacity
              key={zone.id}
              style={styles.zoneCard}
              onPress={() => setSelectedZoneId(zone.id)}
            >
              <View style={[styles.scoreCircle, { borderColor: color }]}>
                <Text style={[styles.scoreCircleText, { color }]}>{score}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.zoneName}>{zone.name}</Text>
                <Text style={styles.zoneMeta}>
                  {phones} phones · {verkada} sensor events
                  {b && b.discardedOutliers.length > 0
                    ? ` · ${b.discardedOutliers.length} filtered`
                    : ''}
                </Text>
              </View>
              {b && (
                <View style={[styles.tierBadge, { backgroundColor: `${ACTION_COLOR[b.actionTier]}22` }]}>
                  <Text style={[styles.tierBadgeText, { color: ACTION_COLOR[b.actionTier] }]}>
                    {b.actionTier}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <Text style={[styles.sectionTitle, { marginTop: 22 }]}>Incident log</Text>
        {sortedIncidents.length === 0 ? (
          <Text style={styles.emptyText}>No incidents reported this session.</Text>
        ) : (
          sortedIncidents.map((inc) => (
            <View key={inc.id} style={styles.incidentRow}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.caution} />
              <View style={{ flex: 1 }}>
                <Text style={styles.incidentTitle}>
                  {CATEGORY_LABEL[inc.category]} · {getZone(inc.zoneId)?.shortName}
                </Text>
                {inc.note ? <Text style={styles.incidentNote}>{inc.note}</Text> : null}
              </View>
              <Text style={styles.incidentTime}>{timeAgo(inc.timestamp)}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <SheetModal visible={!!selectedZone} onClose={() => setSelectedZoneId(null)}>
        {selectedZone && (
          <ZoneDetailSheet zone={selectedZone} breakdown={breakdowns[selectedZone.id]} isAdmin />
        )}
      </SheetModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 10 },
  title: { color: colors.textPrimary, fontSize: 21, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: 11.5, marginTop: 2 },
  tierSummaryRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 18, marginBottom: 14 },
  tierSummaryBox: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tierSummaryCount: { fontSize: 22, fontWeight: '800' },
  tierSummaryLabel: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  zoneList: { paddingHorizontal: 18, paddingBottom: 30 },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  zoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scoreCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCircleText: { fontSize: 15, fontWeight: '800' },
  zoneName: { color: colors.textPrimary, fontSize: 13.5, fontWeight: '700' },
  zoneMeta: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  tierBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  tierBadgeText: { fontSize: 11, fontWeight: '700' },
  emptyText: { color: colors.textMuted, fontSize: 13 },
  incidentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  incidentTitle: { color: colors.textPrimary, fontSize: 12.5, fontWeight: '600' },
  incidentNote: { color: colors.textMuted, fontSize: 11.5, marginTop: 3 },
  incidentTime: { color: colors.textMuted, fontSize: 10.5 },
});
