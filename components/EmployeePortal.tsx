
import React from 'react';
import { 
  User, Clock, FileText, CheckCircle, 
  MapPin, LogIn, LogOut, Wallet, 
  Calendar, ShieldCheck, ClipboardList,
  ExternalLink, ArrowUpRight
} from 'lucide-react';
import { Staff, Task, Document } from '../types';

interface EmployeePortalProps {
  user: Staff;
  tasks: Task[];
  onCompleteTask: (taskId: string) => void;
  onAttendance: (type: 'IN' | 'OUT') => void;
}

const EmployeePortal: React.FC<EmployeePortalProps> = ({ user, tasks, onCompleteTask, onAttendance }) => {
  const myTasks = tasks.filter(t => t.assignedTo === user.id);
  const pendingTasks = myTasks.filter(t => t.status === 'pending');
  const completedTasks = myTasks.filter(t => t.status === 'completed');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header with Improved Gradient */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl relative overflow-hidden border-b-8 border-amber-500">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-right">
             <div className="relative">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} className="w-24 h-24 md:w-28 md:h-28 rounded-[2rem] bg-white/10 p-2 border border-white/20 shadow-xl" alt={user.name} />
               {user.isClockedIn && (
                 <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                 </div>
               )}
             </div>
             <div>
               <p className="text-amber-500 text-xs md:text-sm font-black uppercase tracking-[0.2em] mb-1">مرحباً بك مجدداً في نوبتك</p>
               <h2 className="text-3xl md:text-5xl font-black tracking-tight">{user.name}</h2>
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                 <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-md">{user.role}</span>
                 <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full border border-white/5">
                   <div className={`w-2 h-2 rounded-full ${user.isClockedIn ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-500'}`}></div>
                   <span className="text-[10px] font-black uppercase tracking-widest">{user.isClockedIn ? 'على رأس العمل الآن' : 'خارج الدوام الحالي'}</span>
                 </div>
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
               {user.isClockedIn ? <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> : <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
               {user.isClockedIn ? 'بصمة انصراف الجوال' : 'بصمة حضور الجوال'}
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Earnings Card */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-500" /> مستحقاتي الحالية
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">محدث الآن</span>
          </div>
          <div className="space-y-6">
             <div className="text-center py-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative overflow-hidden group">
                <div className="absolute inset-0 bg-emerald-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                <p className="text-4xl font-black text-slate-900 relative z-10">{Math.round(user.totalMonthlyEarnings || 0)} <span className="text-sm font-bold text-slate-400">ر.س</span></p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 relative z-10">صافي أرباح الشهر</p>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                   <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">ساعات العمل</p>
                   <p className="text-lg font-black text-slate-900">{Math.round(user.totalMonthlyHours || 0)} س</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center">
                   <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">أجر الساعة</p>
                   <p className="text-lg font-black text-slate-900">{user.hourlyRate} ر.س</p>
                </div>
             </div>
          </div>
        </div>

        {/* Task Board */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-amber-500" /> المهام اليومية المطلوبة
            </h3>
            <div className="flex gap-2">
               <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest">{pendingTasks.length} مهمة</span>
            </div>
          </div>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
             {pendingTasks.map(task => (
               <div key={task.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-amber-300 transition-all">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-white rounded-xl border border-slate-200 group-hover:bg-amber-500 transition-colors">
                        <CheckCircle className="w-5 h-5 text-slate-300 group-hover:text-slate-900" />
                     </div>
                     <div className="min-w-0">
                        <h4 className="text-sm font-black text-slate-900 truncate">{task.title}</h4>
                        <p className="text-xs text-slate-500 font-medium truncate">{task.description}</p>
                     </div>
                  </div>
                  <button 
                    onClick={() => onCompleteTask(task.id)}
                    className="flex-none px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all opacity-0 group-hover:opacity-100"
                  >
                    إتمام
                  </button>
               </div>
             ))}
             {pendingTasks.length === 0 && (
               <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                  <ShieldCheck className="w-12 h-12 text-emerald-500/20 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-400">لا توجد مهام معلقة.. عمل رائع!</p>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* My Documents Section */}
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" /> وثائقي الرسمية والأوراق
          </h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الأرشيف الرقمي للموظف</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {user.documents.map(doc => (
             <div key={doc.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:shadow-lg transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-2 h-full bg-blue-500/10 group-hover:bg-blue-500 transition-colors"></div>
                <div className="flex items-center gap-3 mb-4">
                   <div className="p-2 bg-white rounded-lg shadow-sm">
                      <FileText className="w-4 h-4 text-slate-400" />
                   </div>
                   <h4 className="text-sm font-black text-slate-900 truncate">{doc.title}</h4>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">تنتهي في: {doc.expiryDate}</p>
                <button 
                  onClick={() => doc.fileUrl && window.open(doc.fileUrl, '_blank')}
                  disabled={!doc.fileUrl}
                  className="w-full py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-blue-600 flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-30"
                >
                  <ExternalLink className="w-3 h-3" /> استعراض النسخة الرقمية
                </button>
             </div>
           ))}
           {user.documents.length === 0 && (
             <div className="col-span-full py-10 text-center text-slate-400 font-bold italic">لا توجد وثائق محفوظة حالياً في ملفك.</div>
           )}
        </div>
      </div>
    </div>
  );
};

export default EmployeePortal;
