
import React, { useState } from 'react';
import { 
  MinusCircle, Scale, LayoutGrid, AlertCircle, ShoppingCart, Coffee, PackageCheck, Clock, Utensils, Wine, Box, Plus, Minus
} from 'lucide-react';
import InventoryManager from './InventoryManager';
import StockAdjustment from './StockAdjustment';
import { InventoryItem, Asset, Category } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface InventoryHubProps {
  inventory: InventoryItem[];
  assets: Asset[];
  onAddItem: (item: any) => void;
  onDeleteItem: (id: string) => void;
  onUpdateItem: (item: any) => void;
  onAddAsset: (asset: any) => void;
  onDeleteAsset: (id: string) => void;
  onUpdateAsset: (asset: any) => void;
  onWithdraw: (id: string, qty: number) => void;
  onAdjust: (id: string, qty: number) => void;
}

const InventoryHub: React.FC<InventoryHubProps> = ({
  inventory, assets, onAddItem, onDeleteItem, onUpdateItem, onAddAsset, onDeleteAsset, onUpdateAsset, onWithdraw, onAdjust
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'MANAGEMENT' | 'BARISTA_VIEW' | 'ADJUST'>('BARISTA_VIEW');
  const [consumptionFilter, setConsumptionFilter] = useState<'ALL' | Category>('ALL'); // فلتر للاستهلاك السريع

  const lowStock = inventory.filter(i => i.quantity <= i.minLimit);
  const expiringStock = inventory.filter(i => {
    if (!i.expiryDate) return false;
    const diff = new Date(i.expiryDate).getTime() - new Date().getTime();
    return diff < (7 * 24 * 3600 * 1000);
  });

  // تصفية المواد المعروضة للاستهلاك بناءً على الفلتر
  const displayedConsumptionItems = inventory.filter(i => {
    // We allow consumption for Kitchen, Bar and Store items
    const isConsumable = i.category === Category.BAR || i.category === Category.KITCHEN || i.category === Category.STORE;
    const matchesFilter = consumptionFilter === 'ALL' || i.category === consumptionFilter;
    return isConsumable && matchesFilter;
  });

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex bg-white p-1 md:p-2 rounded-xl md:rounded-[1.5rem] shadow-sm border border-slate-200 w-full md:w-fit overflow-x-auto no-scrollbar">
        {[
          { id: 'BARISTA_VIEW', label: t('inv_tab_consumption'), icon: Coffee },
          { id: 'MANAGEMENT', label: t('inv_tab_records'), icon: LayoutGrid },
          { id: 'ADJUST', label: t('inv_tab_adjust'), icon: Scale },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl text-[10px] md:text-[11px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'BARISTA_VIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
           <div className="lg:col-span-3 space-y-4 md:space-y-6">
              <div className="bg-white p-4 md:p-10 rounded-2xl md:rounded-[3rem] shadow-sm border border-slate-200">
                 <div className="flex flex-col md:flex-row items-center justify-between mb-6 md:mb-10 gap-4">
                    <h2 className="text-lg md:text-2xl font-black text-slate-900 flex items-center gap-3"><MinusCircle className="w-5 h-5 md:w-7 md:h-7 text-rose-500" /> {t('inv_quick_consume')}</h2>
                    
                    {/* فلاتر الاستهلاك */}
                    <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar max-w-full">
                       <button onClick={() => setConsumptionFilter('ALL')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all whitespace-nowrap ${consumptionFilter === 'ALL' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>{t('inv_filter_all')}</button>
                       <button onClick={() => setConsumptionFilter(Category.KITCHEN)} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 whitespace-nowrap ${consumptionFilter === Category.KITCHEN ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500'}`}><Utensils className="w-3 h-3" /> {t('inv_filter_kitchen')}</button>
                       <button onClick={() => setConsumptionFilter(Category.BAR)} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 whitespace-nowrap ${consumptionFilter === Category.BAR ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}><Wine className="w-3 h-3" /> {t('inv_filter_bar')}</button>
                       <button onClick={() => setConsumptionFilter(Category.STORE)} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 whitespace-nowrap ${consumptionFilter === Category.STORE ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}><Box className="w-3 h-3" /> {t('inv_filter_store')}</button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                    {displayedConsumptionItems.map(item => (
                      <div key={item.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
                        
                        {/* Header Image & Name */}
                        <div className="flex items-center gap-4 mb-4">
                           <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-lg text-slate-300 overflow-hidden shrink-0">
                              {item.name.charAt(0)}
                           </div>
                           <div className="min-w-0 flex-1">
                             <p className="text-sm font-black text-slate-900 truncate">{item.name}</p>
                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mt-1 ${item.category === Category.KITCHEN ? 'bg-orange-50 text-orange-600' : item.category === Category.BAR ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                               {item.category}
                             </span>
                           </div>
                        </div>

                        {/* Controls */}
                        <div className="bg-slate-50 rounded-2xl p-1.5 flex items-center justify-between border border-slate-100">
                           {/* Decrease Button (Withdraw 1) */}
                           <button 
                             onClick={() => onWithdraw(item.id, 1)} 
                             className="w-12 h-12 flex items-center justify-center bg-white text-rose-500 rounded-xl shadow-sm border border-slate-100 hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/30 transition-all active:scale-90"
                             title="استهلاك 1"
                           >
                             <Minus className="w-5 h-5" />
                           </button>

                           {/* Central Quantity Display */}
                           <div className="flex flex-col items-center px-2">
                              <span className={`text-xl font-black ${item.quantity <= item.minLimit ? 'text-red-500' : 'text-slate-800'}`}>
                                {item.quantity}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase">{item.unit}</span>
                           </div>

                           {/* Increase Button (Add 1 - essentially withdraw -1) */}
                           <button 
                             onClick={() => onWithdraw(item.id, -1)} 
                             className="w-12 h-12 flex items-center justify-center bg-white text-emerald-500 rounded-xl shadow-sm border border-slate-100 hover:bg-emerald-500 hover:text-white hover:shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-90"
                             title="إضافة 1 (تراجع)"
                           >
                             <Plus className="w-5 h-5" />
                           </button>
                        </div>

                        {/* Low Stock Indicator Line */}
                        <div className={`absolute bottom-0 right-0 left-0 h-1.5 ${item.quantity <= item.minLimit ? 'bg-rose-500' : 'bg-slate-100'}`}></div>
                      </div>
                    ))}
                    {displayedConsumptionItems.length === 0 && (
                      <div className="col-span-full py-10 text-center text-slate-400 font-bold text-xs italic">
                        لا توجد أصناف في هذا القسم حالياً.
                      </div>
                    )}
                 </div>
              </div>
           </div>

           <div className="space-y-6">
              <div className="bg-slate-900 text-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-2xl relative overflow-hidden border-b-4 md:border-b-8 border-rose-500">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl"></div>
                 <h3 className="text-xs md:text-sm font-black text-rose-400 mb-4 md:mb-6 flex items-center gap-2 tracking-widest uppercase"><AlertCircle className="w-4 h-4 md:w-5 md:h-5" /> {t('inv_alerts')}</h3>
                 
                 <div className="space-y-4 relative z-10">
                    {/* Low Stock Alerts */}
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-slate-500 uppercase">{t('inv_low_stock')}</p>
                      {lowStock.map(item => (
                        <div key={item.id} className="bg-white/5 p-3 rounded-xl flex items-center justify-between border border-white/10">
                           <p className="text-[11px] font-black">{item.name}</p>
                           <p className="text-[9px] text-rose-400 font-bold">{item.quantity} {t('inv_remaining')}</p>
                        </div>
                      ))}
                      {lowStock.length === 0 && <p className="text-[9px] text-slate-500 italic">{t('inv_no_low_stock')}</p>}
                    </div>

                    {/* Expiry Alerts */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <p className="text-[9px] font-black text-slate-500 uppercase">{t('inv_expiry_alert')}</p>
                      {expiringStock.map(item => (
                        <div key={`exp-${item.id}`} className="bg-white/5 p-3 rounded-xl flex items-center justify-between border border-white/10">
                           <div className="flex items-center gap-2">
                             <Clock className="w-3 h-3 text-rose-500" />
                             <p className="text-[11px] font-black">{item.name}</p>
                           </div>
                           <p className="text-[9px] text-rose-400 font-bold">{item.expiryDate}</p>
                        </div>
                      ))}
                      {expiringStock.length === 0 && <p className="text-[9px] text-slate-500 italic">{t('inv_no_expiry')}</p>}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'MANAGEMENT' && <InventoryManager inventory={inventory} assets={assets} onAddItem={onAddItem} onDeleteItem={onDeleteItem} onUpdateItem={onUpdateItem} onAddAsset={onAddAsset} onDeleteAsset={onDeleteAsset} onUpdateAsset={onUpdateAsset} />}
      {activeTab === 'ADJUST' && <StockAdjustment inventory={inventory} onAdjust={onAdjust} />}
    </div>
  );
};

export default InventoryHub;