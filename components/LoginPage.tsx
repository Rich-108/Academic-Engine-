
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

  // Function to decode the Google JWT
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
      
      // Artificial delay for smooth transition
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
      name: "Demo Student",
      email: "student@mastery-engine.ai",
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
            client_id: "755452627376-7m47fjk6unv4a4n6a3g78s4mcln3v7a8.apps.googleusercontent.com", 
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          const btnContainer = document.getElementById("googleBtn");
          if (btnContainer) {
            (window as any).google.accounts.id.renderButton(
              btnContainer,
              { 
                theme: isDarkMode ? "filled_black" : "outline", 
                size: "large",
                width: "320",
                text: "signin_with",
                shape: "pill"
              }
            );
          }
        } else {
          // Retry if script not loaded yet
          setTimeout(initializeGoogle, 200);
        }
      } catch (err) {
        console.error("Google Auth initialization failed", err);
        setGoogleError(true);
      }
    };

    initializeGoogle();
  }, [isDarkMode]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-300">
      <div className="max-w-md w-full">
        {/* Logo Section */}
        <div className="text-center mb-10 animate-in fade-in zoom-in duration-700">
          <div className="inline-flex items-center justify-center bg-indigo-600 p-5 rounded-3xl shadow-2xl mb-6 transform hover:rotate-3 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Mastery Engine</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg font-medium">Master the concepts, not just the answers.</p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl p-10 transition-all duration-300 flex flex-col items-center">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Welcome Back</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Please sign in to access your conceptual tutor</p>
          </div>

          <div id="googleBtn" className={`min-h-[50px] flex items-center justify-center transition-opacity duration-300 ${isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}></div>

          {isLoading && (
            <div className="flex flex-col items-center space-y-4 py-2">
              <div className="h-10 w-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-indigo-600 animate-pulse">Entering Classroom...</p>
            </div>
          )}

          {!isLoading && (
            <div className="mt-4 flex flex-col items-center w-full space-y-4">
              <div className="flex items-center w-full">
                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
                <span className="px-3 text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">OR</span>
                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
              </div>
              
              <button 
                onClick={handleDemoLogin}
                className="w-full max-w-[320px] py-3 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-full text-sm font-bold transition-all flex items-center justify-center space-x-2 active:scale-95 group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Continue as Guest</span>
              </button>
            </div>
          )}

          {googleError && !isLoading && (
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-400 text-center leading-relaxed">
              <p className="font-bold mb-1">Authorization Note</p>
              Google Sign-In is restricted for this domain. Please use the <strong>Guest Login</strong> above to explore the Engine's features.
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 w-full text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
              Securely powered by <br/>
              <span className="text-slate-900 dark:text-slate-300">Google Identity Services</span>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center mt-10 text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-[0.2em]">
          Gemini 3 Pro • Conceptual Intelligence Platform
        </p>
      </div>
    </div>
  );
};

export default LoginPage;