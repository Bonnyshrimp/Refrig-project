import { FoodCategory } from './data/spoilageGuide';

export type Zone = 'chill' | 'freeze';
export type ExpirySource = 'label' | 'est';

// โมเดลฝั่ง UI — แปลงมาจากแถว fridge_items ใน Supabase (ดู FridgeContext)
export interface FridgeItem {
  id: string;
  name: string;
  emoji: string;
  zone: Zone;
  storedDays: number; // เก็บมาแล้วกี่วัน
  daysLeft: number; // เหลืออีกกี่วัน (ติดลบ = เกินแล้ว)
  totalDays: number; // อายุเก็บทั้งหมด ใช้คำนวณแถบความสด
  expirySource: ExpirySource;
  isLeftover: boolean; // ของเหลือ (อาหารปรุงแล้ว)
  category: FoodCategory; // หมวดสำหรับคู่มือสังเกตของเสีย
  photoUri?: string; // รูปที่ผู้ใช้ถ่าย/เลือกเอง ถ้าไม่มีใช้อีโมจิ
}

// แถวจากตาราง fridge_items (คอลัมน์ตาม migration 0001)
export interface FridgeItemRow {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  photo_url: string | null;
  zone: Zone | 'pantry';
  category: FoodCategory;
  stored_at: string; // YYYY-MM-DD
  expiry_date: string; // YYYY-MM-DD
  expiry_source: ExpirySource;
  is_leftover: boolean;
  status: 'active' | 'eaten' | 'discarded';
  created_at: string;
}
