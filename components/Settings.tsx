
import React, { useState } from 'react';
import { Store, Clock, Bell, Shield, Globe, Save, Trash2, CheckCircle, MapPin, Navigation, Info, RefreshCw } from 'lucide-react';

interface SettingsProps {
  onReset: () => void;
  cafeLocation: { lat: number, lng: number };
  setCafeLocation: (loc: { lat: number, lng: number }) => void;
  billingThreshold: number;
  setBillingThreshold: (val: number) => void;
}

const Settings: React.FC<SettingsProps> = ({ onReset, cafeLocation, setCafeLocation, billingThreshold, setBillingThreshold }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCalibrate = () => {
    setIsCalibrating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCafeLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsCalibrating(false);
        alert("تم تحديث موقع الكافي بنجاح!");
      },
      () => {
        setIsCalibrating(false);
        alert("فشل تحديد الموقع. يرجى تفعيل GPS.");
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">إعدادات النظام</h2>
          <p className="text-slate-500 text-sm">إدارة هوية الكافي، أوقات العمل، والنطاق الجغرافي.</p>
        </div>
        {isSaved && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl font-bold text-xs animate-in slide-in-from-top-2">
            <CheckCircle className="w-4 h-4" /> تم الحفظ بنجاح
          </div>
        )}
      </div>

      <div className="space-y-6">
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-500" />
            إعدادات البصمة الجيوفيزيائية (Geofencing)
          </h3>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                   <Navigation className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">إحداثيات المركز المعتمد</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{cafeLocation.lat.toFixed(6)}, {cafeLocation.lng.toFixed(6)}</p>
                </div>
             </div>
             <button 
              onClick={handleCalibrate}
              disabled={isCalibrating}
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-black hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl disabled:opacity-50"
             >
               {isCalibrating ? "جاري التحديد..." : "تثبيت موقع الكافي الحالي كمركز"}
             </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 font-bold flex items-center gap-2">
             <Info className="w-3 h-3" /> ملاحظة: يتم السماح بالبصمة ضمن شعاع 200 متر من هذا الموقع فقط.
          </p>
        </section>

        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Bell className="w-5 h-5 text-amber-500" />إعدادات التنبيهات والفوترة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">أيام التنبيه قبل موعد فوترة الخدمات</label>
              <input 
                type="number" 
                value={billingThreshold} 
                onChange={(e) => setBillingThreshold(Number(e.target.value))} 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold" 
                min="1"
                max="30"
              />
              <p className="text-[10px] text-slate-400 font-bold mt-1">سيظهر تنبيه في لوحة التحكم قبل الموعد بـ {billingThreshold} أيام.</p>
            </div>
          </div>
        </section>

        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Store className="w-5 h-5 text-amber-500" />معلومات المنشأة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><label className="text-xs font-bold text-slate-500">اسم الكافي</label><input type="text" defaultValue="كافي التحلية" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold" /></div>
            <div className="space-y-2"><label className="text-xs font-bold text-slate-500">العنوان</label><input type="text" defaultValue="الرياض، طريق التحلية" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold" /></div>
          </div>
        </section>

        <section className="bg-red-50 p-8 rounded-3xl border border-red-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-red-900 flex items-center gap-2">
                <Trash2 className="w-5 h-5" /> مسح البيانات الشامل
              </h3>
              <p className="text-sm text-red-700 mt-1">هذا الإجراء سيقوم بحذف جميع مدخلات المخزون والموظفين والبدء من الصفر.</p>
            </div>
            <button 
              onClick={onReset}
              className="px-8 py-3 bg-red-600 text-white rounded-xl text-xs font-black hover:bg-red-700 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> تصفير النظام
            </button>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button onClick={handleSave} className="flex items-center gap-2 bg-slate-900 text-white px-12 py-4 rounded-2xl font-black shadow-2xl hover:bg-amber-500 hover:text-slate-900 transition-all border-b-4 border-b-slate-700">
            <Save className="w-5 h-5" /> حفظ الإعدادات
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
