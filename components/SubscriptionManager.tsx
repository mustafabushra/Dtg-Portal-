
import React, { useState } from 'react';
import { CreditCard, Search, UserPlus, Filter, Crown, CheckCircle2, X, Trash2, UserCheck } from 'lucide-react';
import { Subscription } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import ConfirmModal from './ConfirmModal';

interface SubscriptionManagerProps {
  subscriptions: Subscription[];
  onAdd: (sub: Subscription) => void;
  onUpdate: (sub: Subscription) => void;
  onDelete: (id: string) => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ subscriptions, onAdd, onUpdate, onDelete }) => {
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  
  // Confirmation Modal State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredSubs = subscriptions.filter(s => 
    s.customerName.toLowerCase().includes(search.toLowerCase()) || 
    s.phone.includes(search)
  );

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newSub: Subscription = {
      id: Math.random().toString(36).substr(2, 9),
      customerName: formData.get('customerName') as string,
      phone: formData.get('phone') as string,
      type: formData.get('type') as any,
      expiryDate: formData.get('expiryDate') as string,
      status: 'نشط',
      visitsCount: 0,
    };
    onAdd(newSub);
    setShowModal(false);
  };

  const recordVisit = (sub: Subscription) => {
    onUpdate({
      ...sub,
      visitsCount: sub.visitsCount + 1
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <ConfirmModal 
        isOpen={!!deleteId}
        title={t('modal_confirm_title')}
        message={t('confirm_delete')}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        confirmText={t('btn_confirm')}
        cancelText={t('btn_cancel')}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-black flex items-center gap-2 text-slate-900">
          <CreditCard className="w-6 h-6 text-amber-500" /> إدارة الاشتراكات والولاء
        </h2>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl active:scale-95"
        >
          <UserPlus className="w-5 h-5" /> إضافة مشترك جديد
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-4">
           <div className="flex-1 relative">
             <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="البحث برقم الهاتف أو الاسم..." 
              className="w-full pr-12 pl-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-amber-500/10 text-sm font-bold"
             />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">العميل</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">الزيارات</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">نوع الباقة</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">تاريخ الانتهاء</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubs.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-sm font-black text-amber-600 border border-amber-500/20">
                        {sub.customerName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 leading-none">{sub.customerName}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">{sub.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-black shadow-sm">
                      {sub.visitsCount} زيارة
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-1.5">
                      {sub.type === 'ذهبي' && <Crown className="w-4 h-4 text-amber-500" />}
                      <span className={`text-xs font-black uppercase tracking-wider ${
                        sub.type === 'ذهبي' ? 'text-amber-600' : 'text-slate-600'
                      }`}>{sub.type}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm text-slate-600 font-black">{sub.expiryDate}</span>
                  </td>
                  <td className="px-8 py-5 text-left flex items-center justify-end gap-3">
                    <button 
                      onClick={() => recordVisit(sub)}
                      className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      <UserCheck className="w-4 h-4" /> تسجيل زيارة
                    </button>
                    <button onClick={(e) => handleDeleteClick(e, sub.id)} className="p-2 text-slate-300 hover:text-red-500 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-900">تسجيل مشترك جديد</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl text-slate-400"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">اسم العميل</label>
                <input name="customerName" required placeholder="مثلاً: خالد بن فهد" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">رقم الهاتف</label>
                <input name="phone" required placeholder="05xxxxxxxx" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500">نوع الباقة</label>
                  <select name="type" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold">
                    <option value="شهري">باقة شهرية</option>
                    <option value="سنوي">باقة سنوية</option>
                    <option value="ذهبي">الباقة الذهبية</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500">تاريخ الانتهاء</label>
                  <input name="expiryDate" type="date" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-lg hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl">تفعيل العضوية</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManager;
