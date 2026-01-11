
import React, { useState } from 'react';

interface ProjectInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

const ProjectInfoModal: React.FC<ProjectInfoModalProps> = ({ isOpen, onClose, isDarkMode }) => {
  const [copied, setCopied] = useState(false);
  
  if (!isOpen) return null;

  const currentOrigin = window.location.origin;

  const copyOrigin = () => {
    navigator.clipboard.writeText(currentOrigin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`fixed inset-0 z-[250] flex items-center justify-center p-4 ${isDarkMode ? 'dark' : ''}`} role="dialog" aria-modal="true" aria-labelledby="info-title">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} aria-hidden="true" />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-slate-200 dark:border-slate-800">
        <div className="p-8 md:p-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 p-2 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 id="info-title" className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">System Information</h2>
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Mastery Engine Session</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-4 custom-scrollbar">
             <section className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-6">
              <h3 className="font-black text-xs uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-4 flex items-center">
                <span className="bg-indigo-600 text-white h-5 w-5 rounded-full flex items-center justify-center text-[10px] mr-2">1</span>
                Project Environment
              </h3>
              
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                To enable all engine features, ensure your deployment origin is authorized:
              </p>

              <div className="bg-white dark:bg-slate-950 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Authorized Origin:</p>
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  <code className="text-xs font-mono text-indigo-600 dark:text-indigo-400 truncate mr-2">{currentOrigin}</code>
                  <button 
                    onClick={copyOrigin}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'}`}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="h-4 w-4 rounded-full border-2 border-indigo-300 dark:border-indigo-700 flex-shrink-0 mt-0.5 mr-3"></div>
                  <p className="text-xs dark:text-slate-300">Navigate to your Cloud Console.</p>
                </div>
                <div className="flex items-start">
                  <div className="h-4 w-4 rounded-full border-2 border-indigo-600 dark:border-indigo-400 flex-shrink-0 mt-0.5 mr-3"></div>
                  <p className="text-xs font-bold dark:text-slate-200">
                    Go to <strong>APIs &amp; Services</strong> &gt; <strong>Credentials</strong> and update your authorized JavaScript origins if necessary.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Mastery Engine v1.5</p>
            <button 
              onClick={onClose}
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-3 rounded-full text-xs font-bold transition-all active:scale-95 shadow-lg"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoModal;
