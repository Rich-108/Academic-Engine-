
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
      title: "Create GitHub Repo",
      desc: "Go to github.com and create a new repository named 'mastery-engine'. Upload your project files there.",
      status: "Step 1"
    },
    {
      title: "Import to Vercel",
      desc: "Log in to vercel.com and import the repo. Vercel will auto-detect the settings.",
      status: "Step 2"
    },
    {
      title: "Add API_KEY Variable",
      desc: "Go to Settings > Environment Variables. Set Key as 'API_KEY' and Value as your Gemini key.",
      status: "Step 3"
    },
    {
      title: "Redeploy",
      desc: "Environment variables require a fresh build. Go to Deployments > Redeploy to activate the key.",
      status: "Step 4"
    },
    {
      title: "Google Auth Sync",
      desc: "Add your vercel.app domain to 'Authorized JavaScript Origins' in your Google Cloud Console.",
      status: "Step 5"
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
                <h2 id="info-title" className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Vercel Deployment Guide</h2>
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Mastery Engine Online</p>
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
                Setup Checklist
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
                        <span className="text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-800">
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
                  <path fillRule="evenodd" d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM5.879 4.464a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM10 18a1 1 0 100-2h-1a1 1 0 100 2h1zM4.464 18.121a1 1 0 101.414-1.414l-.707-.707a1 1 0 10-1.414 1.414l.707.707zM16 10a1 1 0 11-2 0 1 1 0 012 0zM7 10a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                </svg>
                <h3 className="font-bold">Deep Dive: Adding the API Key</h3>
              </div>
              <p className="text-xs text-indigo-100 leading-relaxed space-y-2">
                1. Inside Vercel Project > <strong>Settings</strong> > <strong>Environment Variables</strong>.<br/>
                2. Key: <code className="bg-indigo-700 px-1 rounded">API_KEY</code><br/>
                3. Value: <i>[Paste your Gemini Key here]</i><br/>
                4. Press <strong>Add</strong> and then go to the <strong>Deployments</strong> tab to <strong>Redeploy</strong>.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Mastery Engine v1.2</p>
            <button 
              onClick={onClose}
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-3 rounded-full text-sm font-bold transition-all active:scale-95 shadow-lg"
            >
              Done, Key Added!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoModal;
