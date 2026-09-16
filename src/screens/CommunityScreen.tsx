import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { SheetModal } from '../components/SheetModal';
import { StarRating } from '../components/StarRating';
import { useAppData } from '../context/AppDataContext';
import { ZONES, getZone } from '../data/zones';
import { CommunityReview } from '../types';

function timeAgo(ts: number): string {
  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function CommunityScreen() {
  const { reviews, addReview } = useAppData();
  const [filterZoneId, setFilterZoneId] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [newZoneId, setNewZoneId] = useState(ZONES[0].id);
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState('');

  const filtered = useMemo(() => {
    const list = filterZoneId ? reviews.filter((r) => r.zoneId === filterZoneId) : reviews;
    return [...list].sort((a, b) => b.timestamp - a.timestamp);
  }, [reviews, filterZoneId]);

  function submit() {
    if (!newText.trim()) return;
    addReview({ zoneId: newZoneId, rating: newRating, text: newText.trim() });
    setNewText('');
    setNewRating(5);
    setComposeOpen(false);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Community</Text>
          <Text style={styles.subtitle}>Reviews are a small, minor input to Secura Scores</Text>
        </View>
        <TouchableOpacity style={styles.composeBtn} onPress={() => setComposeOpen(true)}>
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        <TouchableOpacity
          onPress={() => setFilterZoneId(null)}
          style={[styles.chip, filterZoneId === null && styles.chipActive]}
        >
          <Text style={[styles.chipText, filterZoneId === null && styles.chipTextActive]}>All</Text>
        </TouchableOpacity>
        {ZONES.map((z) => (
          <TouchableOpacity
            key={z.id}
            onPress={() => setFilterZoneId(z.id)}
            style={[styles.chip, filterZoneId === z.id && styles.chipActive]}
          >
            <Text style={[styles.chipText, filterZoneId === z.id && styles.chipTextActive]}>
              {z.shortName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="chatbubble-ellipses-outline" size={28} color={colors.textMuted} />
            <Text style={styles.emptyText}>No reviews yet — be the first to leave one.</Text>
          </View>
        }
        renderItem={({ item }: { item: CommunityReview }) => {
          const zone = getZone(item.zoneId);
          return (
            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewZone}>{zone?.shortName}</Text>
                <Text style={styles.reviewTime}>{timeAgo(item.timestamp)}</Text>
              </View>
              <StarRating value={item.rating} readOnly size={15} />
              <Text style={styles.reviewText}>{item.text}</Text>
            </View>
          );
        }}
      />

      <SheetModal visible={composeOpen} onClose={() => setComposeOpen(false)}>
        <Text style={styles.title}>Leave a review</Text>
        <Text style={styles.subtitle}>
          Objective sensors still drive ~90% of the Secura Score — this is a light community signal.
        </Text>

        <Text style={styles.label}>Location</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
          {ZONES.map((z) => (
            <TouchableOpacity
              key={z.id}
              onPress={() => setNewZoneId(z.id)}
              style={[styles.chip, newZoneId === z.id && styles.chipActive]}
            >
              <Text style={[styles.chipText, newZoneId === z.id && styles.chipTextActive]}>
                {z.shortName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Rating</Text>
        <View style={{ marginBottom: 14 }}>
          <StarRating value={newRating} onChange={setNewRating} size={30} />
        </View>

        <Text style={styles.label}>Review</Text>
        <TextInput
          value={newText}
          onChangeText={setNewText}
          placeholder="e.g. well-lit path but sparse foot traffic at night"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          multiline
        />

        <TouchableOpacity style={styles.submitBtn} onPress={submit}>
          <Text style={styles.submitBtnText}>Post review</Text>
        </TouchableOpacity>
      </SheetModal>
    </SafeAreaView>
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
    paddingBottom: 10,
  },
  title: { color: colors.textPrimary, fontSize: 21, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: 11.5, marginTop: 2, maxWidth: 260 },
  composeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: { paddingHorizontal: 18, marginBottom: 8, flexGrow: 0 },
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
  chipTextActive: { color: colors.textPrimary },
  listContent: { paddingHorizontal: 18, paddingBottom: 24, gap: 12 },
  reviewCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  reviewZone: { color: colors.textPrimary, fontSize: 13.5, fontWeight: '700' },
  reviewTime: { color: colors.textMuted, fontSize: 11 },
  reviewText: { color: colors.textSecondary, fontSize: 13, marginTop: 8, lineHeight: 18 },
  emptyBox: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText: { color: colors.textMuted, fontSize: 13 },
  label: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    color: colors.textPrimary,
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 16,
    fontSize: 13,
  },
  submitBtn: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnText: { color: colors.white, fontWeight: '700', fontSize: 14.5 },
});
