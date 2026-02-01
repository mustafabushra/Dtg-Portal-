
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
import { View, Category, InventoryItem, Asset, Staff, Document, ServiceSubscription, AttendanceLog, TreasuryTransaction, RentalUnit, UserType, Task } from './types';
import { Menu } from 'lucide-react';
import { getCafeInsights } from './services/geminiService';

const App: React.FC = () => {
  const [currentUserType, setCurrentUserType] = useState<UserType>(null);
  const [currentStaffUser, setCurrentStaffUser] = useState<Staff | null>(null);
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const loadData = (key: string, defaultValue: any) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  };

  const [inventory, setInventory] = useState<InventoryItem[]>(() => loadData('cafe_inventory', []));
  const [assets, setAssets] = useState<Asset[]>(() => loadData('cafe_assets', []));
  const [staff, setStaff] = useState<Staff[]>(() => loadData('cafe_staff', []));
  const [tasks, setTasks] = useState<Task[]>(() => loadData('cafe_tasks', []));
  const [documents, setDocuments] = useState<Document[]>(() => loadData('cafe_documents', []));
  const [serviceSubscriptions, setServiceSubscriptions] = useState<ServiceSubscription[]>(() => loadData('cafe_services', []));
  const [treasuryTransactions, setTreasuryTransactions] = useState<TreasuryTransaction[]>(() => loadData('cafe_treasury', []));
  const [rentals, setRentals] = useState<RentalUnit[]>(() => loadData('cafe_rentals', []));
  const [cafeLocation, setCafeLocation] = useState(() => loadData('cafe_location', { lat: 21.54105, lng: 39.17171 }));
  const [billingThreshold, setBillingThreshold] = useState<number>(() => loadData('billing_threshold', 7));
  
  const [themeSettings, setThemeSettings] = useState(() => loadData('cafe_theme', {
    systemName: 'كافي برو',
    primaryColor: '#f59e0b',
    logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=CAFE',
    cafeAccountId: '10101'
  }));

  const [insight, setInsight] = useState<string>('جاري تحليل كفاءة التشغيل المباشرة...');
  const [isRefreshingInsight, setIsRefreshingInsight] = useState(false);

  useEffect(() => {
    document.title = `${themeSettings.systemName} - Cloud OS`;
    document.documentElement.style.setProperty('--primary-color', themeSettings.primaryColor);
    localStorage.setItem('cafe_theme', JSON.stringify(themeSettings));
  }, [themeSettings]);

  useEffect(() => { localStorage.setItem('cafe_inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('cafe_staff', JSON.stringify(staff)); }, [staff]);
  useEffect(() => { localStorage.setItem('cafe_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('cafe_documents', JSON.stringify(documents)); }, [documents]);
  useEffect(() => { localStorage.setItem('cafe_treasury', JSON.stringify(treasuryTransactions)); }, [treasuryTransactions]);
  useEffect(() => { localStorage.setItem('cafe_rentals', JSON.stringify(rentals)); }, [rentals]);

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
      alert('رقم المؤسسة غير صحيح. يرجى مراجعة الإدارة.');
      return;
    }

    if (type === 'ADMIN') {
      if (credentials.username.toLowerCase() === 'admin' && credentials.password === '1234') { 
        setCurrentUserType('ADMIN');
        setCurrentView('DASHBOARD');
      } else {
        alert('بيانات دخول المدير غير صحيحة');
      }
    } else {
      const user = staff.find(s => s.username === credentials.username);
      if (user && user.password === credentials.password) {
        setCurrentStaffUser(user);
        setCurrentUserType('STAFF');
        // التوجيه لأول صفحة مسموح بها، أو البوابة الشخصية كخيار أول
        if (user.permissions && user.permissions.length > 0) {
          setCurrentView(user.permissions[0] as View);
        } else {
          setCurrentView('EMPLOYEE_PORTAL');
        }
      } else {
        alert('اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    }
  };

  const updateStaffAttendance = (staffId: string, type: 'IN' | 'OUT') => {
    const now = new Date();
    setStaff(prevStaff => prevStaff.map(s => {
      if (s.id !== staffId) return s;
      let earned = 0;
      if (type === 'OUT' && s.lastClockIn) {
        const diffMs = now.getTime() - new Date(s.lastClockIn).getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        earned = diffHours * s.hourlyRate;
      }
      const log: AttendanceLog = { id: Math.random().toString(36).substr(2, 9), type, timestamp: now.toISOString(), earnedAmount: Math.round(earned) };
      const updatedUser = { ...s, isClockedIn: type === 'IN', lastClockIn: type === 'IN' ? now.toISOString() : s.lastClockIn, attendanceHistory: [log, ...(s.attendanceHistory || [])], totalMonthlyHours: (s.totalMonthlyHours || 0) + (type === 'OUT' ? (now.getTime() - new Date(s.lastClockIn!).getTime()) / 3600000 : 0), totalMonthlyEarnings: (s.totalMonthlyEarnings || 0) + earned };
      if (currentStaffUser?.id === staffId) setCurrentStaffUser(updatedUser);
      return updatedUser;
    }));
  };

  if (!currentUserType) {
    return <Login onLogin={handleLogin} staffList={staff} logoUrl={themeSettings.logoUrl} systemName={themeSettings.systemName} />;
  }

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
        staffUser={currentStaffUser} // تمرير بيانات الموظف للجانبية
        onLogout={() => { setCurrentUserType(null); setCurrentStaffUser(null); }}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        logoUrl={themeSettings.logoUrl}
        systemName={themeSettings.systemName}
      />
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <main className={`flex-1 transition-all duration-300 w-full lg:mr-64 p-4 md:p-10`}>
        <div className="mb-8 flex items-center justify-between bg-white px-8 py-5 rounded-[2.5rem] shadow-sm border border-slate-200">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">مؤسسة نشطة: {themeSettings.cafeAccountId}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-left ml-4 text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentUserType === 'ADMIN' ? 'المدير' : 'موظف'}</p>
                <p className="text-sm font-black text-slate-900">{currentUserType === 'ADMIN' ? 'المدير العام' : currentStaffUser?.name}</p>
             </div>
             <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${currentUserType === 'ADMIN' ? 'admin' : currentStaffUser?.username}`} className="w-10 h-10 rounded-full bg-slate-100 p-1 border border-slate-200" alt="Avatar" />
          </div>
        </div>

        <div className="pb-10">
          {currentView === 'DASHBOARD' && <Dashboard data={appData} insight={insight} onRefreshInsights={handleRefreshInsights} isRefreshing={isRefreshingInsight} setCurrentView={setCurrentView} />}
          {currentView === 'EMPLOYEE_PORTAL' && currentStaffUser && <EmployeePortal user={currentStaffUser} tasks={tasks} onCompleteTask={(id) => setTasks(tasks.map(t => t.id === id ? {...t, status: 'completed'} : t))} onAttendance={(type) => updateStaffAttendance(currentStaffUser.id, type)} />}
          {currentView === 'INVENTORY_HUB' && <InventoryHub inventory={inventory} assets={assets} onAddItem={(i) => setInventory([...inventory, i])} onDeleteItem={(id) => setInventory(inventory.filter(i => i.id !== id))} onUpdateItem={(u) => setInventory(inventory.map(i => i.id === u.id ? u : i))} onAddAsset={(a) => setAssets([...assets, a])} onDeleteAsset={(id) => setAssets(assets.filter(a => a.id !== id))} onUpdateAsset={(u) => setAssets(assets.map(a => a.id === u.id ? u : a))} onWithdraw={(id, q) => setInventory(inventory.map(i => i.id === id ? {...i, quantity: Math.max(0, i.quantity - q)} : i))} onAdjust={(id, q) => setInventory(inventory.map(i => i.id === id ? {...i, quantity: q} : i))} />}
          {currentView === 'STAFF' && <StaffManager staff={staff} onAdd={(s) => setStaff([...staff, s])} onDelete={(id) => setStaff(staff.filter(s => s.id !== id))} onUpdate={(u) => setStaff(staff.map(s => s.id === u.id ? u : s))} onAttendance={updateStaffAttendance} onSetAssignment={(id, ass) => setStaff(staff.map(s => s.id === id ? {...s, externalAssignment: ass} : s))} cafeLocation={cafeLocation} />}
          {currentView === 'AI_ASSISTANT' && <AIAssistant contextData={appData} />}
          {currentView === 'REPORTS' && <Reports data={appData} />}
          {currentView === 'DOCUMENTS' && <ComplianceTracker documents={documents} onAdd={(d) => setDocuments([...documents, d])} onDelete={(id) => setDocuments(documents.filter(doc => doc.id !== id))} />}
          {currentView === 'TREASURY' && <TreasuryManager transactions={treasuryTransactions} onAdd={(tx) => setTreasuryTransactions([tx, ...treasuryTransactions])} onDelete={(id) => setTreasuryTransactions(treasuryTransactions.filter(t => t.id !== id))} />}
          {currentView === 'RENTALS' && <RentalsManager rentals={rentals} onAdd={(u) => setRentals([...rentals, u])} onUpdate={(u) => setRentals(rentals.map(r => r.id === u.id ? u : r))} onDelete={(id) => setRentals(rentals.filter(r => r.id !== id))} />}
          {currentView === 'SERVICE_SUBSCRIPTIONS' && <ServiceSubscriptions subscriptions={serviceSubscriptions} onAdd={(sub) => setServiceSubscriptions([...serviceSubscriptions, sub])} onUpdate={(u) => setServiceSubscriptions(serviceSubscriptions.map(s => s.id === u.id ? u : s))} onDelete={(id) => setServiceSubscriptions(serviceSubscriptions.filter(s => s.id !== id))} billingThreshold={billingThreshold} />}
          {currentView === 'TASK_MANAGER' && <TaskManager tasks={tasks} staff={staff} onAddTask={(t) => setTasks([t, ...tasks])} onDeleteTask={(id) => setTasks(tasks.filter(t => t.id !== id))} />}
          {currentView === 'DEPLOYMENT_CENTER' && <DeploymentCenter />}
          {currentView === 'SETTINGS' && (
            <Settings 
              onReset={() => {localStorage.clear(); window.location.reload();}} 
              cafeLocation={cafeLocation} setCafeLocation={setCafeLocation} 
              billingThreshold={billingThreshold} setBillingThreshold={setBillingThreshold}
              themeSettings={themeSettings} setThemeSettings={setThemeSettings}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
