# Smart Fridge 🧊

แอปจัดการอาหารในตู้เย็น — ลดอาหารทิ้ง กินอย่างปลอดภัย (React Native + Expo, TypeScript)

สถานะปัจจุบัน: **โครงหน้าจอ (skeleton)** — 4 แท็บ + ปุ่ม ＋ ตรงกลาง ใช้ mock data ยังไม่ต่อฐานข้อมูล

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
App.tsx                    จุดเริ่มต้น: โหลดฟอนต์ + navigation
src/
  theme.ts                 สี/ฟอนต์/รัศมีการ์ด ตาม design system (PRD ข้อ 6)
  data/mock.ts             mock data ทุกหน้าจอ
  components/
    TabBar.tsx             tab bar 4 แท็บ + FAB ＋ ตรงกลาง
    AddSheet.tsx           bottom sheet "เพิ่มของเข้าตู้" 4 ช่องทาง
    ScreenHeader.tsx       หัวข้อหน้า
    PlaceholderCard.tsx    การ์ดบอกฟีเจอร์ที่กำลังพัฒนา
  screens/
    FridgeScreen.tsx       แท็บตู้เย็น (รายการ + ไฟจราจร + แถบความสด)
    MenuScreen.tsx         แท็บเมนูแนะนำ
    ShoppingScreen.tsx     แท็บรายการซื้อของ
    HealthScreen.tsx       แท็บสุขภาพ
```

## ฟอนต์

Prompt (หัวข้อ) + Sarabun (เนื้อหา) จาก Google Fonts — โหลดอัตโนมัติผ่าน `@expo-google-fonts` ไม่ต้องติดตั้งฟอนต์ในเครื่อง
