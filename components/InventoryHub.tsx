
import React, { useState } from 'react';
import { 
  MinusCircle, Scale, LayoutGrid, AlertCircle, ShoppingCart, Coffee, PackageCheck, Clock
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

  const lowStock = inventory.filter(i => i.quantity <= i.minLimit);
  const expiringStock = inventory.filter(i => {
    if (!i.expiryDate) return false;
    const diff = new Date(i.expiryDate).getTime() - new Date().getTime();
    return diff < (7 * 24 * 3600 * 1000);
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
                 <div className="flex items-center justify-between mb-6 md:mb-10">
                    <h2 className="text-lg md:text-2xl font-black text-slate-900 flex items-center gap-3"><MinusCircle className="w-5 h-5 md:w-7 md:h-7 text-rose-500" /> {t('inv_quick_consume')}</h2>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                    {inventory.filter(i => i.category === Category.BAR || i.category === Category.KITCHEN).map(item => (
                      <div key={item.id} className="bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] border border-slate-200 flex flex-col gap-4 md:gap-6 group hover:bg-white hover:shadow-xl transition-all relative overflow-hidden">
                        <div className="flex items-center gap-3 md:gap-4 relative z-10">
                           <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-black text-lg md:text-xl text-slate-300 group-hover:bg-amber-500 group-hover:text-slate-900 transition-colors">
                              {item.name.charAt(0)}
                           </div>
                           <div className="min-w-0">
                             <p className="text-xs md:text-sm font-black text-slate-900 truncate">{item.name}</p>
                             <p className="text-[9px] md:text-[10px] font-black text-slate-400 mt-0.5">{t('inv_available')}: {item.quantity} {item.unit}</p>
                           </div>
                        </div>
                        <div className="flex gap-2 md:gap-3 relative z-10">
                           <button onClick={() => onWithdraw(item.id, 1)} className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm">-1</button>
                           <button onClick={() => onWithdraw(item.id, 5)} className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm">-5</button>
                        </div>
                        <div className={`absolute bottom-0 right-0 left-0 h-1 ${item.quantity <= item.minLimit ? 'bg-rose-500 animate-pulse' : 'bg-transparent'}`}></div>
                      </div>
                    ))}
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
