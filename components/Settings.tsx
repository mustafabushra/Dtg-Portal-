
import React, { useState } from 'react';
import { Store, Clock, Bell, Shield, Globe, Save, Trash2, CheckCircle, MapPin, Navigation, Info, RefreshCw, Palette, Image as ImageIcon, Type } from 'lucide-react';

interface SettingsProps {
  onReset: () => void;
  cafeLocation: { lat: number, lng: number };
  setCafeLocation: (loc: { lat: number, lng: number }) => void;
  billingThreshold: number;
  setBillingThreshold: (val: number) => void;
  themeSettings: { systemName: string, primaryColor: string, logoUrl: string };
  setThemeSettings: (settings: { systemName: string, primaryColor: string, logoUrl: string }) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  onReset, cafeLocation, setCafeLocation, billingThreshold, setBillingThreshold, themeSettings, setThemeSettings 
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  
  const [localTheme, setLocalTheme] = useState(themeSettings);

  const handleSave = () => {
    setThemeSettings(localTheme);
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
          <h2 className="text-2xl font-black text-slate-900">إعدادات النظام الهوية</h2>
          <p className="text-slate-500 text-sm">إدارة هوية الكافي، الاسم، اللون، والنطاق الجغرافي.</p>
        </div>
        {isSaved && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl font-bold text-xs animate-in slide-in-from-top-2">
            <CheckCircle className="w-4 h-4" /> تم الحفظ بنجاح
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* قسم المظهر والهوية */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Palette className="w-5 h-5 text-custom-primary" />
            الهوية البصرية والعلامة التجارية
          </h3>
          
          <div className="grid grid-cols-1 gap-8">
            {/* تغيير اسم الكافي */}
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">اسم الكافي / المنشأة</label>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <Type className="w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  value={localTheme.systemName}
                  onChange={(e) => setLocalTheme({...localTheme, systemName: e.target.value})}
                  placeholder="أدخل اسم الكافي هنا..."
                  className="flex-1 bg-transparent outline-none font-black text-lg text-slate-900"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-bold pr-2">سيظهر هذا الاسم في صفحة الدخول، القائمة الجانبية، وعنوان المتصفح.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">اللون الرئيسي للنظام</label>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <input 
                    type="color" 
                    value={localTheme.primaryColor}
                    onChange={(e) => setLocalTheme({...localTheme, primaryColor: e.target.value})}
                    className="w-12 h-12 rounded-lg cursor-pointer border-none bg-transparent"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-900">{localTheme.primaryColor.toUpperCase()}</p>
                    <p className="text-[10px] text-slate-400 font-bold">يتحكم في أزرار وأيقونات النظام</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">رابط الشعار (Logo URL)</label>
                <div className="flex items-center gap-4 p-2 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="w-16 h-16 bg-white rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    <img src={localTheme.logoUrl} className="w-full h-full object-contain p-1" alt="Logo Preview" onError={(e) => e.currentTarget.src = 'https://placehold.co/100x100?text=Logo'} />
                  </div>
                  <input 
                    type="text"
                    value={localTheme.logoUrl}
                    onChange={(e) => setLocalTheme({...localTheme, logoUrl: e.target.value})}
                    placeholder="رابط الصورة المباشر..."
                    className="flex-1 bg-transparent outline-none font-bold text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-custom-primary" />
            إعدادات البصمة الجيوفيزيائية (Geofencing)
          </h3>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-custom-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-custom">
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
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-black hover:bg-custom-primary hover:text-slate-900 transition-all shadow-xl disabled:opacity-50"
             >
               {isCalibrating ? "جاري التحديد..." : "تثبيت موقع الكافي الحالي كمركز"}
             </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 font-bold flex items-center gap-2">
             <Info className="w-3 h-3" /> ملاحظة: يتم السماح بالبصمة ضمن شعاع 200 متر من هذا الموقع فقط.
          </p>
        </section>

        <div className="flex justify-end pt-4">
          <button onClick={handleSave} className="flex items-center gap-2 bg-slate-900 text-white px-12 py-4 rounded-2xl font-black shadow-2xl hover-bg-custom-primary hover:text-slate-900 transition-all border-b-4 border-b-slate-700">
            <Save className="w-5 h-5" /> حفظ وتطبيق الهوية
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
