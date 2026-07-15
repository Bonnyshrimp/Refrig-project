import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import { useFridge } from '../context/FridgeContext';
import { logMeal } from '../lib/meals';
import { cardShadow, colors, fonts, radius } from '../theme';
import { MenuSuggestion, planWeek, recommendToday } from '../utils/menuPlan';

type SubTab = 'today' | 'week';

function urgencyBadge(urgency: number): { text: string; color: string; bg: string } | null {
  if (urgency <= 1) return { text: 'ด่วน/วันนี้!', color: colors.red, bg: '#FBEAE7' };
  if (urgency <= 3) return { text: 'ใกล้หมดอายุ', color: colors.yellow, bg: '#FCF3E3' };
  return null;
}

function SuggestionCard({
  suggestion,
  onCook,
  cooking,
}: {
  suggestion: MenuSuggestion;
  onCook: (s: MenuSuggestion) => void;
  cooking: boolean;
}) {
  const badge = urgencyBadge(suggestion.urgency);
  const ingredients = suggestion.matched.map((i) => i.name).join(', ');

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.cardEmoji}>{suggestion.recipe.emoji}</Text>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{suggestion.recipe.name}</Text>
          <Text style={styles.cardMeta}>
            ~{suggestion.recipe.kcal} kcal · ใช้: {ingredients}
          </Text>
        </View>
        {badge && (
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.text}</Text>
          </View>
        )}
      </View>
      <Pressable
        style={({ pressed }) => [styles.cookBtn, (pressed || cooking) && styles.cookBtnDim]}
        onPress={() => onCook(suggestion)}
        disabled={cooking}
      >
        <Text style={styles.cookText}>{cooking ? 'กำลังบันทึก...' : '✓ ทำเมนูนี้'}</Text>
      </Pressable>
    </View>
  );
}

