
import React from 'react';
import { 
  TrendingUp, Sparkles, Warehouse, Users, DollarSign, RefreshCw, 
  ArrowUpRight, ArrowDownRight, Coffee, ShieldAlert, Globe, Clock,
  UserPlus, Plus, ReceiptText, LayoutGrid, Wallet, Activity, CheckCircle2, AlertTriangle, Briefcase
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { View } from '../types';

interface DashboardProps {
  data: any;
  insight: string;
  onRefreshInsights: () => void;
  isRefreshing: boolean;
  setCurrentView: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, insight, onRefreshInsights, isRefreshing, setCurrentView }) => {
  // 1. التجميع المالي المتقدم
  const treasuryIn = data.treasuryTransactions.filter((t: any) => t.type === 'IN').reduce((a: number, b: any) => a + b.amount, 0);
  const treasuryOut = data.treasuryTransactions.filter((t: any) => t.type === 'OUT').reduce((a: number, b: any) => a + b.amount, 0);
  
  const rentalIncome = data.rentals.reduce((acc: number, r: any) => {
    return acc + r.payments.filter((p: any) => p.status === 'paid').reduce((sum: number, p: any) => sum + p.amount, 0);
  }, 0);

  const currentPayrollCost = data.staff.reduce((acc: number, s: any) => acc + (s.totalMonthlyEarnings || 0), 0);
  
  const techSubscriptionsCost = data.serviceSubscriptions.reduce((acc: number, sub: any) => {
    // توحيد التكلفة لتكون شهرية للتقدير
    return acc + (sub.billingCycle === 'شهري' ? sub.cost : sub.cost / 12);
  }, 0);

  // المعادلات النهائية
  const totalRevenue = treasuryIn + rentalIncome;
  const totalExpenses = treasuryOut + currentPayrollCost + techSubscriptionsCost;
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

  // 2. البيانات التشغيلية
  const activeStaff = data.staff.filter((s:any) => s.isClockedIn);
  const criticalTasks = data.tasks.filter((t:any) => t.status === 'pending' && t.priority === 'critical');
  const lowStock = data.inventory.filter((i: any) => i.quantity <= i.minLimit);
  const expiringDocs = data.documents.filter((d: any) => {
    const diff = new Date(d.expiryDate).getTime() - new Date().getTime();
    return diff < (30 * 24 * 3600 * 1000);
  });

  const chartData = [
    { name: 'إيراد تشغيلي', amount: treasuryIn },
    { name: 'إيجارات', amount: rentalIncome },
    { name: 'مصروفات', amount: treasuryOut },
    { name: 'رواتب', amount: currentPayrollCost },
  ];

  const quickActions = [
    { id: 'STAFF', label: 'الموظفين', icon: Users, color: 'bg-blue-500' },
    { id: 'TREASURY', label: 'المالية', icon: Wallet, color: 'bg-emerald-500' },
    { id: 'TASK_MANAGER', label: 'المهام', icon: CheckCircle2, color: 'bg-indigo-500' },
    { id: 'REPORTS', label: 'التقارير', icon: Activity, color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      
      {/* شريط التنبيهات الحي */}
      {(lowStock.length > 0 || expiringDocs.length > 0 || criticalTasks.length > 0) && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
           {criticalTasks.length > 0 && (
            <div className="flex-none bg-red-500 text-white px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 shadow-lg shadow-red-500/20 animate-pulse">
              <AlertTriangle className="w-3 h-3" /> {criticalTasks.length} مهام حرجة تتطلب انتباهك
            </div>
           )}
           {lowStock.length > 0 && (
            <div className="flex-none bg-orange-100 text-orange-700 px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 border border-orange-200">
              <Warehouse className="w-3 h-3" /> {lowStock.length} أصناف في حد الطلب
            </div>
           )}
           {expiringDocs.length > 0 && (
            <div className="flex-none bg-slate-800 text-white px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2">
              <ShieldAlert className="w-3 h-3" /> {expiringDocs.length} وثائق حكومية
            </div>
           )}
        </div>
      )}

      {/* 1. قسم الموقف المالي للمالك */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* بطاقة صافي الربح الكبيرة */}
        <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[280px]">
           <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]"></div>
           <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px]"></div>
           
           <div className="relative z-10 flex justify-between items-start">
              <div>
                 <p className="text-amber-500 text-xs font-black uppercase tracking-widest mb-1">صافي الربح التقديري (الحقيقي)</p>
                 <p className="text-slate-400 text-[10px] font-bold">يشمل: المبيعات + الإيجارات - (المصروفات + الرواتب + الاشتراكات)</p>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                 <Wallet className="w-6 h-6 text-amber-500" />
              </div>
           </div>

           <div className="relative z-10 mt-6">
              <h2 className="text-5xl md:text-6xl font-black tracking-tight flex items-baseline gap-2">
                 {netProfit.toLocaleString()} <span className="text-xl text-slate-500 font-bold">ر.س</span>
              </h2>
              <div className="flex items-center gap-4 mt-4">
                 <div className={`px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 ${Number(profitMargin) >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    <Activity className="w-3 h-3" /> هامش الربح: {profitMargin}%
                 </div>
                 <div className="h-4 w-px bg-white/10"></div>
                 <p className="text-[10px] text-slate-400 font-bold">آخر تحديث: الآن</p>
              </div>
           </div>

           <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10 relative z-10">
              <div>
                 <p className="text-[9px] text-slate-400 font-black uppercase mb-1">إجمالي الدخل</p>
                 <p className="text-lg font-black text-emerald-400 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" /> {totalRevenue.toLocaleString()}
                 </p>
              </div>
              <div>
                 <p className="text-[9px] text-slate-400 font-black uppercase mb-1">إجمالي المصروفات</p>
                 <p className="text-lg font-black text-rose-400 flex items-center gap-1">
                    <ArrowDownRight className="w-3 h-3" /> {totalExpenses.toLocaleString()}
                 </p>
              </div>
              <div>
                 <p className="text-[9px] text-slate-400 font-black uppercase mb-1">الرواتب المستحقة</p>
                 <p className="text-lg font-black text-amber-400 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> {currentPayrollCost.toLocaleString()}
                 </p>
              </div>
           </div>
        </div>

        {/* بطاقة الموظفين والحالة */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 flex flex-col relative overflow-hidden">
           <div className="flex justify-between items-start mb-6">
              <div>
                 <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">نبض الميدان</p>
                 <h3 className="text-2xl font-black text-slate-900">الكادر النشط</h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                 <Users className="w-6 h-6" />
              </div>
           </div>

           <div className="flex-1 space-y-4 overflow-y-auto max-h-[160px] custom-scrollbar pr-1">
              {activeStaff.length > 0 ? activeStaff.map((staff: any) => (
                <div key={staff.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                   <div className="relative">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.username}`} className="w-10 h-10 rounded-xl bg-white" />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-50 rounded-full"></div>
                   </div>
                   <div>
                      <p className="text-xs font-black text-slate-900">{staff.name}</p>
                      <p className="text-[9px] text-slate-500 font-bold">{staff.role} • منذ {staff.lastClockIn ? new Date(staff.lastClockIn).toLocaleTimeString('ar-SA', {hour: '2-digit', minute:'2-digit'}) : '--'}</p>
                   </div>
                </div>
              )) : (
                <div className="text-center py-6 text-slate-400 text-xs font-bold italic bg-slate-50 rounded-2xl">
                   لا يوجد موظفين مسجلين دخول حالياً
                </div>
              )}
           </div>
           
           <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
              <p className="text-[10px] font-black text-slate-400">إجمالي الموظفين: {data.staff.length}</p>
              <button onClick={() => setCurrentView('STAFF')} className="text-[10px] font-black text-blue-600 hover:underline">إدارة الكادر</button>
           </div>
        </div>
      </div>

      {/* 2. قسم التحليل البياني والذكاء الاصطناعي */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* الرسم البياني المالي */}
         <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-custom-primary" /> توزيع التدفقات المالية
               </h3>
               <div className="flex gap-2">
                  <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-md">تحليل مباشر</span>
               </div>
            </div>
            <div className="h-[250px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barSize={40}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#64748b'}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#64748b'}} />
                     <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                     <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                        {chartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={index === 0 || index === 1 ? '#10b981' : index === 3 ? '#f59e0b' : '#ef4444'} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* تحليل الذكاء الاصطناعي */}
         <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl border-b-4 border-custom-primary flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-custom-primary/10 rounded-full blur-3xl"></div>
            <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-custom-primary relative z-10">
               <Sparkles className="w-5 h-5" /> المستشار الذكي
            </h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 mb-4 bg-white/5 p-4 rounded-2xl border border-white/5">
               <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-wrap font-medium">
                  {insight}
               </p>
            </div>
            <button 
               onClick={onRefreshInsights} 
               disabled={isRefreshing}
               className="w-full py-4 bg-custom-primary text-slate-900 rounded-2xl font-black text-xs hover:bg-white transition-all flex items-center justify-center gap-2 relative z-10 shadow-lg active:scale-95"
            >
               {isRefreshing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
               {isRefreshing ? 'جاري التحليل...' : 'طلب تحليل تنفيذي جديد'}
            </button>
         </div>
      </div>

      {/* 3. الإجراءات السريعة (في الأسفل) */}
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
         <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">الوصول السريع للأقسام</h3>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map(action => (
            <button 
               key={action.id}
               onClick={() => setCurrentView(action.id as View)}
               className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-custom-primary hover:bg-white hover:shadow-xl transition-all group"
            >
               <div className={`p-3 rounded-2xl ${action.color} text-white shadow-lg mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6" />
               </div>
               <span className="text-xs font-black text-slate-900">{action.label}</span>
            </button>
            ))}
         </div>
      </div>

    </div>
  );
};

export default Dashboard;
