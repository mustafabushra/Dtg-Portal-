
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen, title, message, onConfirm, onCancel, confirmText = 'Delete', cancelText = 'Cancel', type = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl border border-slate-100 p-8 scale-100 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center gap-4">
          <div className={`p-5 rounded-full shadow-inner ${type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
            <AlertTriangle className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
            <p className="text-xs font-bold text-slate-500 leading-relaxed px-4">
              {message}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
            <button
              onClick={(e) => { e.stopPropagation(); onCancel(); }}
              className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm hover:bg-slate-200 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onConfirm(); }}
              className={`flex-1 py-4 text-white rounded-2xl font-black text-sm shadow-xl transition-all active:scale-95 ${
                type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-amber-500 hover:bg-amber-600'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
