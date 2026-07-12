import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

// 4 ช่องทางเพิ่มของเข้าตู้ ตาม PRD 3.4 — ตอนนี้เป็น placeholder ยังไม่ทำงานจริง
const ADD_OPTIONS = [
  { emoji: '🍲', title: 'เก็บของเหลือ', desc: 'ถ่ายรูปกับข้าว/ขนมที่กินไม่หมด บันทึกใน 2 แตะ' },
  { emoji: '🏷️', title: 'ถ่ายรูปฉลาก', desc: 'AI อ่านชื่อสินค้าและวันหมดอายุให้อัตโนมัติ' },
  { emoji: '🥬', title: 'ของสดไม่มีฉลาก', desc: 'เลือกผัก ผลไม้ เนื้อ ระบบใส่อายุมาตรฐานให้' },
  { emoji: '📷', title: 'สแกนบาร์โค้ด', desc: 'ดึงข้อมูลสินค้าจากฐานข้อมูล (เร็วๆ นี้)' },
];

export default function AddSheet({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.handle} />
        <Text style={styles.title}>เพิ่มของเข้าตู้</Text>
        {ADD_OPTIONS.map((opt) => (
          <Pressable
            key={opt.title}
            style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
            onPress={onClose}
          >
            <Text style={styles.optionEmoji}>{opt.emoji}</Text>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>{opt.title}</Text>
              <Text style={styles.optionDesc}>{opt.desc}</Text>
            </View>
          </Pressable>
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
  optionPressed: {
    opacity: 0.7,
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
  optionDesc: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
    marginTop: 1,
  },
});
