import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { FridgeItem } from '../types';

export interface NotifSettings {
  enabled: boolean;
  leadDays: number[]; // เตือนล่วงหน้ากี่วัน เช่น [3, 1] ตาม PRD 3.5
}

export const DEFAULT_NOTIF_SETTINGS: NotifSettings = {
  enabled: false, // เปิดเมื่อผู้ใช้อนุญาตสิทธิ์ในหน้าตั้งค่า
  leadDays: [3, 1],
};

export const LEAD_DAY_OPTIONS = [1, 2, 3, 5, 7];

const NOTIFY_HOUR = 9; // เตือนตอน 9 โมงเช้า

// พฤติกรรมเมื่อแจ้งเตือนเด้งตอนแอปเปิดอยู่
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('expiry', {
    name: 'เตือนวันหมดอายุ',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
  });
}

function messageFor(item: FridgeItem, daysAhead: number): string {
  if (daysAhead <= 1) {
    return `${item.emoji} ${item.name}จะหมดอายุพรุ่งนี้ ใช้ให้หมดก่อนเสียนะ`;
  }
  return `${item.emoji} ${item.name}จะหมดอายุในอีก ${daysAhead} วัน วางแผนใช้ให้ทันนะ`;
}

// นัดแจ้งเตือนใหม่ทั้งชุดตามของในตู้ปัจจุบัน (ยกเลิกของเดิมก่อน กันซ้ำ)
export async function syncExpiryNotifications(
  items: FridgeItem[],
  settings: NotifSettings,
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!settings.enabled || settings.leadDays.length === 0) return;

  const granted = (await Notifications.getPermissionsAsync()).granted;
  if (!granted) return;

  await ensureAndroidChannel();
  const now = new Date();

  for (const item of items) {
    for (const lead of settings.leadDays) {
      const offsetDays = item.daysLeft - lead; // อีกกี่วันถึงวันที่ต้องเตือน
      if (offsetDays < 0) continue; // เลยจุดเตือนนี้มาแล้ว
      const fireDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + offsetDays,
        NOTIFY_HOUR,
        0,
        0,
      );
      if (fireDate.getTime() <= now.getTime()) continue; // 9 โมงของวันนี้ผ่านไปแล้ว

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ ของใกล้หมดอายุ',
          body: messageFor(item, lead),
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fireDate,
          channelId: 'expiry',
        },
      });
    }
  }
}

// ส่งแจ้งเตือนทดสอบใน 3 วินาที ให้ผู้ใช้เช็กว่าระบบทำงาน
export async function sendTestNotification(): Promise<void> {
  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ ของใกล้หมดอายุ',
      body: '🍛 แกงเขียวหวานจะหมดอายุพรุ่งนี้ ใช้ให้หมดก่อนเสียนะ (ข้อความทดสอบ)',
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3,
      channelId: 'expiry',
    },
  });
}
