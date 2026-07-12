import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { supabase } from '../lib/supabase';
import { FridgeItem, FridgeItemRow, Zone } from '../types';
import { addDays, diffDays, todayStr } from '../utils/dates';
import { useAuth } from './AuthContext';

// อายุเก็บโดยประมาณของอาหารปรุงสุก (แนวทาง อย./กรมอนามัย ตาม PRD 3.2)
export const LEFTOVER_SHELF_LIFE: Record<Zone, { label: string; days: number }> = {
  chill: { label: '3–4 วัน', days: 3 },
  freeze: { label: '2–3 เดือน', days: 60 },
};

export interface NewLeftover {
  name: string;
  emoji: string;
  zone: Zone;
  photoUri?: string;
}

interface FridgeContextValue {
  items: FridgeItem[];
  loading: boolean; // โหลดรอบแรกหลังล็อกอิน
  error: string | null;
  refresh: () => Promise<void>;
  addLeftover: (input: NewLeftover) => Promise<void>;
  discardItem: (id: string) => Promise<void>;
}

const FridgeContext = createContext<FridgeContextValue | null>(null);

// แปลงแถวจาก DB เป็นโมเดลฝั่ง UI (คำนวณจำนวนวันจากวันที่จริง)
function rowToItem(row: FridgeItemRow): FridgeItem {
  const today = todayStr();
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    zone: row.zone === 'pantry' ? 'chill' : row.zone, // pantry ยังไม่มีใน UI
    storedDays: Math.max(0, diffDays(today, row.stored_at)),
    daysLeft: diffDays(row.expiry_date, today),
    totalDays: Math.max(1, diffDays(row.expiry_date, row.stored_at)),
    expirySource: row.expiry_source,
    isLeftover: row.is_leftover,
    category: row.category,
    photoUri: row.photo_url ?? undefined,
  };
}

export function FridgeProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [items, setItems] = useState<FridgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const { data, error: err } = await supabase
      .from('fridge_items')
      .select('*')
      .eq('status', 'active')
      .order('expiry_date', { ascending: true });
    if (err) {
      setError('โหลดข้อมูลไม่สำเร็จ ลองดึงหน้าจอลงเพื่อรีเฟรช');
    } else {
      setError(null);
      setItems((data as FridgeItemRow[]).map(rowToItem));
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setItems([]);
      setLoading(true);
      return;
    }
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [userId, refresh]);

  const value = useMemo<FridgeContextValue>(
    () => ({
      items,
      loading,
      error,
      refresh,
      // ระบบใส่วันที่บันทึกอัตโนมัติ: stored_at = วันนี้ อายุตามช่องที่เลือก (PRD 3.4)
      addLeftover: async ({ name, emoji, zone, photoUri }) => {
        if (!userId) throw new Error('ยังไม่ได้เข้าสู่ระบบ');
        const today = todayStr();
        const { data, error: err } = await supabase
          .from('fridge_items')
          .insert({
            user_id: userId,
            name,
            emoji,
            photo_url: photoUri ?? null,
            zone,
            category: 'cooked',
            stored_at: today,
            expiry_date: addDays(today, LEFTOVER_SHELF_LIFE[zone].days),
            expiry_source: 'est',
            is_leftover: true,
          })
          .select()
          .single();
        if (err) throw new Error('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง');
        setItems((prev) => [rowToItem(data as FridgeItemRow), ...prev]);
      },
      // ทิ้งแล้ว: เปลี่ยนสถานะ + บันทึกสถิติของทิ้งลง waste_log (PRD 3.3)
      discardItem: async (id) => {
        if (!userId) throw new Error('ยังไม่ได้เข้าสู่ระบบ');
        const item = items.find((i) => i.id === id);
        const { error: err } = await supabase
          .from('fridge_items')
          .update({ status: 'discarded' })
          .eq('id', id);
        if (err) throw new Error('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง');
        setItems((prev) => prev.filter((i) => i.id !== id));
        if (item) {
          // สถิติของทิ้งพลาดได้โดยไม่ต้องขัดจังหวะผู้ใช้
          await supabase
            .from('waste_log')
            .insert({ user_id: userId, item_name: item.name });
        }
      },
    }),
    [items, loading, error, refresh, userId],
  );

  return <FridgeContext.Provider value={value}>{children}</FridgeContext.Provider>;
}

export function useFridge(): FridgeContextValue {
  const ctx = useContext(FridgeContext);
  if (!ctx) throw new Error('useFridge ต้องใช้ภายใน FridgeProvider');
  return ctx;
}
