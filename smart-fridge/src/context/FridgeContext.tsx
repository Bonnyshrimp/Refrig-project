import React, { createContext, useContext, useMemo, useState } from 'react';
import { FridgeItem, MOCK_FRIDGE_ITEMS, Zone } from '../data/mock';

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
  addLeftover: (input: NewLeftover) => void;
  discardItem: (id: string) => void;
}

const FridgeContext = createContext<FridgeContextValue | null>(null);

export function FridgeProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<FridgeItem[]>(MOCK_FRIDGE_ITEMS);

  const value = useMemo<FridgeContextValue>(
    () => ({
      items,
      // ระบบใส่วันที่บันทึกอัตโนมัติ: เก็บมา 0 วัน อายุตามช่องที่เลือก (PRD 3.4)
      addLeftover: ({ name, emoji, zone, photoUri }) => {
        const days = LEFTOVER_SHELF_LIFE[zone].days;
        setItems((prev) => [
          {
            id: `local-${Date.now()}`,
            name,
            emoji,
            zone,
            storedDays: 0,
            daysLeft: days,
            totalDays: days,
            expirySource: 'est',
            isLeftover: true,
            category: 'cooked',
            photoUri,
          },
          ...prev,
        ]);
      },
      // ทิ้งแล้ว: ลบออกจากตู้ (สถิติ waste_log จะบันทึกจริงตอนต่อ Supabase)
      discardItem: (id) => setItems((prev) => prev.filter((i) => i.id !== id)),
    }),
    [items],
  );

  return <FridgeContext.Provider value={value}>{children}</FridgeContext.Provider>;
}

export function useFridge(): FridgeContextValue {
  const ctx = useContext(FridgeContext);
  if (!ctx) throw new Error('useFridge ต้องใช้ภายใน FridgeProvider');
  return ctx;
}
