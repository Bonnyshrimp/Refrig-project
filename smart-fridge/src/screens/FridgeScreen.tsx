import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { FridgeItem, MOCK_FRIDGE_ITEMS } from '../data/mock';
import { cardShadow, colors, fonts, radius } from '../theme';

// ระบบไฟจราจรตาม PRD 3.1: เขียว >3 วัน / เหลือง 1–2 วัน / แดง หมดวันนี้หรือเกินแล้ว
function trafficColor(daysLeft: number): string {
  if (daysLeft <= 0) return colors.red;
  if (daysLeft <= 2) return colors.yellow;
  return colors.green;
}

function daysLeftLabel(daysLeft: number): string {
  if (daysLeft < 0) return `เกินมา ${-daysLeft} วัน`;
  if (daysLeft === 0) return 'หมดอายุวันนี้';
  return `อีก ${daysLeft} วัน`;
}

function ItemCard({ item }: { item: FridgeItem }) {
  const color = trafficColor(item.daysLeft);
  const freshness = Math.max(0, Math.min(1, item.daysLeft / item.totalDays));
  const zoneColor = item.zone === 'freeze' ? colors.freeze : colors.chill;

  return (
    <View style={styles.card}>
      <Text style={styles.emoji}>{item.emoji}</Text>
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
          <View style={[styles.barFill, { width: `${freshness * 100}%`, backgroundColor: color }]} />
        </View>
      </View>
      <View style={styles.right}>
        <View style={[styles.zoneDot, { backgroundColor: zoneColor }]}>
          <Text style={styles.zoneText}>{item.zone === 'freeze' ? '❄️' : '🧊'}</Text>
        </View>
        <Text style={[styles.daysLeft, { color }]}>{daysLeftLabel(item.daysLeft)}</Text>
      </View>
    </View>
  );
}

export default function FridgeScreen() {
  // เรียงตามความเร่งด่วน — ใกล้หมดอายุขึ้นก่อน
  const items = [...MOCK_FRIDGE_ITEMS].sort((a, b) => a.daysLeft - b.daysLeft);
  const urgentCount = items.filter((i) => i.daysLeft <= 2).length;

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
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ItemCard item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
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
    marginBottom: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  bannerText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.yellow,
  },
  list: {
    padding: 20,
    paddingBottom: 120,
    gap: 12,
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
  emoji: {
    fontSize: 32,
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
