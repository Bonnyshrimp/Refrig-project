import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectLeftover: () => void;
}

// 4 ช่องทางเพิ่มของเข้าตู้ ตาม PRD 3.4 — ตอนนี้ใช้ได้จริงเฉพาะ "เก็บของเหลือ"
const COMING_SOON_OPTIONS = [
  { emoji: '🏷️', title: 'ถ่ายรูปฉลาก', desc: 'AI อ่านชื่อสินค้าและวันหมดอายุให้อัตโนมัติ' },
  { emoji: '🥬', title: 'ของสดไม่มีฉลาก', desc: 'เลือกผัก ผลไม้ เนื้อ ระบบใส่อายุมาตรฐานให้' },
  { emoji: '📷', title: 'สแกนบาร์โค้ด', desc: 'ดึงข้อมูลสินค้าจากฐานข้อมูล' },
];

export default function AddSheet({ visible, onClose, onSelectLeftover }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.handle} />
        <Text style={styles.title}>เพิ่มของเข้าตู้</Text>

        <Pressable
          style={({ pressed }) => [styles.option, styles.optionMain, pressed && styles.optionPressed]}
          onPress={onSelectLeftover}
          accessibilityRole="button"
        >
          <Text style={styles.optionEmoji}>🍲</Text>
          <View style={styles.optionInfo}>
            <Text style={[styles.optionTitle, styles.optionTitleMain]}>เก็บของเหลือ</Text>
            <Text style={styles.optionDescMain}>
              ถ่ายรูปกับข้าว/ขนมที่กินไม่หมด บันทึกใน 2 แตะ
            </Text>
          </View>
          <Text style={styles.optionGo}>›</Text>
        </Pressable>

        {COMING_SOON_OPTIONS.map((opt) => (
          <View key={opt.title} style={[styles.option, styles.optionDisabled]}>
            <Text style={styles.optionEmoji}>{opt.emoji}</Text>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>{opt.title}</Text>
              <Text style={styles.optionDesc}>{opt.desc}</Text>
            </View>
            <View style={styles.soonBadge}>
              <Text style={styles.soonText}>เร็วๆ นี้</Text>
            </View>
          </View>
        ))}
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
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.line,
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.ink,
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  optionMain: {
    backgroundColor: colors.green,
  },
  optionPressed: {
    opacity: 0.85,
  },
  optionDisabled: {
    opacity: 0.65,
  },
  optionEmoji: {
    fontSize: 28,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: fonts.headingMed,
    fontSize: 15,
    color: colors.ink,
  },
  optionTitleMain: {
    color: colors.card,
  },
  optionDesc: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
    marginTop: 1,
  },
  optionDescMain: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#DFF0E6',
    marginTop: 1,
  },
  optionGo: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.card,
  },
  soonBadge: {
    backgroundColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  soonText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
  },
});
