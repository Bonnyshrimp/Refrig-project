-- Smart Fridge — migration 0003: คอลัมน์โภชนาการจากฉลาก
-- เก็บโซเดียม/น้ำตาลที่ AI อ่านได้ ไว้ใช้กับแท็บสุขภาพ/โหมดดูแลผู้สูงอายุ (Phase 2)
-- วิธีใช้: วางทั้งไฟล์ใน Supabase SQL Editor → Run

alter table public.fridge_items
  add column sodium_mg integer,
  add column sugar_g numeric(6, 1);
