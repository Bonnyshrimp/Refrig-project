import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PlaceholderCard from '../components/PlaceholderCard';
import ScreenHeader from '../components/ScreenHeader';
import { MOCK_HEALTH_TODAY } from '../data/mock';
import { cardShadow, colors, fonts, radius } from '../theme';

interface StatRowProps {
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
}

function StatRow({ label, current, goal, unit, color }: StatRowProps) {
  const ratio = Math.min(1, current / goal);
  return (
    <View style={styles.statRow}>
      <View style={styles.statHead}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>
          {current} / {goal} {unit}
        </Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${ratio * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export default function HealthScreen() {
  const h = MOCK_HEALTH_TODAY;
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="สุขภาพ" subtitle="สรุปโภชนาการวันนี้" />
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <StatRow label="แคลอรี่" current={h.kcal.current} goal={h.kcal.goal} unit="kcal" color={colors.green} />
          <StatRow label="โปรตีน" current={h.protein.current} goal={h.protein.goal} unit="g" color={colors.chill} />
          <StatRow label="คาร์บ" current={h.carb.current} goal={h.carb.goal} unit="g" color={colors.yellow} />
          <StatRow label="ไขมัน" current={h.fat.current} goal={h.fat.goal} unit="g" color={colors.sodium} />
        </View>
        <PlaceholderCard
          emoji="💚"
          title="กำลังพัฒนา (Phase 2)"
          lines={[
            'บันทึกอัตโนมัติจากปุ่ม "✓ ทำเมนูนี้"',
            'กราฟย้อนหลัง 7 วัน',
            'โหมดดูแลผู้สูงอายุ: โซเดียม + น้ำตาล (Premium)',
          ]}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.frost,
  },
  list: {
    paddingVertical: 12,
    paddingBottom: 120,
    gap: 12,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 18,
    marginHorizontal: 20,
    gap: 14,
    ...cardShadow,
  },
  statRow: {
    gap: 6,
  },
  statHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontFamily: fonts.headingMed,
    fontSize: 14,
    color: colors.ink,
  },
  statValue: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
  },
  barTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.line,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
});
