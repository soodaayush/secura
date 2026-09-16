import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, scoreToColor } from '../theme/colors';
import { SheetModal } from './SheetModal';
import { ZONES, getZone } from '../data/zones';
import { LOCATION_ALIASES } from '../data/aliases';
import { ZoneScoreBreakdown } from '../types';

interface Props {
  label: string;
  selectedLabel: string;
  onSelect: (zoneId: string, displayLabel: string) => void;
  breakdowns: Record<string, ZoneScoreBreakdown>;
}

type ListItem =
  | { kind: 'zone'; key: string; zoneId: string; title: string }
  | { kind: 'alias'; key: string; zoneId: string; title: string; resolvesTo: string };

export function LocationPicker({ label, selectedLabel, onSelect, breakdowns }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const items = useMemo<ListItem[]>(() => {
    const q = query.trim().toLowerCase();
    const zoneItems: ListItem[] = ZONES.filter(
      (z) => !q || z.name.toLowerCase().includes(q) || z.shortName.toLowerCase().includes(q)
    ).map((z) => ({ kind: 'zone', key: `zone-${z.id}`, zoneId: z.id, title: z.name }));

    const aliasItems: ListItem[] = LOCATION_ALIASES.filter((a) => a.label.toLowerCase().includes(q)).map(
      (a) => ({
        kind: 'alias',
        key: `alias-${a.label}`,
        zoneId: a.zoneId,
        title: a.label,
        resolvesTo: getZone(a.zoneId)?.shortName ?? a.zoneId,
      })
    );

    // Only surface alias matches once the search narrows things down —
    // keeps the default (no query) list to the primary campus zones.
    return q ? [...zoneItems, ...aliasItems] : zoneItems;
  }, [query]);

  function select(item: ListItem) {
    onSelect(item.zoneId, item.title);
    setQuery('');
    setOpen(false);
  }

  return (
    <>
      <TouchableOpacity style={styles.field} onPress={() => setOpen(true)}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={styles.fieldValueRow}>
          <Text style={styles.fieldValue} numberOfLines={1}>
            {selectedLabel}
          </Text>
          <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
        </View>
      </TouchableOpacity>

      <SheetModal visible={open} onClose={() => setOpen(false)} maxHeightPct={0.85}>
        <Text style={styles.title}>Choose {label.toLowerCase()} location</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search any campus building or spot…"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        {!query && <Text style={styles.hint}>Main campus zones — or search for any other building</Text>}

        <FlatList
          data={items}
          keyExtractor={(item) => item.key}
          style={{ maxHeight: 380 }}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text style={styles.emptyText}>No matches — try a different spelling.</Text>
          }
          renderItem={({ item }) => {
            const score = breakdowns[item.zoneId]?.score ?? getZone(item.zoneId)?.baseline ?? 70;
            return (
              <TouchableOpacity style={styles.row} onPress={() => select(item)}>
                <View style={[styles.dot, { backgroundColor: scoreToColor(score) }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  {item.kind === 'alias' && (
                    <Text style={styles.rowSubtitle}>Routed via {item.resolvesTo}</Text>
                  )}
                </View>
                <Text style={styles.rowScore}>{score}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </SheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  fieldLabel: {
    color: colors.textSecondary,
    fontSize: 10.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  fieldValueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fieldValue: { color: colors.textPrimary, fontSize: 15, fontWeight: '600', flex: 1 },
  title: { color: colors.textPrimary, fontSize: 19, fontWeight: '700', marginBottom: 14 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: 14 },
  hint: { color: colors.textMuted, fontSize: 11, marginBottom: 10 },
  emptyText: { color: colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dot: { width: 9, height: 9, borderRadius: 4.5 },
  rowTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  rowSubtitle: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  rowScore: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
});
