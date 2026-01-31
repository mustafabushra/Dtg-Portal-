
import React, { useState } from 'react';
import { ShieldCheck, User, Key, ArrowLeft, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: (type: 'ADMIN' | 'STAFF', staffId?: string, password?: string) => void;
  staffList: any[];
  logoUrl: string;
  systemName: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, staffList, logoUrl, systemName }) => {
  const [loginMode, setLoginMode] = useState<'CHOICE' | 'ADMIN' | 'STAFF'>('CHOICE');
  const [pin, setPin] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onLogin(loginMode as any, selectedStaffId, pin);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden font-['Cairo']">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-custom-light rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden p-10">
          
          <div className="text-center mb-10">
            <div className="inline-flex p-5 bg-white rounded-[2rem] shadow-xl mb-6 text-slate-900 border border-slate-100">
              <img src={logoUrl} alt="Logo" className="w-20 h-20 object-contain" onError={(e) => (e.currentTarget.src = 'https://placehold.co/200x200?text=CAFE')} />
            </div>
            <h1 className="text-3xl font-black text-slate-900">{systemName}</h1>
            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-[0.3em]">نظام الإدارة السحابي المتكامل</p>
          </div>

          {loginMode === 'CHOICE' ? (
            <div className="space-y-4">
               <button 
                 onClick={() => setLoginMode('ADMIN')}
                 className="w-full p-6 bg-slate-900 text-white rounded-[2rem] flex items-center justify-between group hover:bg-custom-primary hover:text-slate-900 transition-all shadow-xl"
               >
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-slate-900/10"><ShieldCheck className="w-6 h-6" /></div>
                    <div className="text-right">
                       <p className="text-lg font-black">بوابة الإدارة</p>
                       <p className="text-[10px] opacity-60 font-bold uppercase">Admin Controller</p>
                    </div>
                 </div>
                 <ArrowLeft className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
               </button>

               <button 
                 onClick={() => setLoginMode('STAFF')}
                 className="w-full p-6 bg-white border-2 border-slate-100 text-slate-900 rounded-[2rem] flex items-center justify-between group hover:border-custom-primary transition-all shadow-lg"
               >
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-custom-light"><User className="w-6 h-6 text-slate-400 group-hover:text-custom-primary" /></div>
                    <div className="text-right">
                       <p className="text-lg font-black">بوابة الموظفين</p>
                       <p className="text-[10px] opacity-60 font-bold uppercase">Staff Portal</p>
                    </div>
                 </div>
                 <ArrowLeft className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
               </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6 animate-in slide-in-from-left-4 duration-500">
               <button onClick={() => setLoginMode('CHOICE')} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-4">
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                  <span className="text-xs font-black">العودة للخلف</span>
               </button>

               <h2 className="text-xl font-black text-slate-900 mb-2">
                 {loginMode === 'ADMIN' ? 'دخول المسؤول' : 'دخول الموظف'}
               </h2>

               {loginMode === 'STAFF' && (
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">اختر اسمك</label>
                    <select value={selectedStaffId} onChange={(e) => setSelectedStaffId(e.target.value)} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm">
                      <option value="">-- اختر من القائمة --</option>
                      {staffList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                    </select>
                 </div>
               )}

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">رمز الدخول السريع (PIN)</label>
                  <div className="relative">
                    <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="****" required className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-lg tracking-widest" />
                  </div>
               </div>

               <button disabled={isLoading} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover-bg-custom-primary hover:text-slate-900 transition-all shadow-2xl flex items-center justify-center gap-2">
                 {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'تسجيل الدخول للنظام'}
               </button>
            </form>
          )}

          <div className="mt-10 text-center">
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                <ShieldCheck className="w-3 h-3 text-emerald-500" /> اتصال مشفر وسحابي بالكامل
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
