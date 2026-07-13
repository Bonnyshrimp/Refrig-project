-- Smart Fridge — migration 0002: ตาราง food_reference + seed data
-- แหล่งข้อมูล:
--   * source = 'usda_foodkeeper' — ค่าจาก USDA FoodKeeper / FoodSafety.gov
--     Cold Food Storage Chart (open data) เลือกหมวดที่ครัวไทยใช้บ่อย ~100 รายการ
--   * source = 'thai_table' — อาหารไทยที่ไม่มีในฐานข้อมูลฝรั่ง อ้างหลักทั่วไปตาม
--     แนวทาง อย./กรมอนามัย: อาหารปรุงสุกแช่เย็น 3–4 วัน / แช่แข็ง 2–3 เดือน
--     (เมนูกะทิใช้ 2–3 วันเผื่อความปลอดภัย, ยำ/ส้มตำ 1–2 วันและไม่แนะนำแช่แข็ง)
-- ทุกรายการเป็นค่า "ประมาณการ" — แอปต้องติดป้าย 📖 และคำเตือนเสมอ (PRD 3.2)
-- วิธีใช้: วางทั้งไฟล์ใน Supabase SQL Editor → Run

create table public.food_reference (
  id uuid primary key default gen_random_uuid(),
  name_th text not null,
  name_en text not null,
  emoji text not null default '🍽️',
  category text not null check (
    category in ('cooked', 'veg', 'fruit', 'meat', 'seafood', 'dairy', 'bakery')
  ),
  chill_days_min int, -- null = ไม่แนะนำเก็บช่องเย็น
  chill_days_max int,
  freeze_days_min int, -- null = ไม่แนะนำแช่แข็ง
  freeze_days_max int,
  pantry_days int, -- เก็บนอกตู้ได้กี่วัน (ยังไม่ใช้ใน UI)
  source text not null check (source in ('usda_foodkeeper', 'thai_table'))
);

-- ตารางอ้างอิงกลาง: ทุกคนอ่านได้ แต่ห้ามแก้จากฝั่งแอป
alter table public.food_reference enable row level security;

create policy "food reference readable by all users"
  on public.food_reference for select
  to authenticated
  using (true);

-- ---------- เนื้อสัตว์ดิบ (usda_foodkeeper) ----------
insert into public.food_reference
  (name_th, name_en, emoji, category, chill_days_min, chill_days_max, freeze_days_min, freeze_days_max, pantry_days, source)
values
  ('เนื้อวัวบดดิบ', 'Ground beef (raw)', '🥩', 'meat', 1, 2, 90, 120, null, 'usda_foodkeeper'),
  ('หมูบดดิบ', 'Ground pork (raw)', '🥩', 'meat', 1, 2, 90, 120, null, 'usda_foodkeeper'),
  ('ไก่บดดิบ', 'Ground chicken (raw)', '🍗', 'meat', 1, 2, 90, 120, null, 'usda_foodkeeper'),
  ('เนื้อวัวชิ้น/สเต๊ก', 'Beef steak (raw)', '🥩', 'meat', 3, 5, 180, 365, null, 'usda_foodkeeper'),
  ('หมูชิ้น/สันคอ', 'Pork chops (raw)', '🥩', 'meat', 3, 5, 120, 180, null, 'usda_foodkeeper'),
  ('อกไก่ดิบ', 'Chicken breast (raw)', '🍗', 'meat', 1, 2, 270, 270, null, 'usda_foodkeeper'),
  ('ไก่ทั้งตัวดิบ', 'Whole chicken (raw)', '🍗', 'meat', 1, 2, 365, 365, null, 'usda_foodkeeper'),
  ('เป็ดดิบ', 'Duck (raw)', '🦆', 'meat', 1, 2, 180, 180, null, 'usda_foodkeeper'),
  ('ตับ/เครื่องในดิบ', 'Liver and organ meats (raw)', '🥩', 'meat', 1, 2, 90, 120, null, 'usda_foodkeeper'),
  ('เบคอน (เปิดแล้ว)', 'Bacon (opened)', '🥓', 'meat', 7, 7, 30, 30, null, 'usda_foodkeeper'),
  ('ไส้กรอกสด', 'Fresh sausage (raw)', '🌭', 'meat', 1, 2, 30, 60, null, 'usda_foodkeeper'),
  ('ฮอทดอก (เปิดแล้ว)', 'Hot dogs (opened)', '🌭', 'meat', 7, 7, 30, 60, null, 'usda_foodkeeper'),
  ('แฮม/เนื้อแปรรูปแผ่น (เปิดแล้ว)', 'Deli meat (opened)', '🍖', 'meat', 3, 5, 30, 60, null, 'usda_foodkeeper');

