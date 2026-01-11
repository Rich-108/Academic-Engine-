
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
      desc: "Go to github.com and create a new repository. Upload all files (including App.tsx and index.html).",
      status: "Step 1"
    },
    {
      title: "Import to Vercel",
      desc: "Connect your GitHub account to Vercel and import the new 'mastery-engine' repository.",
      status: "Step 2"
    },
    {
      title: "API_KEY (Critical)",
      desc: "In Vercel Settings > Env Variables, add 'API_KEY' with your Gemini key from AI Studio.",
      status: "Step 3"
    },
    {
      title: "Redeploy",
      desc: "Environment variables only take effect on new builds. Click 'Redeploy' in your Vercel project dashboard.",
      status: "Step 4"
    },
    {
      title: "Google Auth Sync",
      desc: "Register your new Vercel URL in the Google Cloud Console to enable the Login feature.",
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
                <h2 id="info-title" className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Setup Deep-Dive</h2>
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Fixing the "Confusing" Parts</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-4 custom-scrollbar">
            <section className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-6">
              <div className="flex items-center mb-4 text-amber-800 dark:text-amber-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                <h3 className="font-black text-sm uppercase tracking-wider">Solving Google Login (Step 5)</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Google Login fails if you don't own the <strong>Client ID</strong>. Follow these 3 sub-steps to fix it:
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 text-[10px] font-bold px-2 py-0.5 rounded mr-3">A</span>
                  <p className="text-xs dark:text-slate-300">Create a Project at <strong>console.cloud.google.com</strong> and go to <strong>APIs & Services > Credentials</strong>.</p>
                </div>
                <div className="flex items-start">
                  <span className="bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 text-[10px] font-bold px-2 py-0.5 rounded mr-3">B</span>
                  <p className="text-xs dark:text-slate-300">Create an <strong>OAuth Client ID</strong> (Web Application). Add your Vercel URL to <strong>'Authorized JavaScript Origins'</strong>.</p>
                </div>
                <div className="flex items-start">
                  <span className="bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 text-[10px] font-bold px-2 py-0.5 rounded mr-3">C</span>
                  <p className="text-xs dark:text-slate-300">Copy the new <strong>Client ID</strong> and paste it into the <code>LoginPage.tsx</code> file (replace the old ID string).</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 text-center">Standard Deployment Checklist</h3>
              <div className="grid grid-cols-1 gap-3">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-[10px] flex-shrink-0 mr-3 shadow-sm">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">{step.title}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-500 truncate">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div className="flex flex-col">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Mastery Engine v1.2</p>
              <a href="https://console.cloud.google.com" target="_blank" className="text-[10px] text-indigo-500 font-bold hover:underline">Google Console →</a>
            </div>
            <button 
              onClick={onClose}
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-full text-xs font-bold transition-all active:scale-95 shadow-lg"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoModal;
