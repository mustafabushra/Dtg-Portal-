
import React, { useState } from 'react';
import { 
  User, Clock, FileText, CheckCircle, 
  MapPin, LogIn, LogOut, Wallet, 
  Calendar, ShieldCheck, ClipboardList,
  ExternalLink, ArrowUpRight, Camera, ListChecks, ChevronLeft, X
} from 'lucide-react';
import { Staff, Task, Document } from '../types';

interface EmployeePortalProps {
  user: Staff;
  tasks: Task[];
  onCompleteTask: (taskId: string) => void;
  onAttendance: (type: 'IN' | 'OUT') => void;
}

const EmployeePortal: React.FC<EmployeePortalProps> = ({ user, tasks, onCompleteTask, onAttendance }) => {
  const [activeTaskDetail, setActiveTaskDetail] = useState<Task | null>(null);
  
  const myTasks = tasks.filter(t => t.assignedTo === user.id);
  const pendingTasks = myTasks.filter(t => t.status === 'pending');
  const completedTasks = myTasks.filter(t => t.status === 'completed');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-500" /> مستحقاتي الجارية
            </h3>
          </div>
          <div className="space-y-6">
             <div className="text-center py-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                <p className="text-4xl font-black text-slate-900">{Math.round(user.totalMonthlyEarnings || 0)} <span className="text-sm font-bold text-slate-400">ر.س</span></p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">صافي الربح حتى الآن</p>
             </div>
          </div>
        </div>

        {/* Improved Task Board for Employee */}
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
                {/* FIX: Use imported X icon for close button */}
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

                <div className="grid grid-cols-1 gap-4">
                   {activeTaskDetail.requiresPhoto && (
                     <div className="space-y-2">
                        <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                           <Camera className="w-4 h-4 text-blue-500" /> إرفاق صورة الإثبات:
                        </h4>
                        <div className="w-full h-40 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer group">
                           <Camera className="w-8 h-8 text-slate-300 group-hover:text-blue-500 mb-2" />
                           <p className="text-[10px] font-black text-slate-400 group-hover:text-blue-600 uppercase">اضغط لفتح الكاميرا</p>
                        </div>
                     </div>
                   )}
                   
                   {activeTaskDetail.locationRequired && (
                     <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-blue-500 animate-bounce" />
                        <p className="text-[11px] font-black text-blue-900 uppercase">يتطلب هذا العقد تواجدك الجغرافي داخل الفرع للإغلاق</p>
                     </div>
                   )}
                </div>
             </div>

             <div className="p-8 bg-slate-50 border-t border-slate-200 shrink-0">
                <button 
                  onClick={() => { onCompleteTask(activeTaskDetail.id); setActiveTaskDetail(null); }}
                  className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover-bg-custom-primary hover:text-slate-900 transition-all shadow-2xl flex items-center justify-center gap-3"
                >
                   <CheckCircle className="w-6 h-6" /> اعتماد الإنجاز ورفع الإثباتات
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePortal;
