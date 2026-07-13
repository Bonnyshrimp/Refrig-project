import { LabelReadResult } from '../types';
import { supabase } from './supabase';

// เรียก Edge Function read-label ให้ AI อ่านฉลากจากรูป
// คืน null เมื่อเรียกไม่สำเร็จ (เน็ตล่ม/ยังไม่ deploy ฟังก์ชัน) → แอป fallback เป็นกรอกเอง
export async function readLabel(
  imageBase64: string,
  mediaType: string,
): Promise<LabelReadResult | null> {
  const { data, error } = await supabase.functions.invoke('read-label', {
    body: { image_base64: imageBase64, media_type: mediaType },
  });
  if (error || !data || typeof data.readable !== 'boolean') return null;
  return data as LabelReadResult;
}
