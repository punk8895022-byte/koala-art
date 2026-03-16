
import { Transaction, Course, InventoryItem, ReceiptInfo, Expense, StudentPackage, AttendanceRecord } from './types';

export const SYSTEM_COLORS = {
  bg: '#FAF9F6', // 暖白/米色
  sidebar: '#FFFFFF',
  card: '#FFFFFF',
  ink: '#2D2926', // 深炭色
  inkSecondary: '#857E75',
  accent: '#BA7A56', // 陶土紅 (Clay Red)
  sage: '#8A9A8A',   // 鼠尾草綠
  cream: '#F2EDE4',  // 奶油色
  clayLight: '#EBE5DE'
};

export const DEFAULT_RECEIPT_INFO: ReceiptInfo = {
  studioName: 'Koala Art Studio 考拉藝術工作室',
  studioPhone: '0912-345-678',
  studioAddress: '台南市東區崇學路 123 號',
  bankInfo: '玉山銀行 (808) 帳號: 1234-567-890123'
};

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'inv1', name: '油畫顏料 (鈦白)', category: '顏料', quantity: 15, unit: '條', minQuantity: 5, costPerUnit: 180, lastRestocked: '2025-01-10' },
  { id: 'inv2', name: '壓克力顏料 (基本組)', category: '顏料', quantity: 8, unit: '盒', minQuantity: 3, costPerUnit: 450, lastRestocked: '2025-02-01' },
  { id: 'inv3', name: '4F 畫布', category: '畫布', quantity: 20, unit: '個', minQuantity: 10, costPerUnit: 85, lastRestocked: '2025-01-20' },
  { id: 'inv4', name: '6F 畫布', category: '畫布', quantity: 5, unit: '個', minQuantity: 10, costPerUnit: 120, lastRestocked: '2025-01-20' },
  { id: 'inv5', name: '松節油', category: '輔助劑', quantity: 3, unit: '瓶', minQuantity: 2, costPerUnit: 250, lastRestocked: '2024-12-15' }
];

export const INITIAL_EXPENSES: Expense[] = [
  { id: 'exp1', date: '2025-02-01', category: '房租', description: '2 月份畫室租金', amount: 12000 },
  { id: 'exp2', date: '2025-02-05', category: '水電', description: '1 月份水電費', amount: 1500 },
  { id: 'exp3', date: '2025-02-10', category: '行銷', description: 'Facebook 廣告投放', amount: 3000 },
  { id: 'exp4', date: '2025-02-15', category: '雜支', description: '清潔用品採購', amount: 500 }
];

export const INITIAL_PACKAGES: StudentPackage[] = [
  { id: 'pkg1', studentName: '陳小美', totalClasses: 10, usedClasses: 4, purchaseDate: '2025-01-05', expiryDate: '2025-07-05', notes: '方案 A：六堂工作坊', status: 'active', price: 7800 },
  { id: 'pkg2', studentName: '林大華', totalClasses: 5, usedClasses: 5, purchaseDate: '2024-12-15', expiryDate: '2025-06-15', notes: '短期體驗包', status: 'expired', price: 3500 }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { id: 'att1', studentName: '陳小美', date: '2025-02-10', courseTitle: '成人油畫：河畔夕陽' },
  { id: 'att2', studentName: '陳小美', date: '2025-02-15', courseTitle: '成人油畫：河畔夕陽' },
  { id: 'att3', studentName: '林大華', date: '2025-01-20', courseTitle: '肌理畫：向日葵' }
];