-- ---------- เนื้อสัตว์ปรุงสุก / อาหารเหลือ (usda_foodkeeper) ----------
insert into public.food_reference
  (name_th, name_en, emoji, category, chill_days_min, chill_days_max, freeze_days_min, freeze_days_max, pantry_days, source)
values
  ('ไก่ปรุงสุก', 'Cooked chicken', '🍗', 'cooked', 3, 4, 120, 120, null, 'usda_foodkeeper'),
  ('เนื้อ/หมูปรุงสุก', 'Cooked beef or pork', '🍖', 'cooked', 3, 4, 60, 90, null, 'usda_foodkeeper'),
  ('ไก่ทอด', 'Fried chicken', '🍗', 'cooked', 3, 4, 120, 120, null, 'usda_foodkeeper'),
  ('ซุป/สตูว์', 'Soup or stew', '🍲', 'cooked', 3, 4, 60, 90, null, 'usda_foodkeeper'),
  ('พิซซ่า (เหลือ)', 'Pizza (leftover)', '🍕', 'cooked', 3, 4, 30, 60, null, 'usda_foodkeeper'),
  ('ข้าวสวยหุงสุก', 'Cooked rice', '🍚', 'cooked', 3, 4, 30, 60, null, 'usda_foodkeeper'),
  ('พาสต้าปรุงสุก', 'Cooked pasta', '🍝', 'cooked', 3, 5, 30, 60, null, 'usda_foodkeeper'),
  ('อาหารเหลือทั่วไป', 'Leftovers (general)', '🍱', 'cooked', 3, 4, 60, 90, null, 'usda_foodkeeper');

-- ---------- อาหารทะเล (usda_foodkeeper) ----------
insert into public.food_reference
  (name_th, name_en, emoji, category, chill_days_min, chill_days_max, freeze_days_min, freeze_days_max, pantry_days, source)
values
  ('ปลาเนื้อขาวดิบ', 'Lean fish (raw)', '🐟', 'seafood', 1, 2, 180, 240, null, 'usda_foodkeeper'),
  ('ปลาแซลมอน/ปลามันดิบ', 'Fatty fish e.g. salmon (raw)', '🐟', 'seafood', 1, 2, 60, 90, null, 'usda_foodkeeper'),
  ('กุ้งดิบ', 'Shrimp (raw)', '🦐', 'seafood', 1, 2, 90, 180, null, 'usda_foodkeeper'),
  ('ปลาหมึกดิบ', 'Squid (raw)', '🦑', 'seafood', 1, 2, 90, 180, null, 'usda_foodkeeper'),
  ('เนื้อปูสด', 'Fresh crab meat', '🦀', 'seafood', 2, 4, 120, 120, null, 'usda_foodkeeper'),
  ('หอยแกะเปลือกสด', 'Shucked shellfish', '🐚', 'seafood', 1, 2, 90, 90, null, 'usda_foodkeeper'),
  ('ปลาปรุงสุก', 'Cooked fish', '🐟', 'seafood', 3, 4, 30, 90, null, 'usda_foodkeeper'),
  ('กุ้งปรุงสุก', 'Cooked shrimp', '🦐', 'seafood', 3, 4, 90, 90, null, 'usda_foodkeeper'),
  ('ทูน่ากระป๋อง (เปิดแล้ว)', 'Canned tuna (opened)', '🥫', 'seafood', 3, 4, 60, 60, null, 'usda_foodkeeper'),
  ('ปูอัด (เปิดแล้ว)', 'Imitation crab (opened)', '🦀', 'seafood', 3, 5, 90, 90, null, 'usda_foodkeeper');

