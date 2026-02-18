
import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Calendar, AlertTriangle, ExternalLink, Plus, X, Trash2, Link as LinkIcon, FileText, Clock, CheckCircle, Edit } from 'lucide-react';
import { Document } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import ConfirmModal from './ConfirmModal';

interface ComplianceTrackerProps {
  documents: Document[];
  onAdd: (doc: Document) => void;
  onUpdate: (doc: Document) => void;
  onDelete: (id: string) => void;
}

const ComplianceTracker: React.FC<ComplianceTrackerProps> = ({ documents, onAdd, onUpdate, onDelete }) => {
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editDoc, setEditDoc] = useState<Document | null>(null);

  const getDaysRemaining = (date: string) => {
    if (!date) return 999999; // قيمة كبيرة للوثائق التي ليس لها تاريخ انتهاء
    const diff = new Date(date).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const getStatusColor = (days: number) => {
    if (days === 999999) return 'text-slate-600 bg-slate-50 border-slate-200';
    if (days < 0) return 'text-red-600 bg-red-50 border-red-200';
    if (days < 30) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const handleViewDocument = (doc: Document) => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert(t('comp_no_doc'));
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const handleEditClick = (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation();
    setEditDoc(doc);
    setShowModal(true);
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
    const newDoc: Document = {
      id: editDoc ? editDoc.id : Math.random().toString(36).substr(2, 9),
      title: formData.get('title') as string,
      expiryDate: formData.get('expiryDate') as string,
      type: formData.get('type') as any,
      owner: formData.get('owner') as string || undefined,
      remindBeforeDays: Number(formData.get('remindBeforeDays')) || 30,
      fileUrl: formData.get('fileUrl') as string || undefined,
    };
    
    if (editDoc) {
      onUpdate(newDoc);
    } else {
      onAdd(newDoc);
    }
    setShowModal(false);
    setEditDoc(null);
  };

  const criticalDocs = documents.filter(doc => doc.expiryDate && getDaysRemaining(doc.expiryDate) <= 30);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
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
          <h2 className="text-2xl font-black flex items-center gap-2 text-slate-900">
            <ShieldCheck className="w-8 h-8 text-amber-500" />
            {t('comp_title')}
          </h2>
          <p className="text-slate-500 text-sm font-bold mt-1">مراقبة تواريخ انتهاء التراخيص، العقود، والشهادات الصحية.</p>
        </div>
        <button 
          onClick={() => { setEditDoc(null); setShowModal(true); }}
          className="bg-slate-900 text-white px-6 py-4 rounded-[1.5rem] font-black hover:bg-amber-500 hover:text-slate-900 transition-all active:scale-95 shadow-xl shadow-slate-900/10 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t('comp_add')}
        </button>
      </div>

      {/* Critical Alerts */}
      {criticalDocs.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-red-50 border-2 border-amber-200 rounded-[2.5rem] p-8 shadow-lg shadow-amber-500/5 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-amber-100">
              <AlertTriangle className="w-6 h-6 text-amber-600 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">{t('comp_alert_title')}</h3>
              <p className="text-xs font-bold text-slate-500">يرجى اتخاذ إجراء فوري لتجنب الغرامات أو توقف العمل.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {criticalDocs.map(doc => {
              const days = getDaysRemaining(doc.expiryDate);
              const isExpired = days < 0;
              return (
                <div key={`alert-${doc.id}`} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] cursor-pointer ${isExpired ? 'bg-white border-red-200 shadow-sm' : 'bg-white border-amber-200 shadow-sm'}`} onClick={() => handleViewDocument(doc)}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isExpired ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                       <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 line-clamp-1">{doc.title}</p>
                      <p className={`text-[10px] font-black uppercase tracking-wider ${isExpired ? 'text-red-600' : 'text-amber-600'}`}>
                        {isExpired ? `${t('comp_expired_since')} ${Math.abs(days)} ${t('comp_days')}` : `${t('comp_expires_in')} ${days} ${t('comp_days')}`}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-300" />
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
            <div key={doc.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-6 pt-2">
                <div className={`p-4 rounded-[1.2rem] ${doc.type === 'حكومي' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-sky-50 text-sky-600 border border-sky-100'} shadow-sm`}>
                  {doc.type === 'حكومي' ? <ShieldCheck className="w-7 h-7" /> : <UserCheck className="w-7 h-7" />}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(days)}`}>
                    {days < 0 ? t('sub_overdue') : days < 30 ? t('sub_urgent') : days === 999999 ? 'دائم' : t('sub_active')}
                  </span>
                  <div className="flex gap-1">
                    <button 
                      onClick={(e) => handleEditClick(e, doc)} 
                      className="p-2 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                      title="تعديل الوثيقة"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteClick(e, doc.id)} 
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="حذف الوثيقة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight">{doc.title}</h3>
                {doc.owner && (
                  <div className="flex items-center gap-2 text-slate-400 bg-slate-50 w-fit px-3 py-1 rounded-lg border border-slate-100">
                    <UserCheck className="w-3 h-3" />
                    <span className="text-[10px] font-bold">{doc.owner}</span>
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-black">{doc.expiryDate || 'بدون تاريخ انتهاء'}</span>
                  </div>
                  {days < 30 && days !== 999999 && (
                     <div className="flex items-center gap-1 text-red-500 animate-pulse">
                       <AlertTriangle className="w-4 h-4" />
                       <span className="text-[9px] font-black uppercase">{t('comp_renew')}</span>
                     </div>
                  )}
                  {days === 999999 && (
                     <CheckCircle className="w-4 h-4 text-emerald-500" />
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => handleViewDocument(doc)}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  doc.fileUrl 
                    ? 'bg-slate-900 text-white hover:bg-amber-500 hover:text-slate-900 shadow-lg' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                }`}
              >
                 <ExternalLink className="w-4 h-4" />
                 {doc.fileUrl ? t('comp_view_doc') : t('comp_no_doc')}
              </button>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-900">{editDoc ? 'تعديل الوثيقة' : t('comp_modal_title')}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl text-slate-400"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{t('comp_label_title')}</label>
                <input name="title" defaultValue={editDoc?.title} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 ring-amber-500/10 outline-none font-bold" placeholder="مثلاً: رخصة البلدية" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{t('comp_label_type')}</label>
                  <select name="type" defaultValue={editDoc?.type} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold">
                    <option value="حكومي">{t('comp_type_gov')}</option>
                    <option value="شخصي">{t('comp_type_personal')}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{t('comp_label_expiry')} (اختياري)</label>
                  <input name="expiryDate" defaultValue={editDoc?.expiryDate} type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" /> {t('comp_label_url')}
                </label>
                <input name="fileUrl" defaultValue={editDoc?.fileUrl} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-xs" placeholder="https://" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{t('comp_label_owner')}</label>
                  <input name="owner" defaultValue={editDoc?.owner} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="اسم الموظف أو الفرع" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{t('comp_label_remind')}</label>
                  <input name="remindBeforeDays" type="number" defaultValue={editDoc?.remindBeforeDays || 30} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
                </div>
              </div>
              
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-lg hover:bg-amber-500 hover:text-slate-900 transition-all active:scale-95 shadow-xl mt-4">
                {editDoc ? 'حفظ التعديلات' : t('comp_submit')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceTracker;
