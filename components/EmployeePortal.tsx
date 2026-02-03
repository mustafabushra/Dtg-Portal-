
import React, { useState } from 'react';
import { 
  User, Clock, FileText, CheckCircle, 
  MapPin, LogIn, LogOut, Wallet, 
  Calendar, ShieldCheck, ClipboardList,
  ExternalLink, ArrowUpRight, Camera, ListChecks, ChevronLeft, X, FolderOpen, AlertTriangle, LayoutGrid, Download, Trash2
} from 'lucide-react';
import { Staff, Task, Document } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface EmployeePortalProps {
  user: Staff;
  tasks: Task[];
  onCompleteTask: (taskId: string) => void;
  onAttendance: (type: 'IN' | 'OUT') => void;
  onUpdateStaff: (staff: Staff) => void;
}

const EmployeePortal: React.FC<EmployeePortalProps> = ({ user, tasks, onCompleteTask, onAttendance, onUpdateStaff }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DOCUMENTS'>('OVERVIEW');
  const [activeTaskDetail, setActiveTaskDetail] = useState<Task | null>(null);
  
  const myTasks = tasks.filter(t => t.assignedTo === user.id);
  const pendingTasks = myTasks.filter(t => t.status === 'pending');
  const completedTasks = myTasks.filter(t => t.status === 'completed');

  const getDaysRemaining = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const handleDeleteDocument = (docId: string) => {
    if (!window.confirm(t('confirm_delete'))) return;
    const updatedDocs = user.documents.filter(d => d.id !== docId);
    onUpdateStaff({ ...user, documents: updatedDocs });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Navigation Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 w-fit mx-auto md:mx-0">
        <button 
          onClick={() => setActiveTab('OVERVIEW')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${
            activeTab === 'OVERVIEW' 
            ? 'bg-slate-900 text-white shadow-lg' 
            : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <LayoutGrid className="w-4 h-4" /> نظرة عامة والمهام
        </button>
        <button 
          onClick={() => setActiveTab('DOCUMENTS')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${
            activeTab === 'DOCUMENTS' 
            ? 'bg-slate-900 text-white shadow-lg' 
            : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <FolderOpen className="w-4 h-4" /> ملفاتي الوظيفية
        </button>
      </div>

      {/* VIEW 1: OVERVIEW & TASKS */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Welcome Header */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl relative overflow-hidden border-b-8 border-custom-primary">
            <div className="absolute top-0 right-0 w-80 h-80 bg-custom-light rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-right">
                <div className="relative">
                  <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`} className="w-24 h-24 md:w-28 md:h-28 rounded-[2rem] bg-white/10 p-2 border border-white/20 shadow-xl" alt={user.name} />
                  {user.isClockedIn && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-custom-primary text-xs md:text-sm font-black uppercase tracking-[0.2em] mb-1">مرحباً بك مجدداً في نوبتك</p>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight">{user.name}</h2>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                    <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-md">{user.role}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <button 
                  onClick={() => onAttendance(user.isClockedIn ? 'OUT' : 'IN')}
                  className={`w-full sm:w-auto px-8 py-5 rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 transition-all shadow-2xl active:scale-95 group ${
                    user.isClockedIn 
                    ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/30' 
                    : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/30'
                  }`}
                >
                  {user.isClockedIn ? <LogOut className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                  {user.isClockedIn ? 'بصمة الانصراف الذكية' : 'بصمة الحضور الذكية'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Earnings Card */}
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 h-full">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-emerald-500" /> مستحقاتي الجارية
                  </h3>
                </div>
                <div className="space-y-6">
                  <div className="text-center py-10 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                      <p className="text-5xl font-black text-slate-900">{Math.round(user.totalMonthlyEarnings || 0)} <span className="text-sm font-bold text-slate-400">ر.س</span></p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">صافي الربح حتى الآن</p>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <span className="text-xs font-bold text-slate-500">ساعات العمل</span>
                     <span className="text-sm font-black text-slate-900">{Math.round(user.totalMonthlyHours || 0)} ساعة</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setActiveTab('DOCUMENTS')}
                className="w-full p-8 bg-slate-900 text-white rounded-[2.5rem] flex items-center justify-between group hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl"
              >
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-white/20"><FolderOpen className="w-6 h-6" /></div>
                    <div className="text-right">
                       <p className="text-lg font-black leading-none">ملفاتي الوظيفية</p>
                       <p className="text-[10px] opacity-60 font-bold uppercase mt-1">عرض المستندات والعقود</p>
                    </div>
                 </div>
                 <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Task Board */}
            <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-custom-primary" /> أوامر التشغيل اليومية
                </h3>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black">{pendingTasks.length} تحت التنفيذ</span>
              </div>
              
              <div className="space-y-4">
                {pendingTasks.map(task => (
                  <div key={task.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-custom-primary transition-all group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-2xl bg-white shadow-sm border border-slate-100 ${task.priority === 'critical' ? 'text-red-500' : 'text-slate-400'}`}>
                              <ClipboardList className="w-6 h-6" />
                          </div>
                          <div>
                              <h4 className="text-base font-black text-slate-900">{task.title}</h4>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {task.checklist.length > 0 && (
                                  <span className="flex items-center gap-1 text-[9px] font-black text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100">
                                      <ListChecks className="w-3 h-3" /> {task.checklist.length} متطلبات
                                  </span>
                                )}
                                {task.requiresPhoto && (
                                  <span className="flex items-center gap-1 text-[9px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                                      <Camera className="w-3 h-3" /> يتطلب صورة
                                  </span>
                                )}
                              </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => setActiveTaskDetail(task)}
                          className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover-bg-custom-primary hover:text-slate-900 transition-all flex items-center justify-center gap-2"
                        >
                          فتح العقد <ChevronLeft className="w-4 h-4" />
                        </button>
                      </div>
                  </div>
                ))}
                {pendingTasks.length === 0 && (
                  <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                      <ShieldCheck className="w-12 h-12 text-emerald-500/20 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-400">لا توجد أوامر تشغيل جديدة حالياً.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DOCUMENTS PAGE */}
      {activeTab === 'DOCUMENTS' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-amber-500 rounded-2xl text-slate-900 shadow-lg shadow-amber-500/20">
                <FolderOpen className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black">ملفاتي الوظيفية</h2>
                <p className="text-slate-400 text-sm font-bold mt-1">إدارة الوثائق والعقود والشهادات الرسمية الخاصة بك.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-5 py-2 bg-white/10 rounded-xl border border-white/10 text-xs font-bold">
                عدد الملفات: {user.documents?.length || 0}
              </div>
              <button 
                onClick={() => setActiveTab('OVERVIEW')}
                className="px-6 py-3 bg-white text-slate-900 rounded-xl text-xs font-black hover:bg-slate-200 transition-colors"
              >
                رجوع
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.documents && user.documents.length > 0 ? (
              user.documents.map((doc, idx) => {
                const daysLeft = getDaysRemaining(doc.expiryDate);
                const isExpired = daysLeft < 0;
                const isWarning = daysLeft < 30 && !isExpired;

                return (
                  <div key={idx} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 hover:shadow-xl transition-all group relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                    <div className={`absolute top-0 right-0 w-full h-1.5 ${isExpired ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                    
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="flex items-center gap-2">
                           <button 
                             onClick={() => handleDeleteDocument(doc.id)} 
                             className="p-2 bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                             title="حذف الوثيقة"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                           {isExpired && (
                             <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black border border-red-100 flex items-center gap-1">
                               <AlertTriangle className="w-3 h-3" /> منتهي
                             </span>
                           )}
                           {isWarning && (
                             <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black border border-amber-100 flex items-center gap-1">
                               <Clock className="w-3 h-3" /> تجديد
                             </span>
                           )}
                           {!isExpired && !isWarning && (
                             <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-black border border-green-100 flex items-center gap-1">
                               <CheckCircle className="w-3 h-3" /> ساري
                             </span>
                           )}
                        </div>
                      </div>

                      <h3 className="text-lg font-black text-slate-900 mb-2 line-clamp-2">{doc.title}</h3>
                      <p className="text-xs text-slate-400 font-bold">تاريخ الانتهاء: {doc.expiryDate}</p>
                      
                      <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className={`text-[10px] font-black ${isExpired ? 'text-red-500' : 'text-slate-500'}`}>
                           {isExpired ? `انتهت الصلاحية منذ ${Math.abs(daysLeft)} يوم` : `متبقي ${daysLeft} يوم على الانتهاء`}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                      {doc.fileUrl ? (
                        <a 
                          href={doc.fileUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-500 hover:text-slate-900 transition-all shadow-lg active:scale-95"
                        >
                          <ExternalLink className="w-4 h-4" /> فتح المستند
                        </a>
                      ) : (
                        <button disabled className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-not-allowed">
                          <X className="w-4 h-4" /> لا يوجد مرفق
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-4">
                  <FolderOpen className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-black text-slate-900">الملف فارغ</h3>
                <p className="text-slate-400 text-sm font-bold mt-1">لم يتم إدراج أي وثائق في ملفك الوظيفي حتى الآن.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Task Execution Modal */}
      {activeTaskDetail && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
             <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-custom-primary rounded-2xl text-slate-900 shadow-lg shadow-custom">
                      <FileText className="w-6 h-6" />
                   </div>
                   <div>
                      <h3 className="text-xl font-black">تنفيذ ميثاق المهمة</h3>
                      <p className="text-[10px] text-custom-primary font-bold uppercase tracking-widest">{activeTaskDetail.title}</p>
                   </div>
                </div>
                <button onClick={() => setActiveTaskDetail(null)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors"><X className="w-6 h-6" /></button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                <div className="space-y-2">
                   <h4 className="text-sm font-black text-slate-900">وصف وتعليمات الإدارة:</h4>
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 font-bold leading-relaxed italic">
                      {activeTaskDetail.description}
                   </div>
                </div>

                {activeTaskDetail.checklist.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                       <ListChecks className="w-4 h-4 text-custom-primary" /> خطوات العمل الإلزامية:
                    </h4>
                    <div className="space-y-3">
                       {activeTaskDetail.checklist.map((item, idx) => (
                         <label key={item.id} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl cursor-pointer hover:border-custom-primary transition-all">
                            <input type="checkbox" className="w-5 h-5 rounded-lg accent-custom-primary" />
                            <span className="text-sm font-bold text-slate-700">{item.text}</span>
                         </label>
                       ))}
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t border-slate-100">
                   <button 
                     onClick={() => {
                        onCompleteTask(activeTaskDetail.id);
                        setActiveTaskDetail(null);
                     }}
                     className="w-full py-5 bg-emerald-500 text-white rounded-[2rem] font-black text-lg hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-3"
                   >
                      <CheckCircle className="w-6 h-6" />
                      إتمام المهمة وإرسال التقرير
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePortal;
