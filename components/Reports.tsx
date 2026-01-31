
import React from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { Download, Calendar, Filter, ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, Wallet } from 'lucide-react';

interface ReportsProps {
  data: any;
}

const Reports: React.FC<ReportsProps> = ({ data }) => {
  const inventoryStats = [
    { name: 'المخزون', count: data.inventory.length },
    { name: 'الأصول', count: data.assets.length },
    { name: 'الموظفين', count: data.staff.length }
  ];

  const treasuryIn = data.treasuryTransactions.filter((t: any) => t.type === 'IN').reduce((a: number, b: any) => a + b.amount, 0);
  const treasuryOut = data.treasuryTransactions.filter((t: any) => t.type === 'OUT').reduce((a: number, b: any) => a + b.amount, 0);
  const totalPayroll = data.staff.reduce((a: number, s: any) => a + (s.totalMonthlyEarnings || 0), 0);

  const financialData = [
    { name: 'الوارد', amount: treasuryIn },
    { name: 'المنصرف', amount: treasuryOut },
    { name: 'الرواتب', amount: totalPayroll }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">التقارير والتحليلات المباشرة</h2>
          <p className="text-slate-500 text-sm font-bold">تحليل ذكي يعتمد على البيانات المسجلة في النظام.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50">
            <Calendar className="w-4 h-4" />
            تحليل حيوي
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl">
            <Download className="w-4 h-4" />
            تصدير تقارير PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportMetricCard title="إجمالي حركة الخزنة (وارد)" value={`${treasuryIn.toLocaleString()} ر.س`} trend="+ الحقيقي" up={true} icon={TrendingUp} />
        <ReportMetricCard title="إجمالي الالتزامات (صرف/رواتب)" value={`${(treasuryOut + totalPayroll).toLocaleString()} ر.س`} trend="مؤكد" up={false} icon={DollarSign} />
        <ReportMetricCard title="رصيد السيولة الحالي" value={`${(treasuryIn - treasuryOut - totalPayroll).toLocaleString()} ر.س`} trend="دقيق" up={true} icon={Wallet} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
          <h3 className="text-lg font-black mb-6 flex items-center justify-between text-slate-900">
            توزيع الأصول والبيانات
            <Filter className="w-4 h-4 text-slate-300 cursor-pointer" />
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={inventoryStats}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#94a3b8'}} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="count" stroke="#f59e0b" fillOpacity={1} fill="url(#colorCount)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
          <h3 className="text-lg font-black mb-6 flex items-center justify-between text-slate-900">
            المؤشرات المالية (ر.س)
            <div className="flex gap-2">
               <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest"><span className="w-2 h-2 rounded-full bg-slate-900"></span> التحليل الفعلي</span>
            </div>
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#94a3b8'}} />
                <Tooltip />
                <Bar dataKey="amount" fill="#0f172a" radius={[12, 12, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportMetricCard = ({ title, value, trend, up, icon: Icon }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 group hover:border-amber-500 transition-all duration-300 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-[2.5rem] flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-900 transition-colors">
       <Icon className="w-6 h-6 text-slate-400 group-hover:text-slate-900" />
    </div>
    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
    <div className="flex items-end justify-between">
      <h4 className="text-2xl font-black text-slate-900">{value}</h4>
      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${up ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
        {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {trend}
      </div>
    </div>
  </div>
);

export default Reports;
