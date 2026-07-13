import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFridge } from '../context/FridgeContext';
import { ESTIMATE_WARNING } from '../data/spoilageGuide';
import { supabase } from '../lib/supabase';
import { colors, fonts, radius } from '../theme';
import { FoodReferenceRow, Zone } from '../types';

interface Props {
  visible: boolean;
  onClose: () => void;
}

// แปลงช่วงวันเป็นข้อความอ่านง่าย เช่น 60–90 → "2–3 เดือน"
function fmtRange(min: number | null, max: number | null): string | null {
  if (min == null) return null;
  const hi = max ?? min;
  if (min >= 30) {
    const loM = Math.round(min / 30);
    const hiM = Math.round(hi / 30);
    return loM === hiM ? `${loM} เดือน` : `${loM}–${hiM} เดือน`;
  }
  return min === hi ? `${min} วัน` : `${min}–${hi} วัน`;
}

export default function FreshFlow({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { addFromReference } = useFridge();
  const [refs, setRefs] = useState<FoodReferenceRow[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<FoodReferenceRow | null>(null);
  const [saving, setSaving] = useState(false);

  // โหลดตารางอ้างอิงครั้งแรกที่เปิด แล้ว cache ไว้ (ข้อมูล ~100 แถว ค้นในเครื่องเร็วกว่า)
  useEffect(() => {
    if (!visible || refs !== null) return;
    supabase
      .from('food_reference')
      .select('*')
      .order('name_th')
      .then(({ data, error }) => {
        if (error) setLoadError(true);
        else setRefs(data as FoodReferenceRow[]);
      });
  }, [visible, refs]);

  const matches = useMemo(() => {
    if (!refs) return [];
    const q = query.trim().toLowerCase();
    if (!q) return refs;
    return refs.filter(
      (r) => r.name_th.toLowerCase().includes(q) || r.name_en.toLowerCase().includes(q),
    );
  }, [refs, query]);

  const close = () => {
    setQuery('');
    setSelected(null);
    onClose();
  };

  const save = async (zone: Zone) => {
    if (!selected || saving) return;
    setSaving(true);
    try {
      await addFromReference(selected, zone);
      close();
    } catch (e) {
      Alert.alert('ขออภัย', e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง');
    } finally {
      setSaving(false);
    }
  };

  const chillLabel = selected ? fmtRange(selected.chill_days_min, selected.chill_days_max) : null;
  const freezeLabel = selected
    ? fmtRange(selected.freeze_days_min, selected.freeze_days_max)
    : null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={selected ? () => setSelected(null) : close}>
      <View style={[styles.screen, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.topBar}>
          <Pressable onPress={selected ? () => setSelected(null) : close} hitSlop={12}>
            <Text style={styles.topBtn}>{selected ? '‹ ย้อน' : '✕'}</Text>
          </Pressable>
          <Text style={styles.topTitle}>ของสดไม่มีฉลาก 🥬</Text>
          <Pressable onPress={close} hitSlop={12}>
            <Text style={styles.topBtn}>{selected ? '✕' : ' '}</Text>
          </Pressable>
        </View>

        {!selected ? (
          <>
            <TextInput
              style={styles.search}
              placeholder="ค้นหา เช่น อกไก่, ผักบุ้ง, นม..."
              placeholderTextColor={colors.muted}
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
            />
            {refs === null ? (
              <View style={styles.center}>
                {loadError ? (
                  <Text style={styles.emptyText}>
                    โหลดตารางอ้างอิงไม่สำเร็จ{'\n'}เช็กว่ารัน migration 0002 ใน Supabase แล้ว
                  </Text>
                ) : (
                  <ActivityIndicator size="large" color={colors.chill} />
                )}
              </View>
            ) : (
              <FlatList
                data={matches}
                keyExtractor={(r) => r.id}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    ไม่พบ "{query}" ในตาราง{'\n'}ลองคำอื่น หรือใช้ "เก็บของเหลือ" พิมพ์ชื่อเองได้
                  </Text>
                }
                renderItem={({ item }) => {
                  const chill = fmtRange(item.chill_days_min, item.chill_days_max);
                  const freeze = fmtRange(item.freeze_days_min, item.freeze_days_max);
                  return (
                    <Pressable
                      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                      onPress={() => setSelected(item)}
                    >
                      <Text style={styles.rowEmoji}>{item.emoji}</Text>
                      <View style={styles.rowInfo}>
                        <Text style={styles.rowName}>{item.name_th}</Text>
                        <Text style={styles.rowMeta}>
                          {[chill && `🧊 ${chill}`, freeze && `❄️ ${freeze}`]
                            .filter(Boolean)
                            .join('  ·  ')}
                        </Text>
                      </View>
                      <Text style={styles.rowGo}>›</Text>
                    </Pressable>
                  );
                }}
              />
            )}
          </>
        ) : (
          <View style={styles.zoneBody}>
            <Text style={styles.question}>เก็บช่องไหน?</Text>
            <Text style={styles.itemSummary}>
              {selected.emoji} {selected.name_th}
            </Text>
            {(
              [
                { zone: 'chill', emoji: '🧊', label: 'ช่องเย็น', days: chillLabel, color: colors.chill },
                { zone: 'freeze', emoji: '❄️', label: 'ช่องแข็ง', days: freezeLabel, color: colors.freeze },
              ] as const
            ).map((z) => {
              const enabled = z.days !== null && !saving;
              return (
                <Pressable
                  key={z.zone}
                  style={({ pressed }) => [
                    styles.zoneCard,
                    { borderColor: z.color },
                    (!enabled || pressed) && styles.zoneCardDim,
                  ]}
                  onPress={() => save(z.zone)}
                  disabled={!enabled}
                >
                  <Text style={styles.zoneEmoji}>{z.emoji}</Text>
                  <View style={styles.zoneInfo}>
                    <Text style={[styles.zoneLabel, { color: z.color }]}>{z.label}</Text>
                    <Text style={styles.zoneDays}>
                      {z.days ? `เก็บได้ประมาณ ${z.days}` : 'ไม่แนะนำให้เก็บช่องนี้'}
                    </Text>
                  </View>
                  {z.days && (
                    <Text style={[styles.zoneSave, { color: z.color }]}>
                      {saving ? 'กำลังบันทึก...' : 'บันทึก ›'}
                    </Text>
                  )}
                </Pressable>
              );
            })}
            {/* คำเตือนประมาณการ — ต้องแสดงเสมอ (PRD 3.2 / ข้อ 8) */}
            <Text style={styles.estNote}>📖 {ESTIMATE_WARNING}</Text>
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
  search: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15.5,
    color: colors.ink,
    marginBottom: 10,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingBottom: 30,
    gap: 8,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14.5,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 40,
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 12,
    gap: 12,
  },
  rowPressed: {
    opacity: 0.75,
  },
  rowEmoji: {
    fontSize: 26,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontFamily: fonts.headingMed,
    fontSize: 15,
    color: colors.ink,
  },
  rowMeta: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.muted,
    marginTop: 1,
  },
  rowGo: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.line,
  },
  zoneBody: {
    gap: 12,
    paddingTop: 8,
  },
  question: {
    fontFamily: fonts.headingSemi,
    fontSize: 20,
    color: colors.ink,
    textAlign: 'center',
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
  },
  zoneCardDim: {
    opacity: 0.55,
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
