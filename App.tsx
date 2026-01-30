
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InventoryHub from './components/InventoryHub';
import ComplianceTracker from './components/ComplianceTracker';
import StaffManager from './components/StaffManager';
import SubscriptionManager from './components/SubscriptionManager';
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
import { View, Category, InventoryItem, Asset, Staff, Document, Subscription, ServiceSubscription, AttendanceLog, TreasuryTransaction, RentalUnit, UserType, Task } from './types';
import { DatabaseZap, LogOut, Menu, X } from 'lucide-react';
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
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => loadData('cafe_subscriptions', []));
  const [serviceSubscriptions, setServiceSubscriptions] = useState<ServiceSubscription[]>(() => loadData('cafe_services', []));
  const [treasuryTransactions, setTreasuryTransactions] = useState<TreasuryTransaction[]>(() => loadData('cafe_treasury', []));
  const [rentals, setRentals] = useState<RentalUnit[]>(() => loadData('cafe_rentals', []));
  const [cafeLocation, setCafeLocation] = useState(() => loadData('cafe_location', { lat: 21.54105, lng: 39.17171 }));
  const [billingThreshold, setBillingThreshold] = useState<number>(() => loadData('billing_threshold', 7));

  const [insight, setInsight] = useState<string>('جاري تحليل كفاءة التشغيل المباشرة...');
  const [isRefreshingInsight, setIsRefreshingInsight] = useState(false);

  useEffect(() => { localStorage.setItem('cafe_inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('cafe_assets', JSON.stringify(assets)); }, [assets]);
  useEffect(() => { localStorage.setItem('cafe_staff', JSON.stringify(staff)); }, [staff]);
  useEffect(() => { localStorage.setItem('cafe_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('cafe_documents', JSON.stringify(documents)); }, [documents]);
  useEffect(() => { localStorage.setItem('cafe_subscriptions', JSON.stringify(subscriptions)); }, [subscriptions]);
  useEffect(() => { localStorage.setItem('cafe_services', JSON.stringify(serviceSubscriptions)); }, [serviceSubscriptions]);
  useEffect(() => { localStorage.setItem('cafe_treasury', JSON.stringify(treasuryTransactions)); }, [treasuryTransactions]);
  useEffect(() => { localStorage.setItem('cafe_rentals', JSON.stringify(rentals)); }, [rentals]);
  useEffect(() => { localStorage.setItem('cafe_location', JSON.stringify(cafeLocation)); }, [cafeLocation]);
  useEffect(() => { localStorage.setItem('billing_threshold', JSON.stringify(billingThreshold)); }, [billingThreshold]);

  const appData = useMemo(() => ({ inventory, assets, staff, documents, subscriptions, serviceSubscriptions, treasuryTransactions, rentals, cafeLocation, tasks, billingThreshold }), 
    [inventory, assets, staff, documents, subscriptions, serviceSubscriptions, treasuryTransactions, rentals, cafeLocation, tasks, billingThreshold]);

  const handleRefreshInsights = async () => {
    setIsRefreshingInsight(true);
    const text = await getCafeInsights(appData);
    setInsight(text || "تعذر الحصول على تحليل حالياً.");
    setIsRefreshingInsight(false);
  };

  const handleLogin = (type: 'ADMIN' | 'STAFF', staffId?: string, password?: string) => {
    if (type === 'ADMIN') {
      setCurrentUserType('ADMIN');
      setCurrentView('DASHBOARD');
    } else {
      const user = staff.find(s => s.id === staffId);
      if (user) {
        setCurrentStaffUser(user);
        setCurrentUserType('STAFF');
        setCurrentView('EMPLOYEE_PORTAL');
      }
    }
  };

  const handleLogout = () => {
    setCurrentUserType(null);
    setCurrentStaffUser(null);
  };

  const updateStaffAttendance = (staffId: string, type: 'IN' | 'OUT') => {
    const now = new Date();
    setStaff(prevStaff => prevStaff.map(s => {
      if (s.id !== staffId) return s;
      let earned = 0; let hours = 0;
      const log: AttendanceLog = { id: Math.random().toString(36).substr(2, 9), type, timestamp: now.toISOString(), earnedAmount: Math.round(earned) };
      const updatedUser = { ...s, isClockedIn: type === 'IN', lastClockIn: type === 'IN' ? now.toISOString() : s.lastClockIn, attendanceHistory: [log, ...(s.attendanceHistory || [])] };
      if (currentStaffUser?.id === staffId) setCurrentStaffUser(updatedUser);
      return updatedUser;
    }));
  };

  if (!currentUserType) {
    return <Login onLogin={handleLogin} staffList={staff} />;
  }

  return (
    <div className="min-h-screen flex bg-[#f8fafc] font-['Cairo'] text-slate-900 overflow-x-hidden">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={(v) => { setCurrentView(v); setIsSidebarOpen(false); }} 
        userType={currentUserType} 
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <main className={`flex-1 transition-all duration-300 w-full ${currentUserType === 'ADMIN' ? 'lg:mr-64' : 'lg:mr-64'} p-4 md:p-8 lg:p-10`}>
        
        {/* Top Header Bar */}
        <div className="mb-6 md:mb-8 flex items-center justify-between bg-white px-4 md:px-8 py-3 md:py-5 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 md:gap-6">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-500">البث السحابي نشط</span>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
             <div className="text-left ml-2 md:ml-4">
                <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentUserType === 'ADMIN' ? 'Owner' : 'Staff'}</p>
                <p className="text-xs md:text-sm font-black text-slate-900">{currentUserType === 'ADMIN' ? 'المدير العام' : currentStaffUser?.name}</p>
             </div>
             <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${currentUserType === 'ADMIN' ? 'admin' : currentStaffUser?.name}`} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 p-1 border border-slate-200" alt="Avatar" />
          </div>
        </div>

        <div className="pb-10">
          {currentView === 'DASHBOARD' && <Dashboard data={appData} insight={insight} onRefreshInsights={handleRefreshInsights} isRefreshing={isRefreshingInsight} />}
          {currentView === 'EMPLOYEE_PORTAL' && currentStaffUser && (
            <EmployeePortal 
              user={currentStaffUser} 
              tasks={tasks} 
              onCompleteTask={(id) => setTasks(tasks.map(t => t.id === id ? {...t, status: 'completed'} : t))}
              onAttendance={(type) => updateStaffAttendance(currentStaffUser.id, type)}
            />
          )}
          {currentView === 'TASK_MANAGER' && <TaskManager tasks={tasks} staff={staff} onAddTask={(t) => setTasks([t, ...tasks])} onDeleteTask={(id) => setTasks(tasks.filter(t => t.id !== id))} />}
          {currentView === 'INVENTORY_HUB' && (
            <InventoryHub 
              inventory={inventory} assets={assets}
              onAddItem={(i) => setInventory([...inventory, i])} onDeleteItem={(id) => setInventory(inventory.filter(i => i.id !== id))} onUpdateItem={(u) => setInventory(inventory.map(i => i.id === u.id ? u : i))}
              onAddAsset={(a) => setAssets([...assets, a])} onDeleteAsset={(id) => setAssets(assets.filter(a => a.id !== id))} onUpdateAsset={(u) => setAssets(assets.map(a => a.id === u.id ? u : a))}
              onWithdraw={(id, q) => setInventory(inventory.map(i => i.id === id ? {...i, quantity: Math.max(0, i.quantity - q)} : i))}
              onAdjust={(id, q) => setInventory(inventory.map(i => i.id === id ? {...i, quantity: q} : i))}
            />
          )}
          {currentView === 'STAFF' && <StaffManager staff={staff} onAdd={(s) => setStaff([...staff, s])} onDelete={(id) => setStaff(staff.filter(s => s.id !== id))} onUpdate={(u) => setStaff(staff.map(s => s.id === u.id ? u : s))} onAttendance={updateStaffAttendance} onSetAssignment={(id, ass) => setStaff(staff.map(s => s.id === id ? {...s, externalAssignment: ass} : s))} cafeLocation={cafeLocation} />}
          {currentView === 'TREASURY' && <TreasuryManager transactions={treasuryTransactions} onAdd={(tx) => setTreasuryTransactions([tx, ...treasuryTransactions])} onDelete={(id) => setTreasuryTransactions(treasuryTransactions.filter(t => t.id !== id))} />}
          {currentView === 'RENTALS' && <RentalsManager rentals={rentals} onAdd={(u) => setRentals([...rentals, u])} onUpdate={(u) => setRentals(rentals.map(r => r.id === u.id ? u : r))} onDelete={(id) => setRentals(rentals.filter(r => r.id !== id))} />}
          {currentView === 'SUBSCRIPTIONS' && <SubscriptionManager subscriptions={subscriptions} onAdd={(s) => setSubscriptions([...subscriptions, s])} onUpdate={(u) => setSubscriptions(subscriptions.map(s => s.id === u.id ? u : s))} onDelete={(id) => setSubscriptions(subscriptions.filter(s => s.id !== id))} />}
          {currentView === 'AI_ASSISTANT' && <AIAssistant contextData={appData} />}
          {currentView === 'REPORTS' && <Reports data={appData} />}
          {currentView === 'DOCUMENTS' && <ComplianceTracker documents={documents} onAdd={(d) => setDocuments([...documents, d])} onDelete={(id) => setDocuments(documents.filter(doc => doc.id !== id))} />}
          {currentView === 'SERVICE_SUBSCRIPTIONS' && <ServiceSubscriptions subscriptions={serviceSubscriptions} onAdd={(sub) => setServiceSubscriptions([...serviceSubscriptions, sub])} onUpdate={(u) => setServiceSubscriptions(serviceSubscriptions.map(s => s.id === u.id ? u : s))} onDelete={(id) => setServiceSubscriptions(serviceSubscriptions.filter(s => s.id !== id))} billingThreshold={billingThreshold} />}
          {currentView === 'SETTINGS' && <Settings onReset={() => {localStorage.clear(); window.location.reload();}} cafeLocation={cafeLocation} setCafeLocation={setCafeLocation} billingThreshold={billingThreshold} setBillingThreshold={setBillingThreshold} />}
        </div>
      </main>
    </div>
  );
};

export default App;
