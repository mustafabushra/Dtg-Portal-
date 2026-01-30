
import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit, X, Warehouse, Package, Gauge, Wrench, Image as ImageIcon, AlertCircle, History, DollarSign, Calendar, FileText } from 'lucide-react';
import { InventoryItem, Asset, Category, MaintenanceRecord } from '../types';

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
  const [tab, setTab] = useState<'STOCK' | 'ASSETS'>('STOCK');
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | Asset | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [search, setSearch] = useState('');

  const filteredStock = inventory.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
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
    setSelectedAsset(updatedAsset); // Refresh UI
    e.currentTarget.reset();
  };

  const handleDelete = (id: string, name: string) => {
    const isConfirmed = confirm(`هل أنت متأكد من رغبتك في حذف "${name}"؟ هذا الإجراء لا يمكن التراجع عنه.`);
    if (isConfirmed) {
      if (tab === 'STOCK') {
        onDeleteItem(id);
      } else {
        onDeleteAsset(id);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
          <button onClick={() => setTab('STOCK')} className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all ${tab === 'STOCK' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Package className="w-4 h-4" />
            المخزون السلعي
          </button>
          <button onClick={() => setTab('ASSETS')} className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all ${tab === 'ASSETS' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Wrench className="w-4 h-4" />
            الأصول والمعدات
          </button>
        </div>
        <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-amber-500 text-slate-900 px-6 py-3 rounded-2xl font-black hover:bg-amber-400 transition-all active:scale-95 shadow-xl shadow-amber-500/10">
          <Plus className="w-5 h-5" />
          {tab === 'STOCK' ? 'إضافة مادة مخزنية' : 'إضافة أصل جديد'}
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
           <div className="flex-1 relative">
             <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder="ابحث في السجلات..." className="w-full pr-12 pl-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-amber-500/10 text-sm font-bold" />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              {tab === 'STOCK' ? (
                <tr>
                  <th className="px-8 py-4">الصورة</th>
                  <th className="px-8 py-4">اسم المادة</th>
                  <th className="px-8 py-4">القسم</th>
                  <th className="px-8 py-4">الكمية الحالية</th>
                  <th className="px-8 py-4 text-left">الإجراءات</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-8 py-4">اسم الأصل</th>
                  <th className="px-8 py-4">تاريخ الشراء</th>
                  <th className="px-8 py-4">الصيانة القادمة</th>
                  <th className="px-8 py-4">التكلفة</th>
                  <th className="px-8 py-4 text-left">الإجراءات</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tab === 'STOCK' ? filteredStock.map(item => (
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
                  <td className="px-8 py-5"><span className={`px-3 py-1 rounded-lg text-[10px] font-black ${item.category === Category.KITCHEN ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{item.category}</span></td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-700">{item.quantity} {item.unit}</td>
                  <td className="px-8 py-5 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenEdit(item)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                    <button 
                      onClick={() => handleDelete(item.id, item.name)} 
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : filteredAssets.map(asset => {
                const urgent = isMaintenanceUrgent(asset.maintenanceDate);
                return (
                  <tr key={asset.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-5 text-sm font-black text-slate-900">
                      <div className="flex flex-col">
                        <span>{asset.name}</span>
                        {asset.lastMaintenanceNote && (
                          <span className="text-[9px] text-slate-400 italic mt-0.5">آخر صيانة: {asset.lastMaintenanceNote}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-xs text-slate-500 font-bold">{asset.purchaseDate}</td>
                    <td className={`px-8 py-5 text-xs font-bold flex items-center gap-2 ${urgent ? 'text-red-600 animate-pulse' : 'text-amber-600'}`}>
                      {asset.maintenanceDate}
                      {urgent && <AlertCircle className="w-3.5 h-3.5" title="موعد صيانة قريب (خلال 3 أيام)" />}
                    </td>
                    <td className="px-8 py-5 text-sm font-black text-slate-900">{asset.cost.toLocaleString()} ر.س</td>
                    <td className="px-8 py-5 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenHistory(asset)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="سجل الصيانة"><History className="w-4 h-4" /></button>
                      <button onClick={() => handleOpenEdit(asset)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                      <button 
                        onClick={() => handleDelete(asset.id, asset.name)} 
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
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-900">
                {editItem ? `تعديل: ${editItem.name}` : tab === 'STOCK' ? 'إضافة مادة للمخزن' : 'إضافة أصل جديد'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl text-slate-400"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-8 space-y-6">
              {tab === 'STOCK' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-xs font-black text-slate-500">اسم المادة</label><input name="name" defaultValue={editItem?.name} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 ring-amber-500/10 outline-none font-bold" /></div>
                    <div className="space-y-2"><label className="text-xs font-black text-slate-500">القسم</label><select name="category" defaultValue={(editItem as any)?.category} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"><option value={Category.KITCHEN}>مطبخ</option><option value={Category.BAR}>بار</option></select></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2"><label className="text-xs font-black text-slate-500">الكمية</label><input name="quantity" defaultValue={(editItem as any)?.quantity} type="number" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" /></div>
                    <div className="space-y-2"><label className="text-xs font-black text-slate-500">الوحدة</label><input name="unit" defaultValue={(editItem as any)?.unit} placeholder="كجم/لتر" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" /></div>
                    <div className="space-y-2"><label className="text-xs font-black text-slate-500">الحد الأدنى</label><input name="minLimit" defaultValue={(editItem as any)?.minLimit} type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" /></div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500">رابط صورة المادة (للمساعدة في الفرز)</label>
                    <input name="imageUrl" defaultValue={(editItem as any)?.imageUrl} placeholder="https://..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs" />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2"><label className="text-xs font-black text-slate-500">اسم الأصل</label><input name="name" defaultValue={editItem?.name} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-xs font-black text-slate-500">تاريخ الشراء</label><input name="purchaseDate" defaultValue={(editItem as any)?.purchaseDate} type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" /></div>
                    <div className="space-y-2"><label className="text-xs font-black text-slate-500">الصيانة القادمة</label><input name="maintenanceDate" defaultValue={(editItem as any)?.maintenanceDate} type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-xs font-black text-slate-500">التكلفة الإجمالية للأصل (ر.س)</label><input name="cost" defaultValue={(editItem as any)?.cost} type="number" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" /></div>
                    <div className="space-y-2"><label className="text-xs font-black text-slate-500">الحالة التشغيلية</label><select name="status" defaultValue={(editItem as any)?.status} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"><option value="يعمل">يعمل</option><option value="تحت الصيانة">تحت الصيانة</option><option value="خارج الخدمة">خارج الخدمة</option></select></div>
                  </div>
                </>
              )}
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-lg hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
                {editItem ? 'تحديث البيانات' : 'تأكيد الإضافة'}
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
                  <h3 className="text-xl font-black">سجل صيانة: {selectedAsset.name}</h3>
                  <p className="text-[10px] text-amber-400 font-bold tracking-widest uppercase">Maintenance & Service Log</p>
                </div>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="p-3 hover:bg-slate-800 rounded-2xl transition-colors"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Add New Record Form */}
              <form onSubmit={handleAddMaintenanceRecord} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Plus className="w-4 h-4 text-amber-500" />
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">إضافة عملية صيانة جديدة</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 mr-2">تاريخ العملية</label>
                    <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-3 border border-slate-200 rounded-xl outline-none font-bold bg-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 mr-2">تكلفة الصيانة (ر.س)</label>
                    <input name="cost" type="number" required placeholder="0.00" className="w-full p-3 border border-slate-200 rounded-xl outline-none font-bold bg-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 mr-2">القائم بالصيانة (اختياري)</label>
                  <input name="performedBy" placeholder="اسم الفني أو الشركة..." className="w-full p-3 border border-slate-200 rounded-xl outline-none font-bold bg-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 mr-2">تفاصيل الصيانة</label>
                  <textarea name="description" required placeholder="اشرح ما تم القيام به (تغيير قطع، تنظيف، فحص...)" rows={2} className="w-full p-4 border border-slate-200 rounded-xl outline-none font-bold text-sm resize-none bg-white" />
                </div>
                <button type="submit" className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-sm hover:bg-amber-500 hover:text-slate-900 transition-all shadow-lg">تثبيت العملية في السجل</button>
              </form>

              {/* History List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <History className="w-4 h-4 text-slate-400" />
                    العمليات السابقة
                  </h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase">مبني تاريخياً</p>
                </div>
                
                <div className="space-y-3">
                  {selectedAsset.maintenanceHistory?.map((record) => (
                    <div key={record.id} className="p-5 bg-white border border-slate-100 rounded-2xl flex flex-col gap-3 relative overflow-hidden group hover:border-amber-200 transition-all">
                      <div className="absolute top-0 right-0 w-1 h-full bg-slate-100 group-hover:bg-amber-500 transition-colors"></div>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-50 rounded-lg"><Calendar className="w-4 h-4 text-slate-400" /></div>
                          <span className="text-xs font-black text-slate-900">{record.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                          <DollarSign className="w-3 h-3" />
                          <span className="text-xs font-black">{record.cost.toLocaleString()} ر.س</span>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-slate-600 leading-relaxed">{record.description}</p>
                      {record.performedBy && (
                        <div className="flex items-center gap-2 mt-1">
                          <FileText className="w-3 h-3 text-slate-300" />
                          <span className="text-[10px] font-black text-slate-400">بواسطة: {record.performedBy}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {(!selectedAsset.maintenanceHistory || selectedAsset.maintenanceHistory.length === 0) && (
                    <div className="text-center py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                      <Wrench className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-slate-300 font-bold italic">لا توجد سجلات صيانة سابقة لهذا الأصل.</p>
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
