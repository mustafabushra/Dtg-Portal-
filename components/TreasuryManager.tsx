
import React, { useState } from 'react';
import { Banknote, ArrowUpRight, ArrowDownRight, Plus, Search, Trash2, Wallet, X, FileText, PieChart as PieIcon, Calendar, Hash } from 'lucide-react';
import { TreasuryTransaction } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

interface TreasuryManagerProps {
  transactions: TreasuryTransaction[];
  onAdd: (tx: TreasuryTransaction) => void;
  onDelete: (id: string) => void;
}

const TreasuryManager: React.FC<TreasuryManagerProps> = ({ transactions, onAdd, onDelete }) => {
  const { t, dir } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  const totalIn = transactions.filter(tx => tx.type === 'IN').reduce((acc, tx) => acc + tx.amount, 0);
  const totalOut = transactions.filter(tx => tx.type === 'OUT').reduce((acc, tx) => acc + tx.amount, 0);
  const balance = totalIn - totalOut;

  const chartData = [
    { name: t('treasury_in'), value: totalIn, color: '#10b981' },
    { name: t('treasury_out'), value: totalOut, color: '#ef4444' }
  ];

  const filtered = transactions.filter(tx => tx.description.includes(search) || tx.referenceNumber.includes(search));

  const handleDelete = (tx: TreasuryTransaction) => {
    if (window.confirm(t('confirm_delete'))) {
      onDelete(tx.id);
    }
  };

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
            <div className={`absolute top-0 w-24 h-24 bg-emerald-500/5 rounded-bl-[3rem] transition-all group-hover:w-32 group-hover:h-32 ${dir === 'rtl' ? 'right-0 rounded-bl-[3rem]' : 'left-0 rounded-br-[3rem]'}`}></div>
            <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest mb-2">{t('treasury_in')}</p>
            <h3 className="text-3xl font-black text-emerald-600 flex items-center gap-2">
              <ArrowUpRight className={`w-6 h-6 ${dir === 'ltr' ? 'rotate-45' : '-rotate-45'}`} /> {totalIn.toLocaleString()} <span className="text-sm text-slate-400">SR</span>
            </h3>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
             <div className={`absolute top-0 w-24 h-24 bg-rose-500/5 rounded-bl-[3rem] transition-all group-hover:w-32 group-hover:h-32 ${dir === 'rtl' ? 'right-0 rounded-bl-[3rem]' : 'left-0 rounded-br-[3rem]'}`}></div>
            <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest mb-2">{t('treasury_out')}</p>
            <h3 className="text-3xl font-black text-rose-600 flex items-center gap-2">
              <ArrowDownRight className={`w-6 h-6 ${dir === 'ltr' ? '-rotate-45' : 'rotate-45'}`} /> {totalOut.toLocaleString()} <span className="text-sm text-slate-400">SR</span>
            </h3>
          </div>
          <div className="md:col-span-2 bg-slate-900 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden border-b-8 border-amber-500">
            <div className={`absolute top-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] ${dir === 'rtl' ? 'right-0' : 'left-0'}`}></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-amber-500 text-[11px] font-black uppercase tracking-widest mb-2">السيولة النقدية المتوفرة</p>
                <h3 className="text-5xl font-black text-white flex flex-wrap gap-2 items-baseline">
                  {balance.toLocaleString()} <span className="text-xl text-slate-500">SR</span>
                </h3>
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
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> {t('treasury_in')}</div>
              <div className="flex items-center gap-2 text-[10px] font-black text-rose-600"><div className="w-2 h-2 rounded-full bg-rose-500"></div> {t('treasury_out')}</div>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
          <div className="flex-1 relative">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${dir === 'rtl' ? 'right-4' : 'left-4'}`} />
            <input 
              value={search} 
              onChange={(e)=>setSearch(e.target.value)} 
              type="text" 
              placeholder={t('treasury_search')} 
              className={`w-full py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-amber-500/10 text-sm font-bold ${dir === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
            />
          </div>
          <button 
            onClick={()=>setShowModal(true)} 
            className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-amber-500 hover:text-slate-900 transition-all flex items-center justify-center gap-2 shadow-xl"
          >
            <Plus className="w-5 h-5" /> {t('treasury_add_manual')}
          </button>
        </div>

        {/* -------------------- DESKTOP VIEW (Table) -------------------- */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-start">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-start">{t('treasury_date')}</th>
                <th className="px-8 py-5 text-start">{t('treasury_ref')}</th>
                <th className="px-8 py-5 text-start">{t('treasury_desc')}</th>
                <th className="px-8 py-5 text-center">{t('treasury_amount')}</th>
                <th className="px-8 py-5 text-end">{t('treasury_action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-5 text-sm font-bold text-slate-500">{tx.date}</td>
                  <td className="px-8 py-5 text-xs font-black"><span className="bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 text-slate-600">{tx.referenceNumber}</span></td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-black text-slate-900">{tx.description}</p>
                    <p className="text-[10px] font-black text-amber-500 uppercase">{tx.category}</p>
                  </td>
                  <td className={`px-8 py-5 text-center text-sm font-black ${tx.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.type === 'IN' ? '+' : '-'}{tx.amount.toLocaleString()}
                  </td>
                  <td className="px-8 py-5 text-end">
                    <button onClick={()=>handleDelete(tx)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* -------------------- MOBILE VIEW (Cards) -------------------- */}
        <div className="lg:hidden p-4 space-y-4 bg-slate-50/50">
          {filtered.map(tx => (
            <div key={tx.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-all">
               {/* Decorative Side Bar */}
               <div className={`absolute top-0 bottom-0 w-1 ${dir === 'rtl' ? 'right-0' : 'left-0'} ${tx.type === 'IN' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
               
               <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2 text-slate-400">
                     <Calendar className="w-3.5 h-3.5" />
                     <span className="text-[10px] font-bold">{tx.date}</span>
                  </div>
                  <span className="bg-slate-100 px-2 py-1 rounded-md border border-slate-200 text-[10px] font-black text-slate-600 flex items-center gap-1">
                     <Hash className="w-3 h-3" /> {tx.referenceNumber}
                  </span>
               </div>

               <div className="mb-4">
                  <h4 className="text-sm font-black text-slate-900 leading-tight">{tx.description}</h4>
                  <span className="inline-block mt-1 text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{tx.category}</span>
               </div>

               <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className={`text-lg font-black flex items-center gap-1 ${tx.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                     {tx.type === 'IN' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                     {tx.amount.toLocaleString()} <span className="text-xs text-slate-400">SR</span>
                  </div>
                  <button 
                    onClick={() => handleDelete(tx)}
                    className="p-2 bg-slate-50 text-slate-300 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                     <Trash2 className="w-4 h-4" />
                  </button>
               </div>
            </div>
          ))}
          {filtered.length === 0 && (
             <div className="text-center py-10 text-slate-400 font-bold text-sm">
                لا توجد عمليات مطابقة.
             </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <Banknote className="w-6 h-6 text-amber-500" /> {t('treasury_add_manual')}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('treasury_type') || 'نوع الحركة'}</label>
                  <select name="type" required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold">
                    <option value="OUT">{t('treasury_out')}</option>
                    <option value="IN">{t('treasury_in')}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('treasury_date')}</label>
                  <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('treasury_ref')}</label>
                  <input name="referenceNumber" required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('treasury_amount')}</label>
                  <input name="amount" type="number" required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('treasury_desc')}</label>
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