-- ---------- ไข่ / นม / ผลิตภัณฑ์นม (usda_foodkeeper) ----------
insert into public.food_reference
  (name_th, name_en, emoji, category, chill_days_min, chill_days_max, freeze_days_min, freeze_days_max, pantry_days, source)
values
  ('ไข่ไก่สดทั้งฟอง', 'Fresh eggs in shell', '🥚', 'dairy', 21, 35, null, null, null, 'usda_foodkeeper'),
  ('ไข่ต้มสุก', 'Hard-boiled eggs', '🥚', 'dairy', 7, 7, null, null, null, 'usda_foodkeeper'),
  ('นมพาสเจอไรซ์ (เปิดแล้ว)', 'Milk (opened)', '🥛', 'dairy', 5, 7, 90, 90, null, 'usda_foodkeeper'),
  ('โยเกิร์ต', 'Yogurt', '🥛', 'dairy', 7, 14, 30, 60, null, 'usda_foodkeeper'),
  ('เนย', 'Butter', '🧈', 'dairy', 30, 90, 180, 270, null, 'usda_foodkeeper'),
  ('ชีสแข็ง (เปิดแล้ว)', 'Hard cheese (opened)', '🧀', 'dairy', 21, 28, 180, 180, null, 'usda_foodkeeper'),
  ('ชีสนิ่ม', 'Soft cheese', '🧀', 'dairy', 7, 7, null, null, null, 'usda_foodkeeper'),
  ('ครีมชีส', 'Cream cheese', '🧀', 'dairy', 14, 14, null, null, null, 'usda_foodkeeper'),
  ('วิปครีม/ครีมสด', 'Heavy cream', '🥛', 'dairy', 7, 10, 90, 120, null, 'usda_foodkeeper'),
  ('นมถั่วเหลือง (เปิดแล้ว)', 'Soy milk (opened)', '🥛', 'dairy', 7, 10, null, null, null, 'usda_foodkeeper'),
  ('นมข้นหวาน (เปิดแล้ว)', 'Condensed milk (opened)', '🥛', 'dairy', 14, 21, null, null, null, 'usda_foodkeeper');

-- ---------- ผัก (usda_foodkeeper) ----------
insert into public.food_reference
  (name_th, name_en, emoji, category, chill_days_min, chill_days_max, freeze_days_min, freeze_days_max, pantry_days, source)
