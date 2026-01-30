
import React, { useState } from 'react';
import { Globe, Plus, Calendar, CreditCard, RefreshCw, AlertCircle, Trash2, X, Wifi, ShoppingCart, Smartphone, Terminal, Briefcase } from 'lucide-react';
import { ServiceSubscription } from '../types';

interface ServiceSubscriptionsProps {
  subscriptions: ServiceSubscription[];
  onAdd: (sub: ServiceSubscription) => void;
  onUpdate: (sub: ServiceSubscription) => void;
  onDelete: (id: string) => void;
  billingThreshold: number;
}

const ServiceSubscriptions: React.FC<ServiceSubscriptionsProps> = ({ subscriptions, onAdd, onUpdate, onDelete, billingThreshold }) => {
  const [showModal, setShowModal] = useState(false);

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
    alert(`تم تجديد ${sub.serviceName} بنجاح. الموعد القادم: ${currentDate.toLocaleDateString('ar-SA')}`);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">اشتراكات الخدمات والمنصات</h2>
          <p className="text-slate-500 text-sm">تتبع تجديد فودكس، الإنترنت، والأنظمة التقنية.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black shadow-xl hover:bg-amber-500 hover:text-slate-900 transition-all active:scale-95">
          <Plus className="w-5 h-5" /> إضافة اشتراك منصة
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
                     {isOverdue ? 'متأخر' : isUrgent ? 'استحقاق قريب' : 'نشط'}
                   </span>
                   <button onClick={() => onDelete(sub.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{sub.provider}</p>
                <h3 className="text-xl font-black text-slate-900">{sub.serviceName}</h3>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-500">التكلفة ({sub.billingCycle})</span>
                  <span className="text-sm font-black text-slate-900">{sub.cost} ر.س</span>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-500">التجديد القادم</span>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">{sub.nextBillingDate}</p>
                    <p className={`text-[10px] font-black mt-0.5 ${isOverdue ? 'text-red-500' : daysLeft <= billingThreshold ? 'text-blue-500' : 'text-green-600'}`}>
                      {isOverdue ? `منتهي` : `متبقي ${daysLeft} يوم`}
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => renewService(sub)}
                className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-500 hover:text-slate-900 transition-all shadow-lg active:scale-95"
              >
                <RefreshCw className="w-4 h-4" /> تجديد الدفعة وتحديث التاريخ
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
            <h4 className="text-xl font-black">إجمالي ميزانية التقنية والمنصات</h4>
            <p className="text-slate-400 text-sm mt-1 font-medium">حساب تراكمي شهري لجميع الخدمات السحابية والبرمجية.</p>
          </div>
        </div>
        <div className="text-center md:text-left relative z-10">
           <p className="text-4xl font-black text-amber-500">{totalMonthlyCost.toLocaleString()} ر.س</p>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">شهرياً (تقديري)</p>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-900">إضافة اشتراك منصة جديدة</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl text-slate-400"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 mr-2">اسم الخدمة</label>
                  <input name="serviceName" required placeholder="مثلاً: فودكس كاشير" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 mr-2">المزود</label>
                  <input name="provider" required placeholder="مثلاً: Foodics" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 mr-2">الفئة</label>
                  <select name="category" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold">
                    <option value="كاشير">كاشير</option>
                    <option value="إنترنت">إنترنت</option>
                    <option value="ولاء">ولاء</option>
                    <option value="توصيل">توصيل</option>
                    <option value="برمجيات">برمجيات أخرى</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 mr-2">دورة الفوترة</label>
                  <select name="billingCycle" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold">
                    <option value="شهري">شهري</option>
                    <option value="سنوي">سنوي</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 mr-2">التكلفة (ر.س)</label>
                  <input name="cost" type="number" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 mr-2">موعد التجديد القادم</label>
                  <input name="nextBillingDate" type="date" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-lg hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl">تفعيل التتبع السحابي</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceSubscriptions;
