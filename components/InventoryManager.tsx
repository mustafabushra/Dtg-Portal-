
import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit, X, Package, Wrench, Image as ImageIcon, AlertCircle, History, DollarSign, Calendar, FileText, Clock, Utensils, Wine, Box } from 'lucide-react';
import { InventoryItem, Asset, Category, MaintenanceRecord } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface InventoryManagerProps {
  inventory: InventoryItem[];
  assets: Asset[];
  onAddItem: (item: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
  onUpdateItem: (item: InventoryItem) => void;
  onAddAsset: (asset: Asset) => void;
  onDeleteAsset: (id: string) => void;
  onUpdateAsset: (asset: Asset) => void;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ 
  inventory, assets, onAddItem, onDeleteItem, onUpdateItem, onAddAsset, onDeleteAsset, onUpdateAsset 
}) => {
  const { t, dir } = useLanguage();
  const [tab, setTab] = useState<'STOCK' | 'ASSETS'>('STOCK');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | Category>('ALL'); // فلتر الأقسام
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | Asset | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [search, setSearch] = useState('');

  const filteredStock = inventory.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || i.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredAssets = assets.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

  const handleOpenAdd = () => {
    setEditItem(null);
    setShowModal(true);
  };

  const handleOpenEdit = (item: InventoryItem | Asset) => {
    setEditItem(item);
    setShowModal(true);
  };

  const handleOpenHistory = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowHistoryModal(true);
  };

  const isMaintenanceUrgent = (dateStr: string) => {
    if (!dateStr) return false;
    const maintenanceDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = maintenanceDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  const isExpiryUrgent = (dateStr?: string) => {
    if (!dateStr) return false;
    const expiryDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editItem ? editItem.id : Math.random().toString(36).substr(2, 9);
    
    if (tab === 'STOCK') {
      const newItem: InventoryItem = {
        id,
        name: formData.get('name') as string,
        category: formData.get('category') as Category,
        quantity: Number(formData.get('quantity')),
        unit: formData.get('unit') as string,
        minLimit: Number(formData.get('minLimit')),
        lastUpdated: new Date().toISOString().split('T')[0],
        imageUrl: formData.get('imageUrl') as string || undefined,
        expiryDate: formData.get('expiryDate') as string || undefined,
      };
      editItem ? onUpdateItem(newItem) : onAddItem(newItem);
    } else {
      const newAsset: Asset = {
        id,
        name: formData.get('name') as string,
        purchaseDate: formData.get('purchaseDate') as string,
        maintenanceDate: formData.get('maintenanceDate') as string,
        cost: Number(formData.get('cost')),
        status: formData.get('status') as any || 'يعمل',
        maintenanceHistory: (editItem as Asset)?.maintenanceHistory || [],
      };
      editItem ? onUpdateAsset(newAsset) : onAddAsset(newAsset);
    }
    setShowModal(false);
  };

  const handleAddMaintenanceRecord = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAsset) return;
    const formData = new FormData(e.currentTarget);
    const newRecord: MaintenanceRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: formData.get('date') as string,
      description: formData.get('description') as string,
      cost: Number(formData.get('cost')),
      performedBy: formData.get('performedBy') as string,
    };

    const updatedAsset: Asset = {
      ...selectedAsset,
      maintenanceHistory: [newRecord, ...(selectedAsset.maintenanceHistory || [])],
      lastMaintenanceNote: newRecord.description,
    };
    onUpdateAsset(updatedAsset);
    setSelectedAsset(updatedAsset);
    e.currentTarget.reset();
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('confirm_delete'))) {
      if (tab === 'STOCK') {
        onDeleteItem(id);
      } else {
        onDeleteAsset(id);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Main Tabs (Stock vs Assets) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
          <button onClick={() => setTab('STOCK')} className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all ${tab === 'STOCK' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Package className="w-4 h-4" />
            {t('inv_stock_inventory')}
          </button>
          <button onClick={() => setTab('ASSETS')} className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all ${tab === 'ASSETS' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Wrench className="w-4 h-4" />
            {t('inv_assets_equipment')}
          </button>
        </div>

        <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-amber-500 text-slate-900 px-6 py-3 rounded-2xl font-black hover:bg-amber-400 transition-all active:scale-95 shadow-xl shadow-amber-500/10">
          <Plus className="w-5 h-5" />
          {tab === 'STOCK' ? t('inv_btn_add_stock') : t('inv_btn_add_asset')}
        </button>
      </div>

      {/* Sub Filters for Stock (Kitchen/Bar/Store/All) */}
      {tab === 'STOCK' && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
           <button 
             onClick={() => setCategoryFilter('ALL')} 
             className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${categoryFilter === 'ALL' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
           >
             {t('inv_filter_all')}
           </button>
           <button 
             onClick={() => setCategoryFilter(Category.KITCHEN)} 
             className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all border ${categoryFilter === Category.KITCHEN ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20' : 'bg-white text-slate-500 border-slate-200 hover:border-orange-200 hover:text-orange-500'}`}
           >
             <Utensils className="w-3 h-3" /> {t('inv_filter_kitchen')}
           </button>
           <button 
             onClick={() => setCategoryFilter(Category.BAR)} 
             className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all border ${categoryFilter === Category.BAR ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-200 hover:text-blue-500'}`}
           >
             <Wine className="w-3 h-3" /> {t('inv_filter_bar')}
           </button>
           <button 
             onClick={() => setCategoryFilter(Category.STORE)} 
             className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all border ${categoryFilter === Category.STORE ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-200 hover:text-emerald-500'}`}
           >
             <Box className="w-3 h-3" /> {t('inv_filter_store')}
           </button>
        </div>
      )}

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
           <div className="flex-1 relative">
             <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${dir === 'rtl' ? 'right-4' : 'left-4'}`} />
             <input 
               value={search} 
               onChange={(e) => setSearch(e.target.value)} 
               type="text" 
               placeholder={t('inv_search_records')} 
               className={`w-full py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-amber-500/10 text-sm font-bold ${dir === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
             />
           </div>
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-start">
            <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              {tab === 'STOCK' ? (
                <tr>
                  <th className="px-8 py-4 text-start">{t('inv_col_image')}</th>
                  <th className="px-8 py-4 text-start">{t('inv_col_name')}</th>
                  <th className="px-8 py-4 text-start">{t('inv_col_category')}</th>
                  <th className="px-8 py-4 text-start">{t('inv_col_qty')}</th>
                  <th className="px-8 py-4 text-start">{t('inv_col_expiry')}</th>
                  <th className="px-8 py-4 text-start">{t('inv_col_actions')}</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-8 py-4 text-start">{t('inv_col_asset_name')}</th>
                  <th className="px-8 py-4 text-start">{t('inv_col_purchase_date')}</th>
                  <th className="px-8 py-4 text-start">{t('inv_col_maintenance')}</th>
                  <th className="px-8 py-4 text-start">{t('inv_col_cost')}</th>
                  <th className="px-8 py-4 text-start">{t('inv_col_actions')}</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tab === 'STOCK' ? filteredStock.map(item => {
                const urgentExpiry = isExpiryUrgent(item.expiryDate);
                const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shadow-sm">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-black text-slate-900">{item.name}</td>
                    <td className="px-8 py-5"><span className={`px-3 py-1 rounded-lg text-[10px] font-black ${item.category === Category.KITCHEN ? 'bg-orange-100 text-orange-700' : item.category === Category.BAR ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{item.category}</span></td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-700">{item.quantity} {item.unit}</td>
                    <td className={`px-8 py-5 text-xs font-bold ${urgentExpiry ? 'text-rose-600' : 'text-slate-500'}`}>
                      <div className="flex items-center gap-2">
                        {item.expiryDate || 'N/A'}
                        {urgentExpiry && (
                          <div 
                            className={`p-1 rounded-md ${isExpired ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-600'}`}
                            title={t('inv_expiry_alert')}
                          >
                            <AlertCircle className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 flex items-center gap-2">
                      <button onClick={() => handleOpenEdit(item)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                      <button 
                        onClick={() => handleDelete(item.id)} 
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              }) : filteredAssets.map(asset => {
                const urgent = isMaintenanceUrgent(asset.maintenanceDate);
                return (
                  <tr key={asset.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-5 text-sm font-black text-slate-900">
                      <div className="flex flex-col">
                        <span>{asset.name}</span>
                        {asset.lastMaintenanceNote && (
                          <span className="text-[9px] text-slate-400 italic mt-0.5">Last: {asset.lastMaintenanceNote}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-xs text-slate-500 font-bold">{asset.purchaseDate}</td>
                    <td className={`px-8 py-5 text-xs font-bold flex items-center gap-2 ${urgent ? 'text-red-600 animate-pulse' : 'text-amber-600'}`}>
                      {asset.maintenanceDate}
                      {urgent && (
                        <span title="Maintenance Soon">
                          <AlertCircle className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-sm font-black text-slate-900">{asset.cost.toLocaleString()}</td>
                    <td className="px-8 py-5 flex items-center gap-2">
                      <button onClick={() => handleOpenHistory(asset)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Maintenance Log"><History className="w-4 h-4" /></button>
                      <button onClick={() => handleOpenEdit(asset)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                      <button 
                        onClick={() => handleDelete(asset.id)} 
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View (Cards) */}
        <div className="lg:hidden p-4 space-y-4 bg-slate-50/50">
          {tab === 'STOCK' ? filteredStock.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-all">
               <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                        {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-full h-full p-3 text-slate-300" />}
                     </div>
                     <div>
                        <h4 className="text-sm font-black text-slate-900">{item.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${item.category === Category.KITCHEN ? 'bg-orange-100 text-orange-700' : item.category === Category.BAR ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{item.category}</span>
                     </div>
                  </div>
                  <div className="flex flex-col items-end">
                     <span className="text-sm font-black text-slate-700">{item.quantity} {item.unit}</span>
                     <span className="text-[10px] text-slate-400">Min: {item.minLimit}</span>
                  </div>
               </div>
               <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                     <Clock className="w-3 h-3" /> {item.expiryDate || 'N/A'}
                  </span>
                  <div className="flex gap-2">
                     <button onClick={() => handleOpenEdit(item)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-amber-600 hover:bg-amber-50"><Edit className="w-4 h-4" /></button>
                     <button onClick={() => handleDelete(item.id)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                  </div>
               </div>
            </div>
          )) : filteredAssets.map(asset => (
            <div key={asset.id} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-all">
               <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-black text-slate-900">{asset.name}</h4>
                  <span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded-lg text-slate-600">{asset.cost.toLocaleString()}</span>
               </div>
               <p className="text-[10px] text-slate-400 font-bold mb-3">{asset.purchaseDate}</p>
               <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className={`text-[10px] font-bold flex items-center gap-1 ${isMaintenanceUrgent(asset.maintenanceDate) ? 'text-red-500' : 'text-slate-500'}`}>
                     <Wrench className="w-3 h-3" /> {asset.maintenanceDate}
                  </span>
                  <div className="flex gap-2">
                     <button onClick={() => handleOpenHistory(asset)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-blue-600 hover:bg-blue-50"><History className="w-4 h-4" /></button>
                     <button onClick={() => handleOpenEdit(asset)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-amber-600 hover:bg-amber-50"><Edit className="w-4 h-4" /></button>
                     <button onClick={() => handleDelete(asset.id)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-900">
                {editItem ? `${t('inv_modal_edit')}: ${editItem.name}` : tab === 'STOCK' ? t('inv_modal_add_stock') : t('inv_modal_add_asset')}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl text-slate-400"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-8 space-y-6">
              {tab === 'STOCK' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-xs font-black text-slate-500">{t('inv_label_name')}</label><input name="name" defaultValue={editItem?.name} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 ring-amber-500/10 outline-none font-bold" /></div>
                    <div className="space-y-2"><label className="text-xs font-black text-slate-500">{t('inv_label_category')}</label>
                    <select name="category" defaultValue={(editItem as any)?.category} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold">
                        <option value={Category.KITCHEN}>{t('inv_cat_kitchen')}</option>
                        <option value={Category.BAR}>{t('inv_cat_bar')}</option>
                        <option value={Category.STORE}>{t('inv_cat_store')}</option>
                    </select></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2"><label className="text-xs font-black text-slate-500">{t('inv_label_qty')}</label><input name="quantity" defaultValue={(editItem as any)?.quantity} type="number" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" /></div>
                    <div className="space-y-2"><label className="text-xs font-black text-slate-500">{t('inv_label_unit')}</label><input name="unit" defaultValue={(editItem as any)?.unit} placeholder="kg/l" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" /></div>
                    <div className="space-y-2"><label className="text-xs font-black text-slate-500">{t('inv_label_min')}</label><input name="minLimit" defaultValue={(editItem as any)?.minLimit} type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3 text-rose-500" /> {t('inv_label_expiry')}</label>
                      <input name="expiryDate" type="date" defaultValue={(editItem as any)?.expiryDate} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500">{t('inv_label_image')}</label>
                      <input name="imageUrl" defaultValue={(editItem as any)?.imageUrl} placeholder="https://..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2"><label className="text-xs font-black text-slate-500">{t('inv_asset_name')}</label><input name="name" defaultValue={editItem?.name} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-xs font-black text-slate-500">{t('inv_asset_purchase')}</label><input name="purchaseDate" defaultValue={(editItem as any)?.purchaseDate} type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" /></div>
                    <div className="space-y-2"><label className="text-xs font-black text-slate-500">{t('inv_asset_maintenance')}</label><input name="maintenanceDate" defaultValue={(editItem as any)?.maintenanceDate} type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-xs font-black text-slate-500">{t('inv_asset_cost')}</label><input name="cost" defaultValue={(editItem as any)?.cost} type="number" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" /></div>
                    <div className="space-y-2"><label className="text-xs font-black text-slate-500">{t('inv_asset_status')}</label><select name="status" defaultValue={(editItem as any)?.status} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"><option value="يعمل">{t('inv_status_working')}</option><option value="تحت الصيانة">{t('inv_status_maintenance')}</option><option value="خارج الخدمة">{t('inv_status_broken')}</option></select></div>
                  </div>
                </>
              )}
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-lg hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
                {editItem ? t('inv_btn_update') : t('inv_btn_confirm')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Maintenance History Modal */}
      {showHistoryModal && selectedAsset && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Wrench className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black">History: {selectedAsset.name}</h3>
                  <p className="text-[10px] text-amber-400 font-bold tracking-widest uppercase">Maintenance & Service Log</p>
                </div>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="p-3 hover:bg-slate-800 rounded-2xl transition-colors"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <form onSubmit={handleAddMaintenanceRecord} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Plus className="w-4 h-4 text-amber-500" />
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Add New Record</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 mx-2">Date</label>
                    <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-4 border border-slate-200 rounded-xl outline-none font-bold bg-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 mx-2">Cost</label>
                    <input name="cost" type="number" required placeholder="0.00" className="w-full p-4 border border-slate-200 rounded-xl outline-none font-bold bg-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 mx-2">Performed By (Optional)</label>
                  <input name="performedBy" placeholder="Technician Name..." className="w-full p-4 border border-slate-200 rounded-xl outline-none font-bold bg-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 mx-2">Details</label>
                  <textarea name="description" required placeholder="What was done..." rows={2} className="w-full p-4 border border-slate-200 rounded-xl outline-none font-bold text-sm resize-none bg-white" />
                </div>
                <button type="submit" className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-sm hover:bg-amber-500 hover:text-slate-900 transition-all shadow-lg">Save Record</button>
              </form>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <History className="w-4 h-4 text-slate-400" />
                    Previous Records
                  </h4>
                </div>
                
                <div className="space-y-3">
                  {selectedAsset.maintenanceHistory?.map((record) => (
                    <div key={record.id} className="p-5 bg-white border border-slate-100 rounded-2xl flex flex-col gap-3 relative overflow-hidden group hover:border-amber-200 transition-all">
                      <div className={`absolute top-0 w-1 h-full bg-slate-100 group-hover:bg-amber-500 transition-colors ${dir === 'rtl' ? 'right-0' : 'left-0'}`}></div>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-50 rounded-lg"><Calendar className="w-4 h-4 text-slate-400" /></div>
                          <span className="text-xs font-black text-slate-900">{record.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                          <DollarSign className="w-3 h-3" />
                          <span className="text-xs font-black">{record.cost.toLocaleString()}</span>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-slate-600 leading-relaxed">{record.description}</p>
                      {record.performedBy && (
                        <div className="flex items-center gap-2 mt-1">
                          <FileText className="w-3 h-3 text-slate-300" />
                          <span className="text-[10px] font-black text-slate-400">By: {record.performedBy}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {(!selectedAsset.maintenanceHistory || selectedAsset.maintenanceHistory.length === 0) && (
                    <div className="text-center py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                      <Wrench className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-slate-300 font-bold italic">No maintenance records found.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;