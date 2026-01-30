
import React, { useState } from 'react';
import { Scale, Search, CheckCircle2, AlertTriangle, Info, RefreshCw, History, ArrowRightLeft, Image as ImageIcon } from 'lucide-react';
import { InventoryItem } from '../types';

interface StockAdjustmentProps {
  inventory: InventoryItem[];
  onAdjust: (id: string, newQuantity: number) => void;
}

const StockAdjustment: React.FC<StockAdjustmentProps> = ({ inventory, onAdjust }) => {
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [physicalCount, setPhysicalCount] = useState<number | string>('');
  const [reason, setReason] = useState('خطأ جرد');
  const [history, setHistory] = useState<{name: string, diff: number, reason: string, time: string}[]>([]);

  const filteredItems = inventory.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdjust = () => {
    if (!selectedItem || physicalCount === '') return;
    const count = Number(physicalCount);
    const diff = count - selectedItem.quantity;

    onAdjust(selectedItem.id, count);

    setHistory([{
      name: selectedItem.name,
      diff: diff,
      reason: reason,
      time: new Date().toLocaleTimeString('ar-SA')
    }, ...history]);

    setSelectedItem(null);
    setPhysicalCount('');
    setSearch('');
  };

  const getDiffDisplay = () => {
    if (physicalCount === '' || !selectedItem) return null;
    const diff = Number(physicalCount) - selectedItem.quantity;
    if (diff === 0) return <span className="text-green-500 font-black">مطابق تماماً</span>;
    return (
      <span className={`font-black ${diff > 0 ? 'text-blue-500' : 'text-red-500'}`}>
        {diff > 0 ? `فائض (+${diff})` : `عجز (${diff})`}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
          <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
            <Scale className="w-7 h-7 text-amber-500" />
            تسوية الجرد الفعلي
          </h2>

          {!selectedItem ? (
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث عن المادة للمطابقة..."
                  className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 ring-amber-500/10 outline-none font-bold"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.slice(0, 6).map(item => (
                  <button 
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-amber-500 hover:shadow-md transition-all text-right group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                         {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-full h-full p-2 text-slate-200" />}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 group-hover:text-amber-600">{item.name}</p>
                        <p className="text-xs text-slate-400 font-bold">الحالي: {item.quantity} {item.unit}</p>
                      </div>
                    </div>
                    <ArrowRightLeft className="w-5 h-5 text-slate-200 group-hover:text-amber-300" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-6 p-6 bg-slate-900 text-white rounded-3xl shadow-xl">
                <div className="w-20 h-20 rounded-2xl bg-white/10 overflow-hidden border border-white/20 shrink-0">
                   {selectedItem.imageUrl ? <img src={selectedItem.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-full h-full p-5 text-white/20" />}
                </div>
                <div className="flex-1">
                  <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest">تأكد من شكل المادة أثناء الجرد</p>
                  <h3 className="text-2xl font-black">{selectedItem.name}</h3>
                </div>
                <button onClick={() => setSelectedItem(null)} className="text-xs font-bold text-slate-400 underline">إلغاء</button>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">الكمية المسجلة في النظام</label>
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-black text-slate-400">
                    {selectedItem.quantity} {selectedItem.unit}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-900 uppercase tracking-wider">الكمية الموجودة فعلياً</label>
                  <input 
                    type="number" 
                    value={physicalCount}
                    onChange={(e) => setPhysicalCount(e.target.value)}
                    placeholder="0"
                    autoFocus
                    className="w-full p-6 bg-white border-2 border-amber-500 rounded-2xl text-2xl font-black text-slate-900 outline-none shadow-lg shadow-amber-500/5"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-bold text-slate-600">تحليل الفارق:</span>
                </div>
                <div className="text-lg">{getDiffDisplay()}</div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">سبب التسوية</label>
                <select 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none"
                >
                  <option value="خطأ جرد">خطأ جرد (إدخال سابق)</option>
                  <option value="تلف / هدر">تلف / هدر (مطبخ أو بار)</option>
                  <option value="انتهاء صلاحية">انتهاء صلاحية</option>
                  <option value="عينة تجربة">عينة تجربة / فحص جودة</option>
                </select>
              </div>

              <button 
                onClick={handleAdjust}
                disabled={physicalCount === ''}
                className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50"
              >
                <RefreshCw className="w-6 h-6" />
                تحديث الكمية في النظام
              </button>
            </div>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
          <div>
            <h4 className="text-sm font-black text-amber-900">تنبيه أمان</h4>
            <p className="text-xs text-amber-700 mt-1">يتم تسجيل كافة عمليات التسوية باسم المدير الحالي وربطها بالتقارير الشهرية لمراجعة الهدر.</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 h-full">
          <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" />
            سجل التسويات الأخيرة
          </h3>
          <div className="space-y-4">
            {history.length === 0 ? (
              <p className="text-center py-10 text-slate-300 font-bold italic text-sm">لا توجد تسويات مسجلة اليوم.</p>
            ) : (
              history.map((h, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-in slide-in-from-right-4">
                  <div className="flex justify-between items-start">
                    <p className="font-black text-sm text-slate-900">{h.name}</p>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${h.diff >= 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                      {h.diff > 0 ? `+${h.diff}` : h.diff}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">السبب: {h.reason}</p>
                  <p className="text-[9px] text-slate-300 font-bold text-left">{h.time}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockAdjustment;
