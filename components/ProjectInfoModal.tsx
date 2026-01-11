
import React from 'react';

interface ProjectInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

const ProjectInfoModal: React.FC<ProjectInfoModalProps> = ({ isOpen, onClose, isDarkMode }) => {
  if (!isOpen) return null;

  const steps = [
    {
      title: "Folder Setup",
      desc: "Put all files (index.html, App.tsx, etc.) into one folder. No build step required.",
      status: "Ready"
    },
    {
      title: "Select Provider",
      desc: "Use Vercel or Netlify. They offer free, fast static hosting for React apps.",
      status: "Recommended"
    },
    {
      title: "Upload",
      desc: "Drag and drop your folder into the Vercel/Netlify 'Manual Deploy' dashboard.",
      status: "Action Required"
    },
    {
      title: "Env Variables",
      desc: "In host settings, add 'API_KEY' with your Gemini key from Google AI Studio.",
      status: "Critical"
    },
    {
      title: "Google OAuth",
      desc: "Add your new domain to 'Authorized JavaScript origins' in Google Cloud Console.",
      status: "Auth Sync"
    }
  ];

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
                <h2 id="info-title" className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Deployment Center</h2>
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Internet Hosting Guide</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors focus:ring-2 focus:ring-indigo-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-8 overflow-y-auto max-h-[60vh] pr-4 custom-scrollbar">
            <section>
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                <span className="w-8 h-px bg-slate-200 dark:bg-slate-800 mr-3"></span>
                Hosting Checklist
                <span className="w-8 h-px bg-slate-200 dark:bg-slate-800 ml-3"></span>
              </h3>
              <div className="space-y-4">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-start p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all">
                    <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs flex-shrink-0 mr-4 shadow-sm">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-slate-900 dark:text-slate-100">{step.title}</p>
                        <span className="text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800">
                          {step.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-200 dark:shadow-none">
              <div className="flex items-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <h3 className="font-bold">Pro Security Tip</h3>
              </div>
              <p className="text-xs text-indigo-100 leading-relaxed">
                Currently, your API key is stored in the frontend. While this works for personal projects, for a public production app, you should create a simple server-side proxy (using Vercel Functions) to hide your Gemini key from the browser network tab.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Academic Engine v1.2</p>
            <button 
              onClick={onClose}
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-3 rounded-full text-sm font-bold transition-all active:scale-95 shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoModal;
