import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { SheetModal } from './SheetModal';
import { ZONES } from '../data/zones';
import { useAppData } from '../context/AppDataContext';
import { IncidentReport } from '../types';

const CATEGORIES: { key: IncidentReport['category']; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'poorly_lit', label: 'Poorly lit', icon: 'bulb-outline' },
  { key: 'suspicious_activity', label: 'Suspicious activity', icon: 'eye-outline' },
  { key: 'unsafe_crossing', label: 'Unsafe crossing', icon: 'walk-outline' },
  { key: 'broken_lock', label: 'Broken lock', icon: 'lock-open-outline' },
  { key: 'other', label: 'Other', icon: 'alert-circle-outline' },
];

interface Props {
  defaultZoneId?: string | null;
}

export function IncidentReportFAB({ defaultZoneId }: Props) {
  const { addIncident } = useAppData();
  const [open, setOpen] = useState(false);
  const [zoneId, setZoneId] = useState<string>(defaultZoneId ?? ZONES[0].id);
  const [category, setCategory] = useState<IncidentReport['category']>('poorly_lit');
  const [note, setNote] = useState('');
  const [anonymous, setAnonymous] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  function openSheet() {
    setZoneId(defaultZoneId ?? ZONES[0].id);
    setSubmitted(false);
    setOpen(true);
  }

  function submit() {
    addIncident({ zoneId, category, note: note.trim() || undefined, anonymous });
    setSubmitted(true);
    setNote('');
    setTimeout(() => setOpen(false), 900);
  }

  return (
    <>
      <TouchableOpacity style={styles.fab} onPress={openSheet}>
        <Ionicons name="warning-outline" size={22} color={colors.white} />
      </TouchableOpacity>
      <SheetModal visible={open} onClose={() => setOpen(false)}>
        {submitted ? (
          <View style={styles.submittedBox}>
            <Ionicons name="checkmark-circle" size={36} color={colors.safe} />
            <Text style={styles.submittedText}>Reported anonymously — thank you</Text>
          </View>
        ) : (
          <>
            <Text style={styles.title}>Quick incident report</Text>
            <Text style={styles.subtitle}>Anonymous by default. Nudges the zone score short-term.</Text>

            <Text style={styles.label}>Zone</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {ZONES.map((z) => (
                <TouchableOpacity
                  key={z.id}
                  onPress={() => setZoneId(z.id)}
                  style={[styles.chip, zoneId === z.id && styles.chipActive]}
                >
                  <Text style={[styles.chipText, zoneId === z.id && styles.chipTextActive]}>
                    {z.shortName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>What's happening</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.key}
                  onPress={() => setCategory(c.key)}
                  style={[styles.categoryTile, category === c.key && styles.categoryTileActive]}
                >
                  <Ionicons
                    name={c.icon}
                    size={18}
                    color={category === c.key ? colors.accent : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.categoryLabel,
                      category === c.key && { color: colors.textPrimary },
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Note (optional)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Add a short detail…"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              multiline
            />

            <TouchableOpacity style={styles.anonRow} onPress={() => setAnonymous((a) => !a)}>
              <Ionicons
                name={anonymous ? 'checkbox' : 'square-outline'}
                size={20}
                color={anonymous ? colors.accent : colors.textMuted}
              />
              <Text style={styles.anonText}>Submit anonymously</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitBtn} onPress={submit}>
              <Text style={styles.submitBtnText}>Submit report</Text>
            </TouchableOpacity>
          </>
        )}
      </SheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 28,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.risk,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  title: { color: colors.textPrimary, fontSize: 19, fontWeight: '700' },
  subtitle: { color: colors.textMuted, fontSize: 12.5, marginTop: 4, marginBottom: 16 },
  label: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  chipText: { color: colors.textSecondary, fontSize: 12.5, fontWeight: '600' },
  chipTextActive: { color: colors.accent },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  categoryTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryTileActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  categoryLabel: { color: colors.textMuted, fontSize: 12 },
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
  anonRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 },
  anonText: { color: colors.textPrimary, fontSize: 13 },
  submitBtn: {
    backgroundColor: colors.risk,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnText: { color: colors.white, fontWeight: '700', fontSize: 14.5 },
  submittedBox: { alignItems: 'center', paddingVertical: 24, gap: 10 },
  submittedText: { color: colors.textPrimary, fontSize: 14.5, fontWeight: '600' },
});
