import React from 'react';
import { Alert, Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import {
  ensureNotificationPermission,
  LEAD_DAY_OPTIONS,
  sendTestNotification,
} from '../lib/notifications';
import { colors, fonts, radius } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function SettingsSheet({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useSettings();
  const { signOut } = useAuth();

  const toggleEnabled = async (next: boolean) => {
    if (next) {
      const granted = await ensureNotificationPermission();
      if (!granted) {
        Alert.alert(
          'ไม่ได้รับอนุญาต',
          'ต้องอนุญาตการแจ้งเตือนในตั้งค่าเครื่องก่อน แอปถึงจะเตือนวันหมดอายุได้',
        );
        return;
      }
    }
    updateSettings({ ...settings, enabled: next });
  };

  const toggleLeadDay = (day: number) => {
    const has = settings.leadDays.includes(day);
    if (has && settings.leadDays.length === 1) {
      Alert.alert('เลือกอย่างน้อย 1 วัน', 'ต้องมีวันเตือนล่วงหน้าอย่างน้อยหนึ่งค่า');
      return;
    }
    const next = has
      ? settings.leadDays.filter((d) => d !== day)
      : [...settings.leadDays, day].sort((a, b) => b - a);
    updateSettings({ ...settings, leadDays: next });
  };

  const testNotify = async () => {
    const granted = await ensureNotificationPermission();
    if (!granted) {
      Alert.alert('ไม่ได้รับอนุญาต', 'ต้องอนุญาตการแจ้งเตือนในตั้งค่าเครื่องก่อน');
      return;
    }
    await sendTestNotification();
    Alert.alert('ส่งแล้ว', 'แจ้งเตือนทดสอบจะเด้งใน 3 วินาที ลองพับแอปไว้ดูนะ');
  };

  const confirmSignOut = () => {
    Alert.alert('ออกจากระบบ', 'ต้องการออกจากระบบใช่ไหม?', [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ออกจากระบบ', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.handle} />
        <Text style={styles.title}>ตั้งค่า ⚙️</Text>

        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.rowTitle}>เตือนวันหมดอายุ</Text>
              <Text style={styles.rowDesc}>แจ้งเตือนตอน 9 โมงเช้าของวันที่ถึงกำหนด</Text>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={toggleEnabled}
              trackColor={{ true: colors.green, false: colors.line }}
              thumbColor={colors.card}
            />
          </View>

          <Text style={[styles.rowTitle, styles.leadTitle]}>เตือนล่วงหน้า (เลือกได้หลายค่า)</Text>
          <View style={styles.chipRow}>
            {LEAD_DAY_OPTIONS.map((day) => {
              const active = settings.leadDays.includes(day);
              return (
                <Pressable
                  key={day}
                  style={[
                    styles.chip,
                    active && styles.chipActive,
                    !settings.enabled && styles.chipDisabled,
                  ]}
                  onPress={() => toggleLeadDay(day)}
                  disabled={!settings.enabled}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {day} วัน
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={[styles.testBtn, !settings.enabled && styles.chipDisabled]}
            onPress={testNotify}
            disabled={!settings.enabled}
          >
            <Text style={styles.testText}>🔔 ลองส่งแจ้งเตือนทดสอบ</Text>
          </Pressable>
        </View>

        <Pressable style={styles.signOut} onPress={confirmSignOut}>
          <Text style={styles.signOutText}>ออกจากระบบ</Text>
        </Pressable>
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
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 16,
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchInfo: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: fonts.headingMed,
    fontSize: 15,
    color: colors.ink,
  },
  rowDesc: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  leadTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.frost,
  },
  chipActive: {
    backgroundColor: colors.green,
  },
  chipDisabled: {
    opacity: 0.4,
  },
  chipText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.muted,
  },
  chipTextActive: {
    fontFamily: fonts.bodyBold,
    color: colors.card,
  },
  testBtn: {
    marginTop: 16,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 12,
    alignItems: 'center',
  },
  testText: {
    fontFamily: fonts.headingMed,
    fontSize: 14.5,
    color: colors.ink,
  },
  signOut: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signOutText: {
    fontFamily: fonts.headingMed,
    fontSize: 15,
    color: colors.red,
  },
});
