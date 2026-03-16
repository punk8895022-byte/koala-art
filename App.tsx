
import React, { useState, useMemo, useEffect, Component } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  Settings, 
  Plus, 
  TrendingUp,
  CreditCard,
  Sparkles,
  Download,
  Search,
  Filter,
  X,
  Quote,
  Palette,
  Award,
  PieChart,
  Target,
  Waves,
  Heart,
  Calendar,
  Layers,
  ChevronRight,
  BookOpen,
  Trash2,
  Edit2,
  Printer,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  LogIn,
  LogOut,
  Menu
} from 'lucide-react';
import { Transaction, ViewState, StudentStats, Course, InventoryItem, ReceiptInfo, Expense, StudentPackage, AttendanceRecord, Schedule, UserProfile } from './types';
import { INITIAL_TRANSACTIONS, INITIAL_COURSES, INITIAL_INVENTORY, DEFAULT_RECEIPT_INFO, INITIAL_EXPENSES, INITIAL_PACKAGES, INITIAL_ATTENDANCE, normalizeName, SYSTEM_COLORS } from './constants';
import { GoogleGenAI } from '@google/genai';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { auth, db, loginWithGoogle, logout, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, onSnapshot, query, where, doc, setDoc, deleteDoc, updateDoc, getDoc, writeBatch } from 'firebase/firestore';

