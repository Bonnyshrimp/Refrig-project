import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FridgeItem } from '../data/mock';
import { DANGER_WARNING, ESTIMATE_WARNING, SPOILAGE_GUIDE } from '../data/spoilageGuide';
import { colors, fonts, radius } from '../theme';
import { daysLeftLabel, freshnessRatio, statusLabel, trafficColor } from '../utils/freshness';

interface Props {
  item: FridgeItem | null;
  onClose: () => void;
  onDiscard: (id: string) => void;
}

// Bottom sheet คู่มือสังเกตอาหารเสีย ตาม PRD 3.3
export default function ItemDetailSheet({ item, onClose, onDiscard }: Props) {
  const insets = useSafeAreaInsets();
  if (!item) return null;

  const color = trafficColor(item.daysLeft);
  const guide = SPOILAGE_GUIDE[item.category];
  const zoneColor = item.zone === 'freeze' ? colors.freeze : colors.chill;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.handle} />
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* หัวรายการ */}
          <View style={styles.headerRow}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <View style={styles.headerInfo}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.badgeRow}>
                <View style={[styles.zoneBadge, { backgroundColor: zoneColor }]}>
                  <Text style={styles.zoneBadgeText}>
                    {item.zone === 'freeze' ? '❄️ ช่องแข็ง' : '🧊 ช่องเย็น'}
                  </Text>
                </View>
                {item.isLeftover && (
                  <View style={styles.leftoverBadge}>
                    <Text style={styles.leftoverText}>ของเหลือ</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* 1. สถานะ + จำนวนวันที่เก็บ */}
          <View style={styles.statusCard}>
            <View style={styles.statusHead}>
              <View style={[styles.statusDot, { backgroundColor: color }]} />
              <Text style={[styles.statusText, { color }]}>{statusLabel(item.daysLeft)}</Text>
            </View>
            <Text style={styles.statusMeta}>
              เก็บมาแล้ว {item.storedDays} วัน · {daysLeftLabel(item.daysLeft)}
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

          {/* 2. แหล่งที่มาของวันหมดอายุ + คำเตือนประมาณการ */}
          <View style={styles.sourceRow}>
            <Text style={styles.sourceLabel}>ที่มาของวันหมดอายุ:</Text>
            <Text style={styles.sourceValue}>
              {item.expirySource === 'label' ? '🏷️ ตามฉลากสินค้า' : '📖 ประมาณการจากฐานอ้างอิง'}
            </Text>
          </View>
          {item.expirySource === 'est' && (
            <View style={styles.estWarning}>
              <Text style={styles.estWarningText}>⚠️ {ESTIMATE_WARNING}</Text>
            </View>
          )}

          {/* 3. เช็กลิสต์วิธีสังเกตว่าเสีย ตามหมวด */}
          <Text style={styles.sectionTitle}>
            {guide.emoji} วิธีสังเกตว่าเสีย — หมวด{guide.label}
          </Text>
          <View style={styles.checklist}>
            {guide.signs.map((sign) => (
              <View key={sign} style={styles.checkItem}>
                <Text style={styles.checkMark}>✓</Text>
                <Text style={styles.checkText}>{sign}</Text>
              </View>
            ))}
          </View>

          {/* 4. กล่องเตือนสีแดง */}
          <View style={styles.dangerBox}>
            <Text style={styles.dangerText}>🚨 {DANGER_WARNING}</Text>
          </View>

          {/* 5. ปุ่มทิ้งแล้ว */}
          <Pressable
            style={({ pressed }) => [styles.discardBtn, pressed && styles.discardBtnPressed]}
            onPress={() => onDiscard(item.id)}
            accessibilityRole="button"
          >
            <Text style={styles.discardText}>ทิ้งแล้ว 🗑️</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(14, 58, 56, 0.4)',
  },
  sheet: {
    backgroundColor: colors.frost,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.line,
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  emoji: {
    fontSize: 44,
  },
  headerInfo: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.ink,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  zoneBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  zoneBadgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.card,
  },
  leftoverBadge: {
    backgroundColor: '#E8F3EC',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  leftoverText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.green,
  },
  statusCard: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 14,
    gap: 6,
    marginBottom: 12,
  },
  statusHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontFamily: fonts.headingSemi,
    fontSize: 15,
  },
  statusMeta: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.muted,
  },
  barTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.line,
    overflow: 'hidden',
    marginTop: 2,
  },
  barFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  sourceLabel: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.muted,
  },
  sourceValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.ink,
  },
  estWarning: {
    backgroundColor: '#FCF3E3',
    borderRadius: radius.card,
    padding: 12,
    marginBottom: 12,
  },
  estWarningText: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: '#9A6A10',
    lineHeight: 20,
  },
  sectionTitle: {
    fontFamily: fonts.headingSemi,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 8,
  },
  checklist: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 14,
    gap: 10,
    marginBottom: 12,
  },
  checkItem: {
    flexDirection: 'row',
    gap: 10,
  },
  checkMark: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.green,
  },
  checkText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    lineHeight: 21,
  },
  dangerBox: {
    backgroundColor: '#FBEAE7',
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: '#F2C4BD',
    padding: 12,
    marginBottom: 16,
  },
  dangerText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    color: colors.red,
    lineHeight: 20,
  },
  discardBtn: {
    backgroundColor: colors.red,
    borderRadius: radius.card,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  discardBtnPressed: {
    opacity: 0.85,
  },
  discardText: {
    fontFamily: fonts.headingSemi,
    fontSize: 16,
    color: colors.card,
  },
});
