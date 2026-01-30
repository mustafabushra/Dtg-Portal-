
import React, { useState } from 'react';
import { ClipboardList, Plus, User, CheckCircle2, Clock, Trash2, X, Send } from 'lucide-react';
import { Task, Staff } from '../types';

interface TaskManagerProps {
  tasks: Task[];
  staff: Staff[];
  onAddTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, staff, onAddTask, onDeleteTask }) => {
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      assignedTo: formData.get('assignedTo') as string,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    onAddTask(newTask);
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <ClipboardList className="w-6 h-6 text-amber-500" /> إدارة أوامر التشغيل والمهام
          </h2>
          <p className="text-slate-500 text-sm">تعيين المهام اليومية للموظفين ومتابعة الإنجاز.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl flex items-center gap-2">
          <Plus className="w-5 h-5" /> إضافة مهمة عمل
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map(task => {
          const worker = staff.find(s => s.id === task.assignedTo);
          return (
            <div key={task.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm relative group overflow-hidden">
              <div className={`absolute top-0 right-0 w-2 h-full ${task.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
              <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${task.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                       {task.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                       {task.status === 'completed' ? 'تم الإنجاز' : 'قيد التنفيذ'}
                    </span>
                 </div>
                 <button onClick={() => onDeleteTask(task.id)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">{task.title}</h3>
              <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">{task.description}</p>
              
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${worker?.name}`} className="w-8 h-8 rounded-full bg-slate-100" />
                    <span className="text-xs font-black text-slate-700">{worker?.name || 'غير معين'}</span>
                 </div>
                 <span className="text-[9px] font-bold text-slate-400">{new Date(task.createdAt).toLocaleDateString('ar-SA')}</span>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-900">تعيين مهمة جديدة</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl text-slate-400"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 mr-2">عنوان المهمة</label>
                <input name="title" required placeholder="مثلاً: جرد قسم البن" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 mr-2">الموظف المسؤول</label>
                <select name="assignedTo" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold">
                  {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 mr-2">التفاصيل / التعليمات</label>
                <textarea name="description" required rows={3} placeholder="اكتب ما يجب فعله بالضبط..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm resize-none" />
              </div>
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-lg hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl flex items-center justify-center gap-2">
                <Send className="w-5 h-5" /> إرسال المهمة للموظف
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;
