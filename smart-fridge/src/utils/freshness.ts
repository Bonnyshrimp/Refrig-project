import { FridgeItem } from '../data/mock';
import { colors } from '../theme';

// ระบบไฟจราจรตาม PRD 3.1: เขียว >3 วัน / เหลือง 1–2 วัน / แดง หมดวันนี้หรือเกินแล้ว
export function trafficColor(daysLeft: number): string {
  if (daysLeft <= 0) return colors.red;
  if (daysLeft <= 2) return colors.yellow;
  return colors.green;
}

export function daysLeftLabel(daysLeft: number): string {
  if (daysLeft < 0) return `เกินมา ${-daysLeft} วัน`;
  if (daysLeft === 0) return 'หมดอายุวันนี้';
  return `อีก ${daysLeft} วัน`;
}

export function statusLabel(daysLeft: number): string {
  if (daysLeft < 0) return 'เกินวันแนะนำแล้ว ไม่ควรกิน';
  if (daysLeft === 0) return 'หมดอายุวันนี้ รีบใช้หรือตรวจก่อนกิน';
  if (daysLeft <= 2) return 'ใกล้หมดอายุ ควรใช้เร็วๆ นี้';
  return 'ยังสดดี';
}

// สัดส่วนความสด 0–1 สำหรับแถบ progress
export function freshnessRatio(item: FridgeItem): number {
  return Math.max(0, Math.min(1, item.daysLeft / item.totalDays));
}
