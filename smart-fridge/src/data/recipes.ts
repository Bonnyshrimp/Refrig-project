// ฐานสูตรอาหารสำหรับแนะนำเมนู (Phase 2 อาจย้ายเข้า DB / ให้ AI แนะนำ)
// ค่าโภชนาการเป็นค่าประมาณต่อหนึ่งจาน

import { FoodCategory } from './spoilageGuide';

export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  kcal: number;
  proteinG: number;
  carbG: number;
  fatG: number;
  sodiumMg: number;
  sugarG: number;
  // จับคู่กับของในตู้: เจอคำใดคำหนึ่งในชื่อของ = ใช้ของชิ้นนั้นทำได้
  keywords: string[];
  // จับคู่แบบกว้างด้วยหมวด (ใช้เมื่อไม่มี keyword ตรง)
  categories?: FoodCategory[];
}

export const RECIPES: Recipe[] = [
  { id: 'r01', name: 'ผัดกะเพราไก่ไข่ดาว', emoji: '🍳', kcal: 550, proteinG: 32, carbG: 52, fatG: 24, sodiumMg: 1100, sugarG: 4, keywords: ['ไก่', 'กะเพรา', 'ไข่'] },
  { id: 'r02', name: 'ไก่ย่างสมุนไพร', emoji: '🍗', kcal: 290, proteinG: 35, carbG: 4, fatG: 14, sodiumMg: 620, sugarG: 2, keywords: ['ไก่'] },
  { id: 'r03', name: 'ต้มยำกุ้ง', emoji: '🦐', kcal: 220, proteinG: 22, carbG: 10, fatG: 9, sodiumMg: 1350, sugarG: 5, keywords: ['กุ้ง', 'เห็ด', 'ตะไคร้', 'มะนาว'] },
  { id: 'r04', name: 'ผัดผักรวมหมูสับ', emoji: '🥘', kcal: 320, proteinG: 18, carbG: 22, fatG: 17, sodiumMg: 780, sugarG: 6, keywords: ['หมู', 'ผัก', 'แครอท', 'บรอกโคลี', 'กะหล่ำ'], categories: ['veg'] },
  { id: 'r05', name: 'แกงจืดผักกาดขาวหมูสับ', emoji: '🍲', kcal: 210, proteinG: 16, carbG: 12, fatG: 10, sodiumMg: 850, sugarG: 3, keywords: ['ผักกาดขาว', 'หมู', 'เต้าหู้'] },
  { id: 'r06', name: 'ไข่เจียวหมูสับ', emoji: '🍳', kcal: 420, proteinG: 22, carbG: 6, fatG: 34, sodiumMg: 640, sugarG: 1, keywords: ['ไข่', 'หมู'] },
  { id: 'r07', name: 'ข้าวผัดหมู', emoji: '🍚', kcal: 520, proteinG: 20, carbG: 68, fatG: 18, sodiumMg: 920, sugarG: 4, keywords: ['ข้าว', 'หมู', 'ไข่'] },
  { id: 'r08', name: 'ผัดคะน้าน้ำมันหอย', emoji: '🥬', kcal: 240, proteinG: 9, carbG: 16, fatG: 16, sodiumMg: 880, sugarG: 5, keywords: ['คะน้า', 'กวางตุ้ง'] },
  { id: 'r09', name: 'ปลานึ่งมะนาว', emoji: '🐟', kcal: 230, proteinG: 34, carbG: 6, fatG: 8, sodiumMg: 950, sugarG: 4, keywords: ['ปลา', 'มะนาว'] },
  { id: 'r10', name: 'ปลาทอดน้ำปลา', emoji: '🐟', kcal: 380, proteinG: 30, carbG: 8, fatG: 25, sodiumMg: 1050, sugarG: 2, keywords: ['ปลา'] },
  { id: 'r11', name: 'ผัดผักบุ้งไฟแดง', emoji: '🥬', kcal: 190, proteinG: 6, carbG: 12, fatG: 13, sodiumMg: 890, sugarG: 3, keywords: ['ผักบุ้ง'] },
  { id: 'r12', name: 'สเต๊กหมูพริกไทยดำ', emoji: '🥩', kcal: 480, proteinG: 38, carbG: 18, fatG: 28, sodiumMg: 720, sugarG: 5, keywords: ['หมู', 'สเต๊ก', 'เนื้อ'] },
  { id: 'r13', name: 'ผัดเผ็ดปลาหมึก', emoji: '🦑', kcal: 300, proteinG: 24, carbG: 14, fatG: 16, sodiumMg: 1150, sugarG: 6, keywords: ['ปลาหมึก', 'หมึก'] },
  { id: 'r14', name: 'กุ้งอบวุ้นเส้น', emoji: '🦐', kcal: 340, proteinG: 24, carbG: 36, fatG: 11, sodiumMg: 1200, sugarG: 3, keywords: ['กุ้ง'] },
  { id: 'r15', name: 'ต้มจืดเต้าหู้สาหร่าย', emoji: '🍲', kcal: 180, proteinG: 14, carbG: 10, fatG: 9, sodiumMg: 800, sugarG: 2, keywords: ['เต้าหู้', 'หมู'] },
  { id: 'r16', name: 'สลัดผักอกไก่', emoji: '🥗', kcal: 310, proteinG: 30, carbG: 14, fatG: 15, sodiumMg: 450, sugarG: 7, keywords: ['ผักกาดหอม', 'สลัด', 'ไก่', 'มะเขือเทศ', 'แตงกวา'], categories: ['veg'] },
  { id: 'r17', name: 'ไข่ต้มยำมาม่า(ไม่ใส่ผงครบ)', emoji: '🥚', kcal: 380, proteinG: 16, carbG: 48, fatG: 14, sodiumMg: 1300, sugarG: 3, keywords: ['ไข่'] },
  { id: 'r18', name: 'โยเกิร์ตผลไม้รวม', emoji: '🍓', kcal: 220, proteinG: 8, carbG: 38, fatG: 5, sodiumMg: 90, sugarG: 26, keywords: ['โยเกิร์ต', 'นม'], categories: ['fruit'] },
  { id: 'r19', name: 'สมูทตี้ผลไม้+นม', emoji: '🥤', kcal: 260, proteinG: 7, carbG: 48, fatG: 5, sodiumMg: 110, sugarG: 32, keywords: ['นม', 'กล้วย', 'มะม่วง', 'สตรอว์เบอร์รี'], categories: ['fruit'] },
  { id: 'r20', name: 'แซนด์วิชแฮมชีส', emoji: '🥪', kcal: 380, proteinG: 18, carbG: 36, fatG: 18, sodiumMg: 980, sugarG: 5, keywords: ['ขนมปัง', 'แฮม', 'ชีส', 'ไข่'] },
  { id: 'r21', name: 'ข้าวต้มหมูสับ', emoji: '🥣', kcal: 320, proteinG: 18, carbG: 44, fatG: 8, sodiumMg: 850, sugarG: 2, keywords: ['ข้าว', 'หมู', 'ไข่'] },
  { id: 'r22', name: 'ผัดมะเขือยาวหมูสับ', emoji: '🍆', kcal: 290, proteinG: 14, carbG: 18, fatG: 18, sodiumMg: 820, sugarG: 6, keywords: ['มะเขือ', 'หมู'] },
];

// เมนูสำหรับ "ของเหลือ": อุ่นกินให้หมด — สร้างแบบไดนามิกจากชื่อของ
export const LEFTOVER_RECIPE_BASE = {
  kcal: 400,
  proteinG: 18,
  carbG: 40,
  fatG: 16,
  sodiumMg: 900,
  sugarG: 5,
} as const;
