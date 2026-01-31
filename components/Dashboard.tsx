
import React from 'react';
import { 
  TrendingUp, Sparkles, Warehouse, Users, DollarSign, RefreshCw, 
  ArrowUpRight, ArrowDownRight, Coffee, ShieldAlert, Globe, Clock,
  UserPlus, Plus, ReceiptText, LayoutGrid
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { View } from '../types';

interface DashboardProps {
  data: any;
  insight: string;
  onRefreshInsights: () => void;
  isRefreshing: boolean;
  setCurrentView: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, insight, onRefreshInsights, isRefreshing, setCurrentView }) => {
  const totalIn = data.treasuryTransactions.filter((t: any) => t.type === 'IN').reduce((a: number, b: any) => a + b.amount, 0);
  const totalOut = data.treasuryTransactions.filter((t: any) => t.type === 'OUT').reduce((a: number, b: any) => a + b.amount, 0);
  const balance = totalIn - totalOut;

  const lowStock = data.inventory.filter((i: any) => i.quantity <= i.minLimit);
  
  const expiringInventory = data.inventory.filter((i: any) => {
    if (!i.expiryDate) return false;
    const diff = new Date(i.expiryDate).getTime() - new Date().getTime();
    return diff < (7 * 24 * 3600 * 1000); // Alert within 7 days
  });

  const expiringDocs = data.documents.filter((d: any) => {
    const diff = new Date(d.expiryDate).getTime() - new Date().getTime();
    return diff < (30 * 24 * 3600 * 1000);
  });

  const quickActions = [
    { id: 'STAFF', label: 'تسجيل موظف', icon: UserPlus, color: 'bg-blue-500' },
    { id: 'INVENTORY_HUB', label: 'إضافة مخزون', icon: Plus, color: 'bg-amber-500' },
    { id: 'TREASURY', label: 'سند مالي', icon: ReceiptText, color: 'bg-emerald-500' },
    { id: 'TASK_MANAGER', label: 'تعيين مهمة', icon: LayoutGrid, color: 'bg-indigo-500' },
  ];

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-700">
      {/* Real-time Status Bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar -mx-2 px-2">
        <div className="flex-none bg-emerald-500 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] font-black flex items-center gap-2 whitespace-nowrap">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
          مباشر
        </div>
        {lowStock.length > 0 && (
          <div className="flex-none bg-orange-100 text-orange-700 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] font-black flex items-center gap-2 border border-orange-200 whitespace-nowrap">
            <Warehouse className="w-3 h-3" /> {lowStock.length} نواقص
          </div>
        )}
        {expiringInventory.length > 0 && (
          <div className="flex-none bg-rose-100 text-rose-700 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] font-black flex items-center gap-2 border border-rose-200 whitespace-nowrap">
            <Clock className="w-3 h-3" /> {expiringInventory.length} صلاحيات منتهية قريباً
          </div>
        )}
        {expiringDocs.length > 0 && (
          <div className="flex-none bg-red-100 text-red-700 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] font-black flex items-center gap-2 border border-red-200 whitespace-nowrap">
            <ShieldAlert className="w-3 h-3" /> {expiringDocs.length} وثائق
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="رصيد الخزنة" value={`${balance.toLocaleString()}`} unit="ر.س" icon={DollarSign} color="amber" up={true} />
        <StatCard title="الموظفين" value={data.staff.filter((s:any)=>s.isClockedIn).length} unit="نشط" icon={Users} color="blue" up={null} />
        <StatCard title="المخزون" value={data.inventory.length} unit="صنف" icon={Warehouse} color="emerald" up={false} />
        <StatCard title="الإيجارات" value={data.rentals.length} unit="وحدة" icon={Coffee} color="indigo" up={true} />
      </div>

      {/* Quick Actions Section */}
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">إجراءات سريعة</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map(action => (
            <button 
              key={action.id}
              onClick={() => setCurrentView(action.id as View)}
              className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-amber-500 hover:bg-white hover:shadow-xl transition-all group"
            >
              <div className={`p-3 rounded-2xl ${action.color} text-white shadow-lg mb-3 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-black text-slate-900">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 bg-white p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <h3 className="text-sm md:text-lg font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" /> التدفق المالي
            </h3>
            <div className="flex gap-2 md:gap-4">
              <div className="flex items-center gap-1.5 md:gap-2">
                <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-emerald-500"></div>
                <span className="text-[8px] md:text-[10px] font-bold text-slate-500">وارد</span>
              </div>
            </div>
          </div>
          <div className="h-[200px] md:h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.treasuryTransactions.slice(-7)}>
                  <defs>
                    <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', fontSize: '10px' }} />
                  <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#colorIn)" strokeWidth={3} />
                </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-2xl text-white relative flex flex-col min-h-[300px] border-b-4 md:border-b-8 border-amber-500">
           <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
           <h3 className="text-sm md:text-lg font-black mb-4 md:mb-6 flex items-center gap-2 text-amber-400 relative z-10">
             <Sparkles className="w-4 h-4 md:w-5 md:h-5" /> Gemini AI
           </h3>
           <div className="text-slate-300 text-xs md:text-sm leading-relaxed font-medium mb-auto overflow-y-auto pr-2 relative z-10 whitespace-pre-wrap max-h-[200px] lg:max-h-full">
             {insight}
           </div>
           <button 
            onClick={onRefreshInsights} 
            disabled={isRefreshing}
            className="w-full mt-6 md:mt-8 py-3 md:py-4 bg-amber-500 text-slate-900 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs hover:bg-amber-400 transition-all flex items-center justify-center gap-2 relative z-10 shadow-lg active:scale-95"
           >
             {isRefreshing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
             {isRefreshing ? 'تحليل...' : 'تحديث الرؤية'}
           </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, unit, icon: Icon, color, up }: any) => {
  const colors: any = {
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };
  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-200 shadow-sm hover:border-amber-500 transition-all group relative">
      <div className="flex items-center justify-between mb-2 md:mb-4">
        <div className={`p-2 md:p-3 rounded-lg md:rounded-xl ${colors[color]} border group-hover:scale-110 transition-transform`}>
          <Icon className="w-4 h-4 md:w-5 md:h-5" />
        </div>
        {up !== null && (
          <div className={`flex items-center gap-1 text-[8px] md:text-[9px] font-black px-2 py-0.5 rounded-full ${up ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {up ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
            {up ? 'نمو' : 'مراجعة'}
          </div>
        )}
      </div>
      <p className="text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest">{title}</p>
      <div className="flex items-baseline gap-1 mt-0.5 md:mt-1">
        <h4 className="text-xl md:text-2xl font-black text-slate-900">{value}</h4>
        <span className="text-[9px] md:text-[10px] font-bold text-slate-400">{unit}</span>
      </div>
    </div>
  );
};

export default Dashboard;