values
  ('ผักกาดหอม', 'Lettuce', '🥬', 'veg', 7, 10, null, null, null, 'usda_foodkeeper'),
  ('ผักกาดขาว', 'Napa cabbage', '🥬', 'veg', 7, 14, null, null, null, 'usda_foodkeeper'),
  ('กะหล่ำปลี', 'Cabbage', '🥬', 'veg', 7, 14, null, null, null, 'usda_foodkeeper'),
  ('แครอท', 'Carrots', '🥕', 'veg', 14, 21, 240, 240, null, 'usda_foodkeeper'),
  ('คื่นช่ายฝรั่ง', 'Celery', '🥬', 'veg', 7, 14, null, null, null, 'usda_foodkeeper'),
  ('มะเขือเทศ', 'Tomatoes (ripe)', '🍅', 'veg', 5, 7, null, null, 3, 'usda_foodkeeper'),
  ('แตงกวา', 'Cucumbers', '🥒', 'veg', 4, 7, null, null, null, 'usda_foodkeeper'),
  ('พริกหวาน', 'Bell peppers', '🫑', 'veg', 7, 14, null, null, null, 'usda_foodkeeper'),
  ('บรอกโคลี', 'Broccoli', '🥦', 'veg', 3, 5, 240, 240, null, 'usda_foodkeeper'),
  ('กะหล่ำดอก', 'Cauliflower', '🥦', 'veg', 5, 7, 240, 240, null, 'usda_foodkeeper'),
  ('ต้นหอม', 'Green onions', '🌿', 'veg', 7, 10, null, null, null, 'usda_foodkeeper'),
  ('ผักโขม', 'Spinach', '🥬', 'veg', 5, 7, 240, 240, null, 'usda_foodkeeper'),
  ('เห็ดสด', 'Mushrooms', '🍄', 'veg', 4, 7, null, null, null, 'usda_foodkeeper'),
  ('ข้าวโพดทั้งฝัก', 'Corn on the cob', '🌽', 'veg', 1, 2, 240, 240, null, 'usda_foodkeeper'),
  ('ถั่วฝักยาว/ถั่วแขก', 'Green beans', '🫛', 'veg', 3, 5, 240, 240, null, 'usda_foodkeeper'),
  ('ถั่วงอก', 'Bean sprouts', '🌱', 'veg', 2, 3, null, null, null, 'usda_foodkeeper'),
  ('มะเขือยาว/มะเขือม่วง', 'Eggplant', '🍆', 'veg', 4, 7, null, null, null, 'usda_foodkeeper'),
  ('หน่อไม้ฝรั่ง', 'Asparagus', '🌿', 'veg', 3, 4, 240, 240, null, 'usda_foodkeeper'),
  ('หอมหัวใหญ่ (ปอก/หั่นแล้ว)', 'Onions (peeled or cut)', '🧅', 'veg', 7, 10, null, null, null, 'usda_foodkeeper'),
  ('กระเทียม (ปอกแล้ว)', 'Garlic (peeled)', '🧄', 'veg', 7, 10, null, null, null, 'usda_foodkeeper'),
  ('ขิง', 'Ginger', '🫚', 'veg', 14, 21, 180, 180, null, 'usda_foodkeeper'),
  ('พริกสด', 'Fresh chilies', '🌶️', 'veg', 7, 14, 180, 180, null, 'usda_foodkeeper'),
  ('ผักชี', 'Cilantro', '🌿', 'veg', 7, 10, null, null, null, 'usda_foodkeeper');

-- ---------- ผักไทยที่ไม่มีในฐานฝรั่ง (thai_table) ----------
insert into public.food_reference
  (name_th, name_en, emoji, category, chill_days_min, chill_days_max, freeze_days_min, freeze_days_max, pantry_days, source)
values
  ('โหระพา/กะเพรา', 'Thai basil / holy basil', '🌿', 'veg', 4, 7, null, null, null, 'thai_table'),
  ('ตะไคร้', 'Lemongrass', '🌿', 'veg', 10, 14, 180, 180, null, 'thai_table'),
  ('ใบมะกรูด', 'Kaffir lime leaves', '🍃', 'veg', 7, 14, 365, 365, null, 'thai_table'),
  ('ผักบุ้ง', 'Morning glory', '🥬', 'veg', 2, 3, null, null, null, 'thai_table'),
  ('คะน้า', 'Chinese kale', '🥬', 'veg', 3, 5, null, null, null, 'thai_table'),
  ('กวางตุ้ง', 'Bok choy', '🥬', 'veg', 3, 5, null, null, null, 'thai_table');

-- ---------- ผลไม้ (usda_foodkeeper) ----------
insert into public.food_reference
  (name_th, name_en, emoji, category, chill_days_min, chill_days_max, freeze_days_min, freeze_days_max, pantry_days, source)
