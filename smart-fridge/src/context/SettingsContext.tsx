import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DEFAULT_NOTIF_SETTINGS, NotifSettings } from '../lib/notifications';

const STORAGE_KEY = 'smart-fridge/notif-settings';

interface SettingsContextValue {
  settings: NotifSettings;
  loaded: boolean; // อ่านค่าที่เคยบันทึกจากเครื่องเสร็จแล้ว
  updateSettings: (next: NotifSettings) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<NotifSettings>(DEFAULT_NOTIF_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setSettings({ ...DEFAULT_NOTIF_SETTINGS, ...JSON.parse(raw) });
      })
      .catch(() => {}) // อ่านไม่ได้ก็ใช้ค่าเริ่มต้น
      .finally(() => setLoaded(true));
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      loaded,
      updateSettings: (next) => {
        setSettings(next);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      },
    }),
    [settings, loaded],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings ต้องใช้ภายใน SettingsProvider');
  return ctx;
}
