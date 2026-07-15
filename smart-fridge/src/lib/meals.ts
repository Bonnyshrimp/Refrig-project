import { Recipe } from '../data/recipes';
import { supabase } from './supabase';

// บันทึกมื้ออาหารลง meals_log (PRD 4.3 — แท็บสุขภาพจะอ่านตารางนี้)
export async function logMeal(userId: string, recipe: Recipe): Promise<void> {
  const { error } = await supabase.from('meals_log').insert({
    user_id: userId,
    recipe_name: recipe.name,
    kcal: recipe.kcal,
    protein_g: recipe.proteinG,
    carb_g: recipe.carbG,
    fat_g: recipe.fatG,
    sodium_mg: recipe.sodiumMg,
    sugar_g: recipe.sugarG,
    source: 'auto', // มาจากปุ่ม "✓ ทำเมนูนี้" ผู้ใช้ไม่ต้องกรอกเอง
  });
  if (error) throw new Error('บันทึกมื้ออาหารไม่สำเร็จ');
}
