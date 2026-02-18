
import React from 'react';
import { 
  LayoutDashboard, Warehouse, Users, FileText, BrainCircuit, BarChart3, Settings as SettingsIcon, Globe, Banknote, Home, UserCircle, LogOut, ClipboardList, X, QrCode
} from 'lucide-react';
import { View, UserType, Staff } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  userType: UserType;
  staffUser?: Staff | null;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  logoUrl: string;
  systemName: string; // Keep for fallback, but prefer translation
  onScanQR: () => void; // New prop
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, userType, staffUser, onLogout, isOpen, setIsOpen, logoUrl, systemName, onScanQR }) => {
  const { t, dir } = useLanguage();

  const allItems = [
    { id: 'DASHBOARD' as View, label: t('menu_dashboard'), icon: LayoutDashboard },
    { id: 'EMPLOYEE_PORTAL' as View, label: t('menu_employee_portal'), icon: UserCircle },
    { id: 'TASK_MANAGER' as View, label: t('menu_task_manager'), icon: ClipboardList },
    { id: 'INVENTORY_HUB' as View, label: t('menu_inventory_hub'), icon: Warehouse },
    { id: 'TREASURY' as View, label: t('menu_treasury'), icon: Banknote },
    { id: 'RENTALS' as View, label: t('menu_rentals'), icon: Home },
    { id: 'STAFF' as View, label: t('menu_staff'), icon: Users },
    { id: 'DOCUMENTS' as View, label: t('menu_documents'), icon: FileText },
    { id: 'SERVICE_SUBSCRIPTIONS' as View, label: t('menu_service_subscriptions'), icon: Globe },
    { id: 'REPORTS' as View, label: t('menu_reports'), icon: BarChart3 },
    { id: 'AI_ASSISTANT' as View, label: t('menu_ai_assistant'), icon: BrainCircuit },
  ];

  const menuItems = userType === 'ADMIN' 
    ? allItems.filter(item => item.id !== 'EMPLOYEE_PORTAL') 
    : allItems.filter(item => staffUser?.permissions?.includes(item.id));

  // Determine Sidebar Position based on Language
  // RTL: Right side | LTR: Left side
  const sidebarPositionClass = dir === 'rtl' ? 'right-0 border-l' : 'left-0 border-r';
  const transformClass = isOpen 
    ? 'translate-x-0' 
    : dir === 'rtl' ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0';

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`h-screen w-64 bg-slate-900 text-white fixed top-0 flex flex-col border-slate-800 z-[60] shadow-2xl transition-transform duration-300 transform ${sidebarPositionClass} ${transformClass}`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-xl shadow-lg flex items-center justify-center overflow-hidden w-10 h-10 shrink-0">
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-black tracking-tight text-white leading-none truncate">{systemName}</h1>
              <p className="text-[10px] text-amber-500 font-bold mt-1 uppercase tracking-widest">Cloud System</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        
        <nav className="flex-1 mt-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 text-start">{t('main_menu')}</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-amber-500 text-slate-900 font-bold shadow-lg shadow-amber-500/20' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-white'}`} />
                <span className="text-sm">{item.label}</span>
                {/* Active Indicator Line */}
                {isActive && (
                  <div className={`absolute w-1 h-6 rounded-full bg-slate-900/20 ${dir === 'rtl' ? 'left-2' : 'right-2'}`}></div>
                )}
              </button>
            );
          })}
          
          {/* Link Device Button */}
          <button
             onClick={onScanQR}
             className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-400 hover:bg-emerald-500/10 transition-all mt-4 border border-dashed border-slate-700"
          >
             <QrCode className="w-5 h-5" />
             <span className="text-sm">ربط جهاز / Web</span>
          </button>

          {menuItems.length === 0 && (
            <div className="px-4 py-10 text-center opacity-30 italic text-xs">{t('no_access')}</div>
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
              <span className="text-sm">{t('menu_settings')}</span>
            </button>
          )}
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all">
            <LogOut className="w-5 h-5" />
            <span className="text-sm">{t('logout')}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
