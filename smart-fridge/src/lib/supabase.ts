import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import 'react-native-url-polyfill/auto';

// อ่านค่าจากไฟล์ .env (ดู .env.example) — Expo อ่านตัวแปร EXPO_PUBLIC_* ให้อัตโนมัติ
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = supabaseUrl.length > 0 && supabaseAnonKey.length > 0;

export const supabase = createClient(
  // ใส่ค่า dummy เมื่อยังไม่ตั้ง .env เพื่อให้แอปเปิดได้และแสดงหน้าบอกวิธีตั้งค่า
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

// ต่ออายุ token เฉพาะตอนแอปอยู่หน้าจอ (แนวทางมาตรฐานของ supabase-js บน React Native)
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
