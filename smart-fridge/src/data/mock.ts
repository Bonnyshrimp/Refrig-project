// Mock data ของแท็บที่ยังไม่ต่อฐานข้อมูล (เมนู/ซื้อของ/สุขภาพ — Phase 2)
// ส่วนของในตู้เย็นย้ายไปอ่าน/เขียน Supabase จริงแล้ว (ดู FridgeContext)

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
