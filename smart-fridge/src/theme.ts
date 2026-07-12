// Design tokens ตาม PRD ข้อ 6 (อ้างอิง fridge-app-demo-v5)

export const colors = {
  frost: '#EEF4F3', // พื้นหลังหลัก
  ink: '#0E3A38', // ตัวอักษรหลัก teal เข้ม
  green: '#2E9E5B', // สด / ปลอดภัย
  yellow: '#E8A020', // เตือน ใกล้หมดอายุ
  red: '#E04F3F', // ด่วน / หมดอายุ
  freeze: '#3E7FD4', // ช่องแข็ง
  chill: '#2FA3A0', // ช่องเย็น
  gold: '#B8860B', // Premium
  sodium: '#E07A3F', // โซเดียม
  sugar: '#D4589A', // น้ำตาล
  card: '#FFFFFF',
  muted: '#5C7573', // ตัวอักษรรอง (ink จางลง)
  line: '#DDE8E6', // เส้นแบ่ง
} as const;

export const fonts = {
  heading: 'Prompt_700Bold',
  headingSemi: 'Prompt_600SemiBold',
  headingMed: 'Prompt_500Medium',
  body: 'Sarabun_400Regular',
  bodyBold: 'Sarabun_700Bold',
} as const;

export const radius = {
  card: 16,
  pill: 999,
} as const;

// เงาบางตามสเปกการ์ด
export const cardShadow = {
  shadowColor: '#0E3A38',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 2,
} as const;
