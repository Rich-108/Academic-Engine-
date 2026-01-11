
import React, { useEffect, useState } from 'react';

interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

interface LoginPageProps {
  onLogin: (profile: UserProfile) => void;
  isDarkMode: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, isDarkMode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [googleError, setGoogleError] = useState(false);

  // Updated with the new Client ID provided by the user
  const GOOGLE_CLIENT_ID = "499241709798-irddnbhlupples86frmcbh909hk48gh6.apps.googleusercontent.com";

  const decodeJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Failed to decode JWT", e);
      return null;
    }
  };

  const handleCredentialResponse = (response: any) => {
    setIsLoading(true);
    const payload = decodeJwt(response.credential);
    if (payload) {
      const profile: UserProfile = {
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
      };
      
      setTimeout(() => {
        setIsLoading(false);
        onLogin(profile);
      }, 800);
    } else {
      setIsLoading(false);
      setGoogleError(true);
    }
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    const demoProfile: UserProfile = {
      name: "Guest Explorer",
      email: "guest@mastery-engine.ai",
      picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    };
    
    setTimeout(() => {
      setIsLoading(false);
      onLogin(demoProfile);
    }, 1000);
  };

  useEffect(() => {
    const initializeGoogle = () => {
      try {
        if ((window as any).google && (window as any).google.accounts) {
          (window as any).google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID, 
            callback: handleCredentialResponse,
            auto_select: false,
          });

          const btnContainer = document.getElementById("googleBtn");
          if (btnContainer) {
            (window as any).google.accounts.id.renderButton(
              btnContainer,
              { 
                theme: isDarkMode ? "filled_black" : "outline", 
                size: "large",
                width: "320",
                shape: "pill"
              }
            );
          }
        } else {
          setTimeout(initializeGoogle, 300);
        }
      } catch (err) {
        console.error("Auth init failed", err);
        setGoogleError(true);
      }
    };

    initializeGoogle();
  }, [isDarkMode]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center bg-indigo-600 p-5 rounded-3xl shadow-2xl mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Mastery Engine</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-bold uppercase tracking-widest">Conceptual Intelligence</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl p-10 flex flex-col items-center relative overflow-hidden">
          <div className="mb-8 text-center relative z-10">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Portal Access</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-bold uppercase">Ready for Analysis</p>
          </div>

          <div id="googleBtn" className={`min-h-[50px] flex items-center justify-center transition-opacity ${isLoading ? 'opacity-0' : 'opacity-100'}`}></div>

          {isLoading && (
            <div className="flex flex-col items-center space-y-4 py-2">
              <div className="h-8 w-8 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest animate-pulse">Establishing Session...</p>
            </div>
          )}

          {!isLoading && (
            <div className="mt-6 flex flex-col items-center w-full space-y-4">
              <div className="flex items-center w-full px-8">
                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
                <span className="px-3 text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Safe Mode</span>
                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
              </div>
              
              <button 
                onClick={handleDemoLogin}
                className="w-full max-w-[320px] py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-black uppercase tracking-widest transition-all active:scale-95"
              >
                Continue as Guest
              </button>
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-slate-50 dark:border-slate-800/50 w-full text-center">
            {googleError ? (
              <p className="text-[9px] text-red-500 font-bold uppercase leading-relaxed">
                Domain Unauthorized <br/> Check Project Info for the Fix
              </p>
            ) : (
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                Secure Cloud Gateway
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