values
  ('แอปเปิล', 'Apples', '🍎', 'fruit', 21, 42, null, null, 7, 'usda_foodkeeper'),
  ('กล้วยสุก', 'Bananas (ripe)', '🍌', 'fruit', 3, 5, 60, 90, 3, 'usda_foodkeeper'),
  ('ส้ม', 'Oranges', '🍊', 'fruit', 14, 21, null, null, 7, 'usda_foodkeeper'),
  ('องุ่น', 'Grapes', '🍇', 'fruit', 5, 7, null, null, null, 'usda_foodkeeper'),
  ('สตรอว์เบอร์รี', 'Strawberries', '🍓', 'fruit', 3, 7, 240, 240, null, 'usda_foodkeeper'),
  ('บลูเบอร์รี', 'Blueberries', '🫐', 'fruit', 7, 10, 240, 240, null, 'usda_foodkeeper'),
  ('แตงโม (หั่นแล้ว)', 'Watermelon (cut)', '🍉', 'fruit', 3, 4, null, null, null, 'usda_foodkeeper'),
  ('สับปะรด (หั่นแล้ว)', 'Pineapple (cut)', '🍍', 'fruit', 3, 4, 180, 180, null, 'usda_foodkeeper'),
  ('มะม่วงสุก', 'Mango (ripe)', '🥭', 'fruit', 5, 7, 180, 180, null, 'usda_foodkeeper'),
  ('มะละกอสุก', 'Papaya (ripe)', '🍈', 'fruit', 5, 7, null, null, null, 'usda_foodkeeper'),
  ('อะโวคาโดสุก', 'Avocado (ripe)', '🥑', 'fruit', 3, 4, null, null, null, 'usda_foodkeeper'),
  ('มะนาว', 'Limes', '🍋', 'fruit', 21, 28, null, null, 7, 'usda_foodkeeper'),
  ('เลมอน', 'Lemons', '🍋', 'fruit', 21, 28, null, null, 7, 'usda_foodkeeper'),
  ('ลูกแพร์', 'Pears', '🍐', 'fruit', 5, 7, null, null, null, 'usda_foodkeeper'),
  ('พีช', 'Peaches', '🍑', 'fruit', 3, 5, 240, 240, null, 'usda_foodkeeper');

-- ---------- ขนมปัง / เบเกอรี่ (usda_foodkeeper) ----------
insert into public.food_reference
  (name_th, name_en, emoji, category, chill_days_min, chill_days_max, freeze_days_min, freeze_days_max, pantry_days, source)
values
  ('ขนมปังแผ่น', 'Sliced bread', '🍞', 'bakery', 7, 14, 90, 90, 5, 'usda_foodkeeper'),
  ('เค้ก (มีครีม)', 'Frosted cake', '🍰', 'bakery', 3, 7, 60, 60, null, 'usda_foodkeeper'),
  ('ครัวซองต์', 'Croissant', '🥐', 'bakery', 5, 7, 60, 60, 2, 'usda_foodkeeper'),
  ('มัฟฟิน', 'Muffins', '🧁', 'bakery', 5, 7, 90, 90, 3, 'usda_foodkeeper'),
  ('โดนัท', 'Donuts', '🍩', 'bakery', 5, 7, 30, 30, 2, 'usda_foodkeeper');

-- ---------- อาหารไทยปรุงสุก (thai_table) ----------
-- หลัก: ปรุงสุกแช่เย็น 3–4 วัน / แช่แข็ง 2–3 เดือน
-- เมนูกะทิเสียไวกว่า ใช้ 2–3 วัน · ยำ/ส้มตำใช้ 1–2 วันและไม่แนะนำแช่แข็ง
insert into public.food_reference
  (name_th, name_en, emoji, category, chill_days_min, chill_days_max, freeze_days_min, freeze_days_max, pantry_days, source)
