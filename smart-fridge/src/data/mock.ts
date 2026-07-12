// Mock data สำหรับโครงหน้าจอ — ยังไม่ต่อฐานข้อมูล (จะแทนที่ด้วย Supabase ภายหลัง)

import { FoodCategory } from './spoilageGuide';

export type Zone = 'chill' | 'freeze';
export type ExpirySource = 'label' | 'est';

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
}

export const MOCK_FRIDGE_ITEMS: FridgeItem[] = [
  {
    id: '1',
    name: 'แกงเขียวหวานไก่',
    emoji: '🍛',
    zone: 'chill',
    storedDays: 3,
    daysLeft: 0,
    totalDays: 3,
    expirySource: 'est',
    isLeftover: true,
    category: 'cooked',
  },
  {
    id: '2',
    name: 'นมสดพาสเจอไรซ์',
    emoji: '🥛',
    zone: 'chill',
    storedDays: 5,
    daysLeft: 2,
    totalDays: 7,
    expirySource: 'label',
    isLeftover: false,
    category: 'dairy',
  },
  {
    id: '3',
    name: 'ผักกาดขาว',
    emoji: '🥬',
    zone: 'chill',
    storedDays: 2,
    daysLeft: 3,
    totalDays: 5,
    expirySource: 'est',
    isLeftover: false,
    category: 'veg',
  },
  {
    id: '4',
    name: 'ข้าวผัดหมู (ของเหลือ)',
    emoji: '🍚',
    zone: 'chill',
    storedDays: 1,
    daysLeft: 2,
    totalDays: 3,
    expirySource: 'est',
    isLeftover: true,
    category: 'cooked',
  },
  {
    id: '5',
    name: 'อกไก่แช่แข็ง',
    emoji: '🍗',
    zone: 'freeze',
    storedDays: 14,
    daysLeft: 76,
    totalDays: 90,
    expirySource: 'est',
    isLeftover: false,
    category: 'meat',
  },
  {
    id: '6',
    name: 'กุ้งแช่แข็ง',
    emoji: '🦐',
    zone: 'freeze',
    storedDays: 30,
    daysLeft: 60,
    totalDays: 90,
    expirySource: 'label',
    isLeftover: false,
    category: 'seafood',
  },
];

export const MOCK_MENU_TODAY = [
  { id: 'm1', name: 'ผัดผักกาดขาวหมูสับ', kcal: 320, urgent: true },
  { id: 'm2', name: 'ข้าวผัดแกงเขียวหวาน', kcal: 480, urgent: true },
  { id: 'm3', name: 'อกไก่ย่างสมุนไพร', kcal: 290, urgent: false },
];

export const MOCK_SHOPPING = [
  { id: 's1', name: 'นมสด 1 ลิตร', reason: 'นมจะหมด 14 ก.ค. (อีก 2 วัน)', done: false },
  { id: 's2', name: 'ไข่ไก่ 1 แผง', reason: 'ใช้ในแผนเมนูสัปดาห์นี้', done: false },
  { id: 's3', name: 'ผักกาดขาว ครึ่งหัว', reason: '🧠 เดือนก่อนซื้อเต็มหัวแล้วทิ้ง 2 ครั้ง', done: true },
];

export const MOCK_HEALTH_TODAY = {
  kcal: { current: 1240, goal: 1800 },
  protein: { current: 52, goal: 90 },
  carb: { current: 150, goal: 220 },
  fat: { current: 38, goal: 60 },
};
