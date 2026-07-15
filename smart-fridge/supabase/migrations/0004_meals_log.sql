-- Smart Fridge — migration 0004: ตาราง meals_log (PRD ข้อ 7 / 4.3)
-- ปรับจาก schema ใน PRD: ใช้ user_id ผูก auth.users ตรงๆ ก่อน
-- (profile_id จะมาพร้อมระบบโปรไฟล์ครอบครัวในโหมดดูแลผู้สูงอายุ Phase 2
--  ตอนนั้นค่อยเพิ่มคอลัมน์ profile_id แล้ว migrate)
-- วิธีใช้: วางทั้งไฟล์ใน Supabase SQL Editor → Run

create table public.meals_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recipe_name text not null,
  kcal integer not null default 0,
  protein_g numeric(6, 1),
  carb_g numeric(6, 1),
  fat_g numeric(6, 1),
  sodium_mg integer,
  sugar_g numeric(6, 1),
  eaten_at timestamptz not null default now(),
  source text not null default 'auto' check (source in ('auto', 'manual'))
);

-- แท็บสุขภาพเรียก "มื้อของฉันวันนี้/ย้อนหลัง" บ่อยที่สุด
create index meals_log_user_eaten_idx on public.meals_log (user_id, eaten_at desc);

alter table public.meals_log enable row level security;

create policy "own meals - select"
  on public.meals_log for select
  using (auth.uid() = user_id);

create policy "own meals - insert"
  on public.meals_log for insert
  with check (auth.uid() = user_id);

create policy "own meals - delete"
  on public.meals_log for delete
  using (auth.uid() = user_id);