values
  ('แกงเขียวหวาน', 'Green curry', '🍛', 'cooked', 2, 3, 60, 90, null, 'thai_table'),
  ('แกงเผ็ด/แกงกะทิ', 'Red curry / coconut curry', '🍛', 'cooked', 2, 3, 60, 90, null, 'thai_table'),
  ('แกงมัสมั่น', 'Massaman curry', '🍛', 'cooked', 2, 3, 60, 90, null, 'thai_table'),
  ('พะแนง', 'Panang curry', '🍛', 'cooked', 2, 3, 60, 90, null, 'thai_table'),
  ('ต้มข่าไก่', 'Tom kha gai', '🥥', 'cooked', 2, 3, 60, 90, null, 'thai_table'),
  ('แกงส้ม', 'Sour curry (kaeng som)', '🍲', 'cooked', 3, 4, 60, 90, null, 'thai_table'),
  ('แกงจืด/ต้มจืด', 'Clear soup', '🍲', 'cooked', 3, 4, 60, 90, null, 'thai_table'),
  ('ต้มยำ', 'Tom yum', '🍲', 'cooked', 3, 4, 60, 90, null, 'thai_table'),
  ('พะโล้', 'Palo (five-spice stew)', '🥘', 'cooked', 3, 4, 60, 90, null, 'thai_table'),
  ('ผัดกะเพรา', 'Pad krapow', '🍳', 'cooked', 3, 4, 60, 90, null, 'thai_table'),
  ('ผัดผักรวม', 'Stir-fried vegetables', '🥘', 'cooked', 3, 4, 30, 60, null, 'thai_table'),
  ('ผัดไทย', 'Pad thai', '🍜', 'cooked', 3, 4, 30, 60, null, 'thai_table'),
  ('ข้าวผัด', 'Fried rice', '🍚', 'cooked', 3, 4, 30, 60, null, 'thai_table'),
  ('ข้าวมันไก่', 'Khao man gai', '🍗', 'cooked', 2, 3, 30, 60, null, 'thai_table'),
  ('ก๋วยเตี๋ยว (แยกน้ำ)', 'Noodle soup (separated)', '🍜', 'cooked', 2, 3, 30, 60, null, 'thai_table'),
  ('ลาบ/น้ำตก (สุก)', 'Larb / nam tok (cooked)', '🥗', 'cooked', 2, 3, 60, 60, null, 'thai_table'),
  ('ยำ', 'Thai spicy salad (yum)', '🥗', 'cooked', 1, 2, null, null, null, 'thai_table'),
  ('ส้มตำ', 'Som tum (papaya salad)', '🥗', 'cooked', 1, 2, null, null, null, 'thai_table'),
  ('น้ำพริกกะปิ', 'Nam prik kapi', '🌶️', 'cooked', 5, 7, 90, 90, null, 'thai_table'),
  ('น้ำพริกแห้ง/ตาแดง', 'Dry chili paste (nam prik)', '🌶️', 'cooked', 7, 14, 90, 90, null, 'thai_table'),
  ('ทอดมัน', 'Thai fish cakes (tod mun)', '🍤', 'cooked', 3, 4, 60, 90, null, 'thai_table'),
  ('ไข่เจียว/ไข่ดาว', 'Thai omelet / fried egg', '🍳', 'cooked', 2, 3, null, null, null, 'thai_table'),
  ('ข้าวเหนียวนึ่ง', 'Steamed sticky rice', '🍚', 'cooked', 2, 3, 60, 60, null, 'thai_table'),
  ('ขนมไทยกะทิ (ขนมชั้น/ตะโก้)', 'Thai coconut dessert', '🍮', 'bakery', 1, 2, null, null, null, 'thai_table'),
  ('ขนมครก/ขนมถ้วย', 'Khanom krok / khanom tuay', '🥮', 'bakery', 1, 2, null, null, null, 'thai_table'),
  ('กล้วยบวชชี/บัวลอย', 'Banana in coconut milk / bua loi', '🍌', 'bakery', 2, 3, null, null, null, 'thai_table');
