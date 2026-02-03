
import React from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { Download, Calendar, Filter, ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, Wallet, PieChart as PieIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Category } from '../types';

interface ReportsProps {
  data: any;
}

const Reports: React.FC<ReportsProps> = ({ data }) => {
  const { t } = useLanguage();

  const inventoryStats = [
    { name: t('rep_inv'), count: data.inventory.length },
    { name: t('rep_assets'), count: data.assets.length },
    { name: t('rep_staff'), count: data.staff.length }
  ];

  const treasuryIn = data.treasuryTransactions.filter((t: any) => t.type === 'IN').reduce((a: number, b: any) => a + b.amount, 0);
  const treasuryOut = data.treasuryTransactions.filter((t: any) => t.type === 'OUT').reduce((a: number, b: any) => a + b.amount, 0);
  const totalPayroll = data.staff.reduce((a: number, s: any) => a + (s.totalMonthlyEarnings || 0), 0);

  const financialData = [
    { name: t('rep_in'), amount: treasuryIn },
    { name: t('rep_out'), amount: treasuryOut },
    { name: t('rep_payroll'), amount: totalPayroll }
  ];

  // Calculate Inventory Values per Category
  const getStockValue = (cat: string) => {
    return data.inventory
      .filter((i: any) => i.category === cat)
      .reduce((acc: number, i: any) => acc + (i.quantity * (i.costPerUnit || 0)), 0);
  };

  const kitchenVal = getStockValue(Category.KITCHEN);
  const barVal = getStockValue(Category.BAR);
  const storeVal = getStockValue(Category.STORE);

  const stockValueData = [
    { name: t('rep_val_kitchen'), value: kitchenVal, color: '#f97316' },
    { name: t('rep_val_bar'), value: barVal, color: '#3b82f6' },
    { name: t('rep_val_store'), value: storeVal, color: '#10b981' }
  ];

  const totalStockValue = kitchenVal + barVal + storeVal;

  const handleExportReport = () => {
    const csvContent = [
      ["Metric", "Value"],
      [t('rep_inv'), data.inventory.length],
      [t('rep_assets'), data.assets.length],
      [t('rep_staff'), data.staff.length],
      [t('rep_in'), treasuryIn],
      [t('rep_out'), treasuryOut],
      [t('rep_payroll'), totalPayroll],
      ["Inventory Value (Kitchen)", kitchenVal],
      ["Inventory Value (Bar)", barVal],
      ["Inventory Value (Store)", storeVal],
      ["Total Stock Value", totalStockValue],
      ["Net Balance", treasuryIn - treasuryOut - totalPayroll]
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `financial_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAnalyze = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">{t('rep_title')}</h2>
          <p className="text-slate-500 text-sm font-bold">{t('rep_subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleAnalyze}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
          >
            <Calendar className="w-4 h-4" />
            {t('rep_btn_analyze')} (PDF/Print)
          </button>
          <button 
            onClick={handleExportReport}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl active:scale-95"
          >
            <Download className="w-4 h-4" />
            {t('rep_btn_export')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportMetricCard title={t('rep_metric_treasury')} value={`${treasuryIn.toLocaleString()} ${t('currency')}`} trend="+" up={true} icon={TrendingUp} />
        <ReportMetricCard title={t('rep_metric_liability')} value={`${(treasuryOut + totalPayroll).toLocaleString()} ${t('currency')}`} trend="-" up={false} icon={DollarSign} />
        <ReportMetricCard title={t('rep_metric_balance')} value={`${(treasuryIn - treasuryOut - totalPayroll).toLocaleString()} ${t('currency')}`} trend="=" up={true} icon={Wallet} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
          <h3 className="text-lg font-black mb-6 flex items-center justify-between text-slate-900">
            {t('rep_dist_assets')}
            <Filter className="w-4 h-4 text-slate-300 cursor-pointer" />
          </h3>
          <div className="h-[250px]">
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
            {t('rep_financial_ind')}
            <div className="flex gap-2">
               <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest"><span className="w-2 h-2 rounded-full bg-slate-900"></span> Live</span>
            </div>
          </h3>
          <div className="h-[250px]">
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

        {/* Stock Value Distribution */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
           <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-slate-900">
             <PieIcon className="w-5 h-5 text-emerald-500" />
             {t('rep_val_breakdown')}
           </h3>
           <div className="h-[200px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stockValueData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {stockValueData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase">الإجمالي</p>
                    <p className="text-lg font-black text-slate-900">{totalStockValue.toLocaleString()}</p>
                 </div>
              </div>
           </div>
           <div className="mt-4 space-y-2">
              {stockValueData.map((d, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                   <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></div>
                      <span className="font-bold text-slate-600">{d.name}</span>
                   </div>
                   <span className="font-black text-slate-900">{d.value.toLocaleString()}</span>
                </div>
              ))}
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