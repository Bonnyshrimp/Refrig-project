import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFridge } from '../context/FridgeContext';
import { FoodCategory, SPOILAGE_GUIDE } from '../data/spoilageGuide';
import { readLabel } from '../lib/readLabel';
import { cardShadow, colors, fonts, radius } from '../theme';
import { Zone } from '../types';
import { todayStr } from '../utils/dates';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const CATEGORY_EMOJI: Record<FoodCategory, string> = {
  cooked: '🍱',
  veg: '🥬',
  fruit: '🍎',
  meat: '🥩',
  seafood: '🐟',
  dairy: '🥛',
  bakery: '🍞',
};

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: 'images',
  quality: 0.5, // ลดขนาดรูปให้ส่งขึ้นเซิร์ฟเวอร์เร็ว
  base64: true,
};

// "15/08/2569" หรือ "15/08/2026" → "2026-08-15" (แปลง พ.ศ. อัตโนมัติ)
function parseThaiDate(input: string): string | null {
  const m = input.trim().match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  let year = Number(m[3]);
  if (year > 2400) year -= 543; // พ.ศ. → ค.ศ.
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return Number.isNaN(Date.parse(iso)) ? null : iso;
}

// "2026-08-15" → "15/08/2026" สำหรับแสดงในช่องกรอก
function isoToDisplay(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export default function LabelFlow({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { addLabeledItem } = useFridge();

  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [reading, setReading] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [expiryText, setExpiryText] = useState('');
  const [category, setCategory] = useState<FoodCategory>('cooked');
  const [zone, setZone] = useState<Zone>('chill');
  const [sodium, setSodium] = useState('');
  const [sugar, setSugar] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setPhotoUri(undefined);
    setReading(false);
    setAiNote(null);
    setName('');
    setExpiryText('');
    setCategory('cooked');
    setZone('chill');
    setSodium('');
    setSugar('');
  };

  const close = () => {
    reset();
    onClose();
  };

  const runAi = async (asset: ImagePicker.ImagePickerAsset) => {
    setPhotoUri(asset.uri);
    if (!asset.base64) {
      setAiNote('ไม่ได้ข้อมูลรูป กรอกเองได้เลย');
      return;
    }
    setReading(true);
    setAiNote(null);
    const result = await readLabel(asset.base64, asset.mimeType ?? 'image/jpeg');
    setReading(false);

    if (!result || !result.readable) {
      // Fallback ตามสเปก: AI อ่านไม่ได้ → กรอกเอง
      setAiNote('🤖 AI อ่านฉลากไม่สำเร็จ กรอกข้อมูลเองได้เลยด้านล่าง');
      return;
    }
    if (result.name_th) setName(result.name_th);
    if (result.expiry_date) setExpiryText(isoToDisplay(result.expiry_date));
    if (result.category) setCategory(result.category);
    if (result.sodium_mg != null) setSodium(String(result.sodium_mg));
    if (result.sugar_g != null) setSugar(String(result.sugar_g));
    setAiNote('✨ AI เติมข้อมูลให้แล้ว ตรวจความถูกต้องก่อนบันทึกนะ');
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('ไม่ได้รับอนุญาต', 'ต้องอนุญาตให้ใช้กล้องก่อน หรือเลือกรูปจากเครื่องแทนได้');
      return;
    }
    const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
    if (!result.canceled) runAi(result.assets[0]);
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
    if (!result.canceled) runAi(result.assets[0]);
  };

  const save = async () => {
    if (saving) return;
    const expiryIso = parseThaiDate(expiryText);
    if (!name.trim()) {
      Alert.alert('ยังไม่มีชื่อ', 'ใส่ชื่อสินค้าก่อนนะ');
      return;
    }
    if (!expiryIso) {
      Alert.alert('วันหมดอายุไม่ถูกต้อง', 'ใส่รูปแบบ วัน/เดือน/ปี เช่น 15/08/2569 (พ.ศ. หรือ ค.ศ. ก็ได้)');
      return;
    }
    if (expiryIso < todayStr()) {
      Alert.alert('เช็กอีกที', 'วันหมดอายุนี้ผ่านมาแล้ว ตรวจปีอีกครั้งนะ');
      return;
    }
    setSaving(true);
    try {
      await addLabeledItem({
        name: name.trim(),
        emoji: CATEGORY_EMOJI[category],
        zone,
        category,
        expiryDate: expiryIso,
        photoUri,
        sodiumMg: sodium.trim() ? Number(sodium) : null,
        sugarG: sugar.trim() ? Number(sugar) : null,
      });
      close();
    } catch (e) {
      Alert.alert('ขออภัย', e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
          <View style={styles.topBar}>
            <Pressable onPress={close} hitSlop={12}>
              <Text style={styles.topBtn}>✕</Text>
            </Pressable>
            <Text style={styles.topTitle}>ถ่ายรูปฉลาก 🏷️</Text>
            <View style={styles.topBtnSpace} />
          </View>

          <ScrollView
            contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 24 }]}
            keyboardShouldPersistTaps="handled"
          >
            {/* รูปฉลาก */}
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.preview} />
            ) : (
              <View style={styles.photoBox}>
                <Text style={styles.photoHint}>🏷️</Text>
                <Text style={styles.photoDesc}>
                  ถ่ายให้เห็นชื่อสินค้า วันหมดอายุ{'\n'}และตารางโภชนาการชัดๆ
                </Text>
              </View>
            )}
            <View style={styles.photoBtnRow}>
              <Pressable style={[styles.photoBtn, styles.photoBtnPrimary]} onPress={takePhoto}>
                <Text style={styles.photoBtnPrimaryText}>📷 ถ่ายรูป</Text>
              </Pressable>
              <Pressable style={styles.photoBtn} onPress={pickPhoto}>
                <Text style={styles.photoBtnText}>🖼️ เลือกรูป</Text>
              </Pressable>
            </View>

            {reading && (
              <View style={styles.readingBox}>
                <ActivityIndicator color={colors.chill} />
                <Text style={styles.readingText}>AI กำลังอ่านฉลาก...</Text>
              </View>
            )}
            {aiNote && !reading && <Text style={styles.aiNote}>{aiNote}</Text>}

            {/* ฟอร์มตรวจแก้ */}
            <Text style={styles.label}>ชื่อสินค้า</Text>
            <TextInput
              style={styles.input}
              placeholder="เช่น นมสดรสจืด"
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>วันหมดอายุ (วัน/เดือน/ปี — พ.ศ. หรือ ค.ศ.)</Text>
            <TextInput
              style={styles.input}
              placeholder="เช่น 15/08/2569"
              placeholderTextColor={colors.muted}
              keyboardType="numbers-and-punctuation"
              value={expiryText}
              onChangeText={setExpiryText}
            />

            <Text style={styles.label}>หมวดอาหาร</Text>
            <View style={styles.chipWrap}>
              {(Object.keys(SPOILAGE_GUIDE) as FoodCategory[]).map((cat) => {
                const active = category === cat;
                return (
                  <Pressable
                    key={cat}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {SPOILAGE_GUIDE[cat].emoji} {SPOILAGE_GUIDE[cat].label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>เก็บช่องไหน</Text>
            <View style={styles.chipWrap}>
              {(
                [
                  { zone: 'chill', label: '🧊 ช่องเย็น', color: colors.chill },
                  { zone: 'freeze', label: '❄️ ช่องแข็ง', color: colors.freeze },
                ] as const
              ).map((z) => {
                const active = zone === z.zone;
                return (
                  <Pressable
                    key={z.zone}
                    style={[styles.chip, active && { backgroundColor: z.color }]}
                    onPress={() => setZone(z.zone)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {z.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.nutritionRow}>
              <View style={styles.flex}>
                <Text style={styles.label}>โซเดียม (mg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ไม่บังคับ"
                  placeholderTextColor={colors.muted}
                  keyboardType="numeric"
                  value={sodium}
                  onChangeText={setSodium}
                />
              </View>
              <View style={styles.flex}>
                <Text style={styles.label}>น้ำตาล (g)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ไม่บังคับ"
                  placeholderTextColor={colors.muted}
                  keyboardType="numeric"
                  value={sugar}
                  onChangeText={setSugar}
                />
              </View>
            </View>

            <Pressable
              style={[styles.saveBtn, saving && styles.saveBtnDim]}
              onPress={save}
              disabled={saving}
            >
              <Text style={styles.saveText}>
                {saving ? 'กำลังบันทึก...' : '🏷️ บันทึกตามฉลาก'}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.frost,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  topBtn: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.muted,
    minWidth: 44,
  },
  topBtnSpace: {
    minWidth: 44,
  },
  topTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.ink,
  },
  body: {
    paddingHorizontal: 20,
    gap: 8,
  },
  photoBox: {
    height: 140,
    borderRadius: radius.card,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  photoHint: {
    fontSize: 36,
    opacity: 0.6,
  },
  photoDesc: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 19,
  },
  preview: {
    height: 180,
    borderRadius: radius.card,
    alignSelf: 'stretch',
  },
  photoBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  photoBtn: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.card,
    paddingVertical: 12,
    alignItems: 'center',
    ...cardShadow,
  },
  photoBtnPrimary: {
    backgroundColor: colors.green,
  },
  photoBtnText: {
    fontFamily: fonts.headingMed,
    fontSize: 14.5,
    color: colors.ink,
  },
  photoBtnPrimaryText: {
    fontFamily: fonts.headingMed,
    fontSize: 14.5,
    color: colors.card,
  },
  readingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 12,
    marginTop: 4,
  },
  readingText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.muted,
  },
  aiNote: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: '#1E6E4E',
    backgroundColor: '#E8F3EC',
    borderRadius: radius.card,
    padding: 10,
    marginTop: 4,
    lineHeight: 19,
  },
  label: {
    fontFamily: fonts.headingMed,
    fontSize: 13.5,
    color: colors.ink,
    marginTop: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontFamily: fonts.body,
    fontSize: 15.5,
    color: colors.ink,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: colors.ink,
  },
  chipText: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.muted,
  },
  chipTextActive: {
    fontFamily: fonts.bodyBold,
    color: colors.card,
  },
  nutritionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  saveBtn: {
    backgroundColor: colors.green,
    borderRadius: radius.card,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnDim: {
    opacity: 0.6,
  },
  saveText: {
    fontFamily: fonts.headingSemi,
    fontSize: 16,
    color: colors.card,
  },
});
