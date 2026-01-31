
import React, { useState } from 'react';
import { 
  Cloud, ShieldCheck, Terminal, Copy, CheckCircle2, 
  ExternalLink, Server, Globe, Lock, Cpu, Info, AlertTriangle, Zap
} from 'lucide-react';

const DeploymentCenter: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Zap className="w-10 h-10 text-amber-500" /> مركز النشر (Netlify Free Path)
          </h2>
          <p className="text-slate-500 text-sm font-bold">هندسة نشر مجانية 100% بدون بطاقة ائتمان.</p>
        </div>
        <div className="flex gap-2">
          <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black border border-emerald-200 uppercase">No Credit Card Required</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
             <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-slate-900 text-white rounded-2xl">
                   <Terminal className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-xl font-black">خطوات النشر على Netlify</h3>
                   <p className="text-xs text-slate-400 font-bold">اتبع هذه الأوامر لنشر تطبيقك في 5 دقائق.</p>
                </div>
             </div>
             
             <div className="space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-black shrink-0">1</span>
                    <p className="text-sm font-bold text-slate-700">قم برفع الكود إلى مستودع (GitHub Repository) خاص بك.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-black shrink-0">2</span>
                    <p className="text-sm font-bold text-slate-700">اربط حسابك في Netlify بمستودع GitHub.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-black shrink-0">3</span>
                    <p className="text-sm font-bold text-slate-700">في إعدادات النشر، استخدم أمر البناء: <code className="bg-slate-100 px-2 py-1 rounded">npm run build</code> والمجلد: <code className="bg-slate-100 px-2 py-1 rounded">dist</code>.</p>
                  </div>
                </div>

                <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-200">
                   <h4 className="text-sm font-black text-amber-900 mb-2 flex items-center gap-2">
                     <Lock className="w-4 h-4" /> ضبط متغيرات البيئة (الأمان)
                   </h4>
                   <p className="text-xs text-amber-800 leading-relaxed mb-4">
                     اذهب إلى <strong>Site Configuration &gt; Environment Variables</strong> وأضف المفتاح التالي:
                   </p>
                   <div className="bg-white p-4 rounded-xl border border-amber-200 font-mono text-xs flex justify-between items-center">
                      <code>API_KEY = "مفتاح_جيمناي_الخاص_بك"</code>
                      <button onClick={() => copyToClipboard('API_KEY', 'env')} className="text-amber-600 hover:text-amber-800"><Copy className="w-4 h-4" /></button>
                   </div>
                </div>
             </div>
          </section>

          <section className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white">
             <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-amber-500 text-slate-900 rounded-2xl">
                   <Cpu className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-xl font-black">لماذا Netlify Functions؟</h3>
                   <p className="text-xs text-slate-400 font-bold">هندسة الـ Serverless الآمنة.</p>
                </div>
             </div>
             <p className="text-sm text-slate-300 leading-relaxed">
               عند استخدام Netlify Functions، يتم تنفيذ طلب الـ API داخل بيئة سحابية محمية تابعة لـ AWS Lambda. الميزة الكبرى هنا هي أن المهاجم لا يمكنه رؤية الـ <strong>API_KEY</strong> لأنه لا يغادر السيرفر إطلاقاً. المتصفح يرى فقط النتيجة النهائية.
             </p>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
             <h3 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-widest">تأكيد المجانية</h3>
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                   <span className="text-xs font-bold text-slate-600">لا يتطلب بطاقة بنكية (Credit Card Free)</span>
                </div>
                <div className="flex items-center gap-3">
                   <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                   <span className="text-xs font-bold text-slate-600">دومين مجاني (your-site.netlify.app)</span>
                </div>
                <div className="flex items-center gap-3">
                   <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                   <span className="text-xs font-bold text-slate-600">شهادة SSL مجانية تلقائية</span>
                </div>
                <div className="flex items-center gap-3">
                   <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                   <span className="text-xs font-bold text-slate-600">125,000 استدعاء شهري للـ Backend</span>
                </div>
             </div>
          </div>

          <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-500/20">
             <Info className="w-10 h-10 mb-4 opacity-50" />
             <h4 className="text-lg font-black mb-2">هل تحتاج مساعدة؟</h4>
             <p className="text-xs text-blue-100 leading-relaxed">
               بمجرد نشر التطبيق على Netlify، سيتعرف النظام تلقائياً على البيئة ويبدأ بإرسال الطلبات عبر السيرفر الآمن بدلاً من الاتصال المباشر.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DeploymentCenter;