// --- 錯誤邊界組件 ---
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorInfo: string | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, errorInfo: null };

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, errorInfo: error.message || String(error) };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6">
          <div className="bg-white p-12 rounded-[48px] shadow-2xl max-w-lg w-full text-center space-y-6">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto">
              <AlertTriangle size={40} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#2D2926]">應用程式發生錯誤</h2>
            <p className="text-sm text-[#857E75] leading-relaxed">
              很抱歉，系統在處理資料時遇到問題。這可能是由於權限不足或網路連線中斷。
            </p>
            <div className="bg-red-50 p-4 rounded-2xl text-left overflow-auto max-h-40">
              <code className="text-[10px] text-red-600 break-all">{this.state.errorInfo}</code>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-[#2D2926] text-white py-4 rounded-2xl font-bold hover:bg-[#BA7A56] transition-all"
            >
              重新整理頁面
            </button>
          </div>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

// --- 藝術啟發語錄 ---

const ART_QUOTES = [
  { text: "藝術並不是真理。藝術是能讓我們意識到真理的謊言。", author: "畢卡索" },
  { text: "我夢想著繪畫，我繪畫著夢想。", author: "梵谷" },
  { text: "色彩是我永恆的追求。", author: "莫內" },
  { text: "繪畫是詩，而詩是無形的繪畫。", author: "達文西" }
];

// --- 樣式組件 ---

const SidebarItem = ({ active, icon: Icon, label, onClick }: { active: boolean; icon: any; label: string; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 xl:gap-4 px-4 xl:px-6 py-3 xl:py-4 rounded-2xl xl:rounded-3xl transition-all duration-700 group ${
      active 
      ? 'bg-[#BA7A56] text-white shadow-xl translate-x-1' 
      : 'text-[#857E75] hover:bg-[#F2EDE4] hover:text-[#2D2926]'
    }`}
  >
    <Icon size={16} xl:size={18} strokeWidth={active ? 2.5 : 2} className={active ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
    <span className={`text-xs xl:text-sm tracking-wide ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
  </button>
);

const BentoCard = ({ children, className = "", title, icon: Icon, action, dark = false }: { children?: React.ReactNode, className?: string, title?: string, icon?: any, action?: React.ReactNode, dark?: boolean }) => (
  <div className={`${dark ? 'bg-[#2D2926] text-white' : 'bg-white text-[#2D2926]'} rounded-[32px] xl:rounded-[40px] p-6 xl:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-black/[0.02] hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] transition-all duration-1000 flex flex-col group ${className}`}>
    {(title || Icon) && (
      <div className="flex justify-between items-start mb-6 xl:mb-8">
        <div className="flex items-center gap-3 xl:gap-4">
          {Icon && (
            <div className={`w-10 h-10 xl:w-12 xl:h-12 ${dark ? 'bg-white/10 text-[#BA7A56]' : 'bg-[#FAF9F6] text-[#BA7A56]'} rounded-xl xl:rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6 duration-700`}>
              <Icon size={18} xl:size={20} />
            </div>
          )}
          {title && <h3 className="text-lg xl:text-xl font-serif font-bold tracking-tight">{title}</h3>}
        </div>
        {action}
      </div>
    )}
    <div className="flex-1 overflow-hidden">{children}</div>
  </div>
);

const QuickActionButton = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center p-4 xl:p-6 bg-[#FAF9F6] rounded-[24px] xl:rounded-[32px] border border-[#EBE5DE]/50 hover:border-[#BA7A56] hover:bg-white transition-all group w-full"
  >
    <div className="w-10 h-10 xl:w-12 xl:h-12 bg-white rounded-xl xl:rounded-2xl flex items-center justify-center text-[#BA7A56] shadow-sm group-hover:scale-110 transition-transform mb-2 xl:mb-3">
      <Icon size={20} xl:size={24} />
    </div>
    <span className="text-[9px] xl:text-[10px] font-bold text-[#2D2926] uppercase tracking-widest text-center">{label}</span>
  </button>
);

const MetricStat = ({ label, value, sub, color, icon: Icon }: { label: string; value: string; sub: string; color: string; icon: any }) => (
  <div className="group relative h-full">
    <div className="absolute inset-0 bg-white rounded-[32px] xl:rounded-[40px] shadow-sm group-hover:shadow-2xl transition-all duration-1000"></div>
    <div className="relative p-6 xl:p-10 flex flex-col h-full overflow-hidden">
      <div className="absolute -right-4 -bottom-4 w-20 h-20 xl:w-24 xl:h-24 opacity-[0.03] group-hover:scale-150 transition-transform duration-1000" style={{ color }}>
         <Icon size={120} />
      </div>
      <div className="flex justify-between items-start mb-4 xl:mb-8">
        <div className="p-2 xl:p-4 rounded-xl xl:rounded-2xl" style={{ backgroundColor: `${color}15`, color }}>
          <Icon size={18} xl:size={24} />
        </div>
        <div className="text-right">
          <span className="text-[8px] xl:text-[10px] font-bold text-[#C4C0BA] uppercase tracking-[1px] xl:tracking-[3px]">{label}</span>
        </div>
      </div>
      <div className="mt-auto relative z-10">
        <h3 className="text-2xl md:text-3xl xl:text-5xl font-bold text-[#2D2926] tracking-tighter font-serif truncate" title={value}>{value}</h3>
        <p className="text-[9px] xl:text-[11px] text-[#857E75] font-bold mt-2 xl:mt-4 flex items-center gap-2">
          <TrendingUp size={10} xl:size={12} className="text-[#8FA895]" /> {sub}
        </p>
      </div>
    </div>
  </div>
);

// --- 核心應用程式 ---

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}

function MainApp() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [view, setView] = useState<ViewState>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingStudent, setEditingStudent] = useState<StudentStats | null>(null);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [confirmDeleteTx, setConfirmDeleteTx] = useState<string | null>(null);
  const [confirmDeleteCourse, setConfirmDeleteCourse] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [quote] = useState(() => ART_QUOTES[Math.floor(Math.random() * ART_QUOTES.length)]);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [studentSortBy, setStudentSortBy] = useState<'spent' | 'active' | 'name' | 'balance'>('spent');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [receiptInfo, setReceiptInfo] = useState<ReceiptInfo>(DEFAULT_RECEIPT_INFO);
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<Transaction | null>(null);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState<InventoryItem | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [packages, setPackages] = useState<StudentPackage[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<StudentPackage | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // 篩選狀態
  const [filterName, setFilterName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 課程篩選狀態
  const [courseFilterCategory, setCourseFilterCategory] = useState('');
  const [courseFilterMinPrice, setCourseFilterMinPrice] = useState('');
  const [courseFilterMaxPrice, setCourseFilterMaxPrice] = useState('');

  // --- Firebase Auth & Profile ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          setUserProfile(profile);
          setReceiptInfo({
            studioName: profile.studioName || DEFAULT_RECEIPT_INFO.studioName,
            studioPhone: profile.studioPhone || DEFAULT_RECEIPT_INFO.studioPhone,
            studioAddress: profile.studioAddress || DEFAULT_RECEIPT_INFO.studioAddress,
            bankInfo: profile.bankInfo || DEFAULT_RECEIPT_INFO.bankInfo,
            logoUrl: profile.logoUrl || DEFAULT_RECEIPT_INFO.logoUrl,
          });
        } else {
          // 初始化新用戶
          const newProfile: UserProfile = {
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || '',
            role: 'staff',
            studioName: DEFAULT_RECEIPT_INFO.studioName,
            studioPhone: DEFAULT_RECEIPT_INFO.studioPhone,
            studioAddress: DEFAULT_RECEIPT_INFO.studioAddress,
            bankInfo: DEFAULT_RECEIPT_INFO.bankInfo || ''
          };
          await setDoc(doc(db, 'users', currentUser.uid), newProfile);
          setUserProfile(newProfile);
        }
      } else {
        setUserProfile(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // --- Firebase Data Sync ---
  useEffect(() => {
    if (!user || !isAuthReady) return;

    // --- 資料遷移 (LocalStorage to Firestore) ---
    const migrateData = async () => {
      const legacyTxs = localStorage.getItem('koala_transactions');
      const legacyCourses = localStorage.getItem('koala_courses');
      const legacyInventory = localStorage.getItem('koala_inventory');
      const legacyExpenses = localStorage.getItem('koala_expenses');
      const legacyPackages = localStorage.getItem('koala_packages');
      const legacyAttendance = localStorage.getItem('koala_attendance');
      const legacySchedules = localStorage.getItem('koala_schedules');

      if (legacyTxs || legacyCourses || legacyInventory || legacyExpenses || legacyPackages || legacyAttendance || legacySchedules) {
        const batch = writeBatch(db);
        let hasChanges = false;

        if (legacyTxs) {
          const txs = JSON.parse(legacyTxs);
          txs.forEach((t: any) => {
            const ref = doc(db, 'transactions', t.id);
            batch.set(ref, { ...t, uid: user.uid });
          });
          hasChanges = true;
        }
        if (legacyCourses) {
          const cs = JSON.parse(legacyCourses);
          cs.forEach((c: any) => {
            const ref = doc(db, 'courses', c.id);
            batch.set(ref, { ...c, uid: user.uid });
          });
          hasChanges = true;
        }
        if (legacyInventory) {
          const inv = JSON.parse(legacyInventory);
          inv.forEach((i: any) => {
            const ref = doc(db, 'inventory', i.id);
            batch.set(ref, { ...i, uid: user.uid });
          });
          hasChanges = true;
        }
        if (legacyExpenses) {
          const exp = JSON.parse(legacyExpenses);
          exp.forEach((e: any) => {
            const ref = doc(db, 'expenses', e.id);
            batch.set(ref, { ...e, uid: user.uid });
          });
          hasChanges = true;
        }
        if (legacyPackages) {
          const pkgs = JSON.parse(legacyPackages);
          pkgs.forEach((p: any) => {
            const ref = doc(db, 'packages', p.id);
            batch.set(ref, { ...p, uid: user.uid });
          });
          hasChanges = true;
        }
        if (legacyAttendance) {
          const att = JSON.parse(legacyAttendance);
          att.forEach((a: any) => {
            const ref = doc(db, 'attendance', a.id);
            batch.set(ref, { ...a, uid: user.uid });
          });
          hasChanges = true;
        }
        if (legacySchedules) {
          const sch = JSON.parse(legacySchedules);
          sch.forEach((s: any) => {
            const ref = doc(db, 'schedules', s.id);
            batch.set(ref, { ...s, uid: user.uid });
          });
          hasChanges = true;
        }

        if (hasChanges) {
          await batch.commit();
          // 遷移完成後清除 LocalStorage
          localStorage.removeItem('koala_transactions');
          localStorage.removeItem('koala_courses');
          localStorage.removeItem('koala_inventory');
          localStorage.removeItem('koala_expenses');
          localStorage.removeItem('koala_packages');
          localStorage.removeItem('koala_attendance');
          localStorage.removeItem('koala_schedules');
          console.log('Data migrated from LocalStorage to Firestore');
        }
      }
    };

    migrateData();

    const q = query(collection(db, 'transactions'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Transaction);
      setTransactions(data.length > 0 ? data : INITIAL_TRANSACTIONS.map(t => ({ ...t, uid: user.uid })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'transactions'));

    return () => unsubscribe();
  }, [user, isAuthReady]);

  useEffect(() => {
    if (!user || !isAuthReady) return;

    const q = query(collection(db, 'courses'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Course);
      setCourses(data.length > 0 ? data : INITIAL_COURSES.map(c => ({ ...c, uid: user.uid })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'courses'));

    return () => unsubscribe();
  }, [user, isAuthReady]);

  useEffect(() => {
    if (!user || !isAuthReady) return;

    const q = query(collection(db, 'inventory'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as InventoryItem);
      setInventory(data.length > 0 ? data : INITIAL_INVENTORY.map(i => ({ ...i, uid: user.uid })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'inventory'));

    return () => unsubscribe();
  }, [user, isAuthReady]);

  useEffect(() => {
    if (!user || !isAuthReady) return;

    const q = query(collection(db, 'expenses'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Expense);
      setExpenses(data.length > 0 ? data : INITIAL_EXPENSES.map(e => ({ ...e, uid: user.uid })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'expenses'));

    return () => unsubscribe();
  }, [user, isAuthReady]);

  useEffect(() => {
    if (!user || !isAuthReady) return;

    const q = query(collection(db, 'packages'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as StudentPackage);
      setPackages(data.length > 0 ? data : INITIAL_PACKAGES.map(p => ({ ...p, uid: user.uid })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'packages'));

    return () => unsubscribe();
  }, [user, isAuthReady]);

  useEffect(() => {
    if (!user || !isAuthReady) return;

    const q = query(collection(db, 'attendance'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as AttendanceRecord);
      setAttendance(data.length > 0 ? data : INITIAL_ATTENDANCE.map(a => ({ ...a, uid: user.uid })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'attendance'));

    return () => unsubscribe();
  }, [user, isAuthReady]);

  useEffect(() => {
    if (!user || !isAuthReady) return;

    const q = query(collection(db, 'schedules'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Schedule);
      setSchedules(data.length > 0 ? data : [
        { id: 'sch_1', courseId: 'c1', courseTitle: '成人油畫班', dayOfWeek: 6, startTime: '14:00', endTime: '16:30', instructor: 'Koala', color: '#BA7A56', uid: user.uid },
        { id: 'sch_2', courseId: 'c2', courseTitle: '兒童創意畫', dayOfWeek: 0, startTime: '10:00', endTime: '11:30', instructor: 'Koala', color: '#8A9A8A', uid: user.uid }
      ]);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'schedules'));

    return () => unsubscribe();
  }, [user, isAuthReady]);

  // --- 經營邏輯分析 ---

  const analytics = useMemo(() => {
    const year114Txs = transactions.filter(t => t.year === '114' && t.paid);
    const totalRev = year114Txs.reduce((sum, t) => sum + t.amount, 0);
    const unpaid = transactions.filter(t => !t.paid).reduce((sum, t) => sum + t.amount, 0);
    
    const uniqueStudents = new Set<string>();
    transactions.forEach(t => {
      if (t.name !== '系統結轉' && t.name !== '寵物畫' && t.name !== 'Volvo' && t.name !== '崇學國小' && t.name !== '人物委託') {
        uniqueStudents.add(normalizeName(t.name));
      }
    });

    const monthMap: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.paid) {
        const month = t.date.substring(0, 7);
        monthMap[month] = (monthMap[month] || 0) + t.amount;
      }
    });
    const revenueHistory = Object.entries(monthMap)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 6)
      .reverse();

    const courseMap: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.name === '系統結轉' || t.name === 'Volvo') return;
      courseMap[t.course] = (courseMap[t.course] || 0) + 1;
    });
    const topCourses = Object.entries(courseMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRev - totalExpenses;

    // 月度損益分析
    const monthlyPL: Record<string, { revenue: number, expenses: number }> = {};
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    months.forEach(m => monthlyPL[m] = { revenue: 0, expenses: 0 });

    transactions.forEach(t => {
      if (t.paid) {
        const month = t.date.split('-')[1];
        if (monthlyPL[month]) monthlyPL[month].revenue += t.amount;
      }
    });

    expenses.forEach(e => {
      const month = e.date.split('-')[1];
      if (monthlyPL[month]) monthlyPL[month].expenses += e.amount;
    });

    const profitLossHistory = months.map(m => ({
      month: `${m}月`,
      revenue: monthlyPL[m].revenue,
      expenses: monthlyPL[m].expenses,
      profit: monthlyPL[m].revenue - monthlyPL[m].expenses
    }));

    const lowStockItems = inventory.filter(item => item.quantity <= item.minQuantity);

    const today = new Date();
    const packageAlerts = packages.filter(p => {
      const remaining = p.totalClasses - p.usedClasses;
      const isLow = remaining <= 2;
      const isExpiring = p.expiryDate ? (new Date(p.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24) < 7 : false;
      return isLow || isExpiring;
    }).map(p => ({
      ...p,
      isLow: (p.totalClasses - p.usedClasses) <= 2,
      isExpiring: p.expiryDate ? (new Date(p.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24) < 7 : false,
      remaining: p.totalClasses - p.usedClasses
    }));

    return { totalRev, unpaid, studentCount: uniqueStudents.size, revenueHistory, topCourses, totalExpenses, netProfit, profitLossHistory, lowStockItems, packageAlerts };
  }, [transactions, expenses, inventory, packages]);

  const topStudents = useMemo(() => {
    const stats: Record<string, StudentStats & { categoryCounts: Record<string, number> }> = {};
    transactions.forEach(t => {
      if (t.name === '系統結轉' || t.name === '寵物畫' || t.name === 'Volvo' || t.name === '崇學國小' || t.name === '人物委託') return;
      const realName = normalizeName(t.name);
      if (!stats[realName]) {
        stats[realName] = { name: realName, totalSpent: 0, courses: [], lastActive: '', transactionCount: 0, categoryCounts: {} };
      }
      if (t.paid) stats[realName].totalSpent += t.amount;
      if (t.course && t.course !== '無' && !stats[realName].courses.includes(t.course)) stats[realName].courses.push(t.course);
      if (t.medium && t.medium !== '無' && !stats[realName].courses.includes(t.medium)) stats[realName].courses.push(t.medium);
      if (t.date > stats[realName].lastActive) stats[realName].lastActive = t.date;
      stats[realName].transactionCount++;

      if (t.course && t.course !== '無') {
        const courseObj = courses.find(c => c.title === t.course);
        const category = courseObj ? courseObj.category : '其他';
        stats[realName].categoryCounts[category] = (stats[realName].categoryCounts[category] || 0) + 1;
      }
      if (t.medium && t.medium !== '無') {
        const mediumObj = courses.find(c => c.title === t.medium);
        const category = mediumObj ? mediumObj.category : '其他';
        stats[realName].categoryCounts[category] = (stats[realName].categoryCounts[category] || 0) + 1;
      }
    });
    
    const today = new Date();
    return Object.values(stats).map(s => {
      const preferredCategory = Object.entries(s.categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '綜合';
      
      // 流失風險判斷 (超過 30 天未活動)
      const lastDate = s.lastActive ? new Date(s.lastActive) : new Date(0);
      const diffDays = s.lastActive ? Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)) : 999;
      const isAtRisk = diffDays > 30;

      // 方案狀態判斷
      const studentPackage = packages.find(p => p.studentName === s.name);
      const remainingClasses = studentPackage ? studentPackage.totalClasses - studentPackage.usedClasses : 0;
      const isLowBalance = studentPackage ? remainingClasses <= 2 : false;
      const isExpiringSoon = studentPackage?.expiryDate ? (new Date(studentPackage.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24) < 7 : false;

      return {
        name: s.name,
        totalSpent: s.totalSpent,
        courses: s.courses,
        lastActive: s.lastActive,
        transactionCount: s.transactionCount,
        preferredCategory,
        isAtRisk,
        inactiveDays: diffDays,
        remainingClasses,
        isLowBalance,
        isExpiringSoon
      };
    }).sort((a, b) => {
      if (studentSortBy === 'spent') return b.totalSpent - a.totalSpent;
      if (studentSortBy === 'active') return b.lastActive.localeCompare(a.lastActive);
      if (studentSortBy === 'balance') return a.remainingClasses - b.remainingClasses;
      return a.name.localeCompare(b.name);
    });
  }, [transactions, courses, packages, studentSortBy]);

  const filteredFinance = useMemo(() => {
    return transactions.filter(t => {
      const matchesName = t.name.toLowerCase().includes(filterName.toLowerCase()) || t.course.toLowerCase().includes(filterName.toLowerCase()) || (t.medium && t.medium.toLowerCase().includes(filterName.toLowerCase()));
      const matchesStartDate = startDate ? t.date >= startDate : true;
      const matchesEndDate = endDate ? t.date <= endDate : true;
      return matchesName && matchesStartDate && matchesEndDate;
    });
  }, [transactions, filterName, startDate, endDate]);

  const courseCategories = useMemo(() => {
    const isMediumView = view === 'mediums';
    const relevantCourses = courses.filter(c => isMediumView ? c.type === 'medium' : c.type !== 'medium');
    const categories = new Set(relevantCourses.map(c => c.category));
    return Array.from(categories);
  }, [courses, view]);

  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const isMediumView = view === 'mediums';
      const matchType = isMediumView ? c.type === 'medium' : c.type !== 'medium';
      const matchCategory = courseFilterCategory ? c.category === courseFilterCategory : true;
      const min = courseFilterMinPrice ? parseInt(courseFilterMinPrice) : 0;
      const max = courseFilterMaxPrice ? parseInt(courseFilterMaxPrice) : Infinity;
      const matchPrice = c.price >= min && c.price <= max;
      return matchType && matchCategory && matchPrice;
    });
  }, [courses, courseFilterCategory, courseFilterMinPrice, courseFilterMaxPrice, view]);

  // --- 事件處理 ---

  const runAiConsultant = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        角色：Koala Art Studio 專屬經營顧問 (Dr. Wen 的 AI 助手)
        場景：分析當前畫室數據，並提供具有文藝氣息與商業洞察的建議。
        數據：
        - 114年度累計營收: $${analytics.totalRev} (目標達成率 100%)
        - 活躍學員人頭數: ${analytics.studentCount} 位
        - 最受歡迎課程: ${analytics.topCourses.map(c => c[0]).join(', ')}
        - 待核銷帳項: $${analytics.unpaid}
        任務：請提供 3 點經營洞察與 1 個未來的創意企劃建議。口吻請如同與藝術家的深度對話，溫柔且專業。使用繁體中文。
      `;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      setAiAnalysis(response.text || "靈感採集中，請稍後。");
    } catch (err) {
      setAiAnalysis("連接藝術靈感的頻道暫時受阻，請稍後再試。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveInventory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const id = editingInventory?.id || `inv_${Date.now()}`;
    const newItem: InventoryItem = {
      id,
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      quantity: parseInt(formData.get('quantity') as string) || 0,
      unit: formData.get('unit') as string,
      minQuantity: parseInt(formData.get('minQuantity') as string) || 0,
      costPerUnit: parseInt(formData.get('costPerUnit') as string) || 0,
      lastRestocked: formData.get('lastRestocked') as string || new Date().toISOString().split('T')[0],
      uid: user.uid
    };
    try {
      await setDoc(doc(db, 'inventory', id), newItem);
      setIsInventoryModalOpen(false);
      setEditingInventory(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `inventory/${id}`);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const newInfo: ReceiptInfo = {
      studioName: formData.get('studioName') as string,
      studioPhone: formData.get('studioPhone') as string,
      studioAddress: formData.get('studioAddress') as string,
      bankInfo: formData.get('bankInfo') as string,
      logoUrl: formData.get('logoUrl') as string
    };
    try {
      await updateDoc(doc(db, 'users', user.uid), { ...newInfo });
      setReceiptInfo(newInfo);
      alert('設定已儲存！');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleSaveExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const id = editingExpense?.id || `exp_${Date.now()}`;
    const newExpense: Expense = {
      id,
      date: formData.get('date') as string,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      amount: parseInt(formData.get('amount') as string) || 0,
      uid: user.uid
    };
    try {
      await setDoc(doc(db, 'expenses', id), newExpense);
      setIsExpenseModalOpen(false);
      setEditingExpense(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `expenses/${id}`);
    }
  };

  const handleUseClass = async (studentName: string) => {
    if (!user) return;
    const pkg = packages.find(p => p.studentName === studentName);
    if (!pkg) {
      alert('該學員尚無課堂包！');
      return;
    }
    if (pkg.usedClasses >= pkg.totalClasses) {
      alert('課堂數已用罄！');
      return;
    }
    
    // 自動記錄點名
    const attId = `att_${Date.now()}`;
    const newAttendance: AttendanceRecord = {
      id: attId,
      studentName,
      date: new Date().toISOString().split('T')[0],
      courseTitle: pkg.notes || '課堂包課程',
      uid: user.uid
    };
    
    try {
      await setDoc(doc(db, 'attendance', attId), newAttendance);
      await updateDoc(doc(db, 'packages', pkg.id), { usedClasses: pkg.usedClasses + 1 });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'attendance/packages');
    }
  };

  const exportMonthlyReport = () => {
    const data = analytics.profitLossHistory.map(item => ({
      '月份': item.month,
      '營收': item.revenue,
      '支出': item.expenses,
      '淨利': item.profit
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "年度損益報表");
    XLSX.writeFile(wb, `Koala_Art_Studio_Report_2025.xlsx`);
  };

  const handleSavePackage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const isNew = !editingPackage?.id;
    const id = editingPackage?.id || `pkg_${Date.now()}`;
    const price = parseInt(formData.get('price') as string) || 0;
    const studentName = formData.get('studentName') as string;
    
    const pkgData: StudentPackage = {
      id,
      studentName,
      totalClasses: parseInt(formData.get('totalClasses') as string),
      usedClasses: parseInt(formData.get('usedClasses') as string),
      purchaseDate: formData.get('purchaseDate') as string,
      expiryDate: formData.get('expiryDate') as string || undefined,
      notes: formData.get('notes') as string || undefined,
      price,
      status: 'active',
      uid: user.uid
    };

    try {
      await setDoc(doc(db, 'packages', id), pkgData);
      
      // 如果是新購買，自動建立一筆交易紀錄
      if (isNew && price > 0) {
        const transId = `trans_${Date.now()}`;
        const newTrans: Transaction = {
          id: transId,
          date: pkgData.purchaseDate,
          name: studentName,
          course: `購買課堂包 (${pkgData.totalClasses} 堂)`,
          amount: price,
          paid: true,
          year: pkgData.purchaseDate.split('-')[0],
          uid: user.uid
        };
        await setDoc(doc(db, 'transactions', transId), newTrans);
      }
      
      setIsPackageModalOpen(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `packages/${id}`);
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const courseId = formData.get('courseId') as string;
    const course = courses.find(c => c.id === courseId);
    
    const id = editingSchedule?.id || `sch_${Date.now()}`;
    const schData: Schedule = {
      id,
      courseId,
      courseTitle: course?.title || '未知課程',
      dayOfWeek: parseInt(formData.get('dayOfWeek') as string),
      startTime: formData.get('startTime') as string,
      endTime: formData.get('endTime') as string,
      instructor: formData.get('instructor') as string,
      room: formData.get('room') as string || undefined,
      maxStudents: parseInt(formData.get('maxStudents') as string) || undefined,
      color: course?.color || '#BA7A56',
      uid: user.uid
    };

    try {
      await setDoc(doc(db, 'schedules', id), schData);
      setIsScheduleModalOpen(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `schedules/${id}`);
    }
  };

  const handleResetData = async () => {
    if (!user) return;
    if (confirm('確定要重置所有資料嗎？這將會刪除雲端上的所有記錄。')) {
      try {
        const collections = ['transactions', 'courses', 'inventory', 'expenses', 'packages', 'attendance', 'schedules'];
        const batch = writeBatch(db);
        
        // 這裡我們只刪除當前視圖中的數據，因為 onSnapshot 會處理更新
        // 實際上應該查詢所有並刪除，但為了簡單起見，我們先處理當前已加載的
        transactions.forEach(t => batch.delete(doc(db, 'transactions', t.id)));
        courses.forEach(c => batch.delete(doc(db, 'courses', c.id)));
        inventory.forEach(i => batch.delete(doc(db, 'inventory', i.id)));
        expenses.forEach(e => batch.delete(doc(db, 'expenses', e.id)));
        packages.forEach(p => batch.delete(doc(db, 'packages', p.id)));
        attendance.forEach(a => batch.delete(doc(db, 'attendance', a.id)));
        schedules.forEach(s => batch.delete(doc(db, 'schedules', s.id)));

        await batch.commit();
        alert('雲端資料已重置。');
        setIsResetModalOpen(false);
      } catch (err) {
        console.error(err);
        alert('重置失敗，請檢查權限。');
      }
    }
  };

  const handleSaveTx = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const dateStr = formData.get('date') as string;
    const yearPrefix = dateStr.substring(0, 4);
    const id = editingTx?.id || `tx_${Date.now()}`;
    const newTx: Transaction = {
      id,
      date: dateStr,
      name: formData.get('name') as string,
      course: formData.get('course') as string,
      medium: formData.get('medium') as string || '',
      amount: parseInt(formData.get('amount') as string) || 0,
      paid: formData.get('status') === 'true',
      year: yearPrefix === '2026' ? '115' : yearPrefix === '2025' ? '114' : '113',
      uid: user.uid
    };
    try {
      await setDoc(doc(db, 'transactions', id), newTx);
      setIsModalOpen(false);
      setEditingTx(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `transactions/${id}`);
    }
  };

  const handleDeleteTx = () => {
    if (editingTx) {
      setConfirmDeleteTx(editingTx.id);
    }
  };

  const confirmDeleteTransaction = async () => {
    if (confirmDeleteTx) {
      try {
        await deleteDoc(doc(db, 'transactions', confirmDeleteTx));
        setIsModalOpen(false);
        setEditingTx(null);
        setConfirmDeleteTx(null);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `transactions/${confirmDeleteTx}`);
      }
    }
  };

  const handleSaveCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const id = editingCourse?.id || `course_${Date.now()}`;
    const newCourse: Course = {
      id,
      title: formData.get('title') as string,
      category: formData.get('category') as string,
      price: parseInt(formData.get('price') as string) || 0,
      description: formData.get('description') as string,
      color: formData.get('color') as string || '#BA7A56',
      active: formData.get('active') === 'true',
      type: editingCourse?.type || (view === 'mediums' ? 'medium' : 'course'),
      mediums: formData.getAll('mediums') as string[],
      uid: user.uid
    };
    try {
      await setDoc(doc(db, 'courses', id), newCourse);
      setIsCourseModalOpen(false);
      setEditingCourse(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `courses/${id}`);
    }
  };

  const handleDeleteCourse = (id: string) => {
    setConfirmDeleteCourse(id);
  };

  const confirmDeleteCourseAction = async () => {
    if (confirmDeleteCourse) {
      try {
        await deleteDoc(doc(db, 'courses', confirmDeleteCourse));
        setConfirmDeleteCourse(null);
        setIsCourseModalOpen(false);
        setEditingCourse(null);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `courses/${confirmDeleteCourse}`);
      }
    }
  };

  const exportCSV = () => {
    const headers = "日期,姓名,項目,媒材,金額,狀態,年份\n";
    const rows = filteredFinance.map(t => 
      `${t.date},${t.name},${t.course},${t.medium || ''},${t.amount},${t.paid ? '已付' : '未付'},${t.year}`
    ).join("\n");
    const blob = new Blob(["\ufeff" + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `考拉藝術財務檔案_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const batch = writeBatch(db);
        let count = 0;
        for (const [index, row] of (data as any[]).entries()) {
          const dateStr = row['日期'] || new Date().toISOString().split('T')[0];
          const yearPrefix = String(dateStr).substring(0, 4);
          const year = row['年份'] ? String(row['年份']) : (yearPrefix === '2026' ? '115' : yearPrefix === '2025' ? '114' : '113');
          
          const id = `tx_imported_${Date.now()}_${index}`;
          const newTx: Transaction = {
            id,
            date: dateStr,
            name: row['姓名'] || row['學員對象'] || '未知',
            course: row['項目'] || row['課程名稱'] || '未知',
            medium: row['媒材'] || '',
            amount: parseInt(row['金額']) || 0,
            paid: row['狀態'] === '已付' || row['狀態'] === '已入帳' || row['狀態'] === true || row['狀態'] === 'true',
            year: year,
            uid: user.uid
          };
          batch.set(doc(db, 'transactions', id), newTx);
          count++;
          
          // Firestore batch limit is 500
          if (count % 500 === 0) {
            await batch.commit();
          }
        }

        if (count % 500 !== 0) {
          await batch.commit();
        }

        alert(`成功匯入 ${count} 筆資料！`);
      } catch (error) {
        console.error(error);
        alert('匯入失敗，請確認檔案格式是否正確。');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const exportStudentsCSV = () => {
    const headers = "姓名,總消費金額,參與課程/媒材,最後活躍日期,偏好媒材\n";
    const rows = topStudents.map(s => {
      const coursesStr = s.courses.join(';');
      return `${s.name},${s.totalSpent},${coursesStr},${s.lastActive},${s.preferredCategory}`;
    }).join("\n");
    const blob = new Blob(["\ufeff" + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `考拉藝術學員檔案_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportCoursesCSV = () => {
    const headers = "標題,類別,價格,描述,代表色,狀態,使用媒材\n";
    const rows = filteredCourses.map(c => {
      const status = c.active ? (c.type === 'medium' ? '販售中' : '開課中') : (c.type === 'medium' ? '已停售' : '已停課');
      const mediumsStr = c.mediums ? c.mediums.map(mId => courses.find(mc => mc.id === mId)?.title || '').filter(Boolean).join(';') : '';
      return `${c.title},${c.category},${c.price},${c.description},${c.color},${status},${mediumsStr}`;
    }).join("\n");
    const blob = new Blob(["\ufeff" + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `考拉藝術檔案_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCoursesExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const batch = writeBatch(db);
        let count = 0;
        for (const [index, row] of (data as any[]).entries()) {
          const mediumsStr = row['使用媒材'] || '';
          const mediumTitles = mediumsStr.split(';').map((s: string) => s.trim()).filter(Boolean);
          const matchedMediums = mediumTitles.map((t: string) => courses.find(c => c.type === 'medium' && c.title === t)?.id).filter(Boolean) as string[];

          const id = `course_imported_${Date.now()}_${index}`;
          const newCourse: Course = {
            id,
            title: row['標題'] || row['課程名稱'] || '未命名課程',
            category: row['類別'] || row['媒材'] || '其他',
            price: parseInt(row['價格']) || 0,
            description: row['描述'] || row['課程描述'] || '',
            color: row['代表色'] || row['顏色'] || '#857E75',
            active: row['狀態'] === '開課中' || row['狀態'] === '販售中' || row['狀態'] === true || row['狀態'] === 'true',
            type: view === 'mediums' ? 'medium' : 'course',
            mediums: matchedMediums.length > 0 ? matchedMediums : undefined,
            uid: user.uid
          };
          batch.set(doc(db, 'courses', id), newCourse);
          count++;

          if (count % 500 === 0) {
            await batch.commit();
          }
        }

        if (count % 500 !== 0) {
          await batch.commit();
        }

        alert(`成功匯入 ${count} 門課程！`);
      } catch (error) {
        console.error(error);
        alert('匯入失敗，請確認檔案格式是否正確。');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-[#2D2926] rounded-[32px] flex items-center justify-center text-4xl animate-bounce">🐨</div>
          <p className="text-[#BA7A56] font-serif italic animate-pulse">靈感載入中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-[48px] shadow-2xl max-w-lg w-full text-center space-y-10 relative overflow-hidden">
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-[#F2EDE4] rounded-full blur-3xl opacity-50"></div>
          <div className="relative z-10">
            <div className="w-24 h-24 bg-[#2D2926] rounded-[32px] flex items-center justify-center text-5xl mx-auto mb-8 shadow-2xl">🐨</div>
            <h1 className="text-4xl font-serif font-bold text-[#2D2926] mb-4">考拉藝術工作室</h1>
            <p className="text-[#857E75] leading-relaxed mb-12">
              歡迎回來。請登入以管理您的畫室業務、學員檔案與藝術靈感。
            </p>
            <button 
              onClick={loginWithGoogle}
              className="w-full bg-[#2D2926] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-4 hover:bg-[#BA7A56] transition-all transform hover:-translate-y-1 shadow-xl"
            >
              <LogIn size={24} />
              使用 Google 帳號登入
            </button>
            <p className="text-[10px] text-[#BA7A56] uppercase tracking-[4px] mt-12 opacity-60 font-bold">Secure Cloud Access</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FAF9F6] selection:bg-[#BA7A56]/20">
      {/* 側邊導覽 */}
      <aside className="w-64 xl:w-72 bg-white border-r border-[#EBE5DE] p-8 xl:p-10 flex flex-col hidden lg:flex sticky top-0 h-screen overflow-hidden">
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-[#F2EDE4] rounded-full blur-3xl opacity-50"></div>
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-4 mb-16 group cursor-pointer">
            <div className="w-12 h-12 xl:w-16 xl:h-16 bg-[#2D2926] rounded-[20px] xl:rounded-[24px] flex items-center justify-center text-2xl xl:text-3xl shadow-2xl group-hover:rotate-12 transition-all duration-1000">🐨</div>
            <div>
              <h1 className="font-serif text-xl xl:text-2xl font-bold text-[#2D2926] tracking-tight">考拉藝術</h1>
              <p className="text-[9px] xl:text-[10px] tracking-[3px] xl:tracking-[5px] text-[#BA7A56] uppercase font-bold mt-1 opacity-80">Studio Hub</p>
            </div>
          </div>

          <nav className="space-y-2 xl:space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <SidebarItem active={view === 'dashboard'} icon={LayoutDashboard} label="經營脈動" onClick={() => setView('dashboard')} />
            <SidebarItem active={view === 'students'} icon={Users} label="學員檔案庫" onClick={() => setView('students')} />
            <SidebarItem active={view === 'packages'} icon={Award} label="課堂包管理" onClick={() => setView('packages')} />
            <SidebarItem active={view === 'courses'} icon={BookOpen} label="課程管理" onClick={() => setView('courses')} />
            <SidebarItem active={view === 'mediums'} icon={Palette} label="媒材管理" onClick={() => setView('mediums')} />
            <SidebarItem active={view === 'inventory'} icon={Layers} label="庫存管理" onClick={() => setView('inventory')} />
            <SidebarItem active={view === 'expenses'} icon={CreditCard} label="支出管理" onClick={() => setView('expenses')} />
            <SidebarItem active={view === 'attendance'} icon={Calendar} label="點名管理" onClick={() => setView('attendance')} />
            <SidebarItem active={view === 'schedules'} icon={Clock} label="課程課表" onClick={() => setView('schedules')} />
            <SidebarItem active={view === 'reports'} icon={TrendingUp} label="經營報表" onClick={() => setView('reports')} />
            <SidebarItem active={view === 'finance'} icon={Receipt} label="財務流水帳" onClick={() => setView('finance')} />
            <SidebarItem active={view === 'settings'} icon={Settings} label="系統設定" onClick={() => setView('settings')} />
            <SidebarItem active={false} icon={Trash2} label="系統重置" onClick={() => setIsResetModalOpen(true)} />
            <SidebarItem active={false} icon={LogOut} label="登出系統" onClick={logout} />
          </nav>

          <div className="mt-8 space-y-6 relative z-10">
            <div className="bg-[#F2EDE4] p-6 xl:p-8 rounded-[32px] xl:rounded-[40px] relative overflow-hidden group">
              <Quote size={20} className="text-[#BA7A56] mb-4 opacity-30" />
              <p className="text-xs xl:text-sm font-serif italic text-[#2D2926] leading-relaxed relative z-10">「{quote.text}」</p>
              <div className="mt-4 xl:mt-6 flex items-center justify-between">
                <span className="text-[9px] xl:text-[10px] font-bold text-[#857E75] uppercase tracking-widest">— {quote.author}</span>
                <Heart size={12} className="text-[#BA7A56] animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* 主內容區 */}
      <main className="flex-1 p-6 md:p-10 xl:p-16 2xl:p-20 overflow-y-auto pb-32 lg:pb-20">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 xl:mb-20">
          <div className="space-y-3 xl:space-y-4">
            <h2 className="font-serif text-4xl md:text-5xl xl:text-6xl font-bold text-[#2D2926] tracking-tighter">
              {view === 'dashboard' ? 'Studio Pulse' : view === 'students' ? 'Student Archives' : view === 'packages' ? 'Package Management' : view === 'courses' ? 'Course Management' : view === 'mediums' ? 'Medium Management' : view === 'inventory' ? 'Inventory Hub' : view === 'expenses' ? 'Expense Tracker' : view === 'attendance' ? 'Attendance' : view === 'schedules' ? 'Studio Schedule' : view === 'reports' ? 'Business Insights' : view === 'finance' ? 'Financial Ledger' : 'System Settings'}
            </h2>
            <div className="flex items-center gap-3 text-[#857E75] text-[10px] xl:text-xs font-semibold tracking-[1px] xl:tracking-[2px] uppercase">
              <span className="w-2 h-2 bg-[#BA7A56] rounded-full animate-ping"></span>
              最後更新：{new Date().toLocaleDateString('zh-TW')}
            </div>
          </div>
          <button 
            onClick={() => { 
              if (view === 'courses' || view === 'mediums') {
                setEditingCourse(null);
                setIsCourseModalOpen(true);
              } else if (view === 'inventory') {
                setEditingInventory(null);
                setIsInventoryModalOpen(true);
              } else if (view === 'expenses') {
                setEditingExpense(null);
                setIsExpenseModalOpen(true);
              } else if (view === 'schedules') {
                setEditingSchedule(null);
                setIsScheduleModalOpen(true);
              } else {
                setEditingTx(null); 
                setIsModalOpen(true); 
              }
            }}
            className="bg-[#2D2926] text-white px-8 xl:px-12 py-4 xl:py-6 rounded-[24px] xl:rounded-[32px] flex items-center gap-3 xl:gap-4 shadow-2xl hover:bg-[#BA7A56] transition-all font-bold w-full md:w-auto justify-center"
          >
            <Plus size={20} xl:size={24} />
            <span className="tracking-widest uppercase text-[10px] xl:text-xs">
              {view === 'courses' ? '新增課程' : view === 'mediums' ? '新增媒材' : view === 'inventory' ? '新增庫存' : view === 'expenses' ? '新增支出' : view === 'schedules' ? '新增課表' : '新增數據'}
            </span>
          </button>
        </header>

        {view === 'dashboard' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-10">
              <MetricStat label="114年度總營收" value={`$${analytics.totalRev.toLocaleString()}`} sub="數據目標達成：100%" icon={TrendingUp} color="#BA7A56" />
              <MetricStat label="活躍學員人頭" value={`${analytics.studentCount}`} sub="去重後真實學員數" icon={Users} color="#8A9A8A" />
              <MetricStat label="待核銷流水" value={`$${analytics.unpaid.toLocaleString()}`} sub="現金流穩定性指標" icon={CreditCard} color="#857E75" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
              <BentoCard className="xl:col-span-8" title="營收成長軌跡" icon={Waves}>
                <div className="h-72 flex items-end justify-between px-10 gap-10 pt-12">
                  {analytics.revenueHistory.map(([month, amount]) => (
                    <div key={month} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                      <div className="w-full max-w-[50px] bg-[#FAF9F6] rounded-3xl relative overflow-hidden transition-all">
                         <div 
                          className="absolute bottom-0 left-0 w-full bg-[#BA7A56] rounded-3xl transition-all"
                          style={{ height: `${(amount / (Math.max(...analytics.revenueHistory.map(m => m[1])) || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="mt-6 text-[11px] font-bold text-[#C4C0BA]">{month.split('-')[1]}月</span>
                    </div>
                  ))}
                </div>
              </BentoCard>

              <BentoCard className="xl:col-span-4" title="熱門媒材排行榜" icon={PieChart}>
                <div className="space-y-8 pt-4">
                  {analytics.topCourses.map(([course, count], idx) => (
                    <div key={course} className="space-y-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[#2D2926]">{course}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[#BA7A56] font-bold">{count} 堂</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const courseObj = courses.find(c => c.title === course);
                              setEditingTx({ id: '', date: new Date().toISOString().split('T')[0], name: '', course: course, amount: courseObj ? courseObj.price : 0, paid: false, year: '' });
                              setIsModalOpen(true);
                            }}
                            className="bg-[#2D2926] text-white px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-[#BA7A56] transition-colors"
                          >
                            報名
                          </button>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-[#FAF9F6] rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${(count / (transactions.length || 1)) * 100}%`,
                            backgroundColor: idx === 0 ? '#BA7A56' : '#8A9A8A'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </BentoCard>
            </div>

            <BentoCard dark title="AI 經營點評" icon={Sparkles}>
              <div className="min-h-[200px] flex flex-col gap-8">
                <div className="flex-1 text-white/80 leading-relaxed text-sm">
                  {isAnalyzing ? "正在深讀畫室數據..." : aiAnalysis || "「點擊下方按鈕，開啟與 Gemini 的經營深度對談。」"}
                </div>
                <button onClick={runAiConsultant} disabled={isAnalyzing} className="w-full bg-[#BA7A56] text-white py-6 rounded-[32px] font-bold flex items-center justify-center gap-4 shadow-xl">
                   <Sparkles size={20} />
                   {isAnalyzing ? "分析中..." : "啟動 AI 數據洞察"}
                </button>
              </div>
            </BentoCard>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              <BentoCard title="低庫存警示" icon={AlertTriangle}>
                <div className="space-y-5 mt-6">
                  {analytics.lowStockItems.length > 0 ? (
                    analytics.lowStockItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-6 bg-red-50 rounded-[28px] border border-red-100 shadow-sm">
                        <div>
                          <p className="text-base font-bold text-red-700">{item.name}</p>
                          <p className="text-[10px] text-red-500 mt-1 font-bold uppercase tracking-wider">當前庫存：{item.quantity} {item.unit} (低於 {item.minQuantity})</p>
                        </div>
                        <button 
                          onClick={() => { setView('inventory'); setEditingInventory(item); setIsInventoryModalOpen(true); }}
                          className="bg-red-600 text-white px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-md hover:shadow-lg"
                        >
                          補貨
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-[#C4C0BA] gap-4">
                      <CheckCircle2 size={56} className="opacity-20" />
                      <p className="text-sm font-bold italic">庫存充足，營運無憂</p>
                    </div>
                  )}
                </div>
              </BentoCard>

              <BentoCard title="方案預警 (跑掉的方案)" icon={Award}>
                <div className="space-y-5 mt-6">
                  {analytics.packageAlerts.length > 0 ? (
                    analytics.packageAlerts.map(pkg => (
                      <div key={pkg.id} className="flex justify-between items-center p-6 bg-orange-50 rounded-[28px] border border-orange-100 shadow-sm">
                        <div>
                          <p className="text-base font-bold text-orange-700">{pkg.studentName}</p>
                          <p className="text-[10px] text-orange-500 mt-1 font-bold uppercase tracking-wider">
                            {pkg.isLow ? `剩餘 ${pkg.remaining} 堂` : ''} 
                            {pkg.isExpiring ? ` | 即將到期: ${pkg.expiryDate}` : ''}
                          </p>
                        </div>
                        <button 
                          onClick={() => { setView('students'); setExpandedStudent(pkg.studentName); }}
                          className="bg-orange-600 text-white px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-orange-700 transition-all shadow-md hover:shadow-lg"
                        >
                          查看
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-[#C4C0BA] gap-4">
                      <CheckCircle2 size={56} className="opacity-20" />
                      <p className="text-sm font-bold italic">所有方案狀態良好</p>
                    </div>
                  )}
                </div>
              </BentoCard>

              <BentoCard title="快速行動" icon={LayoutDashboard}>
                <div className="grid grid-cols-2 gap-6 mt-6">
                  <QuickActionButton icon={Users} label="新增學員" onClick={() => { setView('students'); setIsModalOpen(true); }} />
                  <QuickActionButton icon={Receipt} label="記一筆帳" onClick={() => { setView('finance'); setIsModalOpen(true); }} />
                  <QuickActionButton icon={CreditCard} label="記一筆支出" onClick={() => { setView('expenses'); setIsExpenseModalOpen(true); }} />
                  <QuickActionButton icon={Layers} label="盤點庫存" onClick={() => setView('inventory')} />
                </div>
              </BentoCard>
            </div>

            <BentoCard title="最近經營活動" icon={Clock}>
              <div className="overflow-x-auto -mx-8 px-8 mt-8 pb-4 custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[#EBE5DE]">
                      <th className="py-6 px-4 text-[10px] font-bold text-[#C4C0BA] uppercase tracking-[3px]">時間</th>
                      <th className="py-6 px-4 text-[10px] font-bold text-[#C4C0BA] uppercase tracking-[3px]">類型</th>
                      <th className="py-6 px-4 text-[10px] font-bold text-[#C4C0BA] uppercase tracking-[3px]">內容</th>
                      <th className="py-6 px-4 text-[10px] font-bold text-[#C4C0BA] uppercase tracking-[3px] text-right">金額/狀態</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...transactions, ...expenses, ...attendance.map(a => ({ ...a, type: 'attendance' }))]
                      .sort((a, b) => (b as any).date.localeCompare((a as any).date))
                      .slice(0, 10)
                      .map((item: any) => (
                        <tr key={item.id} className="border-b border-[#FAF9F6] hover:bg-[#FAF9F6] transition-all group">
                          <td className="py-6 px-4 font-mono text-[10px] text-[#857E75] font-bold">{item.date}</td>
                          <td className="py-6 px-4">
                            <span className={`text-[9px] font-bold uppercase px-3 py-1 rounded-full tracking-wider ${
                              item.type === 'attendance' ? 'bg-blue-50 text-blue-500 border border-blue-100' :
                              (item.amount > 0 && !item.category) ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-500 border border-red-100'
                            }`}>
                              {item.type === 'attendance' ? '點名' : item.category ? '支出' : '收入'}
                            </span>
                          </td>
                          <td className="py-6 px-4 text-sm font-bold text-[#2D2926] group-hover:text-[#BA7A56] transition-colors">
                            {item.studentName || item.name || item.description}
                          </td>
                          <td className="py-6 px-4 text-right font-serif font-bold text-sm">
                            {item.type === 'attendance' ? (
                              <span className="text-[#8A9A8A] bg-[#8A9A8A]/10 px-3 py-1 rounded-full">出席</span>
                            ) : (
                              <span className={`${item.category ? 'text-red-400' : 'text-[#BA7A56]'} font-mono`}>
                                {item.category ? '-' : '+'}${item.amount.toLocaleString()}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </BentoCard>
          </div>
        )}

        {view === 'packages' && (
          <div className="space-y-12">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <h2 className="text-4xl font-serif font-bold text-[#2D2926]">課堂包管理</h2>
                <p className="text-sm text-[#857E75] font-medium uppercase tracking-[4px]">Track and manage student lesson packages</p>
              </div>
              <button 
                onClick={() => { setEditingPackage(null); setIsPackageModalOpen(true); }}
                className="bg-[#BA7A56] text-white px-10 py-5 rounded-[32px] text-xs font-bold uppercase tracking-[3px] hover:bg-[#2D2926] transition-all flex items-center gap-3 shadow-xl"
              >
                <Plus size={18} /> 新增課堂包
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-[40px] border border-[#EBE5DE] shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                    <Award size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest">活躍方案數</span>
                </div>
                <p className="text-4xl font-serif font-bold text-[#2D2926]">{packages.filter(p => p.status === 'active').length}</p>
              </div>
              <div className="bg-white p-8 rounded-[40px] border border-[#EBE5DE] shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center">
                    <AlertTriangle size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest">剩餘堂數不足</span>
                </div>
                <p className="text-4xl font-serif font-bold text-[#2D2926]">{packages.filter(p => (p.totalClasses - p.usedClasses) <= 2).length}</p>
              </div>
              <div className="bg-white p-8 rounded-[40px] border border-[#EBE5DE] shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                    <Clock size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest">即將到期</span>
                </div>
                <p className="text-4xl font-serif font-bold text-[#2D2926]">
                  {packages.filter(p => p.expiryDate && (new Date(p.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) < 7).length}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-[48px] border border-[#EBE5DE] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF9F6] border-b border-[#EBE5DE]">
                      <th className="px-10 py-8 text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest">學員姓名</th>
                      <th className="px-10 py-8 text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest">購買日期</th>
                      <th className="px-10 py-8 text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest">剩餘 / 總堂數</th>
                      <th className="px-10 py-8 text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest">有效期限</th>
                      <th className="px-10 py-8 text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest">狀態</th>
                      <th className="px-10 py-8 text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate)).map((pkg) => {
                      const remaining = pkg.totalClasses - pkg.usedClasses;
                      const isLow = remaining <= 2;
                      const isExpired = pkg.expiryDate ? new Date(pkg.expiryDate) < new Date() : false;
                      
                      return (
                        <tr key={pkg.id} className="border-b border-[#EBE5DE] hover:bg-[#FAF9F6]/50 transition-colors group">
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-[#2D2926] rounded-xl flex items-center justify-center text-white font-serif font-bold text-sm">
                                {pkg.studentName[0]}
                              </div>
                              <span className="font-bold text-[#2D2926]">{pkg.studentName}</span>
                            </div>
                          </td>
                          <td className="px-10 py-8 text-sm font-medium text-[#857E75]">{pkg.purchaseDate}</td>
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-3">
                              <span className={`text-lg font-serif font-bold ${isLow ? 'text-red-500' : 'text-[#2D2926]'}`}>{remaining}</span>
                              <span className="text-xs text-[#C4C0BA]">/ {pkg.totalClasses}</span>
                            </div>
                          </td>
                          <td className="px-10 py-8 text-sm font-medium text-[#857E75]">
                            {pkg.expiryDate || <span className="text-[#C4C0BA] italic">無期限</span>}
                          </td>
                          <td className="px-10 py-8">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                              isExpired ? 'bg-red-50 text-red-500' : 
                              isLow ? 'bg-orange-50 text-orange-500' : 
                              'bg-green-50 text-green-500'
                            }`}>
                              {isExpired ? '已過期' : isLow ? '堂數不足' : '正常'}
                            </span>
                          </td>
                          <td className="px-10 py-8 text-right">
                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleUseClass(pkg.studentName)}
                                disabled={remaining <= 0}
                                className="p-3 bg-white border border-[#EBE5DE] rounded-xl text-[#BA7A56] hover:bg-[#BA7A56] hover:text-white transition-all shadow-sm disabled:opacity-50"
                              >
                                <CheckCircle2 size={18} />
                              </button>
                              <button 
                                onClick={() => { setEditingPackage(pkg); setIsPackageModalOpen(true); }}
                                className="p-3 bg-white border border-[#EBE5DE] rounded-xl text-[#2D2926] hover:bg-[#2D2926] hover:text-white transition-all shadow-sm"
                              >
                                <Edit2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {view === 'students' && (
          <div className="space-y-12">
            {/* 學員檔案庫概覽 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-8 rounded-[32px] border border-[#EBE5DE] shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest">總學員數</span>
                </div>
                <p className="text-3xl font-serif font-bold text-[#2D2926]">{topStudents.length}</p>
              </div>
              <div className="bg-white p-8 rounded-[32px] border border-[#EBE5DE] shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                    <AlertTriangle size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest">流失風險</span>
                </div>
                <p className="text-3xl font-serif font-bold text-[#2D2926]">{topStudents.filter(s => s.isAtRisk).length}</p>
              </div>
              <div className="bg-white p-8 rounded-[32px] border border-[#EBE5DE] shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center">
                    <Award size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest">課堂數不足</span>
                </div>
                <p className="text-3xl font-serif font-bold text-[#2D2926]">{topStudents.filter(s => s.isLowBalance).length}</p>
              </div>
              <div className="bg-white p-8 rounded-[32px] border border-[#EBE5DE] shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center">
                    <TrendingUp size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest">本月活躍</span>
                </div>
                <p className="text-3xl font-serif font-bold text-[#2D2926]">{topStudents.filter(s => s.inactiveDays < 7).length}</p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto">
                <div className="relative w-full lg:w-96">
                  <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-[#C4C0BA]" size={20} />
                  <input 
                    type="text" 
                    placeholder="搜尋學員姓名、媒材或等級..." 
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    className="bg-white border border-[#EBE5DE] rounded-[32px] pl-20 pr-10 py-5 text-base font-bold focus:ring-4 focus:ring-[#BA7A56]/10 transition-all w-full shadow-sm"
                  />
                </div>
                <select 
                  value={studentSortBy}
                  onChange={(e) => setStudentSortBy(e.target.value as any)}
                  className="bg-white border border-[#EBE5DE] rounded-[32px] px-8 py-5 text-sm font-bold focus:ring-4 focus:ring-[#BA7A56]/10 transition-all shadow-sm"
                >
                  <option value="spent">依投資總額排序</option>
                  <option value="active">依最近活動排序</option>
                  <option value="name">依姓名排序</option>
                  <option value="balance">依剩餘課堂排序</option>
                </select>
              </div>
              <div className="flex w-full lg:w-auto gap-4">
                <button onClick={exportStudentsCSV} className="flex-1 lg:flex-none bg-[#2D2926] text-white px-10 py-5 rounded-[32px] text-xs font-bold uppercase tracking-[3px] hover:bg-[#BA7A56] transition-all flex items-center justify-center gap-3 shadow-xl">
                  <Download size={18} /> 導出學員名單
                </button>
                <button onClick={() => setIsModalOpen(true)} className="flex-1 lg:flex-none bg-[#BA7A56] text-white px-10 py-5 rounded-[32px] text-xs font-bold uppercase tracking-[3px] hover:bg-[#2D2926] transition-all flex items-center justify-center gap-3 shadow-xl">
                  <Plus size={18} /> 新增學員
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-12 xl:gap-16">
              <AnimatePresence mode="popLayout">
              {topStudents
                .filter(s => s.name.toLowerCase().includes(filterName.toLowerCase()) || s.preferredCategory.toLowerCase().includes(filterName.toLowerCase()))
                .map((s) => {
                const isExpanded = expandedStudent === s.name;
                const tier = s.totalSpent > 20000 ? '典藏會員' : s.totalSpent > 10000 ? '資深會員' : '藝術之友';
                const tierColor = s.totalSpent > 20000 ? '#BA7A56' : s.totalSpent > 10000 ? '#8A9A8A' : '#857E75';

                return (
                  <motion.div 
                    layout
                    key={s.name} 
                    onClick={() => setExpandedStudent(isExpanded ? null : s.name)}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`group relative bg-white rounded-[48px] md:rounded-[64px] shadow-sm border border-[#EBE5DE] transition-all duration-700 cursor-pointer overflow-hidden ${
                      isExpanded ? 'md:col-span-2 xl:col-span-2 ring-4 ring-[#BA7A56]/10 shadow-3xl z-10' : 'hover:shadow-2xl hover:-translate-y-2'
                    }`}
                  >
                    {/* 背景藝術裝飾 */}
                    <div className={`absolute top-0 right-0 w-80 h-80 bg-[#F2EDE4]/40 rounded-full -mr-40 -mt-40 blur-3xl transition-transform duration-1000 group-hover:scale-125 ${isExpanded ? 'scale-150' : ''}`}></div>
                    
                    <div className="relative p-10 md:p-16 flex flex-col h-full">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-10 md:mb-16">
                        <div className="flex items-center gap-6 md:gap-10">
                          <div className="w-20 h-20 md:w-32 md:h-32 bg-[#2D2926] rounded-[32px] md:rounded-[48px] flex items-center justify-center text-3xl md:text-5xl font-serif font-bold text-[#BA7A56] shadow-2xl group-hover:rotate-6 transition-transform duration-700">
                            {s.name[0]}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-3 mb-2 md:mb-4">
                              <span className="text-[10px] md:text-xs uppercase tracking-[3px] md:tracking-[6px] text-[#BA7A56] font-bold block">{tier}</span>
                              {s.isAtRisk && (
                                <span className="bg-red-100 text-red-500 text-[9px] px-3 py-1 rounded-full font-bold animate-pulse uppercase tracking-widest">流失風險</span>
                              )}
                              {s.isLowBalance && (
                                <span className="bg-orange-100 text-orange-500 text-[9px] px-3 py-1 rounded-full font-bold uppercase tracking-widest">課堂不足</span>
                              )}
                              {s.isExpiringSoon && (
                                <span className="bg-yellow-100 text-yellow-600 text-[9px] px-3 py-1 rounded-full font-bold uppercase tracking-widest">即將到期</span>
                              )}
                            </div>
                            <h3 className="text-2xl md:text-5xl font-serif font-bold text-[#2D2926] tracking-tight">{s.name}</h3>
                          </div>
                        </div>
                        <div className="sm:text-right">
                          <span className="text-[10px] md:text-xs uppercase tracking-[4px] text-[#C4C0BA] font-bold">藝術投資總額</span>
                          <h4 className="text-3xl md:text-5xl font-serif font-bold text-[#2D2926] mt-2 md:mt-4 tracking-tighter">${s.totalSpent.toLocaleString()}</h4>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="grid grid-cols-3 gap-6 md:gap-10 mb-10 md:mb-16">
                          <div className="space-y-2">
                            <span className="text-[10px] md:text-xs text-[#C4C0BA] font-bold uppercase tracking-[3px]">創作次數</span>
                            <p className="text-base md:text-2xl font-serif font-bold text-[#2D2926]">{s.transactionCount} 次</p>
                          </div>
                          <div className="space-y-2">
                            <span className="text-[10px] md:text-xs text-[#C4C0BA] font-bold uppercase tracking-[3px]">偏好媒材</span>
                            <p className="text-base md:text-2xl font-serif font-bold text-[#2D2926] truncate">{s.preferredCategory}</p>
                          </div>
                          <div className="text-right space-y-2">
                            <span className="text-[10px] md:text-xs text-[#C4C0BA] font-bold uppercase tracking-[3px]">最近創作</span>
                            <p className="text-base md:text-2xl font-serif font-bold text-[#2D2926]">{s.lastActive}</p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <span className="text-[10px] md:text-xs text-[#C4C0BA] font-bold uppercase tracking-[4px] block">媒材足跡</span>
                          <div className="flex flex-wrap gap-3 md:gap-5">
                            {(isExpanded ? s.courses : s.courses.slice(0, 3)).map(c => (
                              <span key={c} className="bg-[#FAF9F6] text-[#857E75] px-5 md:px-8 py-2.5 md:py-4 rounded-[20px] md:rounded-[28px] text-[10px] md:text-xs font-bold border border-[#EBE5DE]/50 hover:border-[#BA7A56]/30 transition-all hover:bg-white hover:shadow-md">
                                {c}
                              </span>
                            ))}
                            {!isExpanded && s.courses.length > 3 && (
                              <span className="text-[10px] md:text-xs text-[#BA7A56] font-bold self-center ml-2 md:ml-4 uppercase tracking-widest">+{s.courses.length - 3} 更多</span>
                            )}
                          </div>
                        </div>

                        <motion.div 
                          initial={false}
                          animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
                          className="overflow-hidden"
                        >
                          {/* 詳細數據 */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12">
                            <div className="bg-[#FAF9F6] p-6 rounded-[32px] border border-[#EBE5DE]/50">
                              <span className="text-[9px] font-bold text-[#C4C0BA] uppercase tracking-widest block mb-2">總出席次數</span>
                              <p className="text-xl font-serif font-bold text-[#2D2926]">{attendance.filter(a => a.studentName === s.name).length} 次</p>
                            </div>
                            <div className="bg-[#FAF9F6] p-6 rounded-[32px] border border-[#EBE5DE]/50">
                              <span className="text-[9px] font-bold text-[#C4C0BA] uppercase tracking-widest block mb-2">平均客單價</span>
                              <p className="text-xl font-serif font-bold text-[#2D2926]">${Math.round(s.totalSpent / (s.transactionCount || 1)).toLocaleString()}</p>
                            </div>
                            <div className="bg-[#FAF9F6] p-6 rounded-[32px] border border-[#EBE5DE]/50">
                              <span className="text-[9px] font-bold text-[#C4C0BA] uppercase tracking-widest block mb-2">活躍天數</span>
                              <p className="text-xl font-serif font-bold text-[#2D2926]">{Math.max(0, 30 - s.inactiveDays)} / 30 天</p>
                            </div>
                            <div className="bg-[#FAF9F6] p-6 rounded-[32px] border border-[#EBE5DE]/50">
                              <span className="text-[9px] font-bold text-[#C4C0BA] uppercase tracking-widest block mb-2">會員等級</span>
                              <p className="text-xl font-serif font-bold text-[#2D2926]">{tier}</p>
                            </div>
                          </div>

                          {/* 課堂包資訊 */}
                          {packages.find(p => p.studentName === s.name) ? (
                            <div className="mt-12 md:mt-20 p-10 md:p-16 bg-[#2D2926] rounded-[48px] md:rounded-[64px] text-white relative overflow-hidden group/pkg shadow-2xl">
                              <div className="absolute top-0 right-0 w-64 h-64 bg-[#BA7A56]/20 rounded-full -mr-32 -mt-32 blur-3xl group-hover/pkg:scale-125 transition-transform duration-1000"></div>
                              <div className="relative flex flex-col md:flex-row justify-between items-center gap-10 md:gap-16">
                                <div className="space-y-5 md:space-y-8 text-center md:text-left">
                                  <div className="flex items-center gap-4 justify-center md:justify-start">
                                    <Award className="text-[#BA7A56]" size={24} />
                                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-[4px] md:tracking-[8px] text-[#BA7A56]">Active Package</span>
                                  </div>
                                  <h4 className="text-2xl md:text-4xl font-serif font-bold tracking-tight">剩餘課堂數</h4>
                                  <p className="text-sm md:text-lg text-white/60 font-medium max-w-md">{packages.find(p => p.studentName === s.name)?.notes}</p>
                                </div>
                                <div className="flex items-center gap-10 md:gap-20">
                                  <div className="text-center">
                                    <span className="text-[10px] md:text-xs uppercase tracking-[4px] text-white/40 font-bold block mb-3 md:mb-4">已使用</span>
                                    <p className="text-3xl md:text-6xl font-serif font-bold">{packages.find(p => p.studentName === s.name)?.usedClasses}</p>
                                  </div>
                                  <div className="w-px h-16 md:h-24 bg-white/10"></div>
                                  <div className="text-center">
                                    <span className="text-[10px] md:text-xs uppercase tracking-[4px] text-[#BA7A56] font-bold block mb-3 md:mb-4">剩餘</span>
                                    <p className="text-4xl md:text-8xl font-serif font-bold text-[#BA7A56] tracking-tighter">
                                      {packages.find(p => p.studentName === s.name)!.totalClasses - packages.find(p => p.studentName === s.name)!.usedClasses}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-4 w-full md:w-auto">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleUseClass(s.name); }}
                                    disabled={packages.find(p => p.studentName === s.name)!.usedClasses >= packages.find(p => p.studentName === s.name)!.totalClasses}
                                    className="bg-[#BA7A56] hover:bg-[#BA7A56]/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-10 py-5 rounded-[24px] font-bold text-sm shadow-xl transition-all hover:-translate-y-1"
                                  >
                                    執行消課
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setEditingPackage(packages.find(p => p.studentName === s.name) || null); setIsPackageModalOpen(true); }}
                                    className="text-white/40 hover:text-[#BA7A56] text-[10px] font-bold uppercase tracking-widest transition-colors text-center"
                                  >
                                    管理課堂包
                                  </button>
                                </div>
                              </div>
                              <div className="mt-10 md:mt-16 h-2 md:h-3 bg-white/5 rounded-full overflow-hidden shadow-inner">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(packages.find(p => p.studentName === s.name)!.usedClasses / packages.find(p => p.studentName === s.name)!.totalClasses) * 100}%` }}
                                  className="h-full bg-[#BA7A56] shadow-[0_0_20px_rgba(186,122,86,0.5)]"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="mt-12 md:mt-20 p-12 md:p-20 bg-[#FAF9F6] rounded-[48px] md:rounded-[64px] border-2 border-dashed border-[#EBE5DE] text-center group/add">
                              <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-sm group-hover/add:scale-110 transition-transform duration-500">
                                <Plus className="text-[#BA7A56]" size={32} />
                              </div>
                              <h4 className="text-xl md:text-2xl font-serif font-bold text-[#2D2926] mb-4">尚無活躍課堂方案</h4>
                              <p className="text-sm text-[#857E75] mb-10 max-w-xs mx-auto">為學員建立新的課堂包，輕鬆追蹤上課進度與剩餘堂數。</p>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setEditingPackage({ id: '', studentName: s.name, totalClasses: 10, usedClasses: 0, purchaseDate: new Date().toISOString().split('T')[0] }); setIsPackageModalOpen(true); }}
                                className="bg-[#2D2926] text-white px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-[3px] hover:bg-[#BA7A56] transition-all shadow-xl"
                              >
                                新增課堂包
                              </button>
                            </div>
                          )}

                          <div className="pt-8 md:pt-12 mt-8 md:mt-12 border-t border-[#EBE5DE]/50 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                            <div className="md:col-span-2 space-y-8">
                              <div className="bg-[#FAF9F6] p-6 md:p-8 rounded-2xl md:rounded-[32px] space-y-4 md:space-y-6">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg md:rounded-xl flex items-center justify-center text-[#BA7A56] shadow-sm">
                                      <Calendar size={18} />
                                    </div>
                                    <h5 className="text-[10px] md:text-xs font-bold text-[#2D2926] tracking-widest uppercase">最近點名紀錄</h5>
                                  </div>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setView('attendance'); setFilterName(s.name); }}
                                    className="text-[8px] md:text-[10px] text-[#BA7A56] font-bold hover:underline"
                                  >
                                    查看全部
                                  </button>
                                </div>
                                <div className="space-y-2 md:space-y-3">
                                  {attendance.filter(a => a.studentName === s.name).slice(0, 5).map(record => (
                                    <div key={record.id} className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-[#EBE5DE]/50 flex justify-between items-center">
                                      <div>
                                        <p className="text-xs md:text-sm font-bold text-[#2D2926]">{record.courseTitle}</p>
                                        <p className="text-[8px] md:text-[10px] text-[#857E75] mt-0.5 md:mt-1">{record.date}</p>
                                      </div>
                                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#8FA895]"></div>
                                    </div>
                                  ))}
                                  {attendance.filter(a => a.studentName === s.name).length === 0 && (
                                    <p className="text-xs md:text-sm text-[#C4C0BA] italic text-center py-4">尚無點名紀錄</p>
                                  )}
                                </div>
                              </div>

                              {/* 媒材偏好分析圖表 */}
                              <div className="bg-[#FAF9F6] p-8 rounded-[32px] space-y-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#BA7A56] shadow-sm">
                                    <PieChart size={18} />
                                  </div>
                                  <h5 className="text-xs font-bold text-[#2D2926] tracking-widest uppercase">媒材偏好分佈</h5>
                                </div>
                                <div className="h-48 w-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={Object.entries(s.categoryCounts).map(([name, value]) => ({ name, value }))}>
                                      <XAxis dataKey="name" hide />
                                      <YAxis hide />
                                      <Tooltip 
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                                      />
                                      <Bar dataKey="value" fill="#BA7A56" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                                <div className="flex flex-wrap gap-4 justify-center">
                                  {Object.entries(s.categoryCounts).map(([name, count]) => (
                                    <div key={name} className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-[#BA7A56]"></div>
                                      <span className="text-[10px] font-bold text-[#857E75] uppercase tracking-widest">{name} ({count})</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-6">
                              <div className="bg-[#FAF9F6] p-6 md:p-8 rounded-2xl md:rounded-[32px] space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg md:rounded-xl flex items-center justify-center text-[#BA7A56] shadow-sm">
                                    <Receipt size={18} />
                                  </div>
                                  <h5 className="text-[10px] md:text-xs font-bold text-[#2D2926] tracking-widest uppercase">最近交易</h5>
                                </div>
                                <div className="space-y-3">
                                  {transactions
                                    .filter(t => normalizeName(t.name) === s.name)
                                    .sort((a, b) => b.date.localeCompare(a.date))
                                    .slice(0, 3)
                                    .map(t => (
                                      <div key={t.id} className="bg-white p-4 rounded-2xl border border-[#EBE5DE]/50 group/tx relative overflow-hidden">
                                        <div className="flex justify-between items-start mb-1">
                                          <p className="text-[10px] font-bold text-[#2D2926] truncate max-w-[100px]">{t.course}</p>
                                          <div className="flex items-center gap-2">
                                            <button 
                                              onClick={(e) => { e.stopPropagation(); setSelectedTxForReceipt(t); setIsReceiptModalOpen(true); }}
                                              className="opacity-0 group-hover/tx:opacity-100 text-[#BA7A56] hover:scale-110 transition-all"
                                            >
                                              <Receipt size={12} />
                                            </button>
                                            <p className="text-[10px] font-serif font-bold text-[#BA7A56]">${t.amount}</p>
                                          </div>
                                        </div>
                                        <p className="text-[8px] text-[#857E75]">{t.date}</p>
                                      </div>
                                    ))}
                                  {transactions.filter(t => normalizeName(t.name) === s.name).length === 0 && (
                                    <p className="text-[10px] text-[#C4C0BA] italic text-center py-4">尚無交易紀錄</p>
                                  )}
                                </div>
                              </div>

                              {/* 快速操作選單 */}
                              <div className="bg-[#2D2926] p-8 rounded-[32px] space-y-6 shadow-xl">
                                <h5 className="text-[10px] font-bold text-white/40 tracking-widest uppercase">快速操作 Quick Actions</h5>
                                <div className="grid grid-cols-1 gap-3">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleUseClass(s.name); }}
                                    className="w-full bg-[#BA7A56] text-white py-4 rounded-2xl text-xs font-bold hover:bg-[#BA7A56]/90 transition-all flex items-center justify-center gap-3"
                                  >
                                    <CheckCircle2 size={16} /> 執行消課
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setEditingPackage({ id: '', studentName: s.name, totalClasses: 10, usedClasses: 0, purchaseDate: new Date().toISOString().split('T')[0], status: 'active', price: 0 }); setIsPackageModalOpen(true); }}
                                    className="w-full bg-white/10 text-white py-4 rounded-2xl text-xs font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-3"
                                  >
                                    <Plus size={16} /> 購買新方案
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setEditingStudent(s); setIsModalOpen(true); }}
                                    className="w-full bg-white/5 text-white/60 py-4 rounded-2xl text-xs font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                                  >
                                    <Edit2 size={16} /> 編輯檔案
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      <div className="mt-8 md:mt-10 flex items-center justify-between pt-6 md:pt-8 border-t border-[#EBE5DE]/30">
                        <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tierColor }}></div>
                          {tier}
                        </div>
                        <div className="flex items-center gap-2 text-[#BA7A56] text-[8px] md:text-[10px] font-bold uppercase tracking-widest">
                          {isExpanded ? '收合詳情' : '點擊查看藝術旅程'}
                          <ChevronRight size={12} md:size={14} className={`transition-transform duration-500 ${isExpanded ? 'rotate-90' : ''}`} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {(view === 'courses' || view === 'mediums') && (
          <div className="space-y-12">
            <BentoCard className="!p-10" title={view === 'courses' ? "課程篩選" : "媒材篩選"} icon={Filter}>
              <div className="flex justify-end mb-6">
                <button 
                  onClick={() => { setCourseFilterCategory(''); setCourseFilterMinPrice(''); setCourseFilterMaxPrice(''); }}
                  className="text-[#BA7A56] text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-2"
                >
                  <X size={14} /> 顯示全部{view === 'courses' ? '課程' : '媒材'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                <div className="md:col-span-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-[2px] ml-4">媒材分類</span>
                    <select 
                      value={courseFilterCategory} 
                      onChange={(e) => setCourseFilterCategory(e.target.value)} 
                      className="w-full bg-[#FAF9F6] border-0 rounded-[24px] px-8 py-5 text-sm font-medium appearance-none"
                    >
                      <option value="">所有媒材</option>
                      {courseCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="md:col-span-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-[2px] ml-4">最低價格</span>
                    <input 
                      type="number" 
                      value={courseFilterMinPrice} 
                      onChange={(e) => setCourseFilterMinPrice(e.target.value)} 
                      placeholder="0" 
                      className="w-full bg-[#FAF9F6] border-0 rounded-[24px] px-8 py-5 text-sm font-medium" 
                    />
                  </div>
                </div>
                <div className="md:col-span-3">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-[2px] ml-4">最高價格</span>
                    <input 
                      type="number" 
                      value={courseFilterMaxPrice} 
                      onChange={(e) => setCourseFilterMaxPrice(e.target.value)} 
                      placeholder="無上限" 
                      className="w-full bg-[#FAF9F6] border-0 rounded-[24px] px-8 py-5 text-sm font-medium" 
                    />
                  </div>
                </div>
                <div className="md:col-span-3 flex gap-2">
                  <button onClick={() => { setCourseFilterCategory(''); setCourseFilterMinPrice(''); setCourseFilterMaxPrice(''); }} className="flex-1 bg-white border border-[#EBE5DE] py-5 rounded-[24px] text-[10px] font-bold uppercase tracking-widest hover:bg-[#FAF9F6] transition-colors">重設</button>
                  <label className="flex-1 bg-[#2D2926] text-white py-5 rounded-[24px] text-[10px] font-bold uppercase tracking-widest flex items-center justify-center cursor-pointer hover:bg-[#BA7A56] transition-colors">
                    匯入
                    <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleImportCoursesExcel} />
                  </label>
                  <button onClick={exportCoursesCSV} className="flex-1 bg-[#2D2926] text-white py-5 rounded-[24px] text-[10px] font-bold uppercase tracking-widest hover:bg-[#BA7A56] transition-colors">導出</button>
                </div>
              </div>
            </BentoCard>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-10">
              {filteredCourses.map(course => (
                <div 
                  key={course.id} 
                  onClick={() => setExpandedCourseId(expandedCourseId === course.id ? null : course.id)}
                  className={`bg-white rounded-[32px] md:rounded-[48px] overflow-hidden shadow-sm border border-[#EBE5DE] hover:shadow-xl transition-all duration-500 group cursor-pointer ${expandedCourseId === course.id ? 'col-span-1 md:col-span-2 lg:col-span-3' : ''}`}
                >
                  <div className={`relative transition-all duration-500 ${expandedCourseId === course.id ? 'h-48 md:h-64' : 'h-32 md:h-40'}`} style={{ backgroundColor: course.color + '20' }}>
                     <div className="absolute top-4 right-4 md:top-6 md:right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingCourse(course); setIsCourseModalOpen(true); }}
                          className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center text-[#BA7A56] shadow-lg hover:scale-110 transition-transform"
                          title="編輯"
                        >
                          <Edit2 size={14} md:size={16} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id); }}
                          className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center text-red-400 shadow-lg hover:scale-110 transition-transform"
                          title="刪除"
                        >
                          <Trash2 size={14} md:size={16} />
                        </button>
                     </div>
                     {expandedCourseId === course.id && (
                       <div className="absolute bottom-4 left-6 right-6 md:bottom-6 md:left-10 md:right-10 flex justify-between items-end animate-in fade-in slide-in-from-bottom-4 duration-700">
                         <div className="space-y-1 md:space-y-2">
                           <span className="px-2 py-0.5 md:px-3 md:py-1 bg-white/50 backdrop-blur-md rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-[#2D2926]">
                             {course.category}
                           </span>
                           <h3 className="text-2xl md:text-4xl font-serif font-bold text-[#2D2926]">{course.title}</h3>
                         </div>
                         {view !== 'mediums' && (
                           <span className="text-2xl md:text-4xl font-serif font-bold text-[#BA7A56]">${course.price.toLocaleString()}</span>
                         )}
                       </div>
                     )}
                  </div>
                  <div className="p-6 md:p-10 space-y-4 md:space-y-6">
                    {expandedCourseId !== course.id && (
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg md:text-xl font-serif font-bold text-[#2D2926]">{course.title}</h3>
                        <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[8px] md:text-[9px] font-bold uppercase tracking-widest ${course.active ? 'bg-[#E8F5E9] text-[#388E3C]' : 'bg-[#F5F5F5] text-[#857E75]'}`}>
                          {course.active ? (view === 'mediums' ? '販售中' : '開課中') : (view === 'mediums' ? '已停售' : '已停開')}
                        </span>
                      </div>
                    )}
                    
                    <p className={`text-xs md:text-sm text-[#857E75] ${expandedCourseId === course.id ? 'leading-relaxed md:text-base' : 'line-clamp-2'}`}>
                      {course.description}
                    </p>
                    
                    {view === 'courses' && course.mediums && course.mediums.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {course.mediums.map(mId => {
                          const medium = courses.find(c => c.id === mId);
                          return medium ? (
                            <span key={mId} className="px-2 py-1 md:px-3 md:py-1.5 bg-[#FAF9F6] text-[#857E75] text-[8px] md:text-[10px] font-bold rounded-full border border-[#EBE5DE]">
                              {medium.title}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-[#EBE5DE]/50">
                       {expandedCourseId !== course.id ? (
                         view !== 'mediums' ? (
                           <span className="text-xl md:text-2xl font-serif font-bold text-[#BA7A56]">${course.price.toLocaleString()}</span>
                         ) : (
                           <span className="text-xl md:text-2xl font-serif font-bold text-[#BA7A56] opacity-0">$0</span>
                         )
                       ) : (
                         <div className="flex items-center gap-3 md:gap-4">
                           <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[8px] md:text-[9px] font-bold uppercase tracking-widest ${course.active ? 'bg-[#E8F5E9] text-[#388E3C]' : 'bg-[#F5F5F5] text-[#857E75]'}`}>
                             {course.active ? (view === 'mediums' ? '販售中' : '開課中') : (view === 'mediums' ? '已停售' : '已停開')}
                           </span>
                           <span className="text-[8px] md:text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest">
                             ID: {course.id.split('_').pop()}
                           </span>
                         </div>
                       )}
                       
                       <div className="flex items-center gap-3 md:gap-4 ml-auto">
                         {expandedCourseId !== course.id && (
                           <div className="text-[8px] md:text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest">{course.category}</div>
                         )}
                         <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             setEditingTx({ id: '', date: new Date().toISOString().split('T')[0], name: '', course: view === 'mediums' ? '無' : course.title, medium: view === 'mediums' ? course.title : '', amount: course.price, paid: false, year: '' });
                             setIsModalOpen(true);
                           }}
                           className="bg-[#2D2926] text-white px-4 py-2 md:px-6 md:py-3 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-[#BA7A56] transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                         >
                           {view === 'mediums' ? '購買' : '報名'}
                         </button>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'expenses' && (
          <div className="space-y-8 md:space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
              <MetricStat label="本月總支出" value={`$${expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}`} sub="營運與雜項支出" icon={CreditCard} color="#D32F2F" />
              <MetricStat label="最大支出類別" value={
                (Object.entries(expenses.reduce((acc, e) => {
                  acc[e.category] = (acc[e.category] || 0) + e.amount;
                  return acc;
                }, {} as Record<string, number>)) as [string, number][]).sort((a, b) => b[1] - a[1])[0]?.[0] || '無'
              } sub="佔比最高項目" icon={Target} color="#BA7A56" />
              <MetricStat label="支出筆數" value={`${expenses.length}`} sub="當前記錄總數" icon={Layers} color="#8A9A8A" />
            </div>

            <BentoCard title="支出明細清單" icon={CreditCard}>
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-[#EBE5DE]">
                      <th className="py-6 px-4 text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest">日期</th>
                      <th className="py-6 px-4 text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest">類別</th>
                      <th className="py-6 px-4 text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest">描述</th>
                      <th className="py-6 px-4 text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest text-right">金額</th>
                      <th className="py-6 px-4 text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.length > 0 ? expenses.map(item => (
                      <tr key={item.id} className="border-b border-[#FAF9F6] hover:bg-[#FAF9F6] transition-colors group">
                        <td className="py-6 px-4 text-sm font-bold text-[#2D2926]">{item.date}</td>
                        <td className="py-6 px-4">
                          <span className="bg-[#EBE5DE] text-[#BA7A56] text-[10px] px-3 py-1 rounded-full font-bold">{item.category}</span>
                        </td>
                        <td className="py-6 px-4 text-sm text-[#857E75]">{item.description}</td>
                        <td className="py-6 px-4 text-right font-serif font-bold text-[#2D2926]">${item.amount.toLocaleString()}</td>
                        <td className="py-6 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => { setEditingExpense(item); setIsExpenseModalOpen(true); }}
                              className="text-[#BA7A56] hover:bg-[#BA7A56]/10 p-2 rounded-xl transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={async () => {
                                if (confirm('確定要刪除此筆支出嗎？')) {
                                  try {
                                    await deleteDoc(doc(db, 'expenses', item.id));
                                  } catch (err) {
                                    handleFirestoreError(err, OperationType.DELETE, `expenses/${item.id}`);
                                  }
                                }
                              }}
                              className="text-red-400 hover:bg-red-50 p-2 rounded-xl transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="py-20 text-center text-[#C4C0BA] italic text-sm">目前尚無支出記錄</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </BentoCard>
          </div>
        )}

        {view === 'reports' && (
          <div className="space-y-8 md:space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2D2926]">經營數據分析</h2>
                <p className="text-sm text-[#857E75]">視覺化呈現畫室營運狀況與財務趨勢</p>
              </div>
              <button 
                onClick={exportMonthlyReport}
                className="w-full md:w-auto bg-[#2D2926] text-white px-8 py-4 rounded-[24px] font-bold text-sm shadow-xl hover:bg-[#BA7A56] transition-all flex items-center justify-center gap-2"
              >
                <Download size={18} /> 匯出年度報表
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              <BentoCard title="年度損益趨勢" icon={TrendingUp}>
                <div className="h-[300px] md:h-[400px] w-full mt-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.profitLossHistory}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBE5DE" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#857E75' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#857E75' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold', padding: '4px 0' }}
                      />
                      <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingBottom: '30px' }} />
                      <Bar dataKey="revenue" name="營收" fill="#BA7A56" radius={[6, 6, 0, 0]} barSize={24} />
                      <Bar dataKey="expenses" name="支出" fill="#D32F2F" radius={[6, 6, 0, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </BentoCard>

              <BentoCard title="學員流失風險分析" icon={Users}>
                <div className="space-y-8 mt-8">
                  <div className="p-8 bg-[#FAF9F6] rounded-[40px] border border-[#EBE5DE]/50 shadow-inner">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-sm font-bold text-[#2D2926]">高風險學員 (超過 30 天未活動)</h4>
                      <span className="bg-red-100 text-red-500 text-[10px] px-4 py-1.5 rounded-full font-bold uppercase tracking-widest">
                        {topStudents.filter(s => (s as any).isAtRisk).length} 位
                      </span>
                    </div>
                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
                      {topStudents.filter(s => (s as any).isAtRisk).map(s => (
                        <div key={s.name} className="bg-white p-6 rounded-[28px] border border-[#EBE5DE]/30 flex justify-between items-center group hover:border-[#BA7A56]/30 transition-all hover:shadow-md">
                          <div>
                            <p className="text-base font-bold text-[#2D2926]">{s.name}</p>
                            <p className="text-[10px] text-red-400 mt-1 font-bold uppercase tracking-wider">已中斷 { (s as any).inactiveDays } 天</p>
                          </div>
                          <button 
                            onClick={() => { setView('students'); setExpandedStudent(s.name); }}
                            className="text-[10px] font-bold text-[#BA7A56] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all bg-[#BA7A56]/10 px-4 py-2 rounded-full"
                          >
                            查看詳情
                          </button>
                        </div>
                      ))}
                      {topStudents.filter(s => (s as any).isAtRisk).length === 0 && (
                        <div className="flex flex-col items-center gap-4 py-12 text-[#C4C0BA]">
                          <Award size={48} className="opacity-20" />
                          <p className="text-sm font-bold italic">目前無流失風險學員</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </BentoCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              <BentoCard title="庫存價值摘要" icon={Layers}>
                <div className="mt-8 space-y-8">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[10px] text-[#C4C0BA] font-bold uppercase tracking-widest">預估庫存總值</span>
                      <h3 className="text-4xl font-serif font-bold text-[#2D2926] mt-2 tracking-tighter">
                        ${inventory.reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0).toLocaleString()}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#C4C0BA] font-bold uppercase tracking-widest">品項總數</span>
                      <p className="text-2xl font-serif font-bold text-[#BA7A56]">{inventory.length}</p>
                    </div>
                  </div>
                  <div className="pt-8 border-t border-[#EBE5DE]/50 space-y-5">
                    {[...inventory].sort((a, b) => (b.quantity * b.costPerUnit) - (a.quantity * a.costPerUnit)).slice(0, 3).map(item => (
                      <div key={item.id} className="flex justify-between items-center">
                        <span className="text-sm text-[#857E75] font-bold">{item.name}</span>
                        <span className="text-sm font-bold text-[#2D2926] font-mono">${(item.quantity * item.costPerUnit).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </BentoCard>

              <BentoCard title="年度營運概況" icon={Award}>
                <div className="mt-8 space-y-10">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-[#F2EDE4] rounded-[32px] flex items-center justify-center text-[#BA7A56] shadow-inner">
                      <TrendingUp size={40} />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#C4C0BA] font-bold uppercase tracking-widest">年度利潤率</p>
                      <p className="text-3xl font-serif font-bold text-[#2D2926] mt-1">
                        {analytics.totalRev > 0 ? ((analytics.netProfit / analytics.totalRev) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#857E75] font-bold">總營收</span>
                      <span className="text-sm font-bold text-[#BA7A56] font-mono">${analytics.totalRev.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#857E75] font-bold">總支出</span>
                      <span className="text-sm font-bold text-red-400 font-mono">-${analytics.totalExpenses.toLocaleString()}</span>
                    </div>
                    <div className="pt-6 border-t border-[#EBE5DE]/50 flex justify-between items-center">
                      <span className="text-base font-bold text-[#2D2926]">淨利</span>
                      <span className="text-base font-bold text-[#8A9A8A] font-mono">${analytics.netProfit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </BentoCard>

              <BentoCard title="課程營收佔比" icon={Target}>
                <div className="h-[280px] w-full mt-8">
                   <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.topCourses} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis dataKey="0" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#857E75' }} width={100} />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                      />
                      <Bar dataKey="1" name="銷售次數" fill="#8A9A8A" radius={[0, 6, 6, 0]} barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </BentoCard>
            </div>
          </div>
        )}

        {view === 'schedules' && (
          <div className="space-y-8 md:space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2D2926]">課程課表管理</h2>
                <p className="text-sm text-[#857E75]">規劃畫室每週課程時段與教室配置</p>
              </div>
              <button 
                onClick={() => { setEditingSchedule(null); setIsScheduleModalOpen(true); }}
                className="w-full md:w-auto bg-[#2D2926] text-white px-8 py-4 rounded-[24px] font-bold text-sm shadow-xl hover:bg-[#BA7A56] transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} /> 新增時段
              </button>
            </div>

            <div className="overflow-x-auto -mx-6 px-6 pb-8 custom-scrollbar">
              <div className="grid grid-cols-7 gap-6 md:gap-8 min-w-[1200px]">
                {['週日', '週一', '週二', '週三', '週四', '週五', '週六'].map((day, idx) => (
                  <div key={day} className="space-y-6 md:space-y-8">
                    <div className="text-center py-5 md:py-6 bg-white rounded-[28px] border border-[#EBE5DE] shadow-sm">
                      <span className="text-[10px] md:text-xs font-bold text-[#2D2926] uppercase tracking-[3px]">{day}</span>
                    </div>
                    <div className="space-y-4 md:space-y-6">
                      {schedules
                        .filter(s => s.dayOfWeek === idx)
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map(sch => (
                          <motion.div 
                            key={sch.id}
                            layoutId={sch.id}
                            whileHover={{ y: -4 }}
                            onClick={() => { setEditingSchedule(sch); setIsScheduleModalOpen(true); }}
                            className="bg-white p-5 md:p-6 rounded-[32px] border border-[#EBE5DE] shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
                          >
                            <div className="absolute top-0 left-0 w-1.5 md:w-2 h-full" style={{ backgroundColor: sch.color }}></div>
                            <p className="text-[10px] md:text-[11px] font-bold text-[#BA7A56] mb-2 font-mono">{sch.startTime} - {sch.endTime}</p>
                            <h4 className="text-sm md:text-base font-bold text-[#2D2926] leading-tight mb-3">{sch.courseTitle}</h4>
                            <div className="flex flex-wrap items-center gap-3 text-[9px] md:text-[10px] text-[#C4C0BA] font-bold uppercase tracking-wider">
                              <div className="flex items-center gap-1">
                                <Users size={12} /> {sch.instructor}
                              </div>
                              {sch.room && (
                                <div className="flex items-center gap-1">
                                  <div className="w-1 h-1 rounded-full bg-[#C4C0BA]"></div>
                                  <span>{sch.room}</span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      {schedules.filter(s => s.dayOfWeek === idx).length === 0 && (
                        <div className="py-12 md:py-16 border-2 border-dashed border-[#EBE5DE]/50 rounded-[32px] flex items-center justify-center text-[#C4C0BA] bg-[#FAF9F6]/30">
                          <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-40">無課程安排</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {view === 'attendance' && (
          <div className="space-y-8 md:space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2D2926]">點名紀錄管理</h2>
                <p className="text-sm text-[#857E75]">追蹤學員出席狀況與剩餘課堂數</p>
              </div>
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#C4C0BA]" size={20} />
                  <input 
                    type="text" 
                    placeholder="搜尋學員姓名..." 
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    className="w-full bg-white border border-[#EBE5DE] rounded-[24px] pl-16 pr-8 py-5 text-sm font-bold focus:ring-2 focus:ring-[#BA7A56]/20 transition-all"
                  />
                </div>
                <button 
                  onClick={() => {
                    const csv = "學員姓名,日期,課程內容,備註\n" + attendance.map(a => `${a.studentName},${a.date},${a.courseTitle},${a.notes || ''}`).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = `Attendance_${new Date().toISOString().split('T')[0]}.csv`;
                    link.click();
                  }}
                  className="w-full md:w-auto bg-[#FAF9F6] text-[#2D2926] border border-[#EBE5DE] px-10 py-5 rounded-[24px] font-bold text-sm shadow-sm hover:bg-[#F2EDE4] transition-all flex items-center justify-center gap-3"
                >
                  <Download size={18} /> 匯出紀錄
                </button>
              </div>
            </div>

            <BentoCard title="全體點名歷史" icon={Calendar}>
              <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-[#FAF9F6] text-[#C4C0BA] text-[10px] font-bold uppercase tracking-[3px]">
                      <th className="px-12 py-8">日期</th>
                      <th className="px-8 py-8">學員姓名</th>
                      <th className="px-8 py-8">課程內容</th>
                      <th className="px-12 py-8 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE5DE]/30">
                    {attendance.filter(a => a.studentName.toLowerCase().includes(filterName.toLowerCase())).length > 0 ? 
                      attendance
                        .filter(a => a.studentName.toLowerCase().includes(filterName.toLowerCase()))
                        .map((record) => (
                        <tr key={record.id} className="hover:bg-[#FAF9F6]/50 transition-all group">
                          <td className="px-12 py-8 font-mono text-xs font-bold text-[#857E75]">{record.date}</td>
                          <td className="px-8 py-8">
                            <p className="text-base font-bold text-[#2D2926]">{record.studentName}</p>
                          </td>
                          <td className="px-8 py-8">
                            <p className="text-sm font-bold text-[#857E75]">{record.courseTitle}</p>
                          </td>
                          <td className="px-12 py-8 text-right">
                            <button 
                              onClick={async () => {
                                if (confirm('確定要刪除此點名紀錄嗎？這不會恢復已扣除的課堂數。')) {
                                  try {
                                    await deleteDoc(doc(db, 'attendance', record.id));
                                  } catch (err) {
                                    handleFirestoreError(err, OperationType.DELETE, `attendance/${record.id}`);
                                  }
                                }
                              }}
                              className="w-10 h-10 bg-[#FAF9F6] text-[#C4C0BA] rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="py-24 text-center">
                            <div className="flex flex-col items-center gap-4 text-[#C4C0BA]">
                              <Calendar size={48} className="opacity-20" />
                              <p className="font-bold italic">目前尚無點名紀錄</p>
                            </div>
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>
            </BentoCard>
          </div>
        )}

        {view === 'inventory' && (
          <div className="space-y-8 md:space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2D2926]">物資庫存管理</h2>
                <p className="text-sm text-[#857E75]">監控畫具、耗材庫存與成本價值</p>
              </div>
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#C4C0BA]" size={20} />
                  <input 
                    type="text" 
                    placeholder="搜尋品項名稱..." 
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    className="w-full bg-white border border-[#EBE5DE] rounded-[24px] pl-16 pr-8 py-5 text-sm font-bold focus:ring-2 focus:ring-[#BA7A56]/20 transition-all"
                  />
                </div>
                <button 
                  onClick={() => { setEditingInventory(null); setIsInventoryModalOpen(true); }}
                  className="w-full md:w-auto bg-[#2D2926] text-white px-10 py-5 rounded-[24px] font-bold text-sm shadow-xl hover:bg-[#BA7A56] transition-all flex items-center justify-center gap-3"
                >
                  <Plus size={18} /> 新增品項
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              <MetricStat label="庫存總品項" value={`${inventory.length}`} sub="當前管理物資數" icon={Layers} color="#BA7A56" />
              <MetricStat label="低庫存警示" value={`${inventory.filter(i => i.quantity <= i.minQuantity).length}`} sub="需及時採購項目" icon={Target} color="#D32F2F" />
              <MetricStat label="預估庫存價值" value={`$${inventory.reduce((sum, i) => sum + i.quantity * i.costPerUnit, 0).toLocaleString()}`} sub="資產流動性參考" icon={CreditCard} color="#8A9A8A" />
            </div>

            <BentoCard title="物資庫存清單" icon={Layers}>
              <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-[#FAF9F6] text-[#C4C0BA] text-[10px] font-bold uppercase tracking-[3px]">
                      <th className="px-12 py-8">品項名稱</th>
                      <th className="px-8 py-8">分類</th>
                      <th className="px-8 py-8">當前庫存</th>
                      <th className="px-8 py-8">單位成本</th>
                      <th className="px-8 py-8">最後進貨</th>
                      <th className="px-12 py-8 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE5DE]/30">
                    {inventory.filter(i => i.name.toLowerCase().includes(filterName.toLowerCase())).length > 0 ? 
                      inventory
                        .filter(i => i.name.toLowerCase().includes(filterName.toLowerCase()))
                        .map(item => (
                        <tr key={item.id} className="hover:bg-[#FAF9F6]/50 transition-all group">
                          <td className="px-12 py-8">
                            <div className="flex items-center gap-3">
                              <span className="text-base font-bold text-[#2D2926]">{item.name}</span>
                              {item.quantity <= item.minQuantity && (
                                <span className="bg-red-50 text-red-500 text-[9px] px-3 py-1 rounded-full font-bold uppercase tracking-widest animate-pulse">低庫存</span>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-8 text-sm font-bold text-[#857E75] uppercase tracking-wider">{item.category}</td>
                          <td className="px-8 py-8">
                            <span className={`text-lg font-serif font-bold ${item.quantity <= item.minQuantity ? 'text-red-500' : 'text-[#2D2926]'}`}>
                              {item.quantity} <span className="text-[10px] text-[#C4C0BA] uppercase ml-1">{item.unit}</span>
                            </span>
                          </td>
                          <td className="px-8 py-8 text-sm font-bold text-[#857E75] font-mono">${item.costPerUnit}</td>
                          <td className="px-8 py-8 text-sm font-bold text-[#C4C0BA] font-mono">{item.lastRestocked}</td>
                          <td className="px-12 py-8 text-right">
                            <button 
                              onClick={() => { setEditingInventory(item); setIsInventoryModalOpen(true); }}
                              className="w-10 h-10 bg-[#FAF9F6] text-[#BA7A56] rounded-xl flex items-center justify-center hover:bg-[#BA7A56] hover:text-white transition-all shadow-sm"
                            >
                              <Edit2 size={18} />
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="py-24 text-center">
                            <div className="flex flex-col items-center gap-4 text-[#C4C0BA]">
                              <Layers size={48} className="opacity-20" />
                              <p className="font-bold italic">目前尚無庫存記錄</p>
                            </div>
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>
            </BentoCard>
          </div>
        )}

        {view === 'settings' && (
          <div className="max-w-4xl space-y-8 md:space-y-12">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2D2926]">系統設定</h2>
              <p className="text-sm text-[#857E75]">管理畫室基本資訊與商業化功能配置</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
              <div className="lg:col-span-2 space-y-8 md:space-y-12">
                <BentoCard title="畫室經營設定" icon={Settings}>
                  <form onSubmit={handleSaveSettings} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest ml-4">畫室名稱</label>
                        <input name="studioName" type="text" defaultValue={receiptInfo.studioName} required className="w-full bg-[#FAF9F6] border border-[#EBE5DE] rounded-[24px] px-8 py-5 text-sm font-bold focus:ring-2 focus:ring-[#BA7A56]/20 transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest ml-4">聯絡電話</label>
                        <input name="studioPhone" type="text" defaultValue={receiptInfo.studioPhone} required className="w-full bg-[#FAF9F6] border border-[#EBE5DE] rounded-[24px] px-8 py-5 text-sm font-bold focus:ring-2 focus:ring-[#BA7A56]/20 transition-all" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest ml-4">畫室地址</label>
                      <input name="studioAddress" type="text" defaultValue={receiptInfo.studioAddress} required className="w-full bg-[#FAF9F6] border border-[#EBE5DE] rounded-[24px] px-8 py-5 text-sm font-bold focus:ring-2 focus:ring-[#BA7A56]/20 transition-all" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest ml-4">銀行匯款資訊</label>
                      <input name="bankInfo" type="text" defaultValue={receiptInfo.bankInfo} placeholder="銀行名稱 (代碼) 帳號: ..." className="w-full bg-[#FAF9F6] border border-[#EBE5DE] rounded-[24px] px-8 py-5 text-sm font-bold focus:ring-2 focus:ring-[#BA7A56]/20 transition-all" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest ml-4">Logo URL (選填)</label>
                      <input name="logoUrl" type="text" defaultValue={receiptInfo.logoUrl} placeholder="https://..." className="w-full bg-[#FAF9F6] border border-[#EBE5DE] rounded-[24px] px-8 py-5 text-sm font-bold focus:ring-2 focus:ring-[#BA7A56]/20 transition-all" />
                    </div>
                    <button type="submit" className="w-full bg-[#2D2926] text-white py-6 rounded-[32px] font-bold shadow-xl hover:bg-[#BA7A56] transition-all active:scale-[0.98]">
                      儲存設定
                    </button>
                  </form>
                </BentoCard>

                <BentoCard title="數據管理" icon={Trash2}>
                  <div className="space-y-6">
                    <p className="text-sm text-[#857E75]">危險區域：此操作將永久刪除所有畫室數據，包括學員、課程、財務與庫存紀錄。</p>
                    <button 
                      onClick={handleResetData}
                      className="w-full md:w-auto bg-red-50 text-red-500 border border-red-100 px-8 py-4 rounded-[24px] font-bold text-sm hover:bg-red-100 transition-all"
                    >
                      重設所有數據
                    </button>
                  </div>
                </BentoCard>
              </div>

              <div className="space-y-8 md:space-y-12">
                <BentoCard dark title="商業化版本" icon={Award}>
                  <div className="space-y-6 text-white/80 text-sm leading-relaxed">
                    <p>Koala Art Studio Finance V16.2 商業化模組已啟動。當前版本支援：</p>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center mt-0.5">
                          <ChevronRight size={12} className="text-[#BA7A56]" />
                        </div>
                        <span>專業收據生成與管理</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center mt-0.5">
                          <ChevronRight size={12} className="text-[#BA7A56]" />
                        </div>
                        <span>物資庫存與成本追蹤</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center mt-0.5">
                          <ChevronRight size={12} className="text-[#BA7A56]" />
                        </div>
                        <span>學員消費行為深度分析</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center mt-0.5">
                          <ChevronRight size={12} className="text-[#BA7A56]" />
                        </div>
                        <span>自定義畫室經營資訊</span>
                      </li>
                    </ul>
                    <div className="pt-8 border-t border-white/10">
                      <p className="text-white/40 text-[10px] uppercase tracking-[3px] font-bold">Powered by Gemini AI & Koala Tech</p>
                    </div>
                  </div>
                </BentoCard>
              </div>
            </div>
          </div>
        )}

        {view === 'finance' && (
          <div className="space-y-8 md:space-y-12">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2D2926]">財務流水帳</h2>
              <p className="text-sm text-[#857E75]">管理所有學員報名與交易紀錄</p>
            </div>

            <BentoCard className="!p-6 md:!p-10" title="數據篩選" icon={Filter}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-end">
                <div className="md:col-span-4 lg:col-span-3">
                  <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#C4C0BA]" size={20} />
                    <input 
                      type="text" 
                      value={filterName} 
                      onChange={(e) => setFilterName(e.target.value)} 
                      placeholder="搜尋學員、課程..." 
                      className="w-full bg-[#FAF9F6] border border-[#EBE5DE] rounded-[24px] pl-16 pr-8 py-5 text-sm font-bold focus:ring-2 focus:ring-[#BA7A56]/20 transition-all" 
                    />
                  </div>
                </div>
                <div className="md:col-span-4 lg:col-span-3">
                   <div className="flex flex-col gap-2">
                     <span className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-[2px] ml-4">起始日期</span>
                     <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-[#FAF9F6] border border-[#EBE5DE] rounded-[24px] px-8 py-5 text-sm font-bold focus:ring-2 focus:ring-[#BA7A56]/20 transition-all" />
                   </div>
                </div>
                <div className="md:col-span-4 lg:col-span-3">
                   <div className="flex flex-col gap-2">
                     <span className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-[2px] ml-4">結束日期</span>
                     <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-[#FAF9F6] border border-[#EBE5DE] rounded-[24px] px-8 py-5 text-sm font-bold focus:ring-2 focus:ring-[#BA7A56]/20 transition-all" />
                   </div>
                </div>
                <div className="md:col-span-12 lg:col-span-3 flex gap-3">
                  <button 
                    onClick={() => {setFilterName(''); setStartDate(''); setEndDate('');}} 
                    className="flex-1 bg-white border border-[#EBE5DE] py-5 rounded-[24px] text-[10px] font-bold uppercase tracking-widest hover:bg-[#FAF9F6] transition-all"
                  >
                    重設
                  </button>
                  <label className="flex-1 bg-[#2D2926] text-white py-5 rounded-[24px] text-[10px] font-bold uppercase tracking-widest flex items-center justify-center cursor-pointer hover:bg-[#BA7A56] transition-all">
                    匯入
                    <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleImportExcel} />
                  </label>
                  <button 
                    onClick={exportCSV} 
                    className="flex-1 bg-[#BA7A56] text-white py-5 rounded-[24px] text-[10px] font-bold uppercase tracking-widest hover:bg-[#2D2926] transition-all shadow-lg shadow-[#BA7A56]/20"
                  >
                    導出
                  </button>
                </div>
              </div>
            </BentoCard>

            <div className="bg-white rounded-[40px] md:rounded-[48px] shadow-sm border border-[#EBE5DE] overflow-hidden">
              <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
                <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-[#FAF9F6] text-[#C4C0BA] text-[10px] font-bold uppercase tracking-[2px]">
                    <tr>
                      <th className="px-12 py-8">日期</th>
                      <th className="px-8 py-8">學員對象 / 項目</th>
                      <th className="px-8 py-8 text-right">金額</th>
                      <th className="px-8 py-8 text-right">狀態</th>
                      <th className="px-12 py-8 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE5DE]/30">
                    {filteredFinance.length > 0 ? filteredFinance.map(t => (
                      <tr key={t.id} className="hover:bg-[#FAF9F6]/50 transition-all group">
                        <td className="px-12 py-8 text-xs font-bold text-[#857E75] font-mono">{t.date}</td>
                        <td className="px-8 py-8">
                          <p className="font-serif font-bold text-lg text-[#2D2926]">{t.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-[10px] text-[#C4C0BA] font-bold uppercase tracking-wider">{t.course}</p>
                            {t.medium && t.medium !== '無' && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EBE5DE] text-[#BA7A56] font-bold">{t.medium}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-8 text-right font-serif font-bold text-[#2D2926] text-xl">${t.amount.toLocaleString()}</td>
                        <td className="px-8 py-8 text-right">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${t.paid ? 'bg-[#E8F5E9] text-[#388E3C]' : 'bg-[#FFEBEE] text-[#D32F2F]'}`}>
                            {t.paid ? '已入帳' : '待核銷'}
                          </span>
                        </td>
                        <td className="px-12 py-8 text-right">
                          <div className="flex justify-end gap-3">
                            <button 
                              onClick={() => setSelectedTxForReceipt(t)}
                              className="w-10 h-10 bg-[#FAF9F6] text-[#BA7A56] rounded-xl flex items-center justify-center hover:bg-[#BA7A56] hover:text-white transition-all shadow-sm"
                              title="生成收據"
                            >
                              <CreditCard size={18} />
                            </button>
                            <button 
                              onClick={() => { setEditingTx(t); setIsModalOpen(true); }} 
                              className="w-10 h-10 bg-[#FAF9F6] text-[#C4C0BA] rounded-xl flex items-center justify-center hover:bg-[#2D2926] hover:text-white transition-all shadow-sm"
                              title="編輯紀錄"
                            >
                              <Settings size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="py-24 text-center">
                          <div className="flex flex-col items-center gap-4 text-[#C4C0BA]">
                            <Search size={48} className="opacity-20" />
                            <p className="font-bold italic">找不到符合條件的財務紀錄</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 編輯視窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#2D2926]/40 backdrop-blur-xl">
          <div className="bg-white w-full max-w-xl rounded-[64px] shadow-2xl p-16 animate-in zoom-in">
            <div className="flex justify-between items-center mb-12">
               <h2 className="font-serif text-3xl font-bold text-[#2D2926]">{editingTx && editingTx.id ? '修改紀錄' : '新增報名'}</h2>
               <button onClick={() => setIsModalOpen(false)} className="text-[#C4C0BA]"><X size={28} /></button>
            </div>
            <form key={editingTx?.id || 'new'} onSubmit={handleSaveTx} className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <input name="date" type="date" required defaultValue={editingTx?.date || new Date().toISOString().split('T')[0]} className="w-full bg-[#FAF9F6] border-0 rounded-[20px] px-6 py-4 text-sm font-bold" />
                <select name="status" defaultValue={editingTx?.paid ? 'true' : 'false'} className="w-full bg-[#FAF9F6] border-0 rounded-[20px] px-6 py-4 text-sm font-bold">
                  <option value="true">已完成付款</option>
                  <option value="false">尚未付款</option>
                </select>
              </div>
              <input name="name" type="text" placeholder="學員姓名" required defaultValue={editingTx?.name || ''} className="w-full bg-[#FAF9F6] border-0 rounded-[20px] px-6 py-4 text-sm font-bold" />
              <div className="grid grid-cols-2 gap-6">
                <select name="course" required defaultValue={editingTx?.course || ''} className="w-full bg-[#FAF9F6] border-0 rounded-[20px] px-6 py-4 text-sm font-bold">
                  <option value="" disabled>請選擇課程</option>
                  <option value="無">無 (僅購買媒材)</option>
                  <optgroup label="課程">
                    {courses.filter(c => c.type !== 'medium').map(c => (
                      <option key={c.id} value={c.title}>{c.title}</option>
                    ))}
                  </optgroup>
                  {editingTx && editingTx.course && editingTx.course !== '無' && !courses.find(c => c.title === editingTx.course && c.type !== 'medium') && (
                    <optgroup label="其他 (歷史資料)">
                      <option value={editingTx.course}>{editingTx.course}</option>
                    </optgroup>
                  )}
                </select>
                <select name="medium" defaultValue={editingTx?.medium || ''} className="w-full bg-[#FAF9F6] border-0 rounded-[20px] px-6 py-4 text-sm font-bold">
                  <option value="">無指定媒材</option>
                  <optgroup label="媒材">
                    {courses.filter(c => c.type === 'medium').map(c => (
                      <option key={c.id} value={c.title}>{c.title}</option>
                    ))}
                  </optgroup>
                  {editingTx && editingTx.medium && !courses.find(c => c.title === editingTx.medium && c.type === 'medium') && (
                    <optgroup label="其他 (歷史資料)">
                      <option value={editingTx.medium}>{editingTx.medium}</option>
                    </optgroup>
                  )}
                </select>
              </div>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[#C4C0BA] font-serif font-bold text-2xl">$</span>
                <input name="amount" type="number" placeholder="金額" required defaultValue={editingTx?.amount || ''} className="w-full bg-[#FAF9F6] border-0 rounded-[20px] pl-12 pr-6 py-6 font-serif font-bold text-3xl" />
              </div>
              <div className="flex gap-4">
                {editingTx && editingTx.id && (
                  <button type="button" onClick={handleDeleteTx} className="w-1/3 bg-[#FFEBEE] text-[#D32F2F] py-6 rounded-[28px] font-bold shadow-xl hover:bg-[#FFCDD2] transition-all">
                    刪除
                  </button>
                )}
                <button type="submit" className={`${editingTx && editingTx.id ? 'w-2/3' : 'w-full'} bg-[#2D2926] text-white py-6 rounded-[28px] font-bold shadow-xl hover:bg-[#BA7A56] transition-all`}>
                  確認儲存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 收據生成視窗 */}
      <AnimatePresence>
        {selectedTxForReceipt && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-[#2D2926]/60 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-12 overflow-y-auto flex-1 print:p-0" id="receipt-content">
                <div className="flex justify-between items-start mb-16">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      {receiptInfo.logoUrl ? (
                        <img src={receiptInfo.logoUrl} alt="Logo" className="w-16 h-16 object-contain rounded-2xl" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-16 h-16 bg-[#BA7A56] rounded-2xl flex items-center justify-center text-white">
                          <Palette size={32} />
                        </div>
                      )}
                      <div>
                        <h1 className="font-serif text-3xl font-bold text-[#2D2926]">{receiptInfo.studioName}</h1>
                        <p className="text-[10px] font-bold text-[#BA7A56] uppercase tracking-[4px]">Official Receipt</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest">收據編號</p>
                    <p className="font-mono text-sm font-bold text-[#2D2926]">#RC-{selectedTxForReceipt.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest mt-4">開立日期</p>
                    <p className="font-mono text-sm font-bold text-[#2D2926]">{selectedTxForReceipt.date}</p>
                  </div>
                </div>

                <div className="space-y-12">
                  <div className="border-b border-[#EBE5DE] pb-8">
                    <p className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest mb-4">學員資訊 / Bill To</p>
                    <p className="font-serif text-2xl font-bold text-[#2D2926]">{selectedTxForReceipt.name} 先生/小姐</p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-12 gap-4 text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest border-b border-[#EBE5DE] pb-4">
                      <div className="col-span-8">項目描述 / Description</div>
                      <div className="col-span-4 text-right">金額 / Amount</div>
                    </div>
                    <div className="grid grid-cols-12 gap-4 py-4 items-center">
                      <div className="col-span-8">
                        <p className="font-bold text-[#2D2926]">{selectedTxForReceipt.course}</p>
                        <p className="text-xs text-[#857E75] mt-1">媒材：{selectedTxForReceipt.medium || '無'}</p>
                      </div>
                      <div className="col-span-4 text-right font-serif font-bold text-xl text-[#2D2926]">
                        ${selectedTxForReceipt.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#FAF9F6] rounded-[32px] p-10 flex justify-between items-center">
                    <p className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest">總計金額 / Total Amount</p>
                    <p className="font-serif text-4xl font-bold text-[#BA7A56]">${selectedTxForReceipt.amount.toLocaleString()}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-12 text-sm">
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest">畫室聯絡資訊 / Contact</p>
                      <div className="space-y-2 text-[#857E75]">
                        <p className="flex items-center gap-2"><CreditCard size={14} /> {receiptInfo.studioPhone}</p>
                        <p className="flex items-center gap-2 leading-relaxed"><Target size={14} /> {receiptInfo.studioAddress}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest">匯款資訊 / Payment</p>
                      <div className="p-4 bg-white border border-[#EBE5DE] rounded-2xl text-[11px] font-bold text-[#2D2926] leading-relaxed">
                        {receiptInfo.bankInfo || '請洽櫃檯'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-20 pt-12 border-t border-[#EBE5DE] text-center space-y-4">
                  <p className="font-serif italic text-[#C4C0BA]">Thank you for creating with us.</p>
                  <div className="flex justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#BA7A56]/20" />
                    <div className="w-2 h-2 rounded-full bg-[#BA7A56]/40" />
                    <div className="w-2 h-2 rounded-full bg-[#BA7A56]/20" />
                  </div>
                </div>
              </div>

              <div className="p-8 bg-[#FAF9F6] border-t border-[#EBE5DE] flex gap-4">
                <button 
                  onClick={() => window.print()}
                  className="flex-1 bg-[#2D2926] text-white py-5 rounded-[24px] font-bold flex items-center justify-center gap-3 hover:bg-[#BA7A56] transition-all"
                >
                  <Download size={20} /> 列印收據
                </button>
                <button 
                  onClick={() => setSelectedTxForReceipt(null)}
                  className="px-10 bg-white border border-[#EBE5DE] text-[#2D2926] py-5 rounded-[24px] font-bold hover:bg-[#F2EDE4] transition-all"
                >
                  關閉
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 庫存編輯視窗 */}
      <AnimatePresence>
        {isInventoryModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-[#2D2926]/40 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[64px] shadow-2xl p-16"
            >
              <div className="flex justify-between items-center mb-12">
                 <h2 className="font-serif text-3xl font-bold text-[#2D2926]">{editingInventory ? '修改庫存' : '新增物資'}</h2>
                 <button onClick={() => setIsInventoryModalOpen(false)} className="text-[#C4C0BA]"><X size={28} /></button>
              </div>
              <form onSubmit={handleSaveInventory} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest ml-4">物資名稱</label>
                  <input name="name" type="text" required defaultValue={editingInventory?.name || ''} className="w-full bg-[#FAF9F6] border-0 rounded-[24px] px-8 py-5 text-sm font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest ml-4">分類</label>
                    <input name="category" type="text" required defaultValue={editingInventory?.category || ''} className="w-full bg-[#FAF9F6] border-0 rounded-[24px] px-8 py-5 text-sm font-bold" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest ml-4">單位 (如: 瓶, 盒)</label>
                    <input name="unit" type="text" required defaultValue={editingInventory?.unit || ''} className="w-full bg-[#FAF9F6] border-0 rounded-[24px] px-8 py-5 text-sm font-bold" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest ml-4">當前數量</label>
                    <input name="quantity" type="number" required defaultValue={editingInventory?.quantity || 0} className="w-full bg-[#FAF9F6] border-0 rounded-[24px] px-8 py-5 text-sm font-bold" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest ml-4">安全庫存</label>
                    <input name="minQuantity" type="number" required defaultValue={editingInventory?.minQuantity || 5} className="w-full bg-[#FAF9F6] border-0 rounded-[24px] px-8 py-5 text-sm font-bold" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest ml-4">單位成本</label>
                    <input name="costPerUnit" type="number" required defaultValue={editingInventory?.costPerUnit || 0} className="w-full bg-[#FAF9F6] border-0 rounded-[24px] px-8 py-5 text-sm font-bold" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest ml-4">最後進貨日期</label>
                  <input name="lastRestocked" type="date" required defaultValue={editingInventory?.lastRestocked || new Date().toISOString().split('T')[0]} className="w-full bg-[#FAF9F6] border-0 rounded-[24px] px-8 py-5 text-sm font-bold" />
                </div>
                <button type="submit" className="w-full bg-[#2D2926] text-white py-6 rounded-[32px] font-bold shadow-xl hover:bg-[#BA7A56] transition-all">
                  儲存物資資訊
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 支出編輯視窗 */}
      <AnimatePresence>
        {isExpenseModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-[#2D2926]/40 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[64px] shadow-2xl p-16"
            >
              <div className="flex justify-between items-center mb-12">
                 <h2 className="font-serif text-3xl font-bold text-[#2D2926]">{editingExpense ? '修改支出' : '新增支出'}</h2>
                 <button onClick={() => setIsExpenseModalOpen(false)} className="text-[#C4C0BA]"><X size={28} /></button>
              </div>
              <form onSubmit={handleSaveExpense} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest ml-4">日期</label>
                  <input name="date" type="date" required defaultValue={editingExpense?.date || new Date().toISOString().split('T')[0]} className="w-full bg-[#FAF9F6] border-0 rounded-[24px] px-8 py-5 text-sm font-bold" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest ml-4">類別</label>
                  <select name="category" required defaultValue={editingExpense?.category || '房租'} className="w-full bg-[#FAF9F6] border-0 rounded-[24px] px-8 py-5 text-sm font-bold">
                    <option value="房租">房租</option>
                    <option value="水電">水電</option>
                    <option value="行銷">行銷</option>
                    <option value="雜支">雜支</option>
                    <option value="薪資">薪資</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest ml-4">描述</label>
                  <input name="description" type="text" required defaultValue={editingExpense?.description || ''} placeholder="例如：2 月份租金" className="w-full bg-[#FAF9F6] border-0 rounded-[24px] px-8 py-5 text-sm font-bold" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest ml-4">金額</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[#C4C0BA] font-serif font-bold text-xl">$</span>
                    <input name="amount" type="number" required defaultValue={editingExpense?.amount || ''} className="w-full bg-[#FAF9F6] border-0 rounded-[24px] pl-12 pr-8 py-5 text-sm font-bold" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-[#2D2926] text-white py-6 rounded-[32px] font-bold shadow-xl hover:bg-[#BA7A56] transition-all">
                  儲存支出記錄
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 刪除確認視窗 (交易) */}
      {confirmDeleteTx && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-[#2D2926]/40 backdrop-blur-xl">
          <div className="bg-white rounded-[40px] w-full max-w-sm p-10 shadow-2xl">
            <h3 className="text-2xl font-serif font-bold text-[#2D2926] mb-4">確認刪除？</h3>
            <p className="text-[#857E75] mb-8">此動作無法復原，確定要刪除這筆紀錄嗎？</p>
            <div className="flex gap-4">
              <button onClick={() => setConfirmDeleteTx(null)} className="w-1/2 bg-[#FAF9F6] text-[#857E75] py-4 rounded-[20px] font-bold hover:bg-[#EBE5DE] transition-all">
                取消
              </button>
              <button onClick={confirmDeleteTransaction} className="w-1/2 bg-[#D32F2F] text-white py-4 rounded-[20px] font-bold shadow-xl hover:bg-[#B71C1C] transition-all">
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 課程編輯視窗 */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#2D2926]/40 backdrop-blur-xl">
          <div className="bg-white w-full max-w-xl rounded-[64px] shadow-2xl p-16 animate-in zoom-in">
            <div className="flex justify-between items-center mb-12">
               <h2 className="font-serif text-3xl font-bold text-[#2D2926]">{editingCourse ? (view === 'mediums' ? '修改媒材' : '修改課程') : (view === 'mediums' ? '新增媒材' : '新增課程')}</h2>
               <button onClick={() => setIsCourseModalOpen(false)} className="text-[#C4C0BA]"><X size={28} /></button>
            </div>
            <form key={editingCourse?.id || 'new'} onSubmit={handleSaveCourse} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <input name="title" type="text" placeholder={view === 'mediums' ? "媒材名稱" : "課程標題"} required defaultValue={editingCourse?.title || ''} className="w-full bg-[#FAF9F6] border-0 rounded-[20px] px-6 py-4 text-sm font-bold" />
                <input name="category" type="text" list="category-options" placeholder="類別 (如: 顏料, 畫筆)" required defaultValue={editingCourse?.category || ''} className="w-full bg-[#FAF9F6] border-0 rounded-[20px] px-6 py-4 text-sm font-bold" />
                <datalist id="category-options">
                  <option value="顏料" />
                  <option value="畫筆" />
                  <option value="畫布" />
                  <option value="素描工具" />
                  <option value="其他" />
                </datalist>
              </div>
              <div className={`grid ${view === 'mediums' ? 'grid-cols-1' : 'grid-cols-2'} gap-6`}>
                {view !== 'mediums' && (
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[#C4C0BA] font-serif font-bold text-lg">$</span>
                    <input name="price" type="number" placeholder="價格" required defaultValue={editingCourse?.price ?? ''} className="w-full bg-[#FAF9F6] border-0 rounded-[20px] pl-12 pr-6 py-4 text-sm font-bold" />
                  </div>
                )}
                <select name="active" defaultValue={editingCourse?.active !== false ? 'true' : 'false'} className="w-full bg-[#FAF9F6] border-0 rounded-[20px] px-6 py-4 text-sm font-bold">
                  <option value="true">{view === 'mediums' ? '販售中' : '開課中'}</option>
                  <option value="false">{view === 'mediums' ? '已停售' : '已停開'}</option>
                </select>
              </div>
              <textarea name="description" placeholder="描述" required defaultValue={editingCourse?.description || ''} className="w-full bg-[#FAF9F6] border-0 rounded-[20px] px-6 py-4 text-sm font-bold min-h-[100px]" />
              
              {view === 'courses' && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-[#857E75] uppercase tracking-widest">使用媒材</span>
                  <div className="flex flex-wrap gap-3">
                    {courses.filter(c => c.type === 'medium').map(medium => (
                      <label key={medium.id} className="flex items-center gap-2 bg-[#FAF9F6] px-4 py-2 rounded-full cursor-pointer hover:bg-[#EBE5DE] transition-colors">
                        <input 
                          type="checkbox" 
                          name="mediums" 
                          value={medium.id} 
                          defaultChecked={editingCourse?.mediums?.includes(medium.id)}
                          className="w-4 h-4 text-[#BA7A56] rounded border-[#C4C0BA] focus:ring-[#BA7A56]"
                        />
                        <span className="text-sm font-bold text-[#2D2926]">{medium.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-6">
                <span className="text-xs font-bold text-[#857E75] uppercase tracking-widest">代表色</span>
                <input name="color" type="color" defaultValue={editingCourse?.color || '#BA7A56'} className="w-12 h-12 rounded-full border-0 p-0 overflow-hidden cursor-pointer" />
              </div>
              <div className="flex gap-4">
                {editingCourse && (
                  <button type="button" onClick={() => handleDeleteCourse(editingCourse.id)} className="w-1/3 bg-[#FFEBEE] text-[#D32F2F] py-6 rounded-[28px] font-bold shadow-xl hover:bg-[#FFCDD2] transition-all">
                    刪除
                  </button>
                )}
                <button type="submit" className={`${editingCourse ? 'w-2/3' : 'w-full'} bg-[#2D2926] text-white py-6 rounded-[28px] font-bold shadow-xl hover:bg-[#BA7A56] transition-all`}>
                  確認儲存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 刪除確認視窗 (課程) */}
      {confirmDeleteCourse && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-[#2D2926]/40 backdrop-blur-xl">
          <div className="bg-white rounded-[40px] w-full max-w-sm p-10 shadow-2xl">
            <h3 className="text-2xl font-serif font-bold text-[#2D2926] mb-4">確認刪除？</h3>
            <p className="text-[#857E75] mb-8">此動作無法復原，確定要刪除這個項目嗎？</p>
            <div className="flex gap-4">
              <button onClick={() => setConfirmDeleteCourse(null)} className="w-1/2 bg-[#FAF9F6] text-[#857E75] py-4 rounded-[20px] font-bold hover:bg-[#EBE5DE] transition-all">
                取消
              </button>
              <button onClick={confirmDeleteCourseAction} className="w-1/2 bg-[#D32F2F] text-white py-4 rounded-[20px] font-bold shadow-xl hover:bg-[#B71C1C] transition-all">
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 系統重置確認視窗 */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-[#2D2926]/40 backdrop-blur-xl">
          <div className="bg-white rounded-[40px] w-full max-w-sm p-10 shadow-2xl">
            <h3 className="text-2xl font-serif font-bold text-[#2D2926] mb-4">確認重置系統？</h3>
            <p className="text-[#857E75] mb-8">這將清除所有已儲存的交易與課程紀錄，並恢復至初始範例數據。此操作無法復原。</p>
            <div className="flex gap-4">
              <button onClick={() => setIsResetModalOpen(false)} className="w-1/2 bg-[#FAF9F6] text-[#857E75] py-4 rounded-[20px] font-bold hover:bg-[#EBE5DE] transition-all">
                取消
              </button>
              <button onClick={handleResetData} className="w-1/2 bg-orange-500 text-white py-4 rounded-[20px] font-bold shadow-xl hover:bg-orange-600 transition-all">
                確認重置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 手機版更多選單 */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-[#2D2926]/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[48px] p-10 pb-20 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-[#EBE5DE] rounded-full mx-auto mb-10" />
              <div className="grid grid-cols-2 gap-6">
                <button 
                  onClick={() => { setView('inventory'); setIsMobileMenuOpen(false); }}
                  className={`flex flex-col items-center gap-4 p-8 rounded-[32px] transition-all ${view === 'inventory' ? 'bg-[#BA7A56] text-white shadow-lg' : 'bg-[#FAF9F6] text-[#2D2926] hover:bg-[#EBE5DE]'}`}
                >
                  <Layers size={24} />
                  <span className="text-sm font-bold">庫存管理</span>
                </button>
                <button 
                  onClick={() => { setView('reports'); setIsMobileMenuOpen(false); }}
                  className={`flex flex-col items-center gap-4 p-8 rounded-[32px] transition-all ${view === 'reports' ? 'bg-[#BA7A56] text-white shadow-lg' : 'bg-[#FAF9F6] text-[#2D2926] hover:bg-[#EBE5DE]'}`}
                >
                  <PieChart size={24} />
                  <span className="text-sm font-bold">數據報表</span>
                </button>
                <button 
                  onClick={() => { setView('mediums'); setIsMobileMenuOpen(false); }}
                  className={`flex flex-col items-center gap-4 p-8 rounded-[32px] transition-all ${view === 'mediums' ? 'bg-[#BA7A56] text-white shadow-lg' : 'bg-[#FAF9F6] text-[#2D2926] hover:bg-[#EBE5DE]'}`}
                >
                  <Palette size={24} />
                  <span className="text-sm font-bold">媒材設定</span>
                </button>
                <button 
                  onClick={() => { setView('settings'); setIsMobileMenuOpen(false); }}
                  className={`flex flex-col items-center gap-4 p-8 rounded-[32px] transition-all ${view === 'settings' ? 'bg-[#BA7A56] text-white shadow-lg' : 'bg-[#FAF9F6] text-[#2D2926] hover:bg-[#EBE5DE]'}`}
                >
                  <Settings size={24} />
                  <span className="text-sm font-bold">系統設定</span>
                </button>
              </div>
              <button 
                onClick={logout}
                className="w-full mt-10 flex items-center justify-center gap-3 p-6 text-red-500 font-bold border-2 border-red-50 rounded-[24px] hover:bg-red-50 transition-all"
              >
                <LogOut size={20} /> 登出系統
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 手機版底部導覽 */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-[#EBE5DE] px-4 py-3 flex justify-around items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[32px]">
        <button onClick={() => setView('dashboard')} className={`flex flex-col items-center gap-1 transition-all ${view === 'dashboard' ? 'text-[#BA7A56] scale-110' : 'text-[#C4C0BA]'}`}>
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-bold">概覽</span>
        </button>
        <button onClick={() => setView('students')} className={`flex flex-col items-center gap-1 transition-all ${view === 'students' ? 'text-[#BA7A56] scale-110' : 'text-[#C4C0BA]'}`}>
          <Users size={20} />
          <span className="text-[10px] font-bold">學員</span>
        </button>
        <button onClick={() => setView('packages')} className={`flex flex-col items-center gap-1 transition-all ${view === 'packages' ? 'text-[#BA7A56] scale-110' : 'text-[#C4C0BA]'}`}>
          <Award size={20} />
          <span className="text-[10px] font-bold">方案</span>
        </button>
        <button onClick={() => setView('attendance')} className={`flex flex-col items-center gap-1 transition-all ${view === 'attendance' ? 'text-[#BA7A56] scale-110' : 'text-[#C4C0BA]'}`}>
          <Calendar size={20} />
          <span className="text-[10px] font-bold">點名</span>
        </button>
        <button onClick={() => setView('finance')} className={`flex flex-col items-center gap-1 transition-all ${view === 'finance' ? 'text-[#BA7A56] scale-110' : 'text-[#C4C0BA]'}`}>
          <Receipt size={20} />
          <span className="text-[10px] font-bold">財務</span>
        </button>
        <button onClick={() => setIsMobileMenuOpen(true)} className="flex flex-col items-center gap-1 text-[#C4C0BA]">
          <Menu size={20} />
          <span className="text-[10px] font-bold">更多</span>
        </button>
      </div>
      {/* 課表編輯視窗 */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#2D2926]/40 backdrop-blur-xl">
          <div className="bg-white w-full max-w-xl rounded-[64px] shadow-2xl p-16 animate-in zoom-in">
            <div className="flex justify-between items-center mb-12">
               <h2 className="font-serif text-3xl font-bold text-[#2D2926]">{editingSchedule ? '修改時段' : '新增時段'}</h2>
               <button onClick={() => setIsScheduleModalOpen(false)} className="text-[#C4C0BA]"><X size={28} /></button>
            </div>
            <form onSubmit={handleSaveSchedule} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest ml-4">選擇課程</label>
                <select name="courseId" required defaultValue={editingSchedule?.courseId || ''} className="w-full bg-[#FAF9F6] border-0 rounded-[20px] px-6 py-4 text-sm font-bold">
                  <option value="" disabled>請選擇課程</option>
                  {courses.filter(c => c.type !== 'medium').map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest ml-4">星期</label>
                  <select name="dayOfWeek" required defaultValue={editingSchedule?.dayOfWeek ?? 1} className="w-full bg-[#FAF9F6] border-0 rounded-[20px] px-6 py-4 text-sm font-bold">
                    <option value="0">週日</option>
                    <option value="1">週一</option>
                    <option value="2">週二</option>
                    <option value="3">週三</option>
                    <option value="4">週四</option>
                    <option value="5">週五</option>
                    <option value="6">週六</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest ml-4">授課老師</label>
                  <input name="instructor" type="text" required defaultValue={editingSchedule?.instructor || 'Koala'} className="w-full bg-[#FAF9F6] border-0 rounded-[20px] px-6 py-4 text-sm font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest ml-4">開始時間</label>
                  <input name="startTime" type="time" required defaultValue={editingSchedule?.startTime || '14:00'} className="w-full bg-[#FAF9F6] border-0 rounded-[20px] px-6 py-4 text-sm font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest ml-4">結束時間</label>
                  <input name="endTime" type="time" required defaultValue={editingSchedule?.endTime || '16:00'} className="w-full bg-[#FAF9F6] border-0 rounded-[20px] px-6 py-4 text-sm font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest ml-4">教室 (選填)</label>
                  <input name="room" type="text" defaultValue={editingSchedule?.room || ''} className="w-full bg-[#FAF9F6] border-0 rounded-[20px] px-6 py-4 text-sm font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest ml-4">人數上限 (選填)</label>
                  <input name="maxStudents" type="number" defaultValue={editingSchedule?.maxStudents || ''} className="w-full bg-[#FAF9F6] border-0 rounded-[20px] px-6 py-4 text-sm font-bold" />
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-[#2D2926] text-white py-6 rounded-[32px] font-bold shadow-xl hover:bg-[#BA7A56] transition-all">
                  儲存時段
                </button>
                {editingSchedule?.id && (
                  <button 
                    type="button" 
                    onClick={async () => {
                      if (confirm('確定要刪除此時段嗎？')) {
                        try {
                          await deleteDoc(doc(db, 'schedules', editingSchedule.id));
                          setIsScheduleModalOpen(false);
                        } catch (err) {
                          handleFirestoreError(err, OperationType.DELETE, `schedules/${editingSchedule.id}`);
                        }
                      }
                    }}
                    className="px-10 bg-red-50 text-red-500 py-6 rounded-[32px] font-bold hover:bg-red-100 transition-all"
                  >
                    刪除
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
      {isPackageModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#2D2926]/40 backdrop-blur-xl">
          <div className="bg-white w-full max-w-xl rounded-[64px] shadow-2xl p-16 animate-in zoom-in">
            <div className="flex justify-between items-center mb-12">
               <h2 className="font-serif text-3xl font-bold text-[#2D2926]">{editingPackage && editingPackage.id ? '修改課堂包' : '新增課堂包'}</h2>
               <button onClick={() => setIsPackageModalOpen(false)} className="text-[#C4C0BA]"><X size={28} /></button>
            </div>
            <form onSubmit={handleSavePackage} className="space-y-8">
              <input name="studentName" type="text" placeholder="學員姓名" required defaultValue={editingPackage?.studentName || ''} readOnly={!!editingPackage?.studentName} className="w-full bg-[#FAF9F6] border-0 rounded-[20px] px-6 py-4 text-sm font-bold" />
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest ml-4">總堂數</label>
                  <input name="totalClasses" type="number" required defaultValue={editingPackage?.totalClasses || 10} className="w-full bg-[#FAF9F6] border-0 rounded-[20px] px-6 py-4 text-sm font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest ml-4">已使用</label>
                  <input name="usedClasses" type="number" required defaultValue={editingPackage?.usedClasses || 0} className="w-full bg-[#FAF9F6] border-0 rounded-[20px] px-6 py-4 text-sm font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest ml-4">購買日期</label>
                  <input name="purchaseDate" type="date" required defaultValue={editingPackage?.purchaseDate || new Date().toISOString().split('T')[0]} className="w-full bg-[#FAF9F6] border-0 rounded-[20px] px-6 py-4 text-sm font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest ml-4">有效期限 (選填)</label>
                  <input name="expiryDate" type="date" defaultValue={editingPackage?.expiryDate || ''} className="w-full bg-[#FAF9F6] border-0 rounded-[20px] px-6 py-4 text-sm font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest ml-4">方案價格</label>
                  <input name="price" type="number" placeholder="0" defaultValue={editingPackage?.price || ''} className="w-full bg-[#FAF9F6] border-0 rounded-[20px] px-6 py-4 text-sm font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#C4C0BA] uppercase tracking-widest ml-4">方案狀態</label>
                  <select name="status" defaultValue={editingPackage?.status || 'active'} className="w-full bg-[#FAF9F6] border-0 rounded-[20px] px-6 py-4 text-sm font-bold appearance-none">
                    <option value="active">使用中</option>
                    <option value="completed">已結案</option>
                    <option value="expired">已過期</option>
                  </select>
                </div>
              </div>
              <p className="text-[9px] text-[#BA7A56] ml-4 font-bold uppercase tracking-widest">如果是新購買，儲存後將自動建立交易紀錄並可產生收據</p>
              
              <textarea name="notes" placeholder="備註事項" defaultValue={editingPackage?.notes || ''} className="w-full bg-[#FAF9F6] border-0 rounded-[20px] px-6 py-4 text-sm font-bold h-24" />
              
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-[#2D2926] text-white py-6 rounded-[32px] font-bold shadow-xl hover:bg-[#BA7A56] transition-all">
                  儲存設定
                </button>
                {editingPackage?.id && (
                  <button 
                    type="button" 
                    onClick={async () => {
                      if (confirm('確定要刪除此課堂包嗎？')) {
                        try {
                          await deleteDoc(doc(db, 'packages', editingPackage.id));
                          setIsPackageModalOpen(false);
                        } catch (err) {
                          handleFirestoreError(err, OperationType.DELETE, `packages/${editingPackage.id}`);
                        }
                      }
                    }}
                    className="px-10 bg-red-50 text-red-500 py-6 rounded-[32px] font-bold hover:bg-red-100 transition-all"
                  >
                    刪除
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 收據預覽視窗 */}
      {isReceiptModalOpen && selectedTxForReceipt && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-[#2D2926]/60 backdrop-blur-xl">
          <div className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-10 border-b border-[#EBE5DE] flex justify-between items-center bg-[#FAF9F6]">
              <h2 className="font-serif text-2xl font-bold text-[#2D2926]">收據預覽</h2>
              <button onClick={() => setIsReceiptModalOpen(false)} className="text-[#C4C0BA] hover:text-[#2D2926] transition-colors"><X size={28} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-12 bg-white" id="receipt-content">
              <div className="max-w-md mx-auto border-[12px] border-[#2D2926] p-12 space-y-10 relative shadow-2xl">
                {/* 裝飾性角標 */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-[#BA7A56] -mt-2 -ml-2"></div>
                <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-[#BA7A56] -mt-2 -mr-2"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-[#BA7A56] -mb-2 -ml-2"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-[#BA7A56] -mb-2 -mr-2"></div>
                
                <div className="absolute top-6 right-8 text-[8px] font-bold text-[#BA7A56] uppercase tracking-[4px]">Certificate of Art Investment</div>
                
                <div className="text-center space-y-6 pt-8">
                  {receiptInfo.logoUrl && (
                    <img src={receiptInfo.logoUrl} alt="Logo" className="w-24 h-24 mx-auto object-contain mb-6 grayscale hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
                  )}
                  <h1 className="text-4xl font-serif font-bold text-[#2D2926] tracking-tight uppercase">{receiptInfo.studioName}</h1>
                  <p className="text-[10px] text-[#BA7A56] font-bold uppercase tracking-[6px]">Official Receipt & Record</p>
                  <div className="w-24 h-px bg-[#BA7A56] mx-auto opacity-30"></div>
                </div>

                <div className="space-y-8 pt-4">
                  <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-1">
                      <span className="text-[8px] text-[#C4C0BA] font-bold uppercase tracking-widest">日期 Date</span>
                      <p className="text-sm font-bold text-[#2D2926] border-b border-[#EBE5DE] pb-1">{selectedTxForReceipt.date}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] text-[#C4C0BA] font-bold uppercase tracking-widest">編號 Receipt No.</span>
                      <p className="text-sm font-bold text-[#2D2926] border-b border-[#EBE5DE] pb-1">#{selectedTxForReceipt.id.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[8px] text-[#C4C0BA] font-bold uppercase tracking-widest">學員姓名 Student Name</span>
                    <p className="text-lg font-serif font-bold text-[#2D2926] border-b border-[#EBE5DE] pb-2">{selectedTxForReceipt.name}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[8px] text-[#C4C0BA] font-bold uppercase tracking-widest">課程項目 Description of Service</span>
                    <p className="text-base font-medium text-[#2D2926] border-b border-[#EBE5DE] pb-2">
                      {selectedTxForReceipt.course} {selectedTxForReceipt.medium ? `(${selectedTxForReceipt.medium})` : ''}
                    </p>
                  </div>

                  <div className="flex justify-between items-end pt-6">
                    <div className="space-y-1">
                      <span className="text-[8px] text-[#BA7A56] font-bold uppercase tracking-widest">總計金額 Total Amount</span>
                      <p className="text-5xl font-serif font-bold text-[#2D2926] tracking-tighter">${selectedTxForReceipt.amount.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <div className="w-24 h-24 border-2 border-[#BA7A56]/20 rounded-full flex items-center justify-center relative">
                        <div className="text-[8px] font-bold text-[#BA7A56] uppercase tracking-widest rotate-[-15deg]">Paid</div>
                        <div className="absolute inset-0 border-4 border-[#BA7A56]/5 rounded-full scale-90"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-12 grid grid-cols-2 gap-10 text-[9px] text-[#857E75] leading-relaxed">
                  <div className="space-y-3">
                    <p className="font-bold text-[#2D2926] uppercase tracking-widest border-b border-[#EBE5DE] pb-1">畫室資訊 Studio Info</p>
                    <p className="font-medium">{receiptInfo.studioAddress}</p>
                    <p className="font-medium">Tel: {receiptInfo.studioPhone}</p>
                  </div>
                  <div className="space-y-3">
                    <p className="font-bold text-[#2D2926] uppercase tracking-widest border-b border-[#EBE5DE] pb-1">匯款資訊 Bank Details</p>
                    <p className="font-medium whitespace-pre-wrap">{receiptInfo.bankInfo || 'N/A'}</p>
                  </div>
                </div>

                <div className="pt-16 text-center">
                  <p className="text-[10px] font-serif italic text-[#C4C0BA]">"Art is the only way to run away without leaving home."</p>
                </div>
              </div>
            </div>

            <div className="p-10 bg-[#FAF9F6] border-t border-[#EBE5DE] flex gap-4">
              <button 
                onClick={() => {
                  const content = document.getElementById('receipt-content');
                  if (content) {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Receipt - ${selectedTxForReceipt.name}</title>
                            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                            <style>
                              @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;700&display=swap');
                              body { font-family: 'Inter', sans-serif; }
                              .font-serif { font-family: 'Playfair Display', serif; }
                              @media print {
                                .no-print { display: none; }
                                body { padding: 0; margin: 0; }
                              }
                            </style>
                          </head>
                          <body class="p-10">
                            ${content.innerHTML}
                            <script>
                              window.onload = () => {
                                window.print();
                                // window.close();
                              };
                            </script>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                    }
                  }
                }}
                className="flex-1 bg-[#2D2926] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#BA7A56] transition-all shadow-xl"
              >
                <Printer size={20} /> 列印收據
              </button>
              <button 
                onClick={() => setIsReceiptModalOpen(false)}
                className="flex-1 bg-white border border-[#EBE5DE] text-[#857E75] py-5 rounded-2xl font-bold hover:bg-[#EBE5DE] transition-all"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
