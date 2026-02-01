
import React from 'react';
import { 
  LayoutDashboard, Warehouse, Users, FileText, BrainCircuit, BarChart3, Settings as SettingsIcon, Globe, Banknote, Home, UserCircle, LogOut, ClipboardList, X
} from 'lucide-react';
import { View, UserType, Staff } from '../types';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  userType: UserType;
  staffUser?: Staff | null; // إضافة الموظف الحالي
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  logoUrl: string;
  systemName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, userType, staffUser, onLogout, isOpen, setIsOpen, logoUrl, systemName }) => {
  // القائمة الكاملة بجميع العناصر
  const allItems = [
    { id: 'DASHBOARD' as View, label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'EMPLOYEE_PORTAL' as View, label: 'بوابتي الشخصية', icon: UserCircle },
    { id: 'TASK_MANAGER' as View, label: 'إدارة المهام', icon: ClipboardList },
    { id: 'INVENTORY_HUB' as View, label: 'إدارة المخزون', icon: Warehouse },
    { id: 'TREASURY' as View, label: 'الخزنة والمالية', icon: Banknote },
    { id: 'RENTALS' as View, label: 'إدارة الإيجارات', icon: Home },
    { id: 'STAFF' as View, label: 'الموظفين والورديات', icon: Users },
    { id: 'DOCUMENTS' as View, label: 'الوثائق والتراخيص', icon: FileText },
    { id: 'SERVICE_SUBSCRIPTIONS' as View, label: 'اشتراكات الخدمات', icon: Globe },
    { id: 'REPORTS' as View, label: 'التقارير والإحصائيات', icon: BarChart3 },
    { id: 'AI_ASSISTANT' as View, label: 'المساعد الذكي', icon: BrainCircuit },
  ];

  // فلترة العناصر بناءً على الصلاحيات
  const menuItems = userType === 'ADMIN' 
    ? allItems.filter(item => item.id !== 'EMPLOYEE_PORTAL') // المدير يرى كل شيء عدا بوابة الموظف الشخصية
    : allItems.filter(item => staffUser?.permissions?.includes(item.id)); // الموظف يرى فقط المسموح له

  return (
    <div className={`h-screen w-64 bg-slate-900 text-white fixed right-0 top-0 flex flex-col border-l border-slate-800 z-[60] shadow-2xl transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
      <div className="p-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-xl shadow-lg flex items-center justify-center overflow-hidden w-10 h-10">
            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-black tracking-tight text-white leading-none truncate">{systemName}</h1>
            <p className="text-[10px] text-amber-500 font-bold mt-1 uppercase tracking-widest">Cloud System</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 hover:bg-slate-800 rounded-lg">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>
      
      <nav className="flex-1 mt-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">القائمة الرئيسية</p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-amber-500 text-slate-900 font-bold shadow-lg shadow-amber-500/20 translate-x-1' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
        {menuItems.length === 0 && (
          <div className="px-4 py-10 text-center opacity-30 italic text-xs">لا توجد صلاحيات وصول</div>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        {userType === 'ADMIN' && (
          <button 
            onClick={() => setCurrentView('SETTINGS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentView === 'SETTINGS' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50'
            }`}
          >
            <SettingsIcon className="w-5 h-5" />
            <span className="text-sm">إعدادات النظام</span>
          </button>
        )}
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all">
          <LogOut className="w-5 h-5" />
          <span className="text-sm">تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
