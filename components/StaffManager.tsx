
import React, { useState, useEffect } from 'react';
import { 
  Users, Clock, Trash2, Edit, X, Plus, MapPin, 
  LogIn, LogOut, Radio, Loader2, AlertCircle, ShieldCheck, Key, History, Calendar, AtSign,
  LayoutDashboard, ClipboardList, Warehouse, Banknote, Home, FileText, Globe, BarChart3, BrainCircuit, UserCircle, CheckSquare
} from 'lucide-react';
import { Staff, AttendanceLog, View } from '../types';

interface StaffManagerProps {
  staff: Staff[];
  onAdd: (member: Staff) => void;
  onDelete: (id: string) => void;
  onUpdate: (member: Staff) => void;
  onAttendance: (staffId: string, type: 'IN' | 'OUT') => void;
  onSetAssignment: (id: string, assignment: any) => void;
  cafeLocation: { lat: number, lng: number };
}

const StaffManager: React.FC<StaffManagerProps> = ({ staff, onAdd, onDelete, onUpdate, onAttendance, onSetAssignment, cafeLocation }) => {
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState<Staff | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<'ATTENDANCE' | 'HISTORY' | null>(null);
  const [selectedForDetail, setSelectedForDetail] = useState<Staff | null>(null);
  
  // الحالة المحلية للصلاحيات المختارة في النموذج
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (editMember) {
      setSelectedPermissions(editMember.permissions || ['EMPLOYEE_PORTAL']);
    } else {
      setSelectedPermissions(['EMPLOYEE_PORTAL']); // القيمة الافتراضية
    }
  }, [editMember, showModal]);

  const togglePermission = (perm: string) => {
    setSelectedPermissions(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  // قائمة جميع الصفحات التي يمكن منح صلاحية عليها
  const availableViews = [
    { id: 'EMPLOYEE_PORTAL', label: 'البوابة الشخصية', icon: UserCircle },
    { id: 'DASHBOARD', label: 'لوحة التحكم العامة', icon: LayoutDashboard },
    { id: 'TASK_MANAGER', label: 'إدارة المهام', icon: ClipboardList },
    { id: 'INVENTORY_HUB', label: 'المخزون والبار', icon: Warehouse },
    { id: 'TREASURY', label: 'الخزنة والمالية', icon: Banknote },
    { id: 'RENTALS', label: 'إدارة الإيجارات', icon: Home },
    { id: 'DOCUMENTS', label: 'الوثائق والتراخيص', icon: FileText },
    { id: 'SERVICE_SUBSCRIPTIONS', label: 'اشتراكات الخدمات', icon: Globe },
    { id: 'REPORTS', label: 'التقارير والإحصائيات', icon: BarChart3 },
    { id: 'AI_ASSISTANT', label: 'المساعد الذكي', icon: BrainCircuit },
  ];

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newStaff: Staff = {
      id: editMember ? editMember.id : Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      username: formData.get('username') as string,
      role: formData.get('role') as string,
      password: formData.get('password') as string || (editMember?.password || '1234'),
      shiftStart: formData.get('shiftStart') as string || '09:00',
      shiftEnd: formData.get('shiftEnd') as string || '17:00',
      hourlyRate: Number(formData.get('hourlyRate')),
      documents: editMember ? editMember.documents : [],
      isClockedIn: editMember ? editMember.isClockedIn : false,
      attendanceHistory: editMember ? editMember.attendanceHistory : [],
      totalMonthlyHours: editMember ? editMember.totalMonthlyHours : 0,
      totalMonthlyEarnings: editMember ? editMember.totalMonthlyEarnings : 0,
      permissions: selectedPermissions // استخدام الصلاحيات المختارة
    };
    editMember ? onUpdate(newStaff) : onAdd(newStaff);
    setShowModal(false);
    setEditMember(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-amber-500" /> إدارة الكادر البشري
        </h2>
        <button onClick={() => { setEditMember(null); setShowModal(true); }} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl active:scale-95 flex items-center gap-2">
          <Plus className="w-5 h-5" /> تسجيل موظف جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map(member => (
          <div key={member.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 hover:shadow-xl transition-all relative overflow-hidden group">
            <div className={`absolute top-0 right-0 left-0 h-1.5 ${member.isClockedIn ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username}`} className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm" alt={member.name} />
                <div>
                  <h3 className="text-lg font-black text-slate-900">{member.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black px-2 py-0.5 bg-amber-100 text-amber-700 rounded-lg uppercase">{member.role}</span>
                    <span className="text-[10px] text-slate-400 font-bold">@{member.username}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => { setEditMember(member); setShowModal(true); }} className="p-2 text-slate-300 hover:text-amber-500 transition-colors"><Edit className="w-4 h-4" /></button>
                <button onClick={() => { setSelectedForDetail(member); setShowDetailModal('HISTORY'); }} className="p-2 text-slate-300 hover:text-blue-500 transition-colors"><History className="w-4 h-4" /></button>
                <button onClick={() => onDelete(member.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase">ساعات الشهر</p>
                <p className="text-sm font-black text-slate-900">{Math.round(member.totalMonthlyHours || 0)} س</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">المستحق الحالي</p>
                <p className="text-sm font-black text-emerald-600">{Math.round(member.totalMonthlyEarnings || 0)} ر.س</p>
              </div>
            </div>

            <button 
              onClick={() => { setSelectedForDetail(member); setShowDetailModal('ATTENDANCE'); }}
              className="w-full py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-500 hover:text-slate-900 transition-all shadow-lg"
            >
              <MapPin className="w-4 h-4" /> فحص البصمة الجغرافية
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="text-xl font-black text-slate-900">{editMember ? 'تحديث ملف الموظف والصلاحيات' : 'تسجيل موظف جديد'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-colors"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              <form id="staffForm" onSubmit={handleAddSubmit} className="space-y-8">
                {/* قسم البيانات الأساسية */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest border-b pb-2">البيانات الشخصية والتعاقد</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest mr-2">الاسم الثلاثي</label>
                      <input name="name" defaultValue={editMember?.name} required placeholder="سامي خالد الحربي" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-900" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest mr-2">اسم المستخدم (Login)</label>
                      <input name="username" defaultValue={editMember?.username} required placeholder="sami_99" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-900" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest mr-2">المسمى الوظيفي</label>
                      <select name="role" defaultValue={editMember?.role} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-900">
                        <option value="باريستا">باريستا</option>
                        <option value="شيف">شيف مطبخ</option>
                        <option value="محاسب">كاشير/محاسب</option>
                        <option value="مدير">مدير صالة</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest mr-2">أجر الساعة (ر.س)</label>
                      <input name="hourlyRate" type="number" defaultValue={editMember?.hourlyRate} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-900" />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest mr-2 flex items-center gap-1"><Key className="w-3 h-3" /> كلمة المرور</label>
                    <input name="password" type="password" defaultValue={editMember?.password} required placeholder="••••••••" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold tracking-widest text-slate-900" />
                  </div>
                </div>

                {/* قسم الصلاحيات الجديد (علامات الاختيار) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest">صلاحيات الوصول للمنصات</h4>
                    <span className="text-[9px] font-bold text-slate-400">اختر الصفحات المسموح للموظف برؤيتها</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {availableViews.map(view => {
                      const Icon = view.icon;
                      const isSelected = selectedPermissions.includes(view.id);
                      return (
                        <div 
                          key={view.id}
                          onClick={() => togglePermission(view.id)}
                          className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            isSelected 
                            ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                            : 'bg-white border-slate-100 text-slate-400 hover:border-amber-200 hover:bg-amber-50'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/10' : 'bg-slate-50'}`}>
                             <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-500' : 'text-slate-400'}`} />
                          </div>
                          <span className="text-xs font-black flex-1">{view.label}</span>
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${isSelected ? 'border-amber-500 bg-amber-500' : 'border-slate-200'}`}>
                             {isSelected && <CheckSquare className="w-4 h-4 text-slate-900" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </form>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 shrink-0">
               <button form="staffForm" type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl">
                 {editMember ? 'تحديث البيانات والصلاحيات' : 'اعتماد العقد وإضافة الموظف'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManager;
