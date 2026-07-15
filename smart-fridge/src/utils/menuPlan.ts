// Engine แนะนำเมนูจากของในตู้ (PRD 4.1): ของใกล้หมดอายุถูกหยิบมาใช้ก่อนเสมอ

import { LEFTOVER_RECIPE_BASE, Recipe, RECIPES } from '../data/recipes';
import { FridgeItem } from '../types';

export interface MenuSuggestion {
  recipe: Recipe;
  matched: FridgeItem[]; // ของในตู้ที่เมนูนี้จะใช้ (ถูกตัดออกเมื่อกดทำเมนู)
  urgency: number; // daysLeft ต่ำสุดของของที่ใช้
}

export interface DayPlan {
  dayLabel: string;
  suggestion: MenuSuggestion | null; // null = วันซื้อของ/เมนูอิสระ
  isShoppingDay: boolean;
}

function itemMatchesRecipe(item: FridgeItem, recipe: Recipe): boolean {
  if (recipe.keywords.some((k) => item.name.includes(k))) return true;
  return recipe.categories?.includes(item.category) ?? false;
}

// เมนู "อุ่นของเหลือ" สร้างจากรายการของเหลือโดยตรง
function leftoverSuggestion(item: FridgeItem): MenuSuggestion {
  return {
    recipe: {
      id: `leftover-${item.id}`,
      name: `อุ่น${item.name}กินให้หมด`,
      emoji: item.emoji,
      ...LEFTOVER_RECIPE_BASE,
      keywords: [],
    },
    matched: [item],
    urgency: item.daysLeft,
  };
}

// แนะนำเมนูวันนี้ เรียงด่วนก่อน (PRD 4.1 "วันนี้")
export function recommendToday(items: FridgeItem[], limit = 8): MenuSuggestion[] {
  const suggestions: MenuSuggestion[] = [];

  // 1) ของเหลือ = อุ่นกิน (pain point หลักของแอป)
  for (const item of items.filter((i) => i.isLeftover)) {
    suggestions.push(leftoverSuggestion(item));
  }

  // 2) จับคู่ของสด/วัตถุดิบกับสูตรอาหาร
  const rawItems = items.filter((i) => !i.isLeftover);
  for (const recipe of RECIPES) {
    const matched = rawItems.filter((i) => itemMatchesRecipe(i, recipe));
    if (matched.length === 0) continue;
    suggestions.push({
      recipe,
      matched,
      urgency: Math.min(...matched.map((i) => i.daysLeft)),
    });
  }

  // เรียง: ของด่วนขึ้นก่อน แล้วค่อยเมนูที่ใช้ของได้หลายชิ้น
  suggestions.sort((a, b) => a.urgency - b.urgency || b.matched.length - a.matched.length);
  return suggestions.slice(0, limit);
}

const THAI_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์'];

function dayLabel(offset: number): string {
  if (offset === 0) return 'วันนี้';
  if (offset === 1) return 'พรุ่งนี้';
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `วัน${THAI_DAYS[d.getDay()]}`;
}

// แผนทั้งสัปดาห์ 7 วัน: ของเสียเร็วอยู่วันแรกๆ วันสุดท้ายเป็นวันซื้อของ (PRD 4.1)
export function planWeek(items: FridgeItem[]): DayPlan[] {
  const pool = recommendToday(items, 50); // เรียงตามความด่วนอยู่แล้ว
  const usedItemIds = new Set<string>();
  const days: DayPlan[] = [];

  for (let offset = 0; offset < 7; offset++) {
    if (offset === 6) {
      days.push({ dayLabel: dayLabel(offset), suggestion: null, isShoppingDay: true });
      break;
    }
    // เลือกเมนูด่วนสุดที่ยังมีของเหลือให้ใช้ (ไม่ซ้ำของที่ถูกวันก่อนใช้ไป)
    const pick = pool.find((s) => s.matched.some((i) => !usedItemIds.has(i.id)));
    if (pick) {
      pool.splice(pool.indexOf(pick), 1);
      pick.matched.forEach((i) => usedItemIds.add(i.id));
      days.push({ dayLabel: dayLabel(offset), suggestion: pick, isShoppingDay: false });
    } else {
      days.push({ dayLabel: dayLabel(offset), suggestion: null, isShoppingDay: false });
    }
  }
  return days;
}
