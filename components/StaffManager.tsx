
import React, { useState, useEffect } from 'react';
import { 
  Users, Clock, Trash2, Edit, X, Plus, MapPin, 
  LogIn, LogOut, Radio, Loader2, AlertCircle, ShieldCheck, Key, History, Calendar
} from 'lucide-react';
import { Staff, AttendanceLog } from '../types';

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

  const [currentDistance, setCurrentDistance] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth radius in meters
    const f1 = lat1 * Math.PI / 180;
    const f2 = lat2 * Math.PI / 180;
    const df = (lat2 - lat1) * Math.PI / 180;
    const dl = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(df/2) * Math.sin(df/2) + Math.cos(f1) * Math.cos(f2) * Math.sin(dl/2) * Math.sin(dl/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const startLocating = () => {
    setIsLocating(true);
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("المتصفح لا يدعم تحديد الموقع");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dist = getDistance(pos.coords.latitude, pos.coords.longitude, cafeLocation.lat, cafeLocation.lng);
        setCurrentDistance(dist);
        setIsLocating(false);
      },
      (err) => {
        setLocationError("يرجى السماح بالوصول للموقع لتسجيل الحضور");
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    if (showDetailModal === 'ATTENDANCE') {
      startLocating();
    }
  }, [showDetailModal]);

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newStaff: Staff = {
      id: editMember ? editMember.id : Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
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
      permissions: editMember?.permissions || ['attendance.mark']
    };
    editMember ? onUpdate(newStaff) : onAdd(newStaff);
    setShowModal(false);
    setEditMember(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-amber-500" /> إدارة القوى العاملة
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
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm" alt={member.name} />
                <div>
                  <h3 className="text-lg font-black text-slate-900">{member.name}</h3>
                  <span className="text-[10px] font-black px-2 py-0.5 bg-amber-100 text-amber-700 rounded-lg uppercase tracking-wider">{member.role}</span>
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
                <p className="text-[9px] font-black text-slate-400 uppercase">المستحق الحالي</p>
                <p className="text-sm font-black text-emerald-600">{Math.round(member.totalMonthlyEarnings || 0)} ر.س</p>
              </div>
            </div>

            <button 
              onClick={() => { setSelectedForDetail(member); setShowDetailModal('ATTENDANCE'); }}
              className="w-full py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-500 hover:text-slate-900 transition-all shadow-lg"
            >
              <MapPin className="w-4 h-4" /> بصمة الموقع (GPS)
            </button>
          </div>
        ))}
      </div>

      {/* Attendance History Modal */}
      {showDetailModal === 'HISTORY' && selectedForDetail && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <History className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black">سجل البصمات: {selectedForDetail.name}</h3>
                  <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">Attendance & Payroll Log</p>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(null)} className="p-3 hover:bg-slate-800 rounded-2xl transition-colors"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-4">
              {selectedForDetail.attendanceHistory && selectedForDetail.attendanceHistory.length > 0 ? (
                selectedForDetail.attendanceHistory.map((log) => {
                  const dateObj = new Date(log.timestamp);
                  return (
                    <div key={log.id} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-amber-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${log.type === 'IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                          {log.type === 'IN' ? <LogIn className="w-5 h-5" /> : <LogOut className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">
                            {log.type === 'IN' ? 'تسجيل دخول' : 'تسجيل انصراف'}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 font-bold">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {dateObj.toLocaleDateString('ar-SA')}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {dateObj.toLocaleTimeString('ar-SA')}</span>
                          </div>
                        </div>
                      </div>
                      {log.earnedAmount !== undefined && log.earnedAmount > 0 && (
                        <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase">المكسب</p>
                          <p className="text-xs font-black text-emerald-600">+{log.earnedAmount} ر.س</p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                  <Clock className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 font-bold italic">لا توجد سجلات حضور مسجلة لهذا الموظف.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* GPS Clocking Modal */}
      {showDetailModal === 'ATTENDANCE' && selectedForDetail && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500 rounded-2xl"><ShieldCheck className="w-6 h-6 text-slate-900" /></div>
                <div>
                  <h3 className="text-xl font-black">نظام التحقق الجغرافي</h3>
                  <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">{selectedForDetail.name}</p>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(null)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="p-8 text-center space-y-8">
               {isLocating ? (
                 <div className="space-y-4 py-10">
                   <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto" />
                   <p className="text-sm font-black text-slate-500 animate-pulse">جاري فحص النطاق الجغرافي للكافي...</p>
                 </div>
               ) : locationError ? (
                 <div className="space-y-4 py-6">
                   <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto"><AlertCircle className="w-8 h-8" /></div>
                   <p className="text-sm font-black text-red-600">{locationError}</p>
                   <button onClick={startLocating} className="text-xs font-black text-slate-900 underline">إعادة المحاولة</button>
                 </div>
               ) : currentDistance !== null && (
                 <div className="space-y-8">
                   <div className={`p-8 rounded-[2.5rem] border-2 transition-all ${currentDistance <= 200 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                      <Radio className={`w-12 h-12 mx-auto mb-4 ${currentDistance <= 200 ? 'animate-pulse' : ''}`} />
                      <h4 className="text-xl font-black">{currentDistance <= 200 ? 'أنت داخل نطاق العمل' : 'أنت خارج نطاق العمل'}</h4>
                      <p className="text-[10px] font-bold opacity-60 mt-1">البعد عن الفرع: {Math.round(currentDistance)} متر</p>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => { onAttendance(selectedForDetail.id, 'IN'); setShowDetailModal(null); }}
                        disabled={selectedForDetail.isClockedIn || currentDistance > 200}
                        className="py-5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 disabled:opacity-30 flex items-center justify-center gap-2"
                      >
                        <LogIn className="w-4 h-4" /> بصمة دخول
                      </button>
                      <button 
                        onClick={() => { onAttendance(selectedForDetail.id, 'OUT'); setShowDetailModal(null); }}
                        disabled={!selectedForDetail.isClockedIn}
                        className="py-5 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-500/20 disabled:opacity-30 flex items-center justify-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> بصمة انصراف
                      </button>
                   </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-900">{editMember ? 'تحديث بيانات الموظف' : 'تسجيل موظف جديد'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">الاسم الثلاثي</label>
                <input name="name" defaultValue={editMember?.name} required placeholder="مثلاً: سامي خالد الحربي" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">المسمى الوظيفي</label>
                  <select name="role" defaultValue={editMember?.role} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold">
                    <option value="باريستا">باريستا</option>
                    <option value="شيف">شيف مطبخ</option>
                    <option value="محاسب">كاشير/محاسب</option>
                    <option value="مدير">مدير صالة</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">أجر الساعة (ر.س)</label>
                  <input name="hourlyRate" type="number" defaultValue={editMember?.hourlyRate} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2 flex items-center gap-1">
                  <Key className="w-3 h-3" /> رمز الدخول (PIN)
                </label>
                <input name="password" type="password" defaultValue={editMember?.password} required placeholder="1234" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold tracking-widest" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">بداية الوردية</label>
                  <input name="shiftStart" type="time" defaultValue={editMember?.shiftStart || "09:00"} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">نهاية الوردية</label>
                  <input name="shiftEnd" type="time" defaultValue={editMember?.shiftEnd || "17:00"} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-amber-500 hover:text-slate-900 transition-all active:scale-95 shadow-xl">
                {editMember ? 'تأكيد التحديث' : 'توقيع العقد وإضافة الموظف'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManager;
