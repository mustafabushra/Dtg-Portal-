
import React, { useState, useEffect } from 'react';
import { 
  Users, Clock, Trash2, Edit, X, Plus, MapPin, 
  LogIn, LogOut, Loader2, AlertCircle, ShieldCheck, Key, History, Calendar, AtSign,
  LayoutDashboard, ClipboardList, Warehouse, Banknote, Home, FileText, Globe, BarChart3, BrainCircuit, UserCircle, CheckSquare, FolderOpen, Download, ExternalLink, FileDown, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, Sun, Moon, CalendarDays, LayoutList, Settings2, IdCard, Printer
} from 'lucide-react';
import { Staff, Document, Shift, DefaultShiftSettings } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import ConfirmModal from './ConfirmModal';
import QRCode from "react-qr-code";

interface StaffManagerProps {
  staff: Staff[];
  onAdd: (member: Staff) => void;
  onDelete: (id: string) => void;
  onUpdate: (member: Staff) => void;
  onAttendance: (staffId: string, type: 'IN' | 'OUT') => void;
  onSetAssignment: (id: string, assignment: any) => void;
  cafeLocation: { lat: number, lng: number };
  logoUrl?: string;
  systemName?: string;
}

const StaffManager: React.FC<StaffManagerProps> = ({ staff, onAdd, onDelete, onUpdate, onAttendance, onSetAssignment, cafeLocation, logoUrl, systemName }) => {
  const { t, dir } = useLanguage();
  const [viewMode, setViewMode] = useState<'LIST' | 'BOARD'>('LIST');
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState<Staff | null>(null);
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);

  const [showDetailModal, setShowDetailModal] = useState<'ATTENDANCE' | 'HISTORY' | 'DOCUMENTS' | 'SHIFT_EDIT' | null>(null);
  const [showIdCardModal, setShowIdCardModal] = useState<Staff | null>(null);
  const [selectedForDetail, setSelectedForDetail] = useState<Staff | null>(null);
  const [selectedDateForShift, setSelectedDateForShift] = useState<string>('');
  
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  
  const [shiftSettings, setShiftSettings] = useState<DefaultShiftSettings>({
    isAutoScheduled: true,
    weeklyRestDays: [5], 
    defaultShiftType: 'EVENING',
    defaultStartTime: '16:00',
    defaultEndTime: '00:00'
  });

  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());

  useEffect(() => {
    if (editMember) {
      setSelectedPermissions(editMember.permissions || ['EMPLOYEE_PORTAL']);
      if (editMember.shiftSettings) {
        setShiftSettings(editMember.shiftSettings);
      } else {
        setShiftSettings({
          isAutoScheduled: true,
          weeklyRestDays: [5],
          defaultShiftType: 'EVENING',
          defaultStartTime: editMember.shiftStart || '16:00',
          defaultEndTime: editMember.shiftEnd || '00:00'
        });
      }
    } else {
      setSelectedPermissions(['EMPLOYEE_PORTAL']); 
      setShiftSettings({
        isAutoScheduled: true,
        weeklyRestDays: [5], 
        defaultShiftType: 'EVENING',
        defaultStartTime: '16:00',
        defaultEndTime: '00:00'
      });
    }
  }, [editMember, showModal]);

  useEffect(() => {
    if (selectedForDetail) {
      const updated = staff.find(s => s.id === selectedForDetail.id);
      if (updated) setSelectedForDetail(updated);
    }
  }, [staff]);

  const togglePermission = (perm: string) => {
    setSelectedPermissions(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const toggleRestDay = (dayIndex: number) => {
    setShiftSettings(prev => {
      const current = prev.weeklyRestDays;
      const updated = current.includes(dayIndex) 
        ? current.filter(d => d !== dayIndex) 
        : [...current, dayIndex];
      return { ...prev, weeklyRestDays: updated };
    });
  };

  const handleDeleteStaffClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const confirmDeleteStaff = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const handleDeleteDocumentClick = (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    setDeleteDocId(docId);
  };

  const confirmDeleteDocument = () => {
    if (deleteDocId && selectedForDetail) {
      const updatedStaff = {
        ...selectedForDetail,
        documents: selectedForDetail.documents.filter(d => d.id !== deleteDocId)
      };
      onUpdate(updatedStaff);
      setSelectedForDetail(updatedStaff);
      setDeleteDocId(null);
    }
  };

  const getDaysRemaining = (dateStr: string) => {
    if (!dateStr) return 999999;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(dateStr);
    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleExportAlerts = () => {
    const alerts: any[] = [];
    staff.forEach(member => {
      if (member.documents && member.documents.length > 0) {
        member.documents.forEach(doc => {
          if (!doc.expiryDate) return;
          const daysLeft = getDaysRemaining(doc.expiryDate);
          if (daysLeft <= 30) {
            let statusLabel = '';
            if (daysLeft < 0) statusLabel = `منتهية منذ ${Math.abs(daysLeft)} يوم`;
            else if (daysLeft === 0) statusLabel = 'تنتهي اليوم';
            else statusLabel = `تنتهي خلال ${daysLeft} يوم`;
            alerts.push({
              staffName: member.name,
              docTitle: doc.title,
              docType: doc.type,
              expiryDate: doc.expiryDate,
              daysLeft: daysLeft,
              status: statusLabel
            });
          }
        });
      }
    });

    if (alerts.length === 0) {
      alert("ممتاز! جميع الوثائق سارية لأكثر من 30 يوماً.");
      return;
    }

    alerts.sort((a, b) => a.daysLeft - b.daysLeft);
    const headers = ["اسم الموظف,عنوان الوثيقة,نوع الوثيقة,تاريخ الانتهاء,الحالة,ملاحظات"];
    const rows = alerts.map(d => 
      `"${d.staffName}","${d.docTitle}","${d.docType}","${d.expiryDate}","${d.daysLeft < 0 ? 'منتهية' : 'توشك على الانتهاء'}","${d.status}"`
    );
    const csvContent = "\uFEFF" + [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `documents_alerts_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintCard = () => {
    window.print();
  };

  const availableViews = [
    { id: 'EMPLOYEE_PORTAL', label: t('menu_employee_portal'), icon: UserCircle },
    { id: 'DASHBOARD', label: t('menu_dashboard'), icon: LayoutDashboard },
    { id: 'TASK_MANAGER', label: t('menu_task_manager'), icon: ClipboardList },
    { id: 'INVENTORY_HUB', label: t('menu_inventory_hub'), icon: Warehouse },
    { id: 'TREASURY', label: t('menu_treasury'), icon: Banknote },
    { id: 'RENTALS', label: t('menu_rentals'), icon: Home },
    { id: 'DOCUMENTS', label: t('menu_documents'), icon: FileText },
    { id: 'SERVICE_SUBSCRIPTIONS', label: t('menu_service_subscriptions'), icon: Globe },
    { id: 'REPORTS', label: t('menu_reports'), icon: BarChart3 },
    { id: 'AI_ASSISTANT', label: t('menu_ai_assistant'), icon: BrainCircuit },
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
      shiftStart: shiftSettings.defaultStartTime,
      shiftEnd: shiftSettings.defaultEndTime,
      hourlyRate: Number(formData.get('hourlyRate')),
      documents: editMember ? editMember.documents : [],
      isClockedIn: editMember ? editMember.isClockedIn : false,
      attendanceHistory: editMember ? editMember.attendanceHistory : [],
      totalMonthlyHours: editMember ? editMember.totalMonthlyHours : 0,
      totalMonthlyEarnings: editMember ? editMember.totalMonthlyEarnings : 0,
      permissions: selectedPermissions,
      shifts: editMember ? editMember.shifts : [],
      shiftSettings: shiftSettings,
    };
    editMember ? onUpdate(newStaff) : onAdd(newStaff);
    setShowModal(false);
    setEditMember(null);
  };

  const handleAddDocument = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedForDetail) return;
    const formData = new FormData(e.currentTarget);
    const newDoc: Document = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.get('docTitle') as string,
      type: 'شخصي',
      expiryDate: formData.get('docExpiry') as string,
      remindBeforeDays: 30,
      fileUrl: formData.get('docUrl') as string || undefined,
      owner: selectedForDetail.name
    };
    const updatedStaff = {
      ...selectedForDetail,
      documents: [...(selectedForDetail.documents || []), newDoc]
    };
    onUpdate(updatedStaff);
    setSelectedForDetail(updatedStaff);
    e.currentTarget.reset();
  };

  const getWeekDays = (startDate: Date) => {
    const days = [];
    const day = startDate.getDay();
    const startOfWeek = new Date(startDate);
    startOfWeek.setDate(startDate.getDate() - day);
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays(currentWeekStart);

  const getShiftForDate = (member: Staff, date: Date): Shift | null => {
    const dateKey = date.toISOString().split('T')[0];
    const manualShift = member.shifts?.find(s => s.date === dateKey);
    if (manualShift) return manualShift;
    if (member.shiftSettings && member.shiftSettings.isAutoScheduled) {
      const dayIndex = date.getDay();
      if (member.shiftSettings.weeklyRestDays.includes(dayIndex)) {
        return {
          date: dateKey,
          type: 'OFF',
          startTime: '',
          endTime: '',
          note: 'إجازة أسبوعية'
        };
      }
      return {
        date: dateKey,
        type: member.shiftSettings.defaultShiftType,
        startTime: member.shiftSettings.defaultStartTime,
        endTime: member.shiftSettings.defaultEndTime,
        note: 'جدول تلقائي'
      };
    }
    return null;
  };

  const handleShiftUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedForDetail) return;
    const formData = new FormData(e.currentTarget);
    const type = formData.get('type') as 'MORNING' | 'EVENING' | 'FULL' | 'OFF';
    let shift: Shift = {
      date: selectedDateForShift,
      type: type,
      startTime: formData.get('startTime') as string,
      endTime: formData.get('endTime') as string,
      note: formData.get('note') as string
    };
    if (!shift.startTime && type === 'MORNING') { shift.startTime = '08:00'; shift.endTime = '16:00'; }
    if (!shift.startTime && type === 'EVENING') { shift.startTime = '16:00'; shift.endTime = '00:00'; }
    if (type === 'OFF') { shift.startTime = ''; shift.endTime = ''; }
    const existingShifts = selectedForDetail.shifts || [];
    const otherShifts = existingShifts.filter(s => s.date !== selectedDateForShift);
    const updatedStaff = {
      ...selectedForDetail,
      shifts: [...otherShifts, shift]
    };
    onUpdate(updatedStaff);
    setShowDetailModal(null);
  };

  const changeWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newDate);
  };

  const daysOfWeek = [
    { idx: 0, label: 'أحد', full: 'الأحد' },
    { idx: 1, label: 'إثنين', full: 'الإثنين' },
    { idx: 2, label: 'ثلاثاء', full: 'الثلاثاء' },
    { idx: 3, label: 'أربعاء', full: 'الأربعاء' },
    { idx: 4, label: 'خميس', full: 'الخميس' },
    { idx: 5, label: 'جمعة', full: 'الجمعة' },
    { idx: 6, label: 'سبت', full: 'السبت' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-id-card, #printable-id-card * {
            visibility: visible;
          }
          #printable-id-card {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 320px;
            height: 500px;
            margin: 0 auto;
            padding: 0;
            box-shadow: none !important;
            border: 1px solid #ddd !important;
            border-radius: 16px !important;
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <ConfirmModal 
        isOpen={!!deleteId}
        title={t('modal_confirm_title')}
        message={t('confirm_delete')}
        onConfirm={confirmDeleteStaff}
        onCancel={() => setDeleteId(null)}
        confirmText={t('btn_confirm')}
        cancelText={t('btn_cancel')}
      />
      <ConfirmModal 
        isOpen={!!deleteDocId}
        title={t('modal_confirm_title')}
        message={t('confirm_delete')}
        onConfirm={confirmDeleteDocument}
        onCancel={() => setDeleteDocId(null)}
        confirmText={t('btn_confirm')}
        cancelText={t('btn_cancel')}
      />

      {/* Main Header & View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-amber-500" /> {t('staff_title')}
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
             <button 
               onClick={() => setViewMode('LIST')}
               className={`px-4 py-2 rounded-lg text-xs font-black flex items-center gap-2 transition-all ${viewMode === 'LIST' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
             >
               <LayoutList className="w-4 h-4" /> القائمة
             </button>
             <button 
               onClick={() => setViewMode('BOARD')}
               className={`px-4 py-2 rounded-lg text-xs font-black flex items-center gap-2 transition-all ${viewMode === 'BOARD' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
             >
               <CalendarDays className="w-4 h-4" /> جدول الدوام
             </button>
          </div>

          <button 
            onClick={handleExportAlerts}
            className="bg-white border border-slate-200 text-slate-600 px-4 py-3 rounded-2xl font-black hover:bg-slate-50 transition-all shadow-sm active:scale-95 flex items-center gap-2 text-xs"
          >
            <FileDown className="w-4 h-4 text-orange-500" /> تقارير
          </button>
          <button onClick={() => { setEditMember(null); setShowModal(true); }} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl active:scale-95 flex items-center gap-2">
            <Plus className="w-5 h-5" /> {t('staff_btn_add')}
          </button>
        </div>
      </div>

      {/* ---------------- VIEW: STAFF LIST ---------------- */}
      {viewMode === 'LIST' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
          {staff.map(member => {
            let alertStatus: 'NONE' | 'WARNING' | 'EXPIRED' = 'NONE';
            if (member.documents?.length > 0) {
               const hasExpired = member.documents.some(d => d.expiryDate && getDaysRemaining(d.expiryDate) < 0);
               const hasWarning = member.documents.some(d => {
                  if (!d.expiryDate) return false;
                  const days = getDaysRemaining(d.expiryDate);
                  return days >= 0 && days <= 30;
               });
               if (hasExpired) alertStatus = 'EXPIRED';
               else if (hasWarning) alertStatus = 'WARNING';
            }

            return (
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
                    <button onClick={() => setShowIdCardModal(member)} className="p-2 text-slate-300 hover:text-emerald-500 transition-colors" title="إصدار بطاقة"><IdCard className="w-4 h-4" /></button>
                    <button onClick={() => { setEditMember(member); setShowModal(true); }} className="p-2 text-slate-300 hover:text-amber-500 transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => { setSelectedForDetail(member); setShowDetailModal('DOCUMENTS'); }} className="p-2 text-slate-300 hover:text-blue-500 transition-colors relative" title="Employee File">
                      <FolderOpen className="w-4 h-4" />
                      {alertStatus === 'EXPIRED' && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" title="وثائق منتهية"></span>
                      )}
                      {alertStatus === 'WARNING' && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white" title="وثائق تنتهي قريباً"></span>
                      )}
                    </button>
                    <button onClick={(e) => handleDeleteStaffClick(e, member.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase">{t('staff_hours_month')}</p>
                    <p className="text-sm font-black text-slate-900">{Math.round(member.totalMonthlyHours || 0)} h</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('staff_current_due')}</p>
                    <p className="text-sm font-black text-emerald-600">{Math.round(member.totalMonthlyEarnings || 0)}</p>
                  </div>
                </div>

                <button 
                  onClick={() => { setSelectedForDetail(member); setShowDetailModal('ATTENDANCE'); }}
                  className="w-full py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-500 hover:text-slate-900 transition-all shadow-lg"
                >
                  <MapPin className="w-4 h-4" /> {t('staff_check_geo')}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------------- VIEW: SHIFT BOARD ---------------- */}
      {viewMode === 'BOARD' && (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
           {/* Calendar Header */}
           <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                 <button onClick={() => changeWeek('prev')} className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-amber-50 hover:text-amber-600 transition-all"><ChevronLeft className={`w-5 h-5 ${dir === 'rtl' ? 'rotate-180' : ''}`} /></button>
                 <div className="text-center">
                    <p className="text-lg font-black text-slate-900">
                       {weekDays[0].toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US', { month: 'long', day: 'numeric' })} - {weekDays[6].toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US', { month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{weekDays[0].getFullYear()}</p>
                 </div>
                 <button onClick={() => changeWeek('next')} className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-amber-50 hover:text-amber-600 transition-all"><ChevronRight className={`w-5 h-5 ${dir === 'rtl' ? 'rotate-180' : ''}`} /></button>
              </div>
              <div className="flex gap-4 text-[10px] font-bold text-slate-500">
                 <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-100 border border-amber-200"></span> صباحي</div>
                 <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200"></span> مسائي</div>
                 <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-slate-100 border border-slate-200"></span> راحة</div>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                 <thead className="bg-slate-50">
                    <tr>
                       <th className="p-4 text-start min-w-[200px] font-black text-slate-600 text-xs uppercase tracking-widest sticky left-0 bg-slate-50 z-10 border-r border-slate-100">الموظف</th>
                       {weekDays.map((day, i) => (
                          <th key={i} className="p-4 text-center font-black text-slate-600 text-xs min-w-[120px] border-r border-slate-100 last:border-r-0">
                             <div className="flex flex-col items-center">
                                <span className="opacity-50">{day.toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US', { weekday: 'short' })}</span>
                                <span className="text-lg">{day.getDate()}</span>
                             </div>
                          </th>
                       ))}
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {staff.map(member => (
                       <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 sticky left-0 bg-white z-10 border-r border-slate-100">
                             <div className="flex items-center gap-3">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username}`} className="w-10 h-10 rounded-xl bg-slate-50" />
                                <div>
                                   <p className="text-sm font-black text-slate-900">{member.name}</p>
                                   <p className="text-[10px] text-slate-400 font-bold">{member.role}</p>
                                </div>
                             </div>
                          </td>
                          {weekDays.map((day, i) => {
                             const dateKey = day.toISOString().split('T')[0];
                             const shift = getShiftForDate(member, day);
                             
                             return (
                                <td key={i} className="p-2 border-r border-slate-100 last:border-r-0 align-top h-[100px]">
                                   <button 
                                     onClick={() => {
                                        setSelectedForDetail(member);
                                        setSelectedDateForShift(dateKey);
                                        setShowDetailModal('SHIFT_EDIT');
                                     }}
                                     className={`w-full h-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all p-2 ${
                                        shift 
                                        ? shift.type === 'MORNING' 
                                           ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                                           : shift.type === 'EVENING'
                                              ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                                              : shift.type === 'OFF'
                                                 ? 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'
                                                 : 'bg-purple-50 border-purple-200 text-purple-700'
                                        : 'border-slate-100 text-slate-300 hover:border-slate-300 hover:text-slate-400'
                                     }`}
                                   >
                                      {shift ? (
                                         <>
                                            {shift.type === 'MORNING' && <Sun className="w-5 h-5 mb-1" />}
                                            {shift.type === 'EVENING' && <Moon className="w-5 h-5 mb-1" />}
                                            {shift.type === 'OFF' && <span className="font-black text-sm">OFF</span>}
                                            {shift.type !== 'OFF' && (
                                               <>
                                                  <span className="text-[10px] font-black">{shift.startTime} - {shift.endTime}</span>
                                                  {shift.note && <span className="text-[9px] opacity-70 truncate w-full text-center">{shift.note}</span>}
                                               </>
                                            )}
                                         </>
                                      ) : (
                                         <Plus className="w-5 h-5" />
                                      )}
                                   </button>
                                </td>
                             );
                          })}
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* Modal: ID Card Generator */}
      {showIdCardModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 no-print">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                   <IdCard className="w-6 h-6 text-amber-500" /> بطاقة الموظف
                </h3>
                <button onClick={() => setShowIdCardModal(null)} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-colors"><X className="w-6 h-6" /></button>
             </div>
             
             <div className="p-8 flex justify-center bg-slate-100">
                {/* ID Card Design Container - Optimized for standard ID Card size (85.6mm x 54mm roughly scaled) */}
                <div id="printable-id-card" className="w-[320px] h-[500px] bg-slate-900 rounded-[20px] relative overflow-hidden shadow-2xl flex flex-col items-center border border-slate-800">
                   {/* Card Header Background */}
                   <div className="absolute top-0 w-full h-40 bg-gradient-to-b from-amber-500 to-amber-600 rounded-b-[3rem]"></div>
                   
                   {/* Content */}
                   <div className="relative z-10 flex flex-col items-center w-full h-full pt-8 pb-6 px-6">
                      
                      {/* Company Logo if available */}
                      {logoUrl && (
                        <div className="absolute top-4 right-4 bg-white p-1 rounded-lg shadow-lg">
                           <img src={logoUrl} className="w-8 h-8 object-contain" alt="Logo" />
                        </div>
                      )}

                      {/* Chip Icon */}
                      <div className="absolute top-32 left-6 w-10 h-8 bg-amber-200/50 rounded-md border border-amber-300/50 flex items-center justify-center">
                         <div className="w-6 h-5 border border-amber-500/30 rounded-sm grid grid-cols-2 gap-0.5">
                            <div className="border border-amber-500/30"></div><div className="border border-amber-500/30"></div>
                            <div className="border border-amber-500/30"></div><div className="border border-amber-500/30"></div>
                         </div>
                      </div>

                      {/* Photo */}
                      <div className="w-32 h-32 rounded-full bg-white p-1.5 shadow-xl mb-4 mt-6">
                         <img 
                           src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${showIdCardModal.username}`} 
                           className="w-full h-full rounded-full bg-slate-100 object-cover" 
                           alt="Staff" 
                         />
                      </div>

                      {/* Name & Role */}
                      <h2 className="text-2xl font-black text-white text-center leading-tight mb-1">{showIdCardModal.name}</h2>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">{showIdCardModal.role}</p>
                      
                      {systemName && <p className="text-[10px] text-amber-500 font-bold mb-4">{systemName}</p>}

                      {/* QR Code Section */}
                      <div className="mt-auto bg-white p-3 rounded-xl shadow-lg">
                         <QRCode value={showIdCardModal.id} size={90} fgColor="#0f172a" />
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-[0.2em]">ID: {showIdCardModal.id.substring(0, 8)}</p>
                   </div>

                   {/* Decorative Circles */}
                   <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full -mb-10 -mr-10 blur-2xl"></div>
                   <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full -mb-5 -ml-5 blur-xl"></div>
                </div>
             </div>

             <div className="p-6 bg-white border-t border-slate-100 flex gap-3 no-print">
                <button onClick={handlePrintCard} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl active:scale-95">
                   <Printer className="w-5 h-5" /> طباعة البطاقة
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Employee */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="text-xl font-black text-slate-900">{editMember ? t('staff_modal_update') : t('staff_modal_new')}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-colors"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              <form id="staffForm" onSubmit={handleAddSubmit} className="space-y-8">
                {/* قسم البيانات الأساسية */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest border-b pb-2">{t('staff_section_personal')}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest mx-2">{t('staff_label_name')}</label>
                      <input name="name" defaultValue={editMember?.name} required placeholder="Full Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-900" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest mx-2">{t('staff_label_username')}</label>
                      <input name="username" defaultValue={editMember?.username} required placeholder="username" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-900" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest mx-2">{t('staff_label_role')}</label>
                      <select name="role" defaultValue={editMember?.role} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-900">
                        <option value="باريستا">{t('staff_role_barista')}</option>
                        <option value="شيف">{t('staff_role_chef')}</option>
                        <option value="محاسب">{t('staff_role_cashier')}</option>
                        <option value="مدير">{t('staff_role_manager')}</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest mx-2">{t('staff_label_rate')}</label>
                      <input 
                        name="hourlyRate" 
                        type="number" 
                        step="any"
                        defaultValue={editMember?.hourlyRate} 
                        required 
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-900" 
                        onInvalid={(e) => {
                          (e.target as HTMLInputElement).setCustomValidity('القيمة المدخلة غير صالحة. الرجاء إدخال رقم صالح (مثال: 15.5 أو 20).');
                        }}
                        onInput={(e) => {
                          (e.target as HTMLInputElement).setCustomValidity('');
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest mx-2 flex items-center gap-1"><Key className="w-3 h-3" /> {t('staff_label_password')}</label>
                    <input name="password" type="password" defaultValue={editMember?.password} required placeholder="••••••••" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold tracking-widest text-slate-900" />
                  </div>
                </div>

                {/* قسم نمط الدوام الذكي (New Section) */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest border-b pb-2 flex items-center gap-2">
                    <Settings2 className="w-4 h-4" /> نمط الدوام الافتراضي (الجدولة الذكية)
                  </h4>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-6">
                     
                     <div className="flex justify-between items-center">
                        <label className="text-xs font-black text-slate-700">تفعيل الجدولة التلقائية</label>
                        <input 
                          type="checkbox" 
                          checked={shiftSettings.isAutoScheduled} 
                          onChange={(e) => setShiftSettings({...shiftSettings, isAutoScheduled: e.target.checked})}
                          className="w-6 h-6 accent-amber-500 rounded-lg cursor-pointer" 
                        />
                     </div>

                     {shiftSettings.isAutoScheduled && (
                        <div className="space-y-6 animate-in slide-in-from-top-2">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">أيام الراحة الأسبوعية (OFF)</label>
                              <div className="flex gap-2 justify-start flex-wrap">
                                 {daysOfWeek.map((day) => {
                                    const isSelected = shiftSettings.weeklyRestDays.includes(day.idx);
                                    return (
                                       <button
                                          key={day.idx}
                                          type="button"
                                          onClick={() => toggleRestDay(day.idx)}
                                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-2 ${isSelected ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-amber-400'}`}
                                       >
                                          {day.label}
                                       </button>
                                    )
                                 })}
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">نوع الشفت المعتاد</label>
                                 <select 
                                    value={shiftSettings.defaultShiftType}
                                    onChange={(e) => setShiftSettings({...shiftSettings, defaultShiftType: e.target.value as any})}
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm"
                                 >
                                    <option value="MORNING">صباحي</option>
                                    <option value="EVENING">مسائي</option>
                                 </select>
                              </div>
                              <div className="space-y-1">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">التوقيت</label>
                                 <div className="flex gap-2">
                                    <input 
                                       type="time" 
                                       value={shiftSettings.defaultStartTime} 
                                       onChange={(e) => setShiftSettings({...shiftSettings, defaultStartTime: e.target.value})}
                                       className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm" 
                                    />
                                    <input 
                                       type="time" 
                                       value={shiftSettings.defaultEndTime} 
                                       onChange={(e) => setShiftSettings({...shiftSettings, defaultEndTime: e.target.value})}
                                       className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm" 
                                    />
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
                </div>

                {/* قسم الصلاحيات (علامات الاختيار) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest">{t('staff_section_permissions')}</h4>
                    <span className="text-[9px] font-bold text-slate-400">{t('staff_perm_hint')}</span>
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
                 {editMember ? t('staff_btn_submit_update') : t('staff_btn_submit_new')}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Shift (Same as before) */}
      {showDetailModal === 'SHIFT_EDIT' && selectedForDetail && (
         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
               <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <div>
                     <h3 className="text-xl font-black text-slate-900">تعديل الوردية (استثناء)</h3>
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{selectedForDetail.name} - {selectedDateForShift}</p>
                  </div>
                  <button onClick={() => setShowDetailModal(null)} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-colors"><X className="w-6 h-6" /></button>
               </div>
               <form onSubmit={handleShiftUpdate} className="p-8 space-y-6">
                  {/* ... same form content ... */}
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-xs text-amber-800 font-bold mb-4">
                     ملاحظة: هذا التعديل سيطبق على هذا اليوم فقط كاستثناء من الجدول التلقائي.
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-black text-slate-500">نوع الشفت</label>
                     <div className="grid grid-cols-3 gap-3">
                        <label className="cursor-pointer">
                           <input type="radio" name="type" value="MORNING" defaultChecked className="peer hidden" />
                           <div className="p-4 rounded-xl border-2 border-slate-100 text-center peer-checked:bg-amber-50 peer-checked:border-amber-500 peer-checked:text-amber-700 transition-all hover:bg-slate-50">
                              <Sun className="w-6 h-6 mx-auto mb-1 text-amber-500" />
                              <span className="text-[10px] font-black">صباحي</span>
                           </div>
                        </label>
                        <label className="cursor-pointer">
                           <input type="radio" name="type" value="EVENING" className="peer hidden" />
                           <div className="p-4 rounded-xl border-2 border-slate-100 text-center peer-checked:bg-blue-50 peer-checked:border-blue-500 peer-checked:text-blue-700 transition-all hover:bg-slate-50">
                              <Moon className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                              <span className="text-[10px] font-black">مسائي</span>
                           </div>
                        </label>
                        <label className="cursor-pointer">
                           <input type="radio" name="type" value="OFF" className="peer hidden" />
                           <div className="p-4 rounded-xl border-2 border-slate-100 text-center peer-checked:bg-slate-200 peer-checked:border-slate-400 peer-checked:text-slate-600 transition-all hover:bg-slate-50">
                              <X className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                              <span className="text-[10px] font-black">راحة</span>
                           </div>
                        </label>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">من</label>
                        <input name="startTime" type="time" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">إلى</label>
                        <input name="endTime" type="time" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                     </div>
                  </div>

                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase">ملاحظات</label>
                     <input name="note" placeholder="مثلاً: تغطية إضافية" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm" />
                  </div>

                  <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-lg hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl">حفظ الاستثناء</button>
               </form>
            </div>
         </div>
      )}

      {/* Modal: Staff Documents (Same as before) */}
      {showDetailModal === 'DOCUMENTS' && selectedForDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <FolderOpen className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black">{selectedForDetail.name}</h3>
                  <p className="text-[10px] text-amber-400 font-bold tracking-widest uppercase">Contracts & Documents</p>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(null)} className="p-3 hover:bg-slate-800 rounded-2xl transition-colors"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {/* Add New Document Form */}
              <form onSubmit={handleAddDocument} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Plus className="w-4 h-4 text-amber-500" />
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Add New Document</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 mx-2">Title</label>
                    <input name="docTitle" required placeholder="e.g. ID Copy" className="w-full p-4 border border-slate-200 rounded-xl outline-none font-bold bg-white text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 mx-2">Expiry Date (Optional)</label>
                    <input name="docExpiry" type="date" className="w-full p-4 border border-slate-200 rounded-xl outline-none font-bold bg-white text-sm" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 mx-2">File URL (Google Drive/Dropbox)</label>
                  <input name="docUrl" placeholder="https://..." className="w-full p-4 border border-slate-200 rounded-xl outline-none font-bold bg-white text-sm" />
                </div>
                <button type="submit" className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-sm hover:bg-amber-500 hover:text-slate-900 transition-all shadow-lg">Save to Profile</button>
              </form>

              {/* Documents List */}
              <div className="space-y-3">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Files</p>
                {selectedForDetail.documents?.length > 0 ? (
                  selectedForDetail.documents.map((doc, idx) => {
                    const daysLeft = getDaysRemaining(doc.expiryDate);
                    const isExpired = daysLeft < 0;
                    const isWarning = daysLeft <= 30 && !isExpired && daysLeft !== 999999;
                    const isPermanent = daysLeft === 999999;

                    return (
                      <div key={idx} className={`flex items-center justify-between p-4 bg-white border rounded-2xl group hover:border-amber-200 transition-all ${isExpired ? 'border-red-200 bg-red-50/20' : isWarning ? 'border-orange-200 bg-orange-50/20' : 'border-slate-100'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${isExpired ? 'bg-red-100 text-red-600' : isWarning ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
                            {isExpired ? <AlertTriangle className="w-5 h-5" /> : isWarning ? <Clock className="w-5 h-5" /> : isPermanent ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <FileText className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{doc.title}</p>
                            <p className={`text-[10px] font-bold mt-0.5 ${isExpired ? 'text-red-600' : isWarning ? 'text-orange-600' : 'text-slate-400'}`}>
                              {isPermanent
                                ? 'دائم (بدون تاريخ انتهاء)'
                                : isExpired 
                                  ? `منتهية منذ ${Math.abs(daysLeft)} يوم` 
                                  : isWarning 
                                    ? `تنبيه: تنتهي خلال ${daysLeft} يوم` 
                                    : `تنتهي في: ${doc.expiryDate}`
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.fileUrl && (
                            <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-blue-50 hover:text-blue-500 transition-colors">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button 
                            onClick={(e) => handleDeleteDocumentClick(e, doc.id)}
                            className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <FolderOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-400 text-xs font-bold">Empty Profile</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Staff Attendance & Geo (Same as before) */}
      {showDetailModal === 'ATTENDANCE' && selectedForDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Clock className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black">{selectedForDetail.name}</h3>
                  <p className="text-[10px] text-amber-400 font-bold tracking-widest uppercase">Attendance & Shift Management</p>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(null)} className="p-3 hover:bg-slate-800 rounded-2xl transition-colors"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
               {/* ... Content ... */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shift Start</p>
                     <p className="text-xl font-black text-slate-900">{selectedForDetail.shiftStart}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shift End</p>
                     <p className="text-xl font-black text-slate-900">{selectedForDetail.shiftEnd}</p>
                  </div>
               </div>

               <div className="text-center space-y-4">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black ${selectedForDetail.isClockedIn ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                     <div className={`w-2 h-2 rounded-full ${selectedForDetail.isClockedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
                     {selectedForDetail.isClockedIn ? 'Currently Clocked In' : 'Currently Clocked Out'}
                  </div>

                  <button 
                    onClick={() => {
                       onAttendance(selectedForDetail.id, selectedForDetail.isClockedIn ? 'OUT' : 'IN');
                    }}
                    className={`w-full py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 ${
                        selectedForDetail.isClockedIn 
                        ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/30' 
                        : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/30'
                    }`}
                  >
                     {selectedForDetail.isClockedIn ? <LogOut className="w-6 h-6" /> : <LogIn className="w-6 h-6" />}
                     {selectedForDetail.isClockedIn ? 'Clock Out Now' : 'Clock In Now'}
                  </button>
               </div>

               <div className="space-y-4">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                     <History className="w-4 h-4 text-slate-400" /> Recent Activity
                  </h4>
                  <div className="space-y-3">
                     {selectedForDetail.attendanceHistory && selectedForDetail.attendanceHistory.length > 0 ? (
                        selectedForDetail.attendanceHistory.slice(0, 10).map((log) => (
                           <div key={log.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
                              <div className="flex items-center gap-3">
                                 <div className={`p-2 rounded-xl ${log.type === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {log.type === 'IN' ? <LogIn className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
                                 </div>
                                 <div>
                                    <p className="text-xs font-black text-slate-900">{log.type === 'IN' ? 'Started Shift' : 'Ended Shift'}</p>
                                    <p className="text-[10px] text-slate-400 font-bold">{new Date(log.timestamp).toLocaleString()}</p>
                                 </div>
                              </div>
                              {log.earnedAmount !== undefined && log.earnedAmount > 0 && (
                                 <span className="text-xs font-black text-emerald-600">+{log.earnedAmount} SAR</span>
                              )}
                           </div>
                        ))
                     ) : (
                        <div className="text-center py-8 text-slate-400 text-xs font-bold italic">No attendance records found.</div>
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

export default StaffManager;
