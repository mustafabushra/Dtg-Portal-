
export enum Category {
  KITCHEN = 'مطبخ',
  BAR = 'بار',
  ASSET = 'أصول'
}

export type TaskType = 'operational' | 'monitoring' | 'urgent' | 'developmental';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  status: 'pending' | 'completed' | 'overdue';
  assignedTo: string;
  supervisorId?: string;
  createdAt: string;
  deadline?: string;
  recurrence: RecurrenceType;
  checklist: ChecklistItem[];
  requiresPhoto: boolean;
  requiresNote: boolean;
  proofUrl?: string;
  proofNote?: string;
  contextId?: string;
  locationRequired?: boolean;
}

export interface TreasuryTransaction {
  id: string;
  date: string;
  type: 'IN' | 'OUT';
  referenceNumber: string;
  amount: number;
  description: string;
  category: 'مبيعات' | 'مشتريات' | 'رواتب' | 'فواتير' | 'صيانة' | 'إيجار' | 'أخرى';
}

export interface RentalPayment {
  id: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue';
  note?: string;
}

export interface RentalUnit {
  id: string;
  unitNumber: string;
  type: 'غرفة' | 'شقة' | 'محل';
  tenantName: string;
  tenantPhone: string;
  rentAmount: number;
  billingCycle: 'monthly' | 'quarterly' | 'triannual' | 'biannual' | 'yearly';
  startDate: string;
  endDate: string;
  status: 'occupied' | 'vacant' | 'maintenance';
  payments: RentalPayment[];
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  description: string;
  cost: number;
  performedBy?: string;
}

export interface Asset {
  id: string;
  name: string;
  purchaseDate: string;
  maintenanceDate: string;
  cost: number;
  status: 'يعمل' | 'تحت الصيانة' | 'خارج الخدمة';
  lastMaintenanceNote?: string;
  maintenanceHistory?: MaintenanceRecord[];
}

export interface AttendanceLog {
  id: string;
  type: 'IN' | 'OUT';
  timestamp: string;
  note?: string;
  isLate?: boolean;
  locationStatus?: 'داخل النطاق' | 'خارج النطاق' | 'إيفينت خارجي';
  coords?: { latitude: number; longitude: number };
  durationMinutes?: number; 
  overtimeMinutes?: number; 
  earnedAmount?: number;
}

export interface ExternalAssignment {
  eventName: string;
  startDate: string;
  endDate: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  unit: string;
  minLimit: number;
  lastUpdated: string;
  imageUrl?: string;
  consumptionRate?: number;
  expiryDate?: string;
}

export interface Staff {
  id: string;
  name: string;
  username: string; // الحقل الجديد المضاف
  role: string;
  password?: string;
  shiftStart: string;
  shiftEnd: string;
  hourlyRate: number; 
  documents: Document[];
  performance?: number;
  isClockedIn?: boolean;
  lastClockIn?: string;
  totalMonthlyHours?: number;
  totalMonthlyEarnings?: number;
  attendanceHistory?: AttendanceLog[];
  externalAssignment?: ExternalAssignment;
  permissions: string[];
}

export interface Document {
  id: string;
  title: string;
  expiryDate: string;
  type: 'حكومي' | 'شخصي';
  owner?: string;
  remindBeforeDays: number;
  fileUrl?: string;
}

export interface ServiceSubscription {
  id: string;
  provider: string;
  serviceName: string;
  category: 'كاشير' | 'إنترنت' | 'توصيل' | 'ولاء' | 'برمجيات';
  cost: number;
  billingCycle: 'شهري' | 'سنوي';
  nextBillingDate: string;
  status: 'نشط' | 'ملغي' | 'قيد التجديد';
}

export interface Subscription {
  id: string;
  customerName: string;
  phone: string;
  type: 'شهري' | 'سنوي' | 'ذهبي';
  expiryDate: string;
  status: 'نشط' | 'منتهي' | 'ملغي';
  visitsCount: number;
}

export type UserType = 'ADMIN' | 'STAFF' | null;

export type View = 'DASHBOARD' | 'INVENTORY_HUB' | 'STAFF' | 'DOCUMENTS' | 'SERVICE_SUBSCRIPTIONS' | 'AI_ASSISTANT' | 'REPORTS' | 'SETTINGS' | 'PAYROLL' | 'TREASURY' | 'RENTALS' | 'EMPLOYEE_PORTAL' | 'TASK_MANAGER' | 'DEPLOYMENT_CENTER';
