
import React, { useState, useEffect } from 'react';

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ isOpen, onClose, isDarkMode }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: TutorialStep[] = [
    {
      title: "Welcome to Academic Engine",
      description: "Our goal isn't just to give you answers, but to help you master the fundamental concepts behind any subject. Let's take a quick tour.",
      icon: (
        <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      )
    },
    {
      title: "Interactive Inquiry",
      description: "Ask any academic question in the input field. From quantum mechanics to the French Revolution, the Engine explains the 'why' before the 'what'.",
      icon: (
        <div className="bg-indigo-500 p-3 rounded-2xl shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 012 2h-5l-5 5-5-5z" />
          </svg>
        </div>
      )
    },
    {
      title: "Visual Context",
      description: "Upload a photo of your textbook, handwritten notes, or diagrams. The Engine can analyze them and clarify complex visual logic instantly.",
      icon: (
        <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      )
    },
    {
      title: "The Mastery Library",
      description: "Encountered a new term? Add it to your Personal Glossary. It's a persistent space to store and review definitions you've mastered.",
      icon: (
        <div className="bg-amber-500 p-3 rounded-2xl shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      )
    },
    {
      title: "Conceptual Mapping",
      description: "When explanations get deep, the Engine generates dynamic flowcharts. Click any diagram to zoom in and visualize the relationship between ideas.",
      icon: (
        <div className="bg-rose-500 p-3 rounded-2xl shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
      )
    }
  ];

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="tutorial-title"
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-opacity duration-300 ${isDarkMode ? 'dark' : ''}`}
    >
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} aria-hidden="true" />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-slate-200 dark:border-slate-800">
        <div className="p-8 md:p-12 text-center">
          <div className="flex justify-center mb-8 transform transition-transform duration-500 hover:scale-110" aria-hidden="true">
            {steps[currentStep].icon}
          </div>
          
          <h2 id="tutorial-title" className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            {steps[currentStep].title}
          </h2>
          
          <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-10 font-medium">
            {steps[currentStep].description}
          </p>

          <div className="flex items-center justify-between mt-auto">
            <button 
              onClick={handleBack}
              disabled={currentStep === 0}
              aria-label="Previous step"
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all focus:ring-2 focus:ring-slate-300 ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
              Back
            </button>
            
            <div className="flex space-x-2" role="group" aria-label={`Step ${currentStep + 1} of ${steps.length}`}>
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200 dark:bg-slate-800'}`}
                  aria-hidden="true"
                />
              ))}
            </div>

            <button 
              onClick={handleNext}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>

        {/* Progress Bar Top */}
        <div 
          role="progressbar" 
          aria-valuenow={((currentStep + 1) / steps.length) * 100} 
          aria-valuemin={0} 
          aria-valuemax={100}
          className="absolute top-0 left-0 h-1 bg-indigo-600 transition-all duration-500" 
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} 
        />
        
        <button 
          onClick={onClose}
          aria-label="Skip Tutorial"
          className="absolute top-6 right-6 p-2 rounded-full text-slate-300 hover:text-slate-600 dark:hover:text-slate-100 transition-colors focus:ring-2 focus:ring-indigo-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TutorialOverlay;