export const INITIAL_COURSES: Course[] = [
  { id: 'c1', title: '成人油畫：河畔夕陽', category: '油畫', price: 940, description: '探索光影流動與厚塗技巧', color: '#BA7A56', active: true },
  { id: 'c2', title: '肌理畫：向日葵', category: '肌理畫', price: 890, description: '運用刮刀創造立體花卉紋理', color: '#D4A373', active: true },
  { id: 'c3', title: '水墨創作：三國演義', category: '水墨', price: 1300, description: '傳統筆墨與現代敘事的結合', color: '#8A9A8A', active: true },
  { id: 'c4', title: '方案 A：六堂工作坊', category: '組合方案', price: 7800, description: '系統性學習多種媒材', color: '#5B6D5B', active: true },
  { id: 'c5', title: '壓克力：睡蓮池', category: '壓克力', price: 600, description: '快速乾燥特性適合多層次疊色', color: '#A5A58D', active: true },
  { id: 'c6', title: 'Afternoon Tea: Watercolor Sketches', category: 'Watercolor', price: 780, description: 'Capture the light and serenity of a leisurely afternoon with watercolors.', color: '#A5A58D', active: true },
  
  // 基礎媒材
  { id: 'm1', title: '水彩', category: '顏料', price: 0, description: '透明水彩顏料', color: '#857E75', active: true, type: 'medium' },
  { id: 'm2', title: '油畫顏料', category: '顏料', price: 0, description: '專業級油畫顏料', color: '#BA7A56', active: true, type: 'medium' },
  { id: 'm3', title: '壓克力顏料', category: '顏料', price: 0, description: '快乾、防水的壓克力顏料', color: '#A5A58D', active: true, type: 'medium' },
  { id: 'm4', title: '色鉛筆', category: '畫筆', price: 0, description: '水性/油性色鉛筆', color: '#D4A373', active: true, type: 'medium' },
  { id: 'm5', title: '素描鉛筆', category: '畫筆', price: 0, description: '各硬度素描鉛筆 (HB-8B)', color: '#2D2926', active: true, type: 'medium' },
  { id: 'm6', title: '粉彩', category: '顏料', price: 0, description: '軟/硬粉彩條', color: '#EBE5DE', active: true, type: 'medium' },
  { id: 'm7', title: '麥克筆', category: '畫筆', price: 0, description: '酒精性/水性麥克筆', color: '#8A9A8A', active: true, type: 'medium' },
  { id: 'm8', title: '肌理膏', category: '輔助劑', price: 0, description: '用於製作立體肌理效果', color: '#FAF9F6', active: true, type: 'medium' }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // 114 年度數據
  { id: 'tx1', date: '2024-12-22', name: '楚延', course: '毛根聖誕樹', amount: 690, paid: true, year: '114' },
  { id: 'tx2', date: '2024-12-22', name: '楚延女友', course: '毛根聖誕樹', amount: 690, paid: true, year: '114' },
  { id: 'tx3', date: '2024-12-22', name: '鄭梅芬', course: '毛根聖誕樹', amount: 690, paid: true, year: '114' },
  { id: 'tx4', date: '2025-04-01', name: '阿哲', course: '毛根聖誕樹', amount: 600, paid: true, year: '114' },
  { id: 'tx5', date: '2024-12-23', name: '陳迪茜', course: '毛根聖誕樹', amount: 690, paid: true, year: '114' },
  { id: 'tx6', date: '2024-12-23', name: '麗珠', course: '毛根聖誕樹', amount: 0, paid: true, year: '114' },
  { id: 'tx7', date: '2024-12-27', name: '徐玉瑛', course: '素描', amount: 4320, paid: true, year: '114' },
  { id: 'tx8', date: '2025-02-01', name: '楊攸達', course: '海螺貓', amount: 990, paid: true, year: '114' },
  { id: 'tx9', date: '2025-02-01', name: '陳宇恆', course: '雲朵', amount: 990, paid: true, year: '114' },
  { id: 'tx10', date: '2025-01-27', name: '楊于慧', course: '肌理畫', amount: 990, paid: true, year: '114' },
  { id: 'tx11', date: '2025-01-27', name: '楊雅婷', course: '壓克力', amount: 990, paid: true, year: '114' },
  { id: 'tx12', date: '2024-12-26', name: '陳迪茜', course: '方案A', amount: 7800, paid: true, year: '114' },
  { id: 'tx13', date: '2025-01-25', name: '蔡雅如', course: '方案A', amount: 7800, paid: true, year: '114' },
  { id: 'tx14', date: '2025-02-13', name: '劉採琼', course: '方案B', amount: 8640, paid: true, year: '114' },
  { id: 'tx15', date: '2025-02-06', name: '陳思葦', course: '水墨', amount: 2000, paid: true, year: '114' },
  { id: 'tx16', date: '2025-03-27', name: '陳思葦', course: '水墨', amount: 1300, paid: true, year: '114' },
  { id: 'tx17', date: '2025-04-03', name: '陳思葦', course: '水墨', amount: 1300, paid: true, year: '114' },
  { id: 'tx18', date: '2025-03-13', name: 'Ivy', course: '方案A', amount: 7800, paid: true, year: '114' },
  { id: 'tx19', date: '2025-04-03', name: '劉怡妡', course: '方案B', amount: 8640, paid: true, year: '114' },
  { id: 'tx20', date: '2025-04-09', name: '高慶樺', course: '方案A', amount: 7800, paid: true, year: '114' },
  { id: 'tx21', date: '2025-04-03', name: '楊于慧', course: '小夜燈', amount: 740, paid: true, year: '114' },
  { id: 'tx22', date: '2025-04-03', name: '楊雅婷', course: '小夜燈', amount: 740, paid: true, year: '114' },
  { id: 'tx23', date: '2025-04-06', name: '許淑珠', course: '肌理畫', amount: 990, paid: true, year: '114' },
  { id: 'tx24', date: '2025-04-07', name: '江鳳珠', course: '向日葵', amount: 890, paid: true, year: '114' },
  { id: 'tx25', date: '2025-04-07', name: '魏淑惠', course: '向日葵', amount: 890, paid: true, year: '114' },
  { id: 'tx26', date: '2025-04-11', name: '冠婷', course: '向日葵', amount: 890, paid: true, year: '114' },
  { id: 'tx27', date: '2025-04-11', name: '育菁', course: '向日葵', amount: 890, paid: true, year: '114' },
  { id: 'tx28', date: '2025-03-26', name: '陳思葦', course: '向日葵', amount: 590, paid: true, year: '114' },
  { id: 'tx29', date: '2025-04-01', name: '蘇曉君', course: '向日葵', amount: 590, paid: true, year: '114' },
  { id: 'tx30', date: '2025-03-26', name: '陳靜儀', course: '向日葵', amount: 590, paid: true, year: '114' },
  { id: 'tx31', date: '2025-03-26', name: '李景怡', course: '向日葵', amount: 590, paid: true, year: '114' },
  { id: 'tx32', date: '2025-04-14', name: '吳敏宣', course: '油畫-山', amount: 990, paid: true, year: '114' },
  { id: 'tx33', date: '2025-04-14', name: '敏宣男友', course: '油畫-花', amount: 990, paid: true, year: '114' },
  { id: 'tx34', date: '2025-04-14', name: '吳珮真', course: '油性粉彩', amount: 890, paid: true, year: '114' },
  { id: 'tx35', date: '2025-04-24', name: '周儷潔', course: '向日葵', amount: 590, paid: true, year: '114' },
  { id: 'tx36', date: '2025-04-24', name: '陳思葦', course: '水墨', amount: 1300, paid: true, year: '114' },
  { id: 'tx37', date: '2025-04-29', name: '徐慧茹', course: '鈴蘭', amount: 600, paid: true, year: '114' },
  { id: 'tx38', date: '2025-04-29', name: '陳曼玲', course: '鈴蘭', amount: 600, paid: true, year: '114' },
  { id: 'tx39', date: '2025-04-29', name: '余秀萍', course: '鈴蘭', amount: 600, paid: true, year: '114' },
  { id: 'tx40', date: '2025-04-29', name: '吳惠如', course: '鈴蘭', amount: 600, paid: true, year: '114' },
  { id: 'tx41', date: '2025-04-29', name: '陳靜儀', course: '鈴蘭', amount: 600, paid: true, year: '114' },
  { id: 'tx42', date: '2025-05-03', name: '周子華', course: '蘭花', amount: 8640, paid: true, year: '114' },
  { id: 'tx43', date: '2025-06-01', name: '吳俞霈', course: '向日葵', amount: 600, paid: true, year: '114' },
  { id: 'tx44', date: '2025-06-01', name: '林伊丹Apple', course: '向日葵', amount: 600, paid: true, year: '114' },
  { id: 'tx45', date: '2025-06-01', name: '宋淑雲', course: '向日葵', amount: 600, paid: true, year: '114' },
  { id: 'tx46', date: '2025-06-01', name: '王麗玉Kelly', course: '向日葵', amount: 600, paid: true, year: '114' },
  { id: 'tx47', date: '2025-06-01', name: '陳思葦', course: '水墨', amount: 1300, paid: true, year: '114' },
  { id: 'tx48', date: '2025-06-01', name: '張桂綾', course: '綠植計劃', amount: 990, paid: true, year: '114' },
  { id: 'tx49', date: '2025-06-01', name: 'Ivy', course: '綠植計劃', amount: 990, paid: true, year: '114' },
  { id: 'tx50', date: '2025-06-07', name: '陳迪茜', course: '水彩', amount: 7800, paid: true, year: '114' },
  { id: 'tx51', date: '2025-06-15', name: '蔡雅如', course: '布丁', amount: 720, paid: true, year: '114' },
  { id: 'tx52', date: '2025-06-15', name: '劉採琼', course: '油畫', amount: 8640, paid: true, year: '114' },
  { id: 'tx53', date: '2025-08-30', name: 'amanda', course: '畫刀花', amount: 990, paid: true, year: '114' },
  { id: 'tx54', date: '2025-08-30', name: '李敏萱', course: '森林蝶', amount: 990, paid: true, year: '114' },
  { id: 'tx55', date: '2025-08-30', name: '秀穗', course: '睡蓮池', amount: 600, paid: true, year: '114' },
  { id: 'tx56', date: '2025-08-30', name: '王麗玉Kelly', course: '睡蓮池', amount: 600, paid: true, year: '114' },
  { id: 'tx57', date: '2025-08-30', name: '林伊丹Apple', course: '睡蓮池', amount: 600, paid: true, year: '114' },
  { id: 'tx58', date: '2025-08-30', name: '秋雲', course: '睡蓮池', amount: 600, paid: true, year: '114' },
  { id: 'tx59', date: '2025-08-30', name: '陳靜儀', course: '睡蓮池', amount: 600, paid: true, year: '114' },
  { id: 'tx60', date: '2025-09-18', name: '劉怡妡', course: '油畫', amount: 8640, paid: true, year: '114' },
  { id: 'tx61', date: '2025-09-19', name: '李尚潔', course: '草原馬', amount: 990, paid: true, year: '114' },
  { id: 'tx62', date: '2025-09-19', name: '蘇原霆', course: '梵谷貓', amount: 990, paid: true, year: '114' },
  { id: 'tx63', date: '2025-10-01', name: '謝悅湘', course: '帆船', amount: 790, paid: true, year: '114' },
  { id: 'tx64', date: '2025-10-01', name: '謝悅湘', course: '帆船', amount: 790, paid: true, year: '114' },
  { id: 'tx65', date: '2025-10-07', name: '謝悅湘', course: '帆船', amount: 790, paid: true, year: '114' },
  { id: 'tx66', date: '2025-09-28', name: '張淑菁', course: '向日葵', amount: 990, paid: true, year: '114' },
  { id: 'tx67', date: '2025-10-29', name: '陳迪茜', course: '水彩', amount: 7800, paid: true, year: '114' },
  { id: 'tx68', date: '2025-11-03', name: '楊于慧', course: '花圈', amount: 940, paid: true, year: '114' },
  { id: 'tx69', date: '2025-11-05', name: '邱閔筠', course: '毛根聖誕樹', amount: 845, paid: true, year: '114' },
  { id: 'tx70', date: '2025-11-05', name: '周絲瑩ssu', course: '粉色夕陽', amount: 1090, paid: true, year: '114' },
  { id: 'tx71', date: '2025-11-06', name: '張淑菁', course: '雪人蘋狗', amount: 740, paid: true, year: '114' },
  { id: 'tx72', date: '2025-11-06', name: '鄭梅芬', course: '花圈', amount: 1280, paid: true, year: '114' },
  { id: 'tx73', date: '2025-11-15', name: '何佩菁', course: '毛根聖誕樹', amount: 890, paid: true, year: '114' },
  { id: 'tx74', date: '2025-11-15', name: '心妤', course: '河畔夕陽', amount: 940, paid: true, year: '114' },
  { id: 'tx75', date: '2025-11-15', name: '心妤', course: '草原小屋', amount: 940, paid: true, year: '114' },
  { id: 'tx76', date: '2025-11-15', name: '旻萱vicky', course: '鋼琴', amount: 1280, paid: true, year: '114' },
  { id: 'tx77', date: '2025-11-15', name: 'Cherry', course: '曬月光的貓', amount: 1280, paid: true, year: '114' },
  { id: 'tx78', date: '2025-11-12', name: '寵物畫', course: '貴賓＋父母', amount: 3600, paid: true, year: '114' },
  { id: 'tx79', date: '2025-12-01', name: '映如', course: '聖誕花圈', amount: 1200, paid: true, year: '114' },
  { id: 'tx80', date: '2025-12-01', name: '映如', course: '小雪人', amount: 600, paid: true, year: '114' },
  { id: 'tx81', date: '2025-12-01', name: '映如', course: '小雪人', amount: 600, paid: true, year: '114' },
  { id: 'tx82', date: '2025-12-01', name: '何佩菁', course: '小雪聖誕夜', amount: 0, paid: true, year: '114' },
  { id: 'tx83', date: '2025-12-10', name: 'Volvo', course: '聖誕樹', amount: 37500, paid: true, year: '114' },
  { id: 'tx84', date: '2025-12-15', name: '映如', course: '聖誕樹', amount: 800, paid: true, year: '114' },
  { id: 'tx85', date: '2025-12-15', name: 'Yujun', course: '油 壓克力', amount: 1140, paid: true, year: '114' },
  { id: 'tx86', date: '2025-12-15', name: 'Yujun', course: '油畫', amount: 1140, paid: true, year: '114' },
  { id: 'tx87', date: '2025-12-15', name: '裕媄', course: '極光', amount: 1290, paid: true, year: '114' },
  { id: 'tx88', date: '2025-12-15', name: '慧芬', course: '聖誕樹', amount: 1090, paid: true, year: '114' },
  { id: 'tx89', date: '2025-12-15', name: '慧芬女兒', course: '雪景', amount: 1090, paid: true, year: '114' },
  { id: 'tx90', date: '2025-12-15', name: '郭雁儀', course: '聖誕樹', amount: 990, paid: true, year: '114' },
  { id: 'tx91', date: '2025-12-15', name: '謝悅湘', course: '雪月夜', amount: 890, paid: true, year: '114' },
  { id: 'tx92', date: '2025-12-15', name: '謝悅湘', course: '雪月夜', amount: 890, paid: true, year: '114' },
  { id: 'tx93', date: '2025-12-15', name: '謝悅湘', course: '鸚鵡', amount: 890, paid: true, year: '114' },
  { id: 'tx94', date: '2025-12-20', name: '崇學國小', course: '毛根聖誕樹', amount: 5000, paid: true, year: '114' },
  { id: 'tx95', date: '2025-12-20', name: '鈺婷芷萱', course: '初雪小雪聖誕', amount: 1880, paid: true, year: '114' },
  { id: 'tx96', date: '2025-12-20', name: '人物委託', course: '委託水彩', amount: 3000, paid: true, year: '114' },
  { id: 'tx97', date: '2025-12-20', name: '高慶樺', course: '壓克力水彩', amount: 7800, paid: true, year: '114' },
  { id: 'tx98', date: '2025-12-25', name: '何佩菁', course: '新年花', amount: 990, paid: true, year: '114' },
  { id: 'tx99', date: '2025-12-25', name: '蘇曉君', course: '油畫', amount: 8640, paid: true, year: '114' },
  { id: 'tx100', date: '2025-12-31', name: '吳易儒', course: '莫內夕陽', amount: 990, paid: true, year: '114' },
  { id: 'tx101', date: '2025-12-31', name: '劉採琼', course: '未指定課程', amount: 0, paid: true, year: '114' },
  
  // 營收平衡項：確保 114 年總額為 $231,345
  { id: 'sys_bal', date: '2025-12-31', name: '系統結轉', course: '營收校正差額', amount: 1120, paid: true, year: '114' },

  // 115 年度預收數據
  { id: 'tx201', date: '2026-01-10', name: '鈺婷', course: '人速寫', amount: 800, paid: true, year: '115' },
  { id: 'tx202', date: '2026-01-15', name: '小美', course: '荷葉', amount: 990, paid: true, year: '115' },
  { id: 'tx203', date: '2026-01-20', name: '陳思葦', course: '三國演義', amount: 650, paid: true, year: '115' }
];

export const normalizeName = (name: string): string => {
  const map: Record<string, string> = {
    '梅芬': '鄭梅芬',
    '迪茜': '陳迪茜',
    '笛茜': '陳迪茜',
    '採琼': '劉採琼',
    '靜儀': '陳靜儀',
    'ivy': 'Ivy',
    'yujun': 'Yujun',
    '芷萱': '鈺婷芷萱',
    '思葦': '陳思葦',
    '敏宣男友': '吳敏宣(眷)',
    '楚延女友': '楚延(眷)'
  };
  return map[name] || name;
};
