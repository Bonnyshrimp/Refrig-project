-- Smart Fridge — migration 0001: fridge_items + waste_log + RLS
-- อิง schema ใน PRD ข้อ 7 โดยปรับสำหรับ MVP:
--   * ใช้ user_id ผูกกับ auth.users ตรงๆ ก่อน (ระบบ household/แชร์ตู้ทั้งบ้าน
--     เป็นฟีเจอร์ Premium Phase 2 ค่อยเพิ่มตาราง households แล้ว migrate)
--   * ยังไม่มี reference_id เพราะตาราง food_reference จะสร้างในก้อนที่ 6
--     (seed จาก USDA FoodKeeper)
-- วิธีใช้: คัดลอกไฟล์นี้ทั้งไฟล์ไปวางใน Supabase Dashboard → SQL Editor → Run

-- ---------- ตารางของในตู้ ----------
create table public.fridge_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  emoji text not null default '🍲',
  photo_url text, -- ตอนนี้เก็บ uri รูปในเครื่อง จะย้ายเป็น Supabase Storage ภายหลัง
  zone text not null check (zone in ('chill', 'freeze', 'pantry')),
  category text not null check (
    category in ('cooked', 'veg', 'fruit', 'meat', 'seafood', 'dairy', 'bakery')
  ),
  stored_at date not null default current_date,
  expiry_date date not null,
  expiry_source text not null check (expiry_source in ('label', 'est')),
  is_leftover boolean not null default false,
  status text not null default 'active' check (status in ('active', 'eaten', 'discarded')),
  created_at timestamptz not null default now()
);

-- เรียก "ของในตู้ของฉันที่ยังอยู่" บ่อยที่สุด
create index fridge_items_user_active_idx
  on public.fridge_items (user_id, status, expiry_date);

-- ---------- ตารางสถิติของทิ้ง ----------
create table public.waste_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_name text not null,
  estimated_value_baht numeric(10, 2), -- ยังไม่เก็บราคาใน MVP เผื่อไว้ก่อน
  discarded_at timestamptz not null default now()
);

create index waste_log_user_idx on public.waste_log (user_id, discarded_at desc);

-- ---------- Row Level Security: เห็น/แก้เฉพาะข้อมูลตัวเอง ----------
alter table public.fridge_items enable row level security;
alter table public.waste_log enable row level security;

create policy "own fridge items - select"
  on public.fridge_items for select
  using (auth.uid() = user_id);

create policy "own fridge items - insert"
  on public.fridge_items for insert
  with check (auth.uid() = user_id);

create policy "own fridge items - update"
  on public.fridge_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "own fridge items - delete"
  on public.fridge_items for delete
  using (auth.uid() = user_id);

create policy "own waste log - select"
  on public.waste_log for select
  using (auth.uid() = user_id);

create policy "own waste log - insert"
  on public.waste_log for insert
  with check (auth.uid() = user_id);
