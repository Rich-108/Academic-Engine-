
import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  isDarkMode: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmLabel,
  isDarkMode 
}) => {
  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[300] flex items-center justify-center p-4 ${isDarkMode ? 'dark' : ''}`} role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} aria-hidden="true" />
      
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-slate-200 dark:border-slate-800">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600 dark:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
          </div>

          <h3 className="text-xl font-black text-center text-slate-900 dark:text-white mb-2 tracking-tight">
            {title}
          </h3>
          <p className="text-sm text-center text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
            {message}
          </p>

          <div className="flex flex-col space-y-3">
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-red-200 dark:shadow-none"
            >
              {confirmLabel}
            </button>
            <button
              onClick={onClose}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3 rounded-2xl font-bold transition-all hover:bg-slate-200 dark:hover:bg-slate-750 active:scale-95"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
