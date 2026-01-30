
import React, { useState } from 'react';
import { Banknote, ArrowUpRight, ArrowDownRight, Plus, Search, Trash2, Wallet, X, FileText, PieChart as PieIcon } from 'lucide-react';
import { TreasuryTransaction } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface TreasuryManagerProps {
  transactions: TreasuryTransaction[];
  onAdd: (tx: TreasuryTransaction) => void;
  onDelete: (id: string) => void;
}

const TreasuryManager: React.FC<TreasuryManagerProps> = ({ transactions, onAdd, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  const totalIn = transactions.filter(t => t.type === 'IN').reduce((acc, t) => acc + t.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'OUT').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIn - totalOut;

  const chartData = [
    { name: 'الوارد', value: totalIn, color: '#10b981' },
    { name: 'المنصرف', value: totalOut, color: '#ef4444' }
  ];

  const filtered = transactions.filter(t => t.description.includes(search) || t.referenceNumber.includes(search));

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTx: TreasuryTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: formData.get('date') as string,
      type: formData.get('type') as 'IN' | 'OUT',
      referenceNumber: formData.get('referenceNumber') as string,
      amount: Number(formData.get('amount')),
      description: formData.get('description') as string,
      category: formData.get('category') as any,
    };
    onAdd(newTx);
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-[3rem] transition-all group-hover:w-32 group-hover:h-32"></div>
            <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest mb-2">إجمالي المقبوضات (نقد/شبكة)</p>
            <h3 className="text-3xl font-black text-emerald-600 flex items-center gap-2">
              <ArrowUpRight className="w-6 h-6" /> {totalIn.toLocaleString()} <span className="text-sm text-slate-400">ر.س</span>
            </h3>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-[3rem] transition-all group-hover:w-32 group-hover:h-32"></div>
            <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest mb-2">إجمالي المدفوعات (مصاريف/رواتب)</p>
            <h3 className="text-3xl font-black text-rose-600 flex items-center gap-2">
              <ArrowDownRight className="w-6 h-6" /> {totalOut.toLocaleString()} <span className="text-sm text-slate-400">ر.س</span>
            </h3>
          </div>
          <div className="md:col-span-2 bg-slate-900 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden border-b-8 border-amber-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px]"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-amber-500 text-[11px] font-black uppercase tracking-widest mb-2">السيولة النقدية المتوفرة</p>
                <h3 className="text-5xl font-black text-white">{balance.toLocaleString()} <span className="text-xl text-slate-500">ر.س</span></h3>
              </div>
              <div className="w-16 h-16 bg-amber-500 text-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Wallet className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center">
           <h4 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2"><PieIcon className="w-4 h-4" /> تحليل التدفق النقدي</h4>
           <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> وارد</div>
              <div className="flex items-center gap-2 text-[10px] font-black text-rose-600"><div className="w-2 h-2 rounded-full bg-rose-500"></div> منصرف</div>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={(e)=>setSearch(e.target.value)} type="text" placeholder="ابحث برقم السند أو الوصف..." className="w-full pr-12 pl-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-amber-500/10 text-sm font-bold" />
          </div>
          <button onClick={()=>setShowModal(true)} className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-amber-500 hover:text-slate-900 transition-all flex items-center justify-center gap-2 shadow-xl">
            <Plus className="w-5 h-5" /> إضافة حركة يدوية
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">التاريخ</th>
                <th className="px-8 py-5">رقم المرجع</th>
                <th className="px-8 py-5">البيان</th>
                <th className="px-8 py-5 text-center">المبلغ</th>
                <th className="px-8 py-5 text-left">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-5 text-sm font-bold text-slate-500">{t.date}</td>
                  <td className="px-8 py-5 text-xs font-black"><span className="bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 text-slate-600">{t.referenceNumber}</span></td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-black text-slate-900">{t.description}</p>
                    <p className="text-[10px] font-black text-amber-500 uppercase">{t.category}</p>
                  </td>
                  <td className={`px-8 py-5 text-center text-sm font-black ${t.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === 'IN' ? '+' : '-'}{t.amount.toLocaleString()} ر.س
                  </td>
                  <td className="px-8 py-5 text-left">
                    <button onClick={()=>onDelete(t.id)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <Banknote className="w-6 h-6 text-amber-500" /> تسجيل عملية مالية
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">نوع الحركة</label>
                  <select name="type" required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold">
                    <option value="OUT">صرف (دفع)</option>
                    <option value="IN">قبض (استلام)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">التاريخ</label>
                  <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">رقم المرجع (سند/فاتورة)</label>
                  <input name="referenceNumber" required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">المبلغ (ر.س)</label>
                  <input name="amount" type="number" required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">البيان / الوصف</label>
                <textarea name="description" required rows={3} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm resize-none" placeholder="اشرح سبب العملية بوضوح..." />
              </div>
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-lg hover:bg-amber-500 hover:text-slate-900 transition-all active:scale-95 shadow-xl">تأكيد العملية المالية</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreasuryManager;
