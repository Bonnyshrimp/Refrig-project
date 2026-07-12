# Smart Fridge 🧊

แอปจัดการอาหารในตู้เย็น — ลดอาหารทิ้ง กินอย่างปลอดภัย (React Native + Expo, TypeScript)

สถานะปัจจุบัน: ล็อกอินอีเมล (Supabase Auth) + หน้าตู้เย็นและ flow เก็บของเหลืออ่าน/เขียน Supabase จริง · แท็บเมนู/ซื้อของ/สุขภาพยังเป็น mock (Phase 2)

## ตั้งค่า Supabase (ครั้งแรกครั้งเดียว)

1. สร้างโปรเจกต์ที่ [supabase.com](https://supabase.com) (ฟรี)
2. รัน migration: Dashboard → **SQL Editor** → New query → วางเนื้อหาไฟล์
   `supabase/migrations/0001_fridge_items_waste_log.sql` ทั้งไฟล์ → กด **Run**
3. ปิดการยืนยันอีเมลเพื่อให้ทดสอบง่าย (เปิดกลับได้ก่อนปล่อยจริง):
   **Authentication → Sign In / Providers → Email** → ปิดสวิตช์ **Confirm email** → Save
4. เอาคีย์: **Project Settings → Data API** จะเห็น **Project URL** และหน้า **API Keys**
   จะเห็นคีย์ **anon (public)**
5. ในโฟลเดอร์ `smart-fridge` คัดลอกไฟล์ `.env.example` เป็น `.env` แล้วใส่ค่าทั้งสอง
   (ไฟล์ `.env` ไม่ขึ้น git — ห้าม commit คีย์)

## วิธีรันทดสอบบนมือถือผ่าน Expo Go

1. ติดตั้งแอป **Expo Go** จาก App Store (iPhone) หรือ Play Store (Android)
2. บนคอมพิวเตอร์ ติดตั้ง [Node.js LTS](https://nodejs.org) แล้วเปิด Terminal ในโฟลเดอร์นี้
3. รันคำสั่ง:
   ```bash
   npm install
   npx expo start
   ```
4. จะมี QR code ขึ้นใน Terminal
   - **iPhone**: เปิดแอปกล้องส่อง QR แล้วแตะลิงก์
   - **Android**: เปิดแอป Expo Go แล้วกด "Scan QR code"
5. มือถือกับคอมพิวเตอร์ต้องใช้ **Wi-Fi วงเดียวกัน** — ถ้าเชื่อมไม่ได้ให้ลอง `npx expo start --tunnel`

## โครงสร้างโปรเจกต์

```
App.tsx                    จุดเริ่มต้น: ฟอนต์ → auth → แอปหลัก
supabase/migrations/       ไฟล์ SQL สำหรับรันใน Supabase SQL Editor
src/
  theme.ts                 สี/ฟอนต์/รัศมีการ์ด ตาม design system (PRD ข้อ 6)
  types.ts                 โมเดล FridgeItem + แถวจากตาราง fridge_items
  lib/supabase.ts          Supabase client (อ่านคีย์จาก .env)
  context/
    AuthContext.tsx        session ล็อกอิน
    FridgeContext.tsx      ของในตู้: โหลด/เพิ่ม/ทิ้ง ผ่าน Supabase
  data/
    mock.ts                mock ของแท็บที่ยังไม่ทำ (เมนู/ซื้อของ/สุขภาพ)
    spoilageGuide.ts       คู่มือสังเกตอาหารเสีย 7 หมวด + ข้อความเตือน
  utils/
    freshness.ts           ไฟจราจร/แถบความสด
    dates.ts               คำนวณวันแบบ date-only
  components/
    TabBar.tsx             tab bar 4 แท็บ + FAB ＋ ตรงกลาง
    AddSheet.tsx           bottom sheet "เพิ่มของเข้าตู้" 4 ช่องทาง
    LeftoverFlow.tsx       flow เก็บของเหลือ: รูป → ชื่อ → ช่อง → บันทึก
    ItemDetailSheet.tsx    bottom sheet สถานะ + คู่มือสังเกตของเสีย
    ScreenHeader.tsx       หัวข้อหน้า
    PlaceholderCard.tsx    การ์ดบอกฟีเจอร์ที่กำลังพัฒนา
  screens/
    AuthScreen.tsx         เข้าสู่ระบบ / สมัครสมาชิก
    FridgeScreen.tsx       แท็บตู้เย็น (รายการ + ไฟจราจร + แถบความสด)
    MenuScreen.tsx         แท็บเมนูแนะนำ
    ShoppingScreen.tsx     แท็บรายการซื้อของ
    HealthScreen.tsx       แท็บสุขภาพ
```

## ฟอนต์

Prompt (หัวข้อ) + Sarabun (เนื้อหา) จาก Google Fonts — โหลดอัตโนมัติผ่าน `@expo-google-fonts` ไม่ต้องติดตั้งฟอนต์ในเครื่อง
