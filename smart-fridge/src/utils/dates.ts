// คำนวณวันแบบ date-only (ไม่สนเวลา/timezone) สำหรับ stored_at / expiry_date

const MS_PER_DAY = 86400000;

function toUtcMidnight(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

// วันที่วันนี้ตามเครื่องผู้ใช้ ในรูปแบบ YYYY-MM-DD
export function todayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(dateStr: string, days: number): string {
  const t = new Date(toUtcMidnight(dateStr) + days * MS_PER_DAY);
  return t.toISOString().slice(0, 10);
}

// จำนวนวันจาก b ถึง a (a - b)
export function diffDays(a: string, b: string): number {
  return Math.round((toUtcMidnight(a) - toUtcMidnight(b)) / MS_PER_DAY);
}
