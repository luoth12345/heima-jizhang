// 内置两级分类体系（首版固定，见 CLAUDE.md 产品文档）
// 颜色经过色盲友好度与对比度程序化验证，每个分类颜色固定不变（不随排名变化）

export interface Category {
  name: string;
  icon: string;
  color: string;
  subs: string[];
}

export const CATEGORIES: Category[] = [
  { name: "餐饮", icon: "🍜", color: "#2e9e5b", subs: ["早餐", "午餐", "晚餐", "外卖", "零食饮料", "夜宵", "聚餐"] },
  { name: "交通", icon: "🚌", color: "#3b82c4", subs: ["公交地铁", "打车", "火车高铁", "飞机", "加油", "停车费"] },
  { name: "购物", icon: "🛍️", color: "#d55e8e", subs: ["服饰鞋包", "日用品", "数码家电", "美妆个护", "图书文具", "其他购物"] },
  { name: "居住", icon: "🏠", color: "#e08a3c", subs: ["房租房贷", "水电燃气", "物业费", "网费话费", "家居维修"] },
  { name: "娱乐", icon: "🎮", color: "#7d5fd0", subs: ["电影演出", "游戏", "运动健身", "旅行", "会员订阅", "其他娱乐"] },
  { name: "医疗", icon: "💊", color: "#d5483f", subs: ["门诊药品", "住院治疗", "体检", "保健品"] },
  { name: "教育", icon: "📚", color: "#2ba098", subs: ["学费培训", "书籍课程", "考试报名"] },
  { name: "人情往来", icon: "🧧", color: "#c08a1f", subs: ["红包礼金", "请客送礼", "捐赠"] },
  { name: "金融", icon: "💰", color: "#5a72b8", subs: ["保险", "贷款还款", "手续费利息"] },
  { name: "其他", icon: "📦", color: "#9c6a2b", subs: ["其他支出"] },
];

export function getCategory(name: string): Category {
  return CATEGORIES.find((c) => c.name === name) ?? CATEGORIES[CATEGORIES.length - 1];
}
