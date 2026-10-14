// 金额、日期等显示格式工具

/** 分 -> "1,234.56"（金额内部一律以"分"为单位存储，避免小数误差） */
export function fmtMoney(cents: number): string {
  return (cents / 100).toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** 今天的日期，格式 YYYY-MM-DD */
export function todayStr(): string {
  const d = new Date();
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** 当前月份，格式 YYYY-MM */
export function currentMonth(): string {
  return todayStr().slice(0, 7);
}

/** 月份前后推移，delta 为 ±1 */
export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}`;
}

/** 月份显示："2026年10月" */
export function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return `${y}年${m}月`;
}

/** 日期分组标题："10月14日 · 周二" */
export function dayLabel(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const wd = ["日", "一", "二", "三", "四", "五", "六"][new Date(y, m - 1, d).getDay()];
  return `${m}月${d}日 · 周${wd}`;
}

/** 某个月有多少天 */
export function daysInMonth(month: string): number {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}
