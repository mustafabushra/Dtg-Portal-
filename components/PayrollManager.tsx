
import React from 'react';
import { DollarSign, Calendar, CheckCircle2, User, Clock, ArrowLeftRight, Download } from 'lucide-react';
import { Staff } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface PayrollManagerProps {
  staff: Staff[];
}

const PayrollManager: React.FC<PayrollManagerProps> = ({ staff }) => {
  const { t } = useLanguage(); 
  const totalPayroll = staff.reduce((acc, s) => acc + (s.totalMonthlyEarnings || 0), 0);
  const totalHours = staff.reduce((acc, s) => acc + (s.totalMonthlyHours || 0), 0);

  const handleExportPayroll = () => {
    if (staff.length === 0) {
      alert("لا توجد بيانات لتصديرها.");
      return;
    }

    const headers = ["Employee Name", "Role", "Hourly Rate", "Hours Worked", "Total Due", "Status"];
    const rows = staff.map(s => [
      `"${s.name}"`,
      `"${s.role}"`,
      s.hourlyRate,
      Math.round(s.totalMonthlyHours || 0),
      s.totalMonthlyEarnings || 0,
      "Ready"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `payroll_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
          <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-2">إجمالي الرواتب المستحقة</p>
          <h3 className="text-3xl font-black">{totalPayroll.toLocaleString()} <span className="text-sm">ر.س</span></h3>
          <p className="text-slate-400 text-xs mt-4 font-medium italic">يتم تحديثها لحظياً مع كل بصمة انصراف</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">إجمالي ساعات العمل</p>
          <h3 className="text-3xl font-black text-slate-900">{Math.round(totalHours)} <span className="text-sm">ساعة</span></h3>
          <div className="flex items-center gap-2 text-green-600 mt-4">
             <Clock className="w-4 h-4" />
             <span className="text-xs font-black">تغطية كاملة للفترات</span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">متوسط تكلفة الساعة</p>
          <h3 className="text-3xl font-black text-slate-900">
            {staff.length > 0 ? Math.round(totalPayroll / (totalHours || 1)) : 0} <span className="text-sm">ر.س</span>
          </h3>
          <p className="text-slate-400 text-xs mt-4 font-medium">بناءً على عقود الموظفين الحالية</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-green-500" />
            تفاصيل مستحقات الكادر
          </h3>
          <button 
            onClick={handleExportPayroll}
            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-black hover:bg-amber-500 hover:text-slate-900 transition-all flex items-center gap-2 active:scale-95 shadow-lg"
          >
            <Download className="w-4 h-4" />
            تصدير مسير الرواتب
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">الموظف</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">الساعات المنجزة</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">الأجر الأساسي</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">المستحق الحالي</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-left">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-400">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{s.name}</p>
                        <p className="text-[10px] text-amber-600 font-bold">{s.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-600">{Math.round(s.totalMonthlyHours || 0)} س</td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-600">{s.hourlyRate} ر.س / ساعة</td>
                  <td className="px-8 py-5 text-sm font-black text-slate-900">{(s.totalMonthlyEarnings || 0).toLocaleString()} ر.س</td>
                  <td className="px-8 py-5 text-left">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black border border-green-100">
                      <CheckCircle2 className="w-3 h-3" />
                      جاهز للصرف
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayrollManager;
