import React, { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ItemDetailSheet from '../components/ItemDetailSheet';
import ScreenHeader from '../components/ScreenHeader';
import { useFridge } from '../context/FridgeContext';
import { FridgeItem, Zone } from '../data/mock';
import { cardShadow, colors, fonts, radius } from '../theme';
import { daysLeftLabel, freshnessRatio, trafficColor } from '../utils/freshness';

type Filter = 'all' | Zone;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'chill', label: '🧊 ช่องเย็น' },
  { key: 'freeze', label: '❄️ ช่องแข็ง' },
];

function ItemCard({ item, onPress }: { item: FridgeItem; onPress: () => void }) {
  const color = trafficColor(item.daysLeft);
  const zoneColor = item.zone === 'freeze' ? colors.freeze : colors.chill;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
    >
      {item.photoUri ? (
        <Image source={{ uri: item.photoUri }} style={styles.photo} />
      ) : (
        <Text style={styles.emoji}>{item.emoji}</Text>
      )}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          {item.isLeftover && (
            <View style={styles.leftoverBadge}>
              <Text style={styles.leftoverText}>ของเหลือ</Text>
            </View>
          )}
        </View>
        <Text style={styles.meta}>
          {item.expirySource === 'label' ? '🏷️ ตามฉลาก' : '📖 ประมาณการ'} · เก็บมา{' '}
          {item.storedDays} วัน
        </Text>
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              { width: `${freshnessRatio(item) * 100}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>
      <View style={styles.right}>
        <View style={[styles.zoneDot, { backgroundColor: zoneColor }]}>
          <Text style={styles.zoneText}>{item.zone === 'freeze' ? '❄️' : '🧊'}</Text>
        </View>
        <Text style={[styles.daysLeft, { color }]}>{daysLeftLabel(item.daysLeft)}</Text>
      </View>
    </Pressable>
  );
}

export default function FridgeScreen() {
  const { items, discardItem } = useFridge();
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // เรียงตามความเร่งด่วน — ใกล้หมดอายุขึ้นก่อน (PRD 3.1)
  const visibleItems = useMemo(
    () =>
      items
        .filter((i) => filter === 'all' || i.zone === filter)
        .sort((a, b) => a.daysLeft - b.daysLeft),
    [items, filter],
  );

  const urgentCount = items.filter((i) => i.daysLeft <= 2).length;
  const selectedItem = items.find((i) => i.id === selectedId) ?? null;

  const handleDiscard = (id: string) => {
    discardItem(id);
    setSelectedId(null);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="ตู้เย็นของฉัน" subtitle={`${items.length} รายการในตู้`} />

      {urgentCount > 0 && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            ⚠️ มี {urgentCount} รายการใกล้หมดอายุ รีบใช้ก่อนเสียนะ
          </Text>
        </View>
      )}

      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <Pressable
              key={f.key}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setFilter(f.key)}
              accessibilityRole="button"
              accessibilityState={active ? { selected: true } : {}}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={visibleItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ItemCard item={item} onPress={() => setSelectedId(item.id)} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>ไม่มีของในช่องนี้ กด ＋ เพื่อเพิ่มของเข้าตู้</Text>
        }
      />

      <ItemDetailSheet
        item={selectedItem}
        onClose={() => setSelectedId(null)}
        onDiscard={handleDiscard}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.frost,
  },
  banner: {
    backgroundColor: '#FCF3E3',
    borderRadius: radius.card,
    marginHorizontal: 20,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  bannerText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.yellow,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
  },
  filterChip: {
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: colors.card,
  },
  filterChipActive: {
    backgroundColor: colors.ink,
  },
  filterText: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.muted,
  },
  filterTextActive: {
    fontFamily: fonts.bodyBold,
    color: colors.card,
  },
  list: {
    padding: 20,
    paddingBottom: 120,
    gap: 12,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 14,
    gap: 12,
    ...cardShadow,
  },
  cardPressed: {
    opacity: 0.8,
  },
  emoji: {
    fontSize: 32,
  },
  photo: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontFamily: fonts.headingMed,
    fontSize: 15,
    color: colors.ink,
    flexShrink: 1,
  },
  leftoverBadge: {
    backgroundColor: '#E8F3EC',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  leftoverText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.green,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.muted,
  },
  barTrack: {
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.line,
    overflow: 'hidden',
    marginTop: 3,
  },
  barFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  right: {
    alignItems: 'center',
    gap: 4,
  },
  zoneDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneText: {
    fontSize: 12,
  },
  daysLeft: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
  },
});
