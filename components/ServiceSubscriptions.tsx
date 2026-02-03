
import React, { useState } from 'react';
import { Globe, Plus, Calendar, CreditCard, RefreshCw, AlertCircle, Trash2, X, Wifi, ShoppingCart, Smartphone, Terminal, Briefcase } from 'lucide-react';
import { ServiceSubscription } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import ConfirmModal from './ConfirmModal';

interface ServiceSubscriptionsProps {
  subscriptions: ServiceSubscription[];
  onAdd: (sub: ServiceSubscription) => void;
  onUpdate: (sub: ServiceSubscription) => void;
  onDelete: (id: string) => void;
  billingThreshold: number;
}

const ServiceSubscriptions: React.FC<ServiceSubscriptionsProps> = ({ subscriptions, onAdd, onUpdate, onDelete, billingThreshold }) => {
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  
  // Confirmation Modal State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getDaysUntil = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const renewService = (sub: ServiceSubscription) => {
    const currentDate = new Date(sub.nextBillingDate);
    if (sub.billingCycle === 'شهري') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    } else {
      currentDate.setFullYear(currentDate.getFullYear() + 1);
    }
    
    onUpdate({
      ...sub,
      nextBillingDate: currentDate.toISOString().split('T')[0]
    });
    // Assuming simple alert is fine or use UI notification
  };

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'كاشير': return <Terminal className="w-5 h-5" />;
      case 'إنترنت': return <Wifi className="w-5 h-5" />;
      case 'توصيل': return <ShoppingCart className="w-5 h-5" />;
      case 'ولاء': return <Smartphone className="w-5 h-5" />;
      default: return <Briefcase className="w-5 h-5" />;
    }
  };

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newSub: ServiceSubscription = {
      id: Math.random().toString(36).substr(2, 9),
      provider: formData.get('provider') as string,
      serviceName: formData.get('serviceName') as string,
      category: formData.get('category') as any,
      cost: Number(formData.get('cost')),
      billingCycle: formData.get('billingCycle') as any,
      nextBillingDate: formData.get('nextBillingDate') as string,
      status: 'نشط',
    };
    onAdd(newSub);
    setShowModal(false);
  };

  const totalMonthlyCost = subscriptions.reduce((acc, sub) => acc + (sub.billingCycle === 'شهري' ? sub.cost : sub.cost / 12), 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
        <div>
          <h2 className="text-2xl font-black text-slate-900">{t('sub_title')}</h2>
          <p className="text-slate-500 text-sm">{t('sub_desc')}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black shadow-xl hover:bg-amber-500 hover:text-slate-900 transition-all active:scale-95">
          <Plus className="w-5 h-5" /> {t('sub_add')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptions.map((sub) => {
          const daysLeft = getDaysUntil(sub.nextBillingDate);
          const isUrgent = daysLeft <= billingThreshold && sub.status === 'نشط';
          const isOverdue = daysLeft < 0;

          return (
            <div key={sub.id} className={`bg-white rounded-[2.5rem] p-6 shadow-sm border transition-all hover:shadow-xl group relative overflow-hidden ${isOverdue ? 'border-red-500' : isUrgent ? 'border-blue-400' : 'border-slate-200'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${isOverdue ? 'bg-red-50 text-red-500' : isUrgent ? 'bg-blue-50 text-blue-500' : 'bg-slate-50 text-slate-600'}`}>
                   {getCategoryIcon(sub.category)}
                </div>
                <div className="flex flex-col items-end gap-2">
                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                     isOverdue ? 'bg-red-100 text-red-700' : isUrgent ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                   }`}>
                     {isOverdue ? t('sub_overdue') : isUrgent ? t('sub_urgent') : t('sub_active')}
                   </span>
                   <button onClick={(e) => handleDeleteClick(e, sub.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{sub.provider}</p>
                <h3 className="text-xl font-black text-slate-900">{sub.serviceName}</h3>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-500">{t('sub_label_cost')} ({sub.billingCycle})</span>
                  <span className="text-sm font-black text-slate-900">{sub.cost} {t('currency')}</span>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-500">{t('sub_label_date')}</span>
                  <div className="text-end">
                    <p className="text-sm font-black text-slate-900">{sub.nextBillingDate}</p>
                    <p className={`text-[10px] font-black mt-0.5 ${isOverdue ? 'text-red-500' : daysLeft <= billingThreshold ? 'text-blue-500' : 'text-green-600'}`}>
                      {isOverdue ? t('sub_overdue') : `${daysLeft} ${t('comp_days')}`}
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => renewService(sub)}
                className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-500 hover:text-slate-900 transition-all shadow-lg active:scale-95"
              >
                <RefreshCw className="w-4 h-4" /> {t('sub_renew_btn')}
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden border-b-8 border-amber-500">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="flex items-start gap-5 relative z-10">
          <div className="bg-amber-500 p-4 rounded-2xl shadow-lg shadow-amber-500/20"><AlertCircle className="w-6 h-6 text-slate-900" /></div>
          <div>
            <h4 className="text-xl font-black">{t('sub_total_budget')}</h4>
            <p className="text-slate-400 text-sm mt-1 font-medium">{t('sub_monthly_est')}</p>
          </div>
        </div>
        <div className="text-center md:text-start relative z-10">
           <p className="text-4xl font-black text-amber-500">{totalMonthlyCost.toLocaleString()} <span className="text-xl">{t('currency')}</span></p>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-900">{t('sub_modal_title')}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl text-slate-400"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500">{t('sub_label_name')}</label>
                  <input name="serviceName" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500">{t('sub_label_provider')}</label>
                  <input name="provider" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500">{t('sub_label_category')}</label>
                  <select name="category" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold">
                    <option value="كاشير">{t('sub_category_pos')}</option>
                    <option value="إنترنت">{t('sub_category_internet')}</option>
                    <option value="ولاء">{t('sub_category_loyalty')}</option>
                    <option value="توصيل">{t('sub_category_delivery')}</option>
                    <option value="برمجيات">{t('sub_category_software')}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500">{t('sub_label_cycle')}</label>
                  <select name="billingCycle" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold">
                    <option value="شهري">Monthly</option>
                    <option value="سنوي">Yearly</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500">{t('sub_label_cost')}</label>
                  <input name="cost" type="number" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500">{t('sub_label_date')}</label>
                  <input name="nextBillingDate" type="date" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-lg hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl">{t('sub_btn_save')}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceSubscriptions;
