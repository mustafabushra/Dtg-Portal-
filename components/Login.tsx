
import React, { useState } from 'react';
import { ShieldCheck, User, Key, ArrowLeft, Loader2, Building2, AtSign, Eye, EyeOff, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginProps {
  onLogin: (type: 'ADMIN' | 'STAFF', credentials: { cafeId: string, username: string, password?: string }) => void;
  staffList: any[];
  logoUrl: string;
  systemName: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, staffList, logoUrl, systemName }) => {
  const { t, language, setLanguage, dir } = useLanguage();
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

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 md:p-10 relative overflow-hidden font-['Cairo']">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
      
      {/* Language Switcher - Absolute Top */}
      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full hover:bg-white/20 transition-all active:scale-95 shadow-lg"
        >
          <Globe className="w-4 h-4" />
          <span className="text-xs font-bold uppercase">{language === 'ar' ? 'English' : 'العربية'}</span>
        </button>
      </div>

      <div className="w-full max-w-lg relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl overflow-hidden p-6 md:p-14 border border-white/20">
          
          <div className="text-center mb-10">
            <div className="inline-flex p-4 bg-white rounded-3xl shadow-xl mb-6 text-slate-900 border border-slate-100 transform hover:scale-105 transition-transform duration-300">
              <img src={logoUrl} alt="Logo" className="w-16 h-16 md:w-20 md:h-20 object-contain" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{t('systemName')}</h1>
            <p className="text-[10px] font-black text-slate-500 mt-2 uppercase tracking-[0.3em]">{t('systemTagline')}</p>
          </div>

          {loginMode === 'CHOICE' ? (
            <div className="space-y-4">
               <button 
                 onClick={() => setLoginMode('ADMIN')}
                 className="w-full p-5 md:p-6 bg-slate-900 text-white rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-between group hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl active:scale-95"
               >
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-2xl shrink-0"><ShieldCheck className="w-6 h-6" /></div>
                    <div className="text-start">
                       <p className="text-lg font-black leading-none">{t('adminPortal')}</p>
                       <p className="text-[10px] opacity-60 font-bold uppercase mt-1">{t('adminDesc')}</p>
                    </div>
                 </div>
                 {/* Icon automatically mirrors due to RTL/LTR context */}
                 <ArrowLeft className={`w-5 h-5 ${dir === 'ltr' ? 'rotate-180' : ''}`} />
               </button>

               <button 
                 onClick={() => setLoginMode('STAFF')}
                 className="w-full p-5 md:p-6 bg-white border-2 border-slate-200 text-slate-900 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-between group hover:border-amber-500 transition-all shadow-lg active:scale-95"
               >
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-100 rounded-2xl shrink-0"><User className="w-6 h-6 text-slate-400 group-hover:text-amber-600" /></div>
                    <div className="text-start">
                       <p className="text-lg font-black leading-none">{t('staffPortal')}</p>
                       <p className="text-[10px] opacity-60 font-bold uppercase mt-1">{t('staffDesc')}</p>
                    </div>
                 </div>
                 <ArrowLeft className={`w-5 h-5 ${dir === 'ltr' ? 'rotate-180' : ''}`} />
               </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5 animate-in slide-in-from-start-4 duration-500">
               <button onClick={() => setLoginMode('CHOICE')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4 group">
                  <ArrowLeft className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                  <span className="text-xs font-black">{t('backToChoice')}</span>
               </button>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest block text-start">{t('cafeId')}</label>
                  <div className="relative">
                    {/* Icons use logical positioning: start-4 means left in LTR, right in RTL */}
                    <Building2 className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none ltr:left-4 rtl:right-4" />
                    <input 
                      type="text" 
                      value={formData.cafeId}
                      onChange={(e) => setFormData({...formData, cafeId: e.target.value})}
                      placeholder={t('cafeIdPlaceholder')} 
                      required 
                      className="w-full py-4 bg-slate-50 border border-slate-300 rounded-2xl outline-none font-bold text-sm text-slate-900 focus:border-amber-500 transition-all placeholder:text-slate-300 text-start ltr:pl-12 rtl:pr-12" 
                    />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest block text-start">{t('usernameOrEmail')}</label>
                  <div className="relative">
                    <AtSign className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none ltr:left-4 rtl:right-4" />
                    <input 
                      type="text" 
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      placeholder={t('usernamePlaceholder')} 
                      required 
                      className="w-full py-4 bg-slate-50 border border-slate-300 rounded-2xl outline-none font-bold text-sm text-slate-900 focus:border-amber-500 transition-all placeholder:text-slate-300 text-start ltr:pl-12 rtl:pr-12" 
                    />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest block text-start">{t('password')}</label>
                  <div className="relative">
                    <Key className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none ltr:left-4 rtl:right-4" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder={t('passwordPlaceholder')} 
                      required 
                      className="w-full py-4 bg-slate-50 border border-slate-300 rounded-2xl outline-none font-bold text-sm text-slate-900 focus:border-amber-500 transition-all tracking-widest placeholder:text-slate-300 text-start ltr:pl-12 ltr:pr-12 rtl:pr-12 rtl:pl-12" 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 ltr:right-4 rtl:left-4"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
               </div>

               <button disabled={isLoading} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl flex items-center justify-center gap-2 mt-4 active:scale-95 disabled:opacity-70 disabled:scale-100">
                 {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : t('loginButton')}
               </button>
            </form>
          )}

          <div className="mt-10 pt-6 border-t border-slate-100 text-center">
             <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{t('cloudActive')}</p>
             </div>
             <p className="text-[8px] text-slate-400 font-medium uppercase tracking-widest">{t('securityProtocol')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
