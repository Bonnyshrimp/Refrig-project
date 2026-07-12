import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PlaceholderCard from '../components/PlaceholderCard';
import ScreenHeader from '../components/ScreenHeader';
import { MOCK_SHOPPING } from '../data/mock';
import { cardShadow, colors, fonts, radius } from '../theme';

export default function ShoppingScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="รายการซื้อของ" subtitle="สร้างอัตโนมัติจากของที่หมดและแผนเมนู" />
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {MOCK_SHOPPING.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={[styles.checkbox, item.done && styles.checkboxDone]}>
              {item.done && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.info}>
              <Text style={[styles.name, item.done && styles.nameDone]}>{item.name}</Text>
              <Text style={styles.reason}>{item.reason}</Text>
            </View>
          </View>
        ))}
        <PlaceholderCard
          emoji="🛒"
          title="กำลังพัฒนา (Phase 2)"
          lines={[
            'ติ๊กถูกตัดรายการ / เพิ่มรายการเอง',
            'รายการฉลาด 🧠 จากการเรียนรู้พฤติกรรม',
            'แจ้งเตือนเมื่ออยู่ใกล้ซูเปอร์มาร์เก็ต',
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
    gap: 12,
    ...cardShadow,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  checkmark: {
    color: colors.card,
    fontSize: 14,
    fontFamily: fonts.bodyBold,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.headingMed,
    fontSize: 15,
    color: colors.ink,
  },
  nameDone: {
    textDecorationLine: 'line-through',
    color: colors.muted,
  },
  reason: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
});
