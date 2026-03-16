
export interface Transaction {
  id: string;
  date: string;
  name: string;
  course: string;
  medium?: string;
  amount: number;
  paid: boolean;
  year: string;
  uid?: string;
}

export interface StudentStats {
  name: string;
  totalSpent: number;
  courses: string[];
  lastActive: string;
  transactionCount: number;
  preferredCategory?: string;
}

export interface Course {
  id: string;
  title: string;
  category: string; // 媒材：油畫, 肌理畫, 水彩等
  price: number;
  description: string;
  color: string;
  active: boolean;
  type?: 'course' | 'medium';
  mediums?: string[]; // 選用的媒材 ID 或名稱
  uid?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minQuantity: number; // 安全庫存量
  costPerUnit: number;
  lastRestocked: string;
  uid?: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  uid?: string;
}

export interface StudentPackage {
  id: string;
  studentName: string;
  totalClasses: number;
  usedClasses: number;
  purchaseDate: string;
  expiryDate?: string;
  notes?: string;
  price?: number;
  status: 'active' | 'completed' | 'expired';
  uid?: string;
}

export interface ReceiptInfo {
  studioName: string;
  studioPhone: string;
  studioAddress: string;
  logoUrl?: string;
  bankInfo?: string;
}

export interface UserProfile extends ReceiptInfo {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'staff';
}

export interface AttendanceRecord {
  id: string;
  studentName: string;
  date: string;
  courseTitle: string;
  notes?: string;
  uid?: string;
}

export type ViewState = 'dashboard' | 'students' | 'courses' | 'mediums' | 'finance' | 'inventory' | 'expenses' | 'reports' | 'attendance' | 'settings' | 'schedules' | 'packages';

export interface Schedule {
  id: string;
  courseId: string;
  courseTitle: string;
  dayOfWeek: number; // 0-6 (Sun-Sat)
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  instructor: string;
  room?: string;
  maxStudents?: number;
  color?: string;
  uid?: string;
}
