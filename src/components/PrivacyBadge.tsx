import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { SheetModal } from './SheetModal';

const POINTS = [
  {
    icon: 'mic-off-outline' as const,
    title: 'Raw audio never leaves your phone',
    body: 'Your phone computes a noise-level bucket (quiet / moderate / loud / very loud) on-device. The audio sample itself is never transmitted or stored — only the bucket does.',
  },
  {
    icon: 'eye-off-outline' as const,
    title: 'No facial recognition, no footage stored',
    body: 'Verkada sensors contribute motion, audio, thermal, access-control, and environmental signals — never raw video. Nobody is identified.',
  },
  {
    icon: 'trash-outline' as const,
    title: 'Discarded immediately after scoring',
    body: 'Both phone samples and raw Verkada sensor payloads are used to compute a score for that moment, then discarded — nothing raw is retained.',
  },
  {
    icon: 'person-remove-outline' as const,
    title: 'Incident reports are anonymous by default',
    body: 'Quick incident reports carry no identity unless you choose to add one.',
  },
];

export function PrivacyBadge() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TouchableOpacity style={styles.badge} onPress={() => setOpen(true)}>
        <Ionicons name="shield-checkmark-outline" size={16} color={colors.accent} />
        <Text style={styles.badgeText}>Privacy</Text>
      </TouchableOpacity>
      <SheetModal visible={open} onClose={() => setOpen(false)}>
        <Text style={styles.title}>Privacy, by design</Text>
        <Text style={styles.subtitle}>
          This isn't a policy promise — it's how the fusion engine is built.
        </Text>
        {POINTS.map((p) => (
          <View key={p.title} style={styles.pointRow}>
            <View style={styles.pointIcon}>
              <Ionicons name={p.icon} size={18} color={colors.safe} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pointTitle}>{p.title}</Text>
              <Text style={styles.pointBody}>{p.body}</Text>
            </View>
          </View>
        ))}
      </SheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  badgeText: { color: colors.textPrimary, fontSize: 12, fontWeight: '600' },
  title: { color: colors.textPrimary, fontSize: 20, fontWeight: '700', marginBottom: 4 },
  subtitle: { color: colors.textMuted, fontSize: 13, marginBottom: 18 },
  pointRow: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  pointIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.safeSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: 3 },
  pointBody: { color: colors.textSecondary, fontSize: 12.5, lineHeight: 18 },
});
