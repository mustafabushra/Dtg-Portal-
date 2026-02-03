
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InventoryHub from './components/InventoryHub';
import ComplianceTracker from './components/ComplianceTracker';
import StaffManager from './components/StaffManager';
import ServiceSubscriptions from './components/ServiceSubscriptions';
import Reports from './components/Reports';
import Settings from './components/Settings';
import PayrollManager from './components/PayrollManager';
import TreasuryManager from './components/TreasuryManager';
import RentalsManager from './components/RentalsManager';
import AIAssistant from './components/AIAssistant';
import Login from './components/Login';
import EmployeePortal from './components/EmployeePortal';
import TaskManager from './components/TaskManager';
import DeploymentCenter from './components/DeploymentCenter';
import CloudSetup from './components/CloudSetup'; 
import { View, InventoryItem, Asset, Staff, Document, ServiceSubscription, AttendanceLog, TreasuryTransaction, RentalUnit, UserType, Task } from './types';
import { Menu, WifiOff, ShieldAlert, Globe } from 'lucide-react';
import { getCafeInsights } from './services/geminiService';
import { db, isConfigured } from './services/firebase'; 
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useLanguage } from './contexts/LanguageContext';

const App: React.FC = () => {
  const { t, dir, language, setLanguage } = useLanguage();

  if (!isConfigured) {
    return <CloudSetup />;
  }

  const [currentUserType, setCurrentUserType] = useState<UserType>(null);
  const [currentStaffUser, setCurrentStaffUser] = useState<Staff | null>(null);
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'offline' | 'permission-denied'>('connected');

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [serviceSubscriptions, setServiceSubscriptions] = useState<ServiceSubscription[]>([]);
  const [treasuryTransactions, setTreasuryTransactions] = useState<TreasuryTransaction[]>([]);
  const [rentals, setRentals] = useState<RentalUnit[]>([]);
  
  const [cafeLocation, setCafeLocation] = useState({ lat: 21.54105, lng: 39.17171 });
  const [billingThreshold, setBillingThreshold] = useState<number>(7);
  const [themeSettings, setThemeSettings] = useState({
    systemName: 'كافي برو',
    primaryColor: '#f59e0b',
    logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=CAFE',
    cafeAccountId: '10101'
  });

  const [insight, setInsight] = useState<string>('جاري تحليل كفاءة التشغيل المباشرة...');
  const [isRefreshingInsight, setIsRefreshingInsight] = useState(false);

  useEffect(() => {
    const subscribe = (colName: string, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
      try {
        return onSnapshot(collection(db, colName), (snapshot) => {
          // FIX: Ensure ID is explicitly mapped from doc.id to prevent delete errors
          const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
          setter(data);
          setDbStatus('connected');
        }, (error) => {
          console.error(`Error fetching ${colName}:`, error);
          if (error.code === 'permission-denied') {
            setDbStatus('permission-denied');
          } else {
            setDbStatus('offline');
          }
        });
      } catch (e) {
        console.error("Firebase init error", e);
        return () => {};
      }
    };

    const unsubs = [
      subscribe('inventory', setInventory),
      subscribe('assets', setAssets),
      subscribe('staff', setStaff),
      subscribe('tasks', setTasks),
      subscribe('documents', setDocuments),
      subscribe('services', setServiceSubscriptions),
      subscribe('treasury', setTreasuryTransactions),
      subscribe('rentals', setRentals),
    ];

    const unsubSettings = onSnapshot(collection(db, 'settings'), (snapshot) => {
       snapshot.docs.forEach(doc => {
         if (doc.id === 'theme') setThemeSettings(doc.data() as any);
         if (doc.id === 'location') setCafeLocation(doc.data() as any);
         if (doc.id === 'config') setBillingThreshold(doc.data().billingThreshold);
       });
    }, (error) => {
       if (error.code === 'permission-denied') setDbStatus('permission-denied');
    });

    return () => {
      unsubs.forEach(unsub => unsub());
      unsubSettings();
    };
  }, []);

  useEffect(() => {
    if (currentStaffUser && staff.length > 0) {
      const updatedUser = staff.find(s => s.id === currentStaffUser.id);
      if (updatedUser && JSON.stringify(updatedUser) !== JSON.stringify(currentStaffUser)) {
        setCurrentStaffUser(updatedUser);
      }
    }
  }, [staff, currentStaffUser]);

  const sanitizeData = (obj: any): any => {
    if (obj === null || obj === undefined) return null;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(sanitizeData);
    const newObj: any = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value !== undefined) newObj[key] = sanitizeData(value);
    });
    return newObj;
  };

  const saveDoc = async (colName: string, data: any) => {
    try {
      const cleanData = sanitizeData(data);
      if (cleanData) Object.keys(cleanData).forEach(key => cleanData[key] === undefined && delete cleanData[key]);
      await setDoc(doc(db, colName, data.id), cleanData);
    } catch (e: any) {
      console.error("Error saving doc:", e);
      if (e.code === 'permission-denied') {
        alert(t('permissionDenied'));
      } else {
        alert(`Error: ${e.message}`);
      }
    }
  };

  const removeDoc = async (colName: string, id: string) => {
    if (!id) {
        console.error(`Attempted to delete document from ${colName} with undefined ID`);
        alert("خطأ: لا يمكن حذف عنصر بدون معرف (ID) صحيح. يرجى تحديث الصفحة والمحاولة مرة أخرى.");
        return;
    }
    try {
      await deleteDoc(doc(db, colName, id));
    } catch (e: any) {
      console.error("Error deleting doc:", e);
      if (e.code === 'permission-denied') {
        alert(t('permissionDenied'));
      } else {
        alert(`Error: ${e.message}`);
      }
    }
  };

  useEffect(() => {
    document.title = `${themeSettings.systemName} - Cloud OS`;
    document.documentElement.style.setProperty('--primary-color', themeSettings.primaryColor);
  }, [themeSettings]);

  const appData = useMemo(() => ({ inventory, assets, staff, documents, serviceSubscriptions, treasuryTransactions, rentals, cafeLocation, tasks, billingThreshold }), 
    [inventory, assets, staff, documents, serviceSubscriptions, treasuryTransactions, rentals, cafeLocation, tasks, billingThreshold]);

  const handleRefreshInsights = async () => {
    setIsRefreshingInsight(true);
    const text = await getCafeInsights(appData);
    setInsight(text || "تعذر الحصول على تحليل حالياً.");
    setIsRefreshingInsight(false);
  };

  const handleLogin = (type: 'ADMIN' | 'STAFF', credentials: { cafeId: string, username: string, password?: string }) => {
    if (credentials.cafeId !== themeSettings.cafeAccountId) {
      alert(t('loginErrorCafe'));
      return;
    }

    if (type === 'ADMIN') {
      if (credentials.username.toLowerCase() === 'admin' && credentials.password === '1234') { 
        setCurrentUserType('ADMIN');
        setCurrentView('DASHBOARD');
      } else {
        alert(t('loginErrorAdmin'));
      }
    } else {
      const user = staff.find(s => s.username === credentials.username);
      if (user && user.password === credentials.password) {
        setCurrentStaffUser(user);
        setCurrentUserType('STAFF');
        if (user.permissions && user.permissions.length > 0) {
          setCurrentView(user.permissions[0] as View);
        } else {
          setCurrentView('EMPLOYEE_PORTAL');
        }
      } else {
        alert(t('loginErrorStaff'));
      }
    }
  };

  const updateStaffAttendance = async (staffId: string, type: 'IN' | 'OUT') => {
    const targetStaff = staff.find(s => s.id === staffId);
    if (!targetStaff) return;

    const now = new Date();
    let earned = 0;
    
    if (type === 'OUT' && targetStaff.lastClockIn) {
      const diffMs = now.getTime() - new Date(targetStaff.lastClockIn).getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      earned = diffHours * targetStaff.hourlyRate;
    }

    const log: AttendanceLog = { 
      id: Math.random().toString(36).substr(2, 9), 
      type, 
      timestamp: now.toISOString(), 
      earnedAmount: Math.round(earned) 
    };

    const updatedUser: Staff = { 
      ...targetStaff, 
      isClockedIn: type === 'IN', 
      lastClockIn: type === 'IN' ? now.toISOString() : targetStaff.lastClockIn, 
      attendanceHistory: [log, ...(targetStaff.attendanceHistory || [])], 
      totalMonthlyHours: (targetStaff.totalMonthlyHours || 0) + (type === 'OUT' ? (now.getTime() - new Date(targetStaff.lastClockIn!).getTime()) / 3600000 : 0), 
      totalMonthlyEarnings: (targetStaff.totalMonthlyEarnings || 0) + earned 
    };

    await saveDoc('staff', updatedUser);
    if (currentStaffUser?.id === staffId) setCurrentStaffUser(updatedUser);
  };

  if (!currentUserType) {
    return <Login onLogin={handleLogin} staffList={staff} logoUrl={themeSettings.logoUrl} systemName={themeSettings.systemName} />;
  }

  // Calculate Main Content Margin based on Sidebar Logic
  // LTR: Margin Left 16rem (64) | RTL: Margin Right 16rem (64)
  const mainContentMargin = dir === 'rtl' ? 'lg:mr-64' : 'lg:ml-64';

  return (
    <div className="min-h-screen flex bg-[#f8fafc] font-['Cairo'] text-slate-900 overflow-x-hidden">
      <style>{`
        .bg-custom-primary { background-color: var(--primary-color) !important; }
        .text-custom-primary { color: var(--primary-color) !important; }
        .border-custom-primary { border-color: var(--primary-color) !important; }
        .bg-custom-light { background-color: rgba(245, 158, 11, 0.1) !important; }
        .hover-bg-custom-primary:hover { background-color: var(--primary-color) !important; }
      `}</style>

      <Sidebar 
        currentView={currentView} 
        setCurrentView={(v) => { setCurrentView(v); setIsSidebarOpen(false); }} 
        userType={currentUserType} 
        staffUser={currentStaffUser} 
        onLogout={() => { setCurrentUserType(null); setCurrentStaffUser(null); }}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        logoUrl={themeSettings.logoUrl}
        systemName={themeSettings.systemName}
      />
      
      {/* Main Content Area */}
      <main className={`flex-1 transition-all duration-300 w-full p-4 md:p-10 ${mainContentMargin}`}>
        
        {/* Header Bar */}
        <div className="mb-8 flex items-center justify-between bg-white px-8 py-5 rounded-[2.5rem] shadow-sm border border-slate-200">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${dbStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                {dbStatus === 'connected' ? `${t('liveSync')}: ${themeSettings.cafeAccountId}` : t('offline')}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Global Language Switcher */}
             <button 
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl transition-colors border border-slate-100"
                title="Switch Language"
             >
                <Globe className="w-4 h-4 text-slate-500" />
                <span className="text-[10px] font-black text-slate-700 uppercase">{language === 'ar' ? 'EN' : 'AR'}</span>
             </button>

             <div className="h-8 w-px bg-slate-100 mx-2 hidden sm:block"></div>

             <div className="text-start hidden sm:block">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {currentUserType === 'ADMIN' ? t('welcome_admin') : t('welcome_staff')}
                </p>
                <p className="text-sm font-black text-slate-900">
                  {currentUserType === 'ADMIN' ? t('welcome_admin') : currentStaffUser?.name}
                </p>
             </div>
             <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${currentUserType === 'ADMIN' ? 'admin' : currentStaffUser?.username}`} className="w-10 h-10 rounded-full bg-slate-100 p-1 border border-slate-200" alt="Avatar" />
          </div>
        </div>
        
        {dbStatus === 'permission-denied' && (
          <div className="mb-6 bg-red-50 border border-red-200 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-4 text-red-800 animate-in fade-in shadow-lg">
            <div className="p-3 bg-red-100 rounded-full shrink-0">
              <ShieldAlert className="w-8 h-8 text-red-600" />
            </div>
            <div className="flex-1">
               <h3 className="text-lg font-black">{t('permissionDenied')} (قواعد الأمان)</h3>
               <p className="text-sm mt-1 leading-relaxed">
                 لم يتمكن النظام من الوصول لقاعدة البيانات. هذا بسبب قواعد الأمان (Security Rules).
                 <br/>
                 <strong>الحل السريع (للمطورين):</strong> قم بنشر قواعد الأمان المرفقة (firestore.rules) عبر الأمر:
                 <code className="mx-1 px-2 py-0.5 bg-red-100 rounded text-red-900 font-mono text-xs">firebase deploy --only firestore</code>
                 <br/>
                 أو قم بتغيير القواعد يدوياً في <a href="https://console.firebase.google.com" target="_blank" className="underline font-bold hover:text-red-950">Firebase Console</a> إلى وضع الاختبار (Test Mode).
               </p>
            </div>
          </div>
        )}

        <div className="pb-10">
          {currentView === 'DASHBOARD' && <Dashboard data={appData} insight={insight} onRefreshInsights={handleRefreshInsights} isRefreshing={isRefreshingInsight} setCurrentView={setCurrentView} />}
          
          {currentView === 'EMPLOYEE_PORTAL' && currentStaffUser && (
            <EmployeePortal 
              user={currentStaffUser} 
              tasks={tasks} 
              onCompleteTask={(id) => {
                 const t = tasks.find(x => x.id === id);
                 if (t) saveDoc('tasks', { ...t, status: 'completed' });
              }} 
              onAttendance={(type) => updateStaffAttendance(currentStaffUser.id, type)}
              onUpdateStaff={(updated) => saveDoc('staff', updated)}
            />
          )}

          {currentView === 'INVENTORY_HUB' && (
            <InventoryHub 
              inventory={inventory} 
              assets={assets} 
              onAddItem={(i) => saveDoc('inventory', i)} 
              onDeleteItem={(id) => removeDoc('inventory', id)} 
              onUpdateItem={(u) => saveDoc('inventory', u)} 
              onAddAsset={(a) => saveDoc('assets', a)} 
              onDeleteAsset={(id) => removeDoc('assets', id)} 
              onUpdateAsset={(u) => saveDoc('assets', u)} 
              onWithdraw={(id, q) => {
                const item = inventory.find(i => i.id === id);
                if (item) saveDoc('inventory', { ...item, quantity: Math.max(0, item.quantity - q) });
              }} 
              onAdjust={(id, q) => {
                const item = inventory.find(i => i.id === id);
                if (item) saveDoc('inventory', { ...item, quantity: q });
              }} 
            />
          )}

          {currentView === 'STAFF' && (
            <StaffManager 
              staff={staff} 
              onAdd={(s) => saveDoc('staff', s)} 
              onDelete={(id) => removeDoc('staff', id)} 
              onUpdate={(u) => saveDoc('staff', u)} 
              onAttendance={updateStaffAttendance} 
              onSetAssignment={(id, ass) => {
                const s = staff.find(x => x.id === id);
                if (s) saveDoc('staff', { ...s, externalAssignment: ass });
              }} 
              cafeLocation={cafeLocation} 
            />
          )}

          {currentView === 'AI_ASSISTANT' && <AIAssistant contextData={appData} />}
          {currentView === 'REPORTS' && <Reports data={appData} />}
          
          {currentView === 'DOCUMENTS' && (
            <ComplianceTracker 
              documents={documents} 
              onAdd={(d) => saveDoc('documents', d)} 
              onDelete={(id) => removeDoc('documents', id)} 
            />
          )}

          {currentView === 'TREASURY' && (
            <TreasuryManager 
              transactions={treasuryTransactions} 
              onAdd={(tx) => saveDoc('treasury', tx)} 
              onDelete={(id) => removeDoc('treasury', id)} 
            />
          )}

          {currentView === 'RENTALS' && (
            <RentalsManager 
              rentals={rentals} 
              onAdd={(u) => saveDoc('rentals', u)} 
              onUpdate={(u) => saveDoc('rentals', u)} 
              onDelete={(id) => removeDoc('rentals', id)} 
            />
          )}

          {currentView === 'SERVICE_SUBSCRIPTIONS' && (
            <ServiceSubscriptions 
              subscriptions={serviceSubscriptions} 
              onAdd={(sub) => saveDoc('services', sub)} 
              onUpdate={(u) => saveDoc('services', u)} 
              onDelete={(id) => removeDoc('services', id)} 
              billingThreshold={billingThreshold} 
            />
          )}

          {currentView === 'TASK_MANAGER' && (
            <TaskManager 
              tasks={tasks} 
              staff={staff} 
              onAddTask={(t) => saveDoc('tasks', t)} 
              onDeleteTask={(id) => removeDoc('tasks', id)} 
            />
          )}

          {currentView === 'DEPLOYMENT_CENTER' && <DeploymentCenter />}
          
          {currentView === 'SETTINGS' && (
            <Settings 
              onReset={() => {}} 
              cafeLocation={cafeLocation} 
              setCafeLocation={(loc) => saveDoc('settings', { id: 'location', ...loc })} 
              billingThreshold={billingThreshold} 
              setBillingThreshold={(val) => saveDoc('settings', { id: 'config', billingThreshold: val })}
              themeSettings={themeSettings} 
              setThemeSettings={(settings) => saveDoc('settings', { id: 'theme', ...settings })}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
