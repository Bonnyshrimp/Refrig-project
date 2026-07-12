import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LEFTOVER_SHELF_LIFE, useFridge } from '../context/FridgeContext';
import { Zone } from '../data/mock';
import { cardShadow, colors, fonts, radius } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

type Step = 'photo' | 'name' | 'zone';

// ชื่อยอดนิยม แตะเดียวไม่ต้องพิมพ์ — ช่วยให้จบใน 2 แตะตามเป้า PRD
const NAME_PRESETS = [
  { emoji: '🍛', name: 'แกง' },
  { emoji: '🍲', name: 'ต้ม/ซุป' },
  { emoji: '🥘', name: 'ผัด' },
  { emoji: '🍚', name: 'ข้าวผัด' },
  { emoji: '🍜', name: 'ก๋วยเตี๋ยว' },
  { emoji: '🍗', name: 'ของทอด/ย่าง' },
  { emoji: '🍰', name: 'ขนมหวาน' },
];

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: 'images',
  quality: 0.7,
};

export default function LeftoverFlow({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { addLeftover } = useFridge();
  const [step, setStep] = useState<Step>('photo');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🍲');

  const reset = () => {
    setStep('photo');
    setPhotoUri(undefined);
    setName('');
    setEmoji('🍲');
  };

  const close = () => {
    reset();
    onClose();
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('ไม่ได้รับอนุญาต', 'ต้องอนุญาตให้ใช้กล้องก่อน หรือเลือกรูปจากเครื่องแทนได้');
      return;
    }
    const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
      setStep('name');
    }
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
      setStep('name');
    }
  };

  const selectPreset = (preset: (typeof NAME_PRESETS)[number]) => {
    setName(preset.name);
    setEmoji(preset.emoji);
    setStep('zone');
  };

  const save = (zone: Zone) => {
    addLeftover({ name: name.trim(), emoji, zone, photoUri });
    close();
  };

  const goBack = () => {
    if (step === 'zone') setStep('name');
    else if (step === 'name') setStep('photo');
    else close();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={goBack}>
      <View style={[styles.screen, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
        {/* หัวเรื่อง + ปุ่มย้อน/ปิด */}
        <View style={styles.topBar}>
          <Pressable onPress={goBack} hitSlop={12}>
            <Text style={styles.topBtn}>{step === 'photo' ? '✕' : '‹ ย้อน'}</Text>
          </Pressable>
          <Text style={styles.topTitle}>เก็บของเหลือ 🍲</Text>
          <Pressable onPress={close} hitSlop={12}>
            <Text style={styles.topBtn}>{step === 'photo' ? ' ' : '✕'}</Text>
          </Pressable>
        </View>

        {/* ตัวบอกขั้นตอน */}
        <View style={styles.stepsRow}>
          {(['photo', 'name', 'zone'] as Step[]).map((s, i) => (
            <View key={s} style={[styles.stepDot, step === s && styles.stepDotActive]}>
              <Text style={[styles.stepNum, step === s && styles.stepNumActive]}>{i + 1}</Text>
            </View>
          ))}
        </View>

        {step === 'photo' && (
          <View style={styles.body}>
            <Text style={styles.question}>ถ่ายรูปอาหารที่จะเก็บ</Text>
            <View style={styles.photoBox}>
              <Text style={styles.photoHint}>📷</Text>
            </View>
            <Pressable style={[styles.bigBtn, styles.bigBtnPrimary]} onPress={takePhoto}>
              <Text style={styles.bigBtnPrimaryText}>📷 ถ่ายรูป</Text>
            </Pressable>
            <Pressable style={styles.bigBtn} onPress={pickPhoto}>
              <Text style={styles.bigBtnText}>🖼️ เลือกรูปจากเครื่อง</Text>
            </Pressable>
            <Pressable onPress={() => setStep('name')} hitSlop={8}>
              <Text style={styles.skip}>ข้ามรูปไปก่อน ›</Text>
            </Pressable>
          </View>
        )}

        {step === 'name' && (
          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            <Text style={styles.question}>นี่คืออะไร?</Text>
            {photoUri && <Image source={{ uri: photoUri }} style={styles.preview} />}
            <View style={styles.presetWrap}>
              {NAME_PRESETS.map((p) => (
                <Pressable key={p.name} style={styles.presetChip} onPress={() => selectPreset(p)}>
                  <Text style={styles.presetText}>
                    {p.emoji} {p.name}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.orLabel}>หรือพิมพ์ชื่อเอง</Text>
            <TextInput
              style={styles.input}
              placeholder="เช่น แกงเขียวหวาน"
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={setName}
              returnKeyType="next"
              onSubmitEditing={() => name.trim() && setStep('zone')}
            />
            <Pressable
              style={[styles.bigBtn, styles.bigBtnPrimary, !name.trim() && styles.bigBtnDisabled]}
              onPress={() => name.trim() && setStep('zone')}
              disabled={!name.trim()}
            >
              <Text style={styles.bigBtnPrimaryText}>ต่อไป ›</Text>
            </Pressable>
          </ScrollView>
        )}

        {step === 'zone' && (
          <View style={styles.body}>
            <Text style={styles.question}>เก็บช่องไหน?</Text>
            <Text style={styles.itemSummary}>
              {emoji} {name}
            </Text>
            {(
              [
                { zone: 'chill', emoji: '🧊', label: 'ช่องเย็น', color: colors.chill },
                { zone: 'freeze', emoji: '❄️', label: 'ช่องแข็ง', color: colors.freeze },
              ] as const
            ).map((z) => (
              <Pressable
                key={z.zone}
                style={({ pressed }) => [
                  styles.zoneCard,
                  { borderColor: z.color },
                  pressed && styles.zoneCardPressed,
                ]}
                onPress={() => save(z.zone)}
              >
                <Text style={styles.zoneEmoji}>{z.emoji}</Text>
                <View style={styles.zoneInfo}>
                  <Text style={[styles.zoneLabel, { color: z.color }]}>{z.label}</Text>
                  <Text style={styles.zoneDays}>
                    เก็บได้ประมาณ {LEFTOVER_SHELF_LIFE[z.zone].label}
                  </Text>
                </View>
                <Text style={[styles.zoneSave, { color: z.color }]}>บันทึก ›</Text>
              </Pressable>
            ))}
            {/* คำเตือนประมาณการ — ต้องแสดงทุกจุดที่โชว์อายุแบบประมาณ (PRD ข้อ 8) */}
            <Text style={styles.estNote}>
              ⚠️ อายุการเก็บเป็นการประมาณการ ของจริงอาจเสียเร็วหรือช้ากว่านี้
              ควรสังเกตด้วยตัวเองก่อนกินเสมอ
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.frost,
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  topBtn: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.muted,
    minWidth: 44,
  },
  topTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.ink,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: colors.green,
  },
  stepNum: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.muted,
  },
  stepNumActive: {
    color: colors.card,
  },
  body: {
    gap: 12,
  },
  question: {
    fontFamily: fonts.headingSemi,
    fontSize: 20,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 4,
  },
  photoBox: {
    height: 160,
    borderRadius: radius.card,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoHint: {
    fontSize: 44,
    opacity: 0.5,
  },
  preview: {
    height: 160,
    borderRadius: radius.card,
    alignSelf: 'stretch',
  },
  bigBtn: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    paddingVertical: 15,
    alignItems: 'center',
    ...cardShadow,
  },
  bigBtnPrimary: {
    backgroundColor: colors.green,
  },
  bigBtnDisabled: {
    opacity: 0.4,
  },
  bigBtnText: {
    fontFamily: fonts.headingSemi,
    fontSize: 16,
    color: colors.ink,
  },
  bigBtnPrimaryText: {
    fontFamily: fonts.headingSemi,
    fontSize: 16,
    color: colors.card,
  },
  skip: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    padding: 8,
  },
  presetWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  presetChip: {
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 9,
    ...cardShadow,
  },
  presetText: {
    fontFamily: fonts.body,
    fontSize: 14.5,
    color: colors.ink,
  },
  orLabel: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 4,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
  },
  itemSummary: {
    fontFamily: fonts.headingMed,
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 8,
  },
  zoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 2,
    padding: 18,
    gap: 14,
    ...cardShadow,
  },
  zoneCardPressed: {
    opacity: 0.8,
  },
  zoneEmoji: {
    fontSize: 34,
  },
  zoneInfo: {
    flex: 1,
  },
  zoneLabel: {
    fontFamily: fonts.headingSemi,
    fontSize: 17,
  },
  zoneDays: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.muted,
    marginTop: 2,
  },
  zoneSave: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },
  estNote: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#9A6A10',
    backgroundColor: '#FCF3E3',
    borderRadius: radius.card,
    padding: 12,
    lineHeight: 19,
  },
});
