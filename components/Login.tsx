
import React, { useState } from 'react';
import { ShieldCheck, User, Key, ArrowLeft, Loader2, Building2, AtSign, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: (type: 'ADMIN' | 'STAFF', credentials: { cafeId: string, username: string, password?: string }) => void;
  staffList: any[];
  logoUrl: string;
  systemName: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, staffList, logoUrl, systemName }) => {
  const [loginMode, setLoginMode] = useState<'CHOICE' | 'ADMIN' | 'STAFF'>('CHOICE');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    cafeId: '',
    username: '',
    password: ''
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onLogin(loginMode as any, formData);
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 md:p-10 relative overflow-hidden font-['Cairo']">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="w-full max-w-lg relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-white/95 backdrop-blur-xl rounded-[3.5rem] shadow-2xl overflow-hidden p-8 md:p-14 border border-white/20">
          
          <div className="text-center mb-10">
            <div className="inline-flex p-4 bg-white rounded-3xl shadow-xl mb-6 text-slate-900 border border-slate-100">
              <img src={logoUrl} alt="Logo" className="w-16 h-16 md:w-20 md:h-20 object-contain" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{systemName}</h1>
            <p className="text-[10px] font-black text-slate-500 mt-2 uppercase tracking-[0.3em]">نظام الإدارة السحابي الموحد</p>
          </div>

          {loginMode === 'CHOICE' ? (
            <div className="space-y-4">
               <button 
                 onClick={() => setLoginMode('ADMIN')}
                 className="w-full p-6 bg-slate-900 text-white rounded-[2.5rem] flex items-center justify-between group hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl"
               >
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-2xl"><ShieldCheck className="w-6 h-6" /></div>
                    <div className="text-right">
                       <p className="text-lg font-black leading-none">بوابة الإدارة</p>
                       <p className="text-[10px] opacity-60 font-bold uppercase mt-1">Enterprise Admin</p>
                    </div>
                 </div>
                 <ArrowLeft className="w-5 h-5" />
               </button>

               <button 
                 onClick={() => setLoginMode('STAFF')}
                 className="w-full p-6 bg-white border-2 border-slate-200 text-slate-900 rounded-[2.5rem] flex items-center justify-between group hover:border-amber-500 transition-all shadow-lg"
               >
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-100 rounded-2xl"><User className="w-6 h-6 text-slate-400 group-hover:text-amber-600" /></div>
                    <div className="text-right">
                       <p className="text-lg font-black leading-none">بوابة التشغيل</p>
                       <p className="text-[10px] opacity-60 font-bold uppercase mt-1">Operational Staff</p>
                    </div>
                 </div>
                 <ArrowLeft className="w-5 h-5" />
               </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5 animate-in slide-in-from-left-4 duration-500">
               <button onClick={() => setLoginMode('CHOICE')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4 group">
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                  <span className="text-xs font-black">رجوع لاختيار البوابة</span>
               </button>

               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest mr-3">رقم اشتراك المنشأة (Cafe ID)</label>
                  <div className="relative">
                    <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={formData.cafeId}
                      onChange={(e) => setFormData({...formData, cafeId: e.target.value})}
                      placeholder="أدخل رقم حساب المؤسسة" 
                      required 
                      className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-300 rounded-2xl outline-none font-bold text-sm text-slate-900 focus:border-amber-500 transition-all placeholder:text-slate-300" 
                    />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest mr-3">اسم المستخدم أو البريد</label>
                  <div className="relative">
                    <AtSign className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      placeholder="Username / Email" 
                      required 
                      className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-300 rounded-2xl outline-none font-bold text-sm text-slate-900 focus:border-amber-500 transition-all placeholder:text-slate-300" 
                    />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest mr-3">كلمة المرور</label>
                  <div className="relative">
                    <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="••••••••" 
                      required 
                      className="w-full pr-12 pl-12 py-4 bg-slate-50 border border-slate-300 rounded-2xl outline-none font-bold text-sm text-slate-900 focus:border-amber-500 transition-all tracking-widest placeholder:text-slate-300" 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
               </div>

               <button disabled={isLoading} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl flex items-center justify-center gap-2 mt-4">
                 {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'دخول آمن للنظام'}
               </button>
            </form>
          )}

          <div className="mt-10 pt-6 border-t border-slate-100 text-center">
             <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">التشفير السحابي نشط</p>
             </div>
             <p className="text-[8px] text-slate-400 font-medium uppercase tracking-widest">Enterprise Security Protocol v4.0.2</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
