
import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Calendar, AlertTriangle, ExternalLink, Plus, X, Trash2, Link as LinkIcon, FileText, Clock } from 'lucide-react';
import { Document } from '../types';

interface ComplianceTrackerProps {
  documents: Document[];
  onAdd: (doc: Document) => void;
  onDelete: (id: string) => void;
}

const ComplianceTracker: React.FC<ComplianceTrackerProps> = ({ documents, onAdd, onDelete }) => {
  const [showModal, setShowModal] = useState(false);

  const getDaysRemaining = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const getStatusColor = (days: number) => {
    if (days < 0) return 'text-red-600 bg-red-50 border-red-200';
    if (days < 30) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const handleViewDocument = (doc: Document) => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert('لم يتم إرفاق رابط رقمي لهذه الوثيقة بعد. يرجى تعديل الوثيقة وإضافة رابط (Google Drive / Dropbox).');
    }
  };

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newDoc: Document = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.get('title') as string,
      expiryDate: formData.get('expiryDate') as string,
      type: formData.get('type') as any,
      owner: formData.get('owner') as string || undefined,
      remindBeforeDays: Number(formData.get('remindBeforeDays')) || 30,
      fileUrl: formData.get('fileUrl') as string || undefined,
    };
    onAdd(newDoc);
    setShowModal(false);
  };

  // تصفية الوثائق التي ستنتهي خلال 30 يوماً أو انتهت بالفعل
  const criticalDocs = documents.filter(doc => getDaysRemaining(doc.expiryDate) <= 30);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black flex items-center gap-2 text-slate-900">
          <ShieldCheck className="w-6 h-6 text-amber-500" />
          تتبع التراخيص والوثائق الرسمية
        </h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/10 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إضافة وثيقة
        </button>
      </div>

      {/* قسم التنبيهات العاجلة */}
      {criticalDocs.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-[2.5rem] p-8 shadow-lg shadow-amber-500/5 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-500 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-slate-900" />
            </div>
            <h3 className="text-lg font-black text-amber-900">تنبيهات انتهاء الصلاحية القريبة (خلال 30 يوماً)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {criticalDocs.map(doc => {
              const days = getDaysRemaining(doc.expiryDate);
              const isExpired = days < 0;
              return (
                <div key={`alert-${doc.id}`} className={`flex items-center justify-between p-4 rounded-2xl border ${isExpired ? 'bg-red-100/50 border-red-200' : 'bg-white border-amber-200 shadow-sm'}`}>
                  <div className="flex items-center gap-3">
                    <Clock className={`w-4 h-4 ${isExpired ? 'text-red-500' : 'text-amber-500'}`} />
                    <div>
                      <p className="text-sm font-black text-slate-900">{doc.title}</p>
                      <p className={`text-[10px] font-bold ${isExpired ? 'text-red-600' : 'text-amber-600'}`}>
                        {isExpired ? `منتهية منذ ${Math.abs(days)} يوم` : `ينتهي خلال ${days} يوم`}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => handleViewDocument(doc)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map(doc => {
          const days = getDaysRemaining(doc.expiryDate);
          return (
            <div key={doc.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl ${doc.type === 'حكومي' ? 'bg-indigo-100 text-indigo-600 shadow-indigo-100/50' : 'bg-sky-100 text-sky-600 shadow-sky-100/50'} shadow-lg`}>
                  {doc.type === 'حكومي' ? <ShieldCheck className="w-6 h-6" /> : <UserCheck className="w-6 h-6" />}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(days)}`}>
                    {days < 0 ? 'منتهي' : days < 30 ? 'ينتهي قريباً' : 'ساري'}
                  </span>
                  <button onClick={() => onDelete(doc.id)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight">{doc.title}</h3>
              
              {doc.owner && (
                <div className="flex items-center gap-2 text-slate-400 mb-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <UserCheck className="w-4 h-4 text-slate-300" />
                  <span className="text-xs font-bold">{doc.owner}</span>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-black">ينتهي في: {doc.expiryDate}</span>
                </div>
                {days < 30 && (
                   <div className="flex items-center gap-1 text-red-500 animate-pulse">
                     <AlertTriangle className="w-4 h-4" />
                     <span className="text-[10px] font-black uppercase tracking-tighter">تجديد!</span>
                   </div>
                )}
              </div>
              
              <button 
                onClick={() => handleViewDocument(doc)}
                className={`mt-6 w-full flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg ${
                  doc.fileUrl 
                    ? 'bg-amber-500 text-slate-900 hover:bg-amber-400 shadow-amber-500/10' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                 <ExternalLink className="w-4 h-4" />
                 {doc.fileUrl ? 'عرض الوثيقة الرقمية' : 'لا يوجد مرفق رقمي'}
              </button>
            </div>
          );
        })}
        
        {documents.length === 0 && (
          <div className="col-span-full py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-400 font-bold">لا توجد وثائق مؤرشفة حالياً</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-900">أرشفة وثيقة جديدة</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl text-slate-400"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 mr-2">عنوان الوثيقة</label>
                <input name="title" required placeholder="مثلاً: رخصة الدفاع المدني" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 ring-amber-500/10 outline-none font-bold" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 mr-2">نوع الوثيقة</label>
                  <select name="type" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold">
                    <option value="حكومي">حكومي (للمنشأة)</option>
                    <option value="شخصي">شخصي (لموظف)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 mr-2">تاريخ الانتهاء</label>
                  <input name="expiryDate" type="date" required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 mr-2 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" /> رابط الوثيقة الرقمية (Drive/PDF)
                </label>
                <input name="fileUrl" placeholder="https://drive.google.com/..." className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 mr-2">صاحب الوثيقة (اختياري)</label>
                  <input name="owner" placeholder="اسم الموظف" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 mr-2">تنبيه قبل (أيام)</label>
                  <input name="remindBeforeDays" type="number" defaultValue={30} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
              </div>
              
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-lg hover:bg-amber-500 hover:text-slate-900 transition-all active:scale-95 shadow-xl">
                حفظ وتفعيل التنبيهات
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceTracker;
