
import React, { useState } from 'react';
import { Home, User, Phone, Calendar, DollarSign, Plus, Search, Trash2, Edit, X, CheckCircle2, AlertTriangle, Clock, ArrowLeftRight, Building2, BellRing } from 'lucide-react';
import { RentalUnit, RentalPayment } from '../types';

interface RentalsManagerProps {
  rentals: RentalUnit[];
  onAdd: (unit: RentalUnit) => void;
  onUpdate: (unit: RentalUnit) => void;
  onDelete: (id: string) => void;
}

const RentalsManager: React.FC<RentalsManagerProps> = ({ rentals, onAdd, onUpdate, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<RentalUnit | null>(null);
  const [editUnit, setEditUnit] = useState<RentalUnit | null>(null);
  const [search, setSearch] = useState('');

  const filteredRentals = rentals.filter(r => 
    r.unitNumber.includes(search) || r.tenantName.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = rentals.reduce((acc, r) => {
    const paid = r.payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    return acc + paid;
  }, 0);

  const getDaysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const overduePayments = rentals.flatMap(r => 
    r.payments.filter(p => p.status === 'pending' && getDaysUntil(p.dueDate) < 0)
      .map(p => ({ ...p, unitNumber: r.unitNumber, tenantName: r.tenantName }))
  );

  const upcomingPayments = rentals.flatMap(r => 
    r.payments.filter(p => p.status === 'pending' && getDaysUntil(p.dueDate) >= 0 && getDaysUntil(p.dueDate) <= 7)
      .map(p => ({ ...p, unitNumber: r.unitNumber, tenantName: r.tenantName }))
  );

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editUnit ? editUnit.id : Math.random().toString(36).substr(2, 9);
    
    const newUnit: RentalUnit = {
      id,
      unitNumber: formData.get('unitNumber') as string,
      type: formData.get('type') as any,
      tenantName: formData.get('tenantName') as string,
      tenantPhone: formData.get('tenantPhone') as string,
      rentAmount: Number(formData.get('rentAmount')),
      billingCycle: formData.get('billingCycle') as any,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      status: 'occupied',
      payments: editUnit ? editUnit.payments : [],
    };

    editUnit ? onUpdate(newUnit) : onAdd(newUnit);
    setShowModal(false);
    setEditUnit(null);
  };

  const handleAddPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUnit) return;
    const formData = new FormData(e.currentTarget);
    
    const isPaid = formData.get('isPaid') === 'on';
    
    const newPayment: RentalPayment = {
      id: Math.random().toString(36).substr(2, 9),
      amount: Number(formData.get('amount')),
      dueDate: formData.get('dueDate') as string,
      status: isPaid ? 'paid' : 'pending',
      note: formData.get('note') as string,
    };
    
    // إضافة تاريخ الدفع فقط إذا كانت الحالة مدفوعة
    if (isPaid) {
      newPayment.paidDate = new Date().toISOString().split('T')[0];
    }

    const updatedUnit = {
      ...selectedUnit,
      payments: [...selectedUnit.payments, newPayment]
    };
    onUpdate(updatedUnit);
    setShowPaymentModal(false);
  };

  const togglePaymentStatus = (unit: RentalUnit, paymentId: string) => {
    const updatedPayments = unit.payments.map(p => {
      if (p.id === paymentId) {
        const isCurrentlyPaid = p.status === 'paid';
        const newStatus = isCurrentlyPaid ? 'pending' : 'paid';
        
        // إنشاء نسخة وتحديث الحالة
        const updatedPayment: RentalPayment = { 
          ...p, 
          status: newStatus 
        };
        
        if (isCurrentlyPaid) {
          // إذا كانت مدفوعة وصارت معلقة، نحذف تاريخ الدفع
          delete (updatedPayment as any).paidDate;
        } else {
          // إذا كانت معلقة وصارت مدفوعة، نضيف تاريخ اليوم
          updatedPayment.paidDate = new Date().toISOString().split('T')[0];
        }
        
        return updatedPayment;
      }
      return p;
    });
    
    onUpdate({ ...unit, payments: updatedPayments });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Top Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
          <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-2">إجمالي التحصيل الفعلي</p>
          <h3 className="text-3xl font-black">{totalRevenue.toLocaleString()} <span className="text-sm">ر.س</span></h3>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">الوحدات المؤجرة</p>
          <h3 className="text-3xl font-black text-slate-900">{rentals.length} <span className="text-sm">وحدة</span></h3>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 text-red-500">دفعات متأخرة</p>
          <h3 className="text-3xl font-black text-red-600">{overduePayments.length}</h3>
        </div>
      </div>

      {/* Alarms Section Improved */}
      {(overduePayments.length > 0 || upcomingPayments.length > 0) && (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm space-y-6">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
            <BellRing className="w-6 h-6 text-orange-500 animate-bounce" /> تذكيرات الإيجارات والتحصيل العاجلة
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Overdue Items (Red) */}
            {overduePayments.map(p => (
              <div key={p.id} className="bg-red-50 p-5 rounded-3xl border border-red-200 flex items-center justify-between shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-transform">
                <div className="absolute top-0 right-0 w-1 bg-red-500 h-full"></div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <p className="text-sm font-black text-red-700">دفع متأخر: {p.unitNumber}</p>
                  </div>
                  <p className="text-base font-black text-slate-900">{p.tenantName}</p>
                  <p className="text-[11px] text-slate-500 font-bold">المبلغ: {p.amount.toLocaleString()} ر.س | كان يستحق في: {p.dueDate}</p>
                </div>
                <div className="bg-white p-3 rounded-2xl shadow-sm">
                  <Clock className="w-6 h-6 text-red-400" />
                </div>
              </div>
            ))}
            
            {/* Upcoming Items (Orange) */}
            {upcomingPayments.map(p => {
              const days = getDaysUntil(p.dueDate);
              return (
                <div key={p.id} className="bg-orange-50 p-5 rounded-3xl border border-orange-200 flex items-center justify-between shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-transform">
                  <div className="absolute top-0 right-0 w-1 bg-orange-500 h-full"></div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                      <p className="text-sm font-black text-orange-700">استحقاق قريب: {p.unitNumber}</p>
                    </div>
                    <p className="text-base font-black text-slate-900">{p.tenantName}</p>
                    <p className="text-[11px] text-slate-500 font-bold">المبلغ: {p.amount.toLocaleString()} ر.س | يستحق خلال: {days} أيام ({p.dueDate})</p>
                  </div>
                  <div className="bg-white p-3 rounded-2xl shadow-sm">
                    <Clock className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main List */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              type="text" 
              placeholder="ابحث برقم الوحدة أو اسم المستأجر..." 
              className="w-full pr-12 pl-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-amber-500/10 text-sm font-bold" 
            />
          </div>
          <button 
            onClick={() => { setEditUnit(null); setShowModal(true); }} 
            className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-amber-500 hover:text-slate-900 transition-all flex items-center justify-center gap-2 shadow-xl"
          >
            <Plus className="w-5 h-5" /> إضافة وحدة/مستأجر
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">الوحدة</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">المستأجر</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">مبلغ الإيجار</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">تاريخ النهاية</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">الحالة المالية</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRentals.map(unit => {
                const pendingCount = unit.payments.filter(p => p.status === 'pending').length;
                return (
                  <tr key={unit.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{unit.unitNumber}</p>
                          <p className="text-[10px] text-amber-600 font-bold">{unit.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-black text-slate-900">{unit.tenantName}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{unit.tenantPhone}</p>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-700">{unit.rentAmount.toLocaleString()} ر.س</td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-500">{unit.endDate}</td>
                    <td className="px-8 py-5">
                      {pendingCount > 0 ? (
                        <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black border border-red-100">
                          {pendingCount} دفعات معلقة
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black border border-green-100">
                          منتظم
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-left flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { setSelectedUnit(unit); setShowPaymentModal(true); }}
                        className="bg-amber-500 text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-amber-400 transition-all"
                      >
                        إدارة الدفعات
                      </button>
                      <button onClick={() => { setEditUnit(unit); setShowModal(true); }} className="p-2 text-slate-300 hover:text-blue-500 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(unit.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Unit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-900">{editUnit ? 'تعديل بيانات العقد' : 'إضافة وحدة/عقد جديد'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500">رقم الوحدة (غرفة/شقة)</label>
                  <input name="unitNumber" defaultValue={editUnit?.unitNumber} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500">النوع</label>
                  <select name="type" defaultValue={editUnit?.type} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold">
                    <option value="غرفة">غرفة</option>
                    <option value="شقة">شقة</option>
                    <option value="محل">محل</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500">اسم المستأجر</label>
                <input name="tenantName" defaultValue={editUnit?.tenantName} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500">رقم الهاتف</label>
                  <input name="tenantPhone" defaultValue={editUnit?.tenantPhone} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500">مبلغ الإيجار الدوري</label>
                  <input name="rentAmount" type="number" defaultValue={editUnit?.rentAmount} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500">تاريخ البداية</label>
                  <input name="startDate" type="date" defaultValue={editUnit?.startDate} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500">تاريخ النهاية</label>
                  <input name="endDate" type="date" defaultValue={editUnit?.endDate} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500">دورة الفوترة</label>
                <select name="billingCycle" defaultValue={editUnit?.billingCycle} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold">
                  <option value="monthly">شهرياً</option>
                  <option value="quarterly">كل 3 أشهر</option>
                  <option value="yearly">سنوياً</option>
                </select>
              </div>
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-lg hover:bg-amber-500 hover:text-slate-900 transition-all active:scale-95 shadow-xl">
                {editUnit ? 'تحديث بيانات العقد' : 'تأكيد وحفظ العقد'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Manage Payments Modal */}
      {showPaymentModal && selectedUnit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <DollarSign className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black">سجل دفعات: {selectedUnit.unitNumber}</h3>
                  <p className="text-[10px] text-amber-400 font-bold">المستأجر: {selectedUnit.tenantName}</p>
                </div>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="p-3 hover:bg-slate-800 rounded-2xl transition-colors"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <form onSubmit={handleAddPayment} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 space-y-4">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">إضافة استحقاق/دفعة جديدة</p>
                <div className="grid grid-cols-2 gap-4">
                  <input name="amount" type="number" placeholder="المبلغ" required className="p-3 border border-slate-200 rounded-xl outline-none font-bold" />
                  <input name="dueDate" type="date" required className="p-3 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input name="isPaid" type="checkbox" className="w-5 h-5 rounded-lg text-amber-500 accent-amber-500" />
                    <span className="text-sm font-black text-slate-700">تم الاستلام الآن</span>
                  </label>
                  <input name="note" placeholder="ملاحظات (اختياري)" className="flex-1 p-3 border border-slate-200 rounded-xl outline-none font-bold text-xs" />
                </div>
                <button type="submit" className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-sm hover:bg-amber-500 hover:text-slate-900 transition-all">جدولة الدفعة</button>
              </form>

              <div className="space-y-3">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">جميع العمليات المالية</p>
                {selectedUnit.payments.sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()).map(p => (
                  <div key={p.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {p.status === 'paid' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{p.amount.toLocaleString()} ر.س</p>
                        <p className="text-[10px] text-slate-400 font-bold italic">استحقاق: {p.dueDate} {p.paidDate && `| تم الدفع في: ${p.paidDate}`}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => togglePaymentStatus(selectedUnit, p.id)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${p.status === 'paid' ? 'bg-slate-100 text-slate-400' : 'bg-green-500 text-white'}`}
                    >
                      {p.status === 'paid' ? 'إلغاء التحصيل' : 'تأكيد الاستلام'}
                    </button>
                  </div>
                ))}
                {selectedUnit.payments.length === 0 && <p className="text-center py-10 text-slate-300 italic font-bold">لا توجد دفعات مسجلة.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalsManager;
