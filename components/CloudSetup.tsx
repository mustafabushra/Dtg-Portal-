
import React, { useState } from 'react';
import { Cloud, Server, CheckCircle2, ArrowLeft, Globe, ShieldCheck, Database, Rocket } from 'lucide-react';
import { saveSystemConfig } from '../services/firebase';

const CloudSetup: React.FC = () => {
  const [step, setStep] = useState(1);
  const [configInput, setConfigInput] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    try {
      // محاولة تنظيف المدخلات لاستخراج JSON فقط
      let jsonStr = configInput;
      // إذا قام المستخدم بنسخ الكود كاملاً (const firebaseConfig = ...)، نحاول استخراج الجزء الموجود بين الأقواس
      if (jsonStr.includes('=')) {
        const match = jsonStr.match(/{[\s\S]*}/);
        if (match) jsonStr = match[0];
      }
      
      // تصحيح الأخطاء الشائعة في JSON (مثل الفواصل اللاحقة)
      jsonStr = jsonStr.replace(/,\s*}/g, '}');
      
      const config = JSON.parse(jsonStr);
      
      if (!config.apiKey || !config.projectId) {
        throw new Error("بيانات التكوين غير مكتملة. تأكد من وجود apiKey و projectId");
      }

      saveSystemConfig(config);
    } catch (e) {
      setError('صيغة البيانات غير صحيحة. يرجى التأكد من نسخ كائن JSON بشكل صحيح من Firebase.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 font-['Cairo']" dir="rtl">
      <div className="max-w-3xl w-full bg-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-700">
        <div className="p-10 text-center border-b border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
           <div className="relative z-10">
             <div className="w-20 h-20 bg-amber-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-amber-500/20">
               <Cloud className="w-10 h-10 text-slate-900" />
             </div>
             <h1 className="text-3xl font-black mb-2">تفعيل السحابة (Cloud Activation)</h1>
             <p className="text-slate-400 font-bold">اربط نظامك بقاعدة بيانات حية لتفعيل المزامنة بين الفروع والموظفين.</p>
           </div>
        </div>

        <div className="p-10">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-700/50 p-6 rounded-3xl border border-slate-600">
                     <div className="flex items-center gap-3 mb-4">
                        <span className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-black">1</span>
                        <h3 className="font-black text-lg">أنشئ مشروعاً</h3>
                     </div>
                     <p className="text-sm text-slate-300 leading-relaxed">
                        اذهب إلى <a href="https://console.firebase.google.com" target="_blank" className="text-amber-400 underline font-bold">console.firebase.google.com</a> وأنشئ مشروعاً جديداً مجانياً.
                     </p>
                  </div>
                  <div className="bg-slate-700/50 p-6 rounded-3xl border border-slate-600">
                     <div className="flex items-center gap-3 mb-4">
                        <span className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-black">2</span>
                        <h3 className="font-black text-lg">فعل قاعدة البيانات</h3>
                     </div>
                     <p className="text-sm text-slate-300 leading-relaxed">
                        من القائمة الجانبية اختر <strong>Build</strong> ثم <strong>Firestore Database</strong> واضغط Create Database (اختر Test Mode للبداية).
                     </p>
                  </div>
               </div>
               
               <button onClick={() => setStep(2)} className="w-full py-5 bg-amber-500 text-slate-900 rounded-2xl font-black text-lg hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-xl">
                 أكملت الخطوات، التالي <ArrowLeft className="w-5 h-5" />
               </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
               <div className="bg-slate-700/50 p-6 rounded-3xl border border-slate-600 mb-6">
                  <h3 className="font-black text-lg mb-2 flex items-center gap-2">
                     <Database className="w-5 h-5 text-emerald-400" /> أحضر بيانات الربط (Config)
                  </h3>
                  <ol className="list-decimal list-inside text-sm text-slate-300 space-y-2 marker:text-emerald-500 marker:font-bold">
                     <li>في إعدادات المشروع (Project Settings).</li>
                     <li>انزل لأسفل الصفحة لقسم <strong>Your apps</strong>.</li>
                     <li>اختر أيقونة الويب <strong>(&lt;/&gt;)</strong> وسجل التطبيق.</li>
                     <li>انسخ كود <code>firebaseConfig</code> الظاهر والصقه بالأسفل.</li>
                  </ol>
               </div>

               <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">الصق كود الإعدادات هنا</label>
                  <textarea 
                    value={configInput}
                    onChange={(e) => setConfigInput(e.target.value)}
                    dir="ltr"
                    placeholder={`const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "...",
  projectId: "...",
  ...
};`}
                    className="w-full h-40 bg-slate-900 border border-slate-600 rounded-2xl p-4 font-mono text-xs text-emerald-400 focus:border-amber-500 outline-none"
                  />
                  {error && <p className="text-red-400 text-sm font-bold flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> {error}</p>}
               </div>

               <div className="flex gap-4">
                 <button onClick={() => setStep(1)} className="px-6 py-4 bg-slate-700 rounded-2xl font-black text-slate-300 hover:text-white transition-all">رجوع</button>
                 <button onClick={handleSave} className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black text-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-xl">
                   <Rocket className="w-5 h-5" /> حفظ وتشغيل النظام
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CloudSetup;
