
import React, { useState, useEffect } from 'react';
import { ShieldCheck, User, Key, ArrowLeft, Loader2, Building2, AtSign, Eye, EyeOff, Globe, QrCode, Smartphone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import QRCode from "react-qr-code";
import { db } from '../services/firebase';
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';

interface LoginProps {
  onLogin: (type: 'ADMIN' | 'STAFF', credentials: { cafeId: string, username: string, password?: string }) => void;
  staffList: any[];
  logoUrl: string;
  systemName: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, staffList, logoUrl, systemName }) => {
  const { t, language, setLanguage, dir } = useLanguage();
  const [loginMode, setLoginMode] = useState<'CHOICE' | 'ADMIN' | 'STAFF' | 'QR'>('CHOICE');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [qrSessionId, setQrSessionId] = useState<string>('');
  
  const [formData, setFormData] = useState({
    cafeId: '',
    username: '',
    password: ''
  });

  // Generate QR Session
  useEffect(() => {
    let unsubscribe: () => void;
    let sessionId = '';

    if (loginMode === 'QR') {
      sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      setQrSessionId(sessionId);
      
      // Create temporary session in Firestore
      const sessionRef = doc(db, 'auth_sessions', sessionId);
      setDoc(sessionRef, {
        status: 'pending',
        createdAt: new Date().toISOString()
      }).catch(console.error);

      // Listen for authentication
      unsubscribe = onSnapshot(sessionRef, (snapshot) => {
        const data = snapshot.data();
        if (data && data.status === 'authenticated' && data.user) {
           setIsLoading(true);
           // Auto login
           setTimeout(() => {
             // Delete session after successful login for security
             deleteDoc(sessionRef);
             
             // Trigger Login
             onLogin(data.userType, {
               cafeId: data.user.cafeId || '10101', // Fallback or from data
               username: data.user.username,
               password: data.user.password
             });
           }, 1000);
        }
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
      // Optional: Cleanup pending session if component unmounts
    };
  }, [loginMode]);

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

      <div className="w-full max-w-4xl relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl overflow-hidden border border-white/20 flex flex-col md:flex-row min-h-[500px]">
          
          {/* Left Side (Login Form) */}
          <div className="flex-1 p-8 md:p-14 flex flex-col justify-center">
            <div className="text-center md:text-start mb-8">
              <div className="inline-flex md:hidden p-3 bg-white rounded-2xl shadow-lg mb-4 text-slate-900 border border-slate-100">
                <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{systemName}</h1>
              <p className="text-[10px] font-black text-slate-500 mt-2 uppercase tracking-[0.3em]">{t('systemTagline')}</p>
            </div>

            {loginMode === 'CHOICE' ? (
              <div className="space-y-4">
                 <button 
                   onClick={() => setLoginMode('QR')}
                   className="w-full p-5 bg-emerald-50 text-emerald-900 rounded-[2rem] border-2 border-emerald-100 flex items-center justify-between group hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm active:scale-95"
                 >
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-2xl shrink-0 text-emerald-600 group-hover:text-emerald-500"><QrCode className="w-6 h-6" /></div>
                      <div className="text-start">
                         <p className="text-lg font-black leading-none">WhatsApp Web Style</p>
                         <p className="text-[10px] opacity-60 font-bold uppercase mt-1">امسح الكود للدخول</p>
                      </div>
                   </div>
                   <ArrowLeft className={`w-5 h-5 ${dir === 'ltr' ? 'rotate-180' : ''}`} />
                 </button>

                 <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"></span></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold">أو اختر الطريقة التقليدية</span></div>
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                   <button 
                     onClick={() => setLoginMode('ADMIN')}
                     className="p-4 bg-slate-900 text-white rounded-[1.5rem] flex flex-col items-center justify-center gap-2 hover:bg-amber-500 hover:text-slate-900 transition-all shadow-lg active:scale-95"
                   >
                      <ShieldCheck className="w-6 h-6" />
                      <span className="text-xs font-black">{t('adminPortal')}</span>
                   </button>

                   <button 
                     onClick={() => setLoginMode('STAFF')}
                     className="p-4 bg-white border-2 border-slate-200 text-slate-900 rounded-[1.5rem] flex flex-col items-center justify-center gap-2 hover:border-amber-500 transition-all shadow-sm active:scale-95"
                   >
                      <User className="w-6 h-6 text-slate-400" />
                      <span className="text-xs font-black">{t('staffPortal')}</span>
                   </button>
                 </div>
              </div>
            ) : loginMode === 'QR' ? (
              <div className="text-center space-y-6 animate-in zoom-in duration-300">
                 <button onClick={() => setLoginMode('CHOICE')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4 group mx-auto">
                    <ArrowLeft className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                    <span className="text-xs font-black">{t('backToChoice')}</span>
                 </button>

                 {isLoading ? (
                    <div className="py-20 flex flex-col items-center">
                       <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mb-4" />
                       <p className="text-lg font-black text-slate-900">جاري الاتصال بالجهاز...</p>
                    </div>
                 ) : (
                   <div className="bg-white p-4 rounded-3xl border-4 border-slate-100 inline-block shadow-inner relative">
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/50 z-10 pointer-events-none"></div>
                      <QRCode value={qrSessionId} size={200} fgColor="#0f172a" />
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-1 rounded-full text-[10px] font-bold shadow-lg whitespace-nowrap">
                         Scan with Mobile App
                      </div>
                   </div>
                 )}

                 <div>
                    <h3 className="text-lg font-black text-slate-900">استخدم جوالك للمسح</h3>
                    <ol className="text-xs text-slate-500 font-bold mt-4 space-y-2 text-start list-decimal list-inside bg-slate-50 p-4 rounded-2xl">
                       <li>افتح النظام في جوالك (يجب أن تكون مسجلاً).</li>
                       <li>اذهب للقائمة الجانبية واضغط <strong>"ربط جهاز / Web"</strong>.</li>
                       <li>وجه الكاميرا نحو الرمز المربع.</li>
                    </ol>
                 </div>
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
          </div>

          {/* Right Side (Art/Info) - Hidden on Mobile */}
          <div className="hidden md:flex w-1/2 bg-slate-50 border-r border-slate-100 relative items-center justify-center p-12 overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]"></div>
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
             
             <div className="relative z-10 text-center space-y-6">
                <div className="w-32 h-32 mx-auto bg-white rounded-[2.5rem] shadow-2xl p-6 flex items-center justify-center mb-8 border border-slate-100">
                   <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                </div>
                <h2 className="text-3xl font-black text-slate-900">نظام إدارة المقاهي الذكي</h2>
                <p className="text-sm font-bold text-slate-500 leading-relaxed max-w-sm mx-auto">
                   تحكم كامل في المخزون، الموظفين، والمبيعات من خلال منصة سحابية موحدة تدعم المزامنة اللحظية والذكاء الاصطناعي.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-8">
                   <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                      <Smartphone className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                      <p className="text-xs font-black">يدعم الجوال</p>
                   </div>
                   <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                      <QrCode className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                      <p className="text-xs font-black">تسجيل سريع</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
