
import React, { useState } from 'react';
import { MinusCircle, Search, ArrowLeftRight, CheckCircle2, AlertCircle, History, Image as ImageIcon } from 'lucide-react';
import { InventoryItem } from '../types';

interface StockWithdrawalProps {
  inventory: InventoryItem[];
  onWithdraw: (id: string, quantity: number) => void;
}

const StockWithdrawal: React.FC<StockWithdrawalProps> = ({ inventory, onWithdraw }) => {
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [logs, setLogs] = useState<{id: string, name: string, amount: number, time: string}[]>([]);

  const filteredItems = inventory.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirm = () => {
    if (!selectedItem || amount <= 0) return;
    if (amount > selectedItem.quantity) {
      alert('الكمية المسحوبة أكبر من المتوفر!');
      return;
    }

    onWithdraw(selectedItem.id, amount);
    
    // Add to local logs for the session
    const newLog = {
      id: Math.random().toString(),
      name: selectedItem.name,
      amount: amount,
      time: new Date().toLocaleTimeString('ar-SA')
    };
    setLogs([newLog, ...logs]);

    // Reset
    setSelectedItem(null);
    setAmount(0);
    setSearch('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Left side: Selection and Action */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
          <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
            <MinusCircle className="w-7 h-7 text-red-500" />
            تسجيل سحب مواد (مطبخ / بار)
          </h2>

          {!selectedItem ? (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث عن المادة (قهوة، حليب، لحم...)"
                  className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 ring-amber-500/10 outline-none font-bold text-lg"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredItems.slice(0, 6).map(item => (
                  <button 
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-amber-500 hover:shadow-lg transition-all text-right group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-full h-full p-2 text-slate-300" />}
                       </div>
                       <p className="font-black text-slate-900 group-hover:text-amber-600 truncate">{item.name}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold">المتوفر: {item.quantity} {item.unit}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-6 p-6 bg-amber-50 rounded-3xl border border-amber-100">
                <div className="w-24 h-24 rounded-2xl bg-white overflow-hidden border-2 border-amber-200 shadow-md shrink-0">
                  {selectedItem.imageUrl ? <img src={selectedItem.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-full h-full p-6 text-slate-200" />}
                </div>
                <div className="flex-1">
                  <p className="text-amber-600 text-xs font-black uppercase tracking-widest">تأكد من فرز المادة التالية:</p>
                  <h3 className="text-2xl font-black text-slate-900">{selectedItem.name}</h3>
                  <p className="text-slate-500 text-sm font-bold">الرصيد الحالي في المخزن: {selectedItem.quantity} {selectedItem.unit}</p>
                </div>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="p-3 bg-white text-slate-400 hover:text-slate-900 rounded-2xl border border-slate-200 self-start"
                >
                  تغيير
                </button>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-black text-slate-600 block">الكمية المسحوبة ({selectedItem.unit})</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="number" 
                    autoFocus
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="flex-1 p-6 bg-slate-50 border-2 border-slate-200 rounded-[2rem] text-4xl font-black text-center focus:border-amber-500 outline-none transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              <button 
                onClick={handleConfirm}
                disabled={amount <= 0 || amount > selectedItem.quantity}
                className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 hover:bg-green-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-50 disabled:bg-slate-300"
              >
                <CheckCircle2 className="w-6 h-6" />
                تأكيد الخصم من المخزون
              </button>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-blue-500 shrink-0" />
          <div>
            <h4 className="text-sm font-black text-blue-900">نصيحة للموظف</h4>
            <p className="text-xs text-blue-700 mt-1">تأكد من مطابقة صورة المادة مع النوع الذي تسحبه فعلياً لضمان جودة التحضير.</p>
          </div>
        </div>
      </div>

      {/* Right side: Session Log */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 h-full">
          <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" />
            سجل السحب الأخير
          </h3>

          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="py-20 text-center text-slate-300 font-bold italic text-sm">
                لا توجد عمليات سحب في هذه الجلسة.
              </div>
            ) : (
              logs.map(log => (
                <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between animate-in slide-in-from-right-4">
                  <div>
                    <p className="text-sm font-black text-slate-900">{log.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{log.time}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-red-500">-{log.amount}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockWithdrawal;