export default function MenuScreen() {
  const { items, loading, consumeItems } = useFridge();
  const { session } = useAuth();
  const [subTab, setSubTab] = useState<SubTab>('today');
  const [cookingId, setCookingId] = useState<string | null>(null);

  const today = useMemo(() => recommendToday(items), [items]);
  const week = useMemo(() => planWeek(items), [items]);

  // หัวใจที่ร้อยระบบเข้าด้วยกัน (PRD 4.1): ตัดของออกจากตู้ + ลง meals_log
  const cook = (s: MenuSuggestion) => {
    const names = s.matched.map((i) => `• ${i.emoji} ${i.name}`).join('\n');
    Alert.alert(
      `ทำ "${s.recipe.name}"?`,
      `จะตัดของเหล่านี้ออกจากตู้ และบันทึกโภชนาการ (~${s.recipe.kcal} kcal):\n\n${names}`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: '✓ ทำเลย',
          onPress: async () => {
            if (!session) return;
            setCookingId(s.recipe.id);
            try {
              await consumeItems(s.matched.map((i) => i.id));
              await logMeal(session.user.id, s.recipe);
              Alert.alert('บันทึกแล้ว 🎉', 'ตัดวัตถุดิบออกจากตู้และบันทึกมื้ออาหารเรียบร้อย');
            } catch (e) {
              Alert.alert('ขออภัย', e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ');
            } finally {
              setCookingId(null);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="เมนูแนะนำ" subtitle="ใช้ของใกล้หมดอายุให้ทันก่อนเสีย" />

      {/* แท็บย่อย วันนี้ / ทั้งสัปดาห์ */}
      <View style={styles.subTabRow}>
        {(
          [
            { key: 'today', label: 'วันนี้' },
            { key: 'week', label: 'ทั้งสัปดาห์' },
          ] as const
        ).map((t) => {
          const active = subTab === t.key;
          return (
            <Pressable
              key={t.key}
              style={[styles.subTab, active && styles.subTabActive]}
              onPress={() => setSubTab(t.key)}
            >
              <Text style={[styles.subTabText, active && styles.subTabTextActive]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {items.length === 0 && !loading ? (
          <Text style={styles.empty}>
            ตู้ยังว่างอยู่ กด ＋ เพิ่มของก่อน{'\n'}แล้วเดี๋ยวช่วยคิดเมนูให้เอง 🍳
          </Text>
        ) : subTab === 'today' ? (
          today.length === 0 ? (
            <Text style={styles.empty}>ยังจับคู่เมนูกับของในตู้ไม่ได้ ลองเพิ่มวัตถุดิบเพิ่มดูนะ</Text>
          ) : (
            today.map((s) => (
              <SuggestionCard
                key={s.recipe.id}
                suggestion={s}
                onCook={cook}
                cooking={cookingId === s.recipe.id}
              />
            ))
          )
        ) : (
          week.map((day) => (
            <View key={day.dayLabel} style={styles.dayRow}>
              <Text style={styles.dayLabel}>{day.dayLabel}</Text>
              {day.isShoppingDay ? (
                <View style={styles.dayCardShopping}>
                  <Text style={styles.dayShoppingText}>🛒 วันซื้อของ — เติมตู้สำหรับสัปดาห์หน้า</Text>
                </View>
              ) : day.suggestion ? (
                <View style={styles.dayCard}>
                  <Text style={styles.dayEmoji}>{day.suggestion.recipe.emoji}</Text>
                  <View style={styles.cardInfo}>
                    <Text style={styles.dayName}>{day.suggestion.recipe.name}</Text>
                    <Text style={styles.dayMeta}>
                      ~{day.suggestion.recipe.kcal} kcal · ใช้:{' '}
                      {day.suggestion.matched.map((i) => i.name).join(', ')}
                    </Text>
                  </View>
                  {urgencyBadge(day.suggestion.urgency) && (
                    <Text style={styles.dayUrgent}>⚡</Text>
                  )}
                </View>
              ) : (
                <View style={styles.dayCardFree}>
                  <Text style={styles.dayFreeText}>🍽️ เมนูอิสระ / กินนอกบ้าน</Text>
                </View>
              )}
            </View>
          ))
        )}

        {subTab === 'week' && items.length > 0 && (
          <Text style={styles.weekNote}>
            แผนเรียงของเสียเร็วไว้วันแรกๆ และปรับใหม่อัตโนมัติเมื่อของในตู้เปลี่ยน
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.frost,
  },
  subTabRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 4,
  },
  subTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  subTabActive: {
    backgroundColor: colors.ink,
  },
  subTabText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.muted,
  },
  subTabTextActive: {
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
    lineHeight: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 14,
    gap: 12,
    ...cardShadow,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardEmoji: {
    fontSize: 30,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontFamily: fonts.headingMed,
    fontSize: 15,
    color: colors.ink,
  },
  cardMeta: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.muted,
    marginTop: 2,
  },
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11.5,
  },
  cookBtn: {
    backgroundColor: colors.green,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  cookBtnDim: {
    opacity: 0.7,
  },
  cookText: {
    fontFamily: fonts.headingSemi,
    fontSize: 14.5,
    color: colors.card,
  },
  dayRow: {
    gap: 6,
  },
  dayLabel: {
    fontFamily: fonts.headingSemi,
    fontSize: 14,
    color: colors.ink,
  },
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 12,
    gap: 10,
    ...cardShadow,
  },
  dayEmoji: {
    fontSize: 24,
  },
  dayName: {
    fontFamily: fonts.headingMed,
    fontSize: 14,
    color: colors.ink,
  },
  dayMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
    marginTop: 1,
  },
  dayUrgent: {
    fontSize: 16,
  },
  dayCardShopping: {
    backgroundColor: '#E8F3EC',
    borderRadius: radius.card,
    padding: 14,
  },
  dayShoppingText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    color: '#1E6E4E',
  },
  dayCardFree: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 14,
    opacity: 0.7,
  },
  dayFreeText: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.muted,
  },
  weekNote: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});
