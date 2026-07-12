import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PlaceholderCard from '../components/PlaceholderCard';
import ScreenHeader from '../components/ScreenHeader';
import { MOCK_MENU_TODAY } from '../data/mock';
import { cardShadow, colors, fonts, radius } from '../theme';

export default function MenuScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="เมนูแนะนำ" subtitle="ใช้ของใกล้หมดอายุให้ทันก่อนเสีย" />
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {MOCK_MENU_TODAY.map((menu) => (
          <View key={menu.id} style={styles.card}>
            <View style={styles.info}>
              <Text style={styles.name}>{menu.name}</Text>
              <Text style={styles.kcal}>~{menu.kcal} kcal</Text>
            </View>
            {menu.urgent && (
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentText}>ด่วน/วันนี้!</Text>
              </View>
            )}
          </View>
        ))}
        <PlaceholderCard
          emoji="🍳"
          title="กำลังพัฒนา (Phase 2)"
          lines={[
            'ปุ่ม "✓ ทำเมนูนี้" ตัดวัตถุดิบ + บันทึกโภชนาการ',
            'แผนเมนูทั้งสัปดาห์ (Premium)',
            'โหมดดูแลผู้สูงอายุ 👵',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 16,
    marginHorizontal: 20,
    ...cardShadow,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.headingMed,
    fontSize: 15,
    color: colors.ink,
  },
  kcal: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  urgentBadge: {
    backgroundColor: '#FBEAE7',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  urgentText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.red,
  },
});
