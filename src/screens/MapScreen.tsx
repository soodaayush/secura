import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { CampusMap } from '../components/CampusMap';
import { PrivacyBadge } from '../components/PrivacyBadge';
import { IncidentReportFAB } from '../components/IncidentReportFAB';
import { SheetModal } from '../components/SheetModal';
import { ZoneDetailSheet } from '../components/ZoneDetailSheet';
import { useAppData } from '../context/AppDataContext';
import { getZone } from '../data/zones';

export function MapScreen() {
  const { breakdowns } = useAppData();
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const selectedZone = selectedZoneId ? getZone(selectedZoneId) : undefined;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Secura</Text>
          <Text style={styles.subtitle}>University of Waterloo · live Secura Score</Text>
        </View>
        <PrivacyBadge />
      </View>

      <View style={styles.mapWrap}>
        <CampusMap
          breakdowns={breakdowns}
          onZonePress={setSelectedZoneId}
          selectedZoneId={selectedZoneId}
        />
        <View style={styles.legend}>
          <LegendDot color={colors.safe} label="Calm" />
          <LegendDot color={colors.caution} label="Elevated" />
          <LegendDot color={colors.risk} label="Active concern" />
        </View>
      </View>

      <IncidentReportFAB defaultZoneId={selectedZoneId} />

      <SheetModal visible={!!selectedZone} onClose={() => setSelectedZoneId(null)}>
        {selectedZone && (
          <ZoneDetailSheet zone={selectedZone} breakdown={breakdowns[selectedZone.id]} />
        )}
      </SheetModal>
    </SafeAreaView>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: { color: colors.textPrimary, fontSize: 21, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: 11.5, marginTop: 2 },
  mapWrap: { flex: 1 },
  legend: {
    position: 'absolute',
    left: 14,
    bottom: 14,
    backgroundColor: colors.bgElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  legendDot: { width: 9, height: 9, borderRadius: 4.5 },
  legendLabel: { color: colors.textSecondary, fontSize: 11.5 },
});
