
import React, { useState } from 'react';
import { 
  ClipboardList, Plus, User, CheckCircle2, Clock, Trash2, X, Send, 
  Settings2, AlertOctagon, Repeat, FileCheck, MapPin, ShieldAlert,
  ChevronLeft, ChevronRight, Info, Camera, ListChecks, CalendarRange
} from 'lucide-react';
import { Task, Staff, TaskType, TaskPriority, RecurrenceType, ChecklistItem } from '../types';

interface TaskManagerProps {
  tasks: Task[];
  staff: Staff[];
  onAddTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, staff, onAddTask, onDeleteTask }) => {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  
  // State لبيانات المهمة الجديدة
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    type: 'operational' as TaskType,
    priority: 'medium' as TaskPriority,
    assignedTo: '',
    supervisorId: '',
    deadline: '',
    recurrence: 'none' as RecurrenceType,
    checklist: [] as ChecklistItem[],
    requiresPhoto: false,
    requiresNote: true,
    locationRequired: false
  });

  const [newCheckItem, setNewCheckItem] = useState('');

  const handleAddTaskItem = () => {
    if (!newCheckItem.trim()) return;
    const item: ChecklistItem = {
      id: Math.random().toString(36).substr(2, 9),
      text: newCheckItem,
      isCompleted: false
    };
    setTaskData({ ...taskData, checklist: [...taskData.checklist, item] });
    setNewCheckItem('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      ...taskData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    onAddTask(task);
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setStep(1);
    setTaskData({
      title: '',
      description: '',
      type: 'operational',
      priority: 'medium',
      assignedTo: '',
      supervisorId: '',
      deadline: '',
      recurrence: 'none',
      checklist: [],
      requiresPhoto: false,
      requiresNote: true,
      locationRequired: false
    });
  };

  const typeLabels: Record<TaskType, string> = {
    operational: 'تشغيلية',
    monitoring: 'رقابية',
    urgent: 'طارئة',
    developmental: 'تطويرية'
  };

  const priorityColors: Record<TaskPriority, string> = {
    low: 'bg-slate-100 text-slate-600',
    medium: 'bg-blue-100 text-blue-600',
    high: 'bg-orange-100 text-orange-600',
    critical: 'bg-red-100 text-red-600 animate-pulse'
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-custom-primary" /> مركز العمليات والتحكم
          </h2>
          <p className="text-slate-500 text-sm font-bold">بناء عقود التشغيل، متابعة الأداء، وضمان معايير الجودة.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-black hover-bg-custom-primary hover:text-slate-900 transition-all shadow-xl flex items-center gap-2 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> تعيين مهمة احترافية
        </button>
      </div>

      {/* عرض المهام الحالية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map(task => {
          const worker = staff.find(s => s.id === task.assignedTo);
          return (
            <div key={task.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm relative group overflow-hidden hover:border-custom-primary transition-all">
              <div className={`absolute top-0 right-0 w-2 h-full ${task.priority === 'critical' ? 'bg-red-500' : 'bg-slate-200 group-hover:bg-custom-primary'}`}></div>
              
              <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${priorityColors[task.priority]}`}>
                       {task.priority === 'critical' ? 'حرج جداً' : task.priority}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                       {typeLabels[task.type]}
                    </span>
                 </div>
                 <button onClick={() => onDeleteTask(task.id)} className="p-2 text-slate-200 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>

              <h3 className="text-lg font-black text-slate-900 mb-2">{task.title}</h3>
              <p className="text-xs text-slate-500 mb-6 font-bold leading-relaxed line-clamp-2">{task.description}</p>
              
              <div className="space-y-3 mb-6">
                {task.checklist.length > 0 && (
                   <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                      <ListChecks className="w-3 h-3" /> {task.checklist.filter(c => c.isCompleted).length} / {task.checklist.length} خطوة مكتملة
                   </div>
                )}
                {task.deadline && (
                  <div className="flex items-center gap-2 text-[10px] font-black text-rose-500">
                     <Clock className="w-3 h-3" /> الموعد النهائي: {task.deadline}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${worker?.name || 'unknown'}`} className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200" />
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">المنفذ</p>
                      <p className="text-[11px] font-black text-slate-700 leading-none">{worker?.name || 'غير معين'}</p>
                    </div>
                 </div>
                 <div className={`w-3 h-3 rounded-full ${task.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
              </div>
            </div>
          );
        })}
        {tasks.length === 0 && (
          <div className="col-span-full py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <ClipboardList className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-400 font-bold">لا توجد مهام نشطة حالياً. ابدأ ببناء أول عقد تشغيل.</p>
          </div>
        )}
      </div>

      {/* Popup عقد التشغيل المتقدم */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-custom-primary rounded-2xl shadow-lg shadow-custom text-slate-900">
                  <Settings2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black">تحرير ميثاق مهمة تشغيلية</h3>
                  <div className="flex items-center gap-4 mt-1">
                     <span className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-custom-primary' : 'bg-slate-700'}`}></span>
                     <span className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-custom-primary' : 'bg-slate-700'}`}></span>
                     <span className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-custom-primary' : 'bg-slate-700'}`}></span>
                     <span className={`w-2 h-2 rounded-full ${step >= 4 ? 'bg-custom-primary' : 'bg-slate-700'}`}></span>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">المرحلة {step} من 4</span>
                  </div>
                </div>
              </div>
              <button onClick={resetForm} className="p-2 hover:bg-slate-800 rounded-xl transition-colors"><X className="w-6 h-6" /></button>
            </div>

            {/* Content Wizard */}
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              
              {step === 1 && (
                <div className="space-y-8 animate-in slide-in-from-left-4">
                   <div className="flex items-center gap-2 mb-2">
                     <Info className="w-5 h-5 text-custom-primary" />
                     <h4 className="text-lg font-black text-slate-900">تعريف المهمة ونوعها</h4>
                   </div>
                   <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 mr-2 uppercase tracking-widest">عنوان المهمة (العقد)</label>
                        <input 
                          value={taskData.title}
                          onChange={(e) => setTaskData({...taskData, title: e.target.value})}
                          required 
                          placeholder="مثلاً: جرد قسم البن المختص الأسبوعي" 
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-lg focus:border-custom-primary transition-all" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-black text-slate-500 mr-2 uppercase tracking-widest">نوع المهمة</label>
                          <select 
                            value={taskData.type}
                            onChange={(e) => setTaskData({...taskData, type: e.target.value as any})}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold"
                          >
                            <option value="operational">تشغيلية (يومية)</option>
                            <option value="monitoring">رقابية (تدقيق)</option>
                            <option value="urgent">طارئة (استجابة)</option>
                            <option value="developmental">تطويرية (تحسين)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-black text-slate-500 mr-2 uppercase tracking-widest">الأولوية</label>
                          <select 
                            value={taskData.priority}
                            onChange={(e) => setTaskData({...taskData, priority: e.target.value as any})}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold"
                          >
                            <option value="low">منخفضة</option>
                            <option value="medium">متوسطة</option>
                            <option value="high">عالية</option>
                            <option value="critical">حرجة جداً (تنبيه فوري)</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1">
                         <label className="text-xs font-black text-slate-500 mr-2 uppercase tracking-widest">وصف التفاصيل والمعايير</label>
                         <textarea 
                           value={taskData.description}
                           onChange={(e) => setTaskData({...taskData, description: e.target.value})}
                           rows={4} 
                           placeholder="اكتب المعايير الدقيقة التي يجب الالتزام بها..." 
                           className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm resize-none"
                         />
                      </div>
                   </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8 animate-in slide-in-from-left-4">
                   <div className="flex items-center gap-2 mb-2">
                     <CalendarRange className="w-5 h-5 text-custom-primary" />
                     <h4 className="text-lg font-black text-slate-900">النطاق الزمني والتكرار</h4>
                   </div>
                   <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                      <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">طبيعة التكرار</label>
                            <div className="grid grid-cols-2 gap-2">
                               {['none', 'daily', 'weekly', 'monthly'].map(type => (
                                 <button 
                                   key={type}
                                   type="button"
                                   onClick={() => setTaskData({...taskData, recurrence: type as any})}
                                   className={`py-3 rounded-xl text-[10px] font-black border transition-all ${taskData.recurrence === type ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 border-slate-200 hover:border-custom-primary'}`}
                                 >
                                   {type === 'none' ? 'مرة واحدة' : type === 'daily' ? 'يومي' : type === 'weekly' ? 'أسبوعي' : 'شهري'}
                                 </button>
                               ))}
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">الموعد النهائي (Deadline)</label>
                            <input 
                              type="datetime-local" 
                              value={taskData.deadline}
                              onChange={(e) => setTaskData({...taskData, deadline: e.target.value})}
                              className="w-full p-4 bg-white border border-slate-200 rounded-xl outline-none font-bold" 
                            />
                         </div>
                      </div>
                   </div>
                   <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
                      <AlertOctagon className="w-6 h-6 text-amber-500 shrink-0" />
                      <div>
                        <p className="text-sm font-black text-amber-900">ملاحظة التكرار الذكي</p>
                        <p className="text-xs text-amber-700 mt-1">سيقوم النظام تلقائياً بإعادة توليد هذه المهمة عند كل دورة جديدة وارسال اشعارات للموظف.</p>
                      </div>
                   </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8 animate-in slide-in-from-left-4">
                   <div className="flex items-center gap-2 mb-2">
                     <ListChecks className="w-5 h-5 text-custom-primary" />
                     <h4 className="text-lg font-black text-slate-900">المسؤوليات وشروط الإنجاز (DoD)</h4>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 mr-2 uppercase tracking-widest">المنفذ الأساسي</label>
                        <select 
                          value={taskData.assignedTo}
                          onChange={(e) => setTaskData({...taskData, assignedTo: e.target.value})}
                          required 
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold"
                        >
                          <option value="">-- اختر الموظف --</option>
                          {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 mr-2 uppercase tracking-widest">جهة الإشراف والتدقيق</label>
                        <select 
                          value={taskData.supervisorId}
                          onChange={(e) => setTaskData({...taskData, supervisorId: e.target.value})}
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold"
                        >
                          <option value="">-- اختياري (مدير/مشرف) --</option>
                          {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                        </select>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label className="text-xs font-black text-slate-500 mr-2 uppercase tracking-widest block">قائمة شروط الإنجاز (Definition of Done)</label>
                      <div className="flex gap-2">
                         <input 
                           value={newCheckItem}
                           onChange={(e) => setNewCheckItem(e.target.value)}
                           placeholder="مثلاً: تأكد من إغلاق صمام الغاز" 
                           className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" 
                         />
                         <button 
                          type="button"
                          onClick={handleAddTaskItem}
                          className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-custom-primary hover:text-slate-900 transition-all shadow-lg"
                         >
                           <Plus className="w-6 h-6" />
                         </button>
                      </div>
                      <div className="space-y-2">
                         {taskData.checklist.map((item, idx) => (
                           <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <span className="text-sm font-bold text-slate-700">{idx + 1}. {item.text}</span>
                              <button 
                                onClick={() => setTaskData({...taskData, checklist: taskData.checklist.filter(c => c.id !== item.id)})}
                                className="text-red-400 hover:text-red-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-8 animate-in slide-in-from-left-4">
                   <div className="flex items-center gap-2 mb-2">
                     <FileCheck className="w-5 h-5 text-custom-primary" />
                     <h4 className="text-lg font-black text-slate-900">إثبات العمل والحوكمة</h4>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <button 
                        type="button"
                        onClick={() => setTaskData({...taskData, requiresPhoto: !taskData.requiresPhoto})}
                        className={`p-6 rounded-[2rem] border-2 transition-all text-right flex flex-col gap-3 ${taskData.requiresPhoto ? 'bg-custom-light border-custom-primary' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                      >
                         <Camera className={`w-8 h-8 ${taskData.requiresPhoto ? 'text-custom-primary' : 'text-slate-300'}`} />
                         <div>
                            <p className="text-sm font-black text-slate-900">إثبات بالصورة الفوتوغرافية</p>
                            <p className="text-[10px] text-slate-400 font-bold">لا يكتمل الطلب إلا برفع صورة حية من الموقع.</p>
                         </div>
                      </button>

                      <button 
                        type="button"
                        onClick={() => setTaskData({...taskData, locationRequired: !taskData.locationRequired})}
                        className={`p-6 rounded-[2rem] border-2 transition-all text-right flex flex-col gap-3 ${taskData.locationRequired ? 'bg-blue-50 border-blue-400' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                      >
                         <MapPin className={`w-8 h-8 ${taskData.locationRequired ? 'text-blue-500' : 'text-slate-300'}`} />
                         <div>
                            <p className="text-sm font-black text-slate-900">التحقق الجغرافي (GPS)</p>
                            <p className="text-[10px] text-slate-400 font-bold">يجب أن يكون الموظف ضمن نطاق جغرافي محدد ليتمكن من الإغلاق.</p>
                         </div>
                      </button>
                   </div>

                   <div className="p-6 bg-red-50 rounded-3xl border border-red-100">
                      <h5 className="text-sm font-black text-red-900 flex items-center gap-2 mb-2">
                         <ShieldAlert className="w-5 h-5" /> آلية التصعيد التلقائي
                      </h5>
                      <p className="text-xs text-red-700 leading-relaxed font-bold">
                         في حال عدم الإنجاز خلال 120 دقيقة من الموعد النهائي، سيقوم النظام تلقائياً بإصدار تنبيه "خرق التزام" لمدير العمليات وخصم نقاط من تقييم الأداء الشهري للموظف.
                      </p>
                   </div>
                </div>
              )}

            </div>

            {/* Footer Navigation */}
            <div className="p-8 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
               <button 
                 onClick={() => setStep(s => Math.max(1, s - 1))}
                 disabled={step === 1}
                 className="px-6 py-3 bg-white text-slate-600 rounded-xl font-black text-xs border border-slate-200 disabled:opacity-30 flex items-center gap-2"
               >
                 <ChevronRight className="w-4 h-4" /> السابق
               </button>
               
               {step < 4 ? (
                 <button 
                   onClick={() => setStep(s => Math.min(4, s + 1))}
                   className="px-10 py-3 bg-slate-900 text-white rounded-xl font-black text-xs hover-bg-custom-primary hover:text-slate-900 transition-all flex items-center gap-2"
                 >
                   التالي <ChevronLeft className="w-4 h-4" />
                 </button>
               ) : (
                 <button 
                   onClick={handleSubmit}
                   className="px-12 py-4 bg-emerald-500 text-white rounded-[1.5rem] font-black text-sm hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2"
                 >
                   <CheckCircle2 className="w-5 h-5" /> اعتماد عقد التشغيل
                 </button>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;
