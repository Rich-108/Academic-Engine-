
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, FileData, GlossaryItem } from './types';
import { getGeminiResponse } from './services/geminiService';
import ChatMessage from './components/ChatMessage';
import LoginPage from './components/LoginPage';
import Glossary from './components/Glossary';
import TutorialOverlay from './components/TutorialOverlay';
import ProjectInfoModal from './components/ProjectInfoModal';
import ConfirmationModal from './components/ConfirmationModal';

interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

const INITIAL_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: "Hello! I'm your Mastery Engine. Ask me any question about your studies, or upload an image of your textbook/notes, and I'll help you master the core concepts. What are we exploring today?\n\n[RELATED_TOPICS: Photosynthesis, Quantum Mechanics, French Revolution]",
  timestamp: new Date(),
};

const STORAGE_KEY = 'mastery_engine_chat_history';
const USER_KEY = 'mastery_engine_user_profile';
const MODEL_KEY = 'mastery_engine_selected_model';
const GLOSSARY_KEY = 'mastery_engine_glossary';
const TUTORIAL_KEY = 'mastery_engine_tutorial_seen';
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB Limit

const MODELS = [
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', desc: 'Complex reasoning' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', desc: 'Fast & efficient' },
  { id: 'gemini-1.5-pro-preview-0514', name: 'Gemini 1.5 Pro (v0514)', desc: 'Large context' },
  { id: 'gemini-2.5-flash-lite-latest', name: 'Gemini 2.5 Lite', desc: 'Lightweight' },
];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [selectedModel, setSelectedModel] = useState(() => {
    return localStorage.getItem(MODEL_KEY) || MODELS[0].id;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      } catch (e) {
        console.error("Failed to parse saved chat history", e);
        return [INITIAL_MESSAGE];
      }
    }
    return [INITIAL_MESSAGE];
  });

  const [glossary, setGlossary] = useState<GlossaryItem[]>(() => {
    const saved = localStorage.getItem(GLOSSARY_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      } catch (e) {
        console.error("Failed to parse glossary", e);
        return [];
      }
    }
    return [];
  });

  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Undo/Redo State
  const [inputHistory, setInputHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isInternalUpdate = useRef(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const messagesRef = useRef<Message[]>(messages);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Undo/Redo logic
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    const timer = setTimeout(() => {
      if (input !== inputHistory[historyIndex]) {
        const newHistory = inputHistory.slice(0, historyIndex + 1);
        newHistory.push(input);
        // Limit history size to 50 snapshots
        if (newHistory.length > 50) newHistory.shift();
        
        setInputHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }, 500); // 500ms debounce for history snapshots

    return () => clearTimeout(timer);
  }, [input, inputHistory, historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isInternalUpdate.current = true;
      const prevValue = inputHistory[historyIndex - 1];
      setInput(prevValue);
      setHistoryIndex(historyIndex - 1);
    }
  }, [historyIndex, inputHistory]);

  const handleRedo = useCallback(() => {
    if (historyIndex < inputHistory.length - 1) {
      isInternalUpdate.current = true;
      const nextValue = inputHistory[historyIndex + 1];
      setInput(nextValue);
      setHistoryIndex(historyIndex + 1);
    }
  }, [historyIndex, inputHistory]);

  // Keyboard shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isZ = e.key.toLowerCase() === 'z';
      const isMeta = e.metaKey || e.ctrlKey;
      const isShift = e.shiftKey;

      if (isMeta && isZ) {
        e.preventDefault();
        if (isShift) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(MODEL_KEY, selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    localStorage.setItem(GLOSSARY_KEY, JSON.stringify(glossary));
  }, [glossary]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      const tutorialSeen = localStorage.getItem(TUTORIAL_KEY);
      if (!tutorialSeen) {
        setTimeout(() => setIsTutorialOpen(true), 1500);
      }
    }
  }, [messages, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messagesRef.current));
      setShowSavedIndicator(true);
      setTimeout(() => setShowSavedIndicator(false), 3000);
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAuthenticated]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setError(`Voice input failed. Please ensure your microphone permissions are enabled and try again.`);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, [isAuthenticated]);

  const handleLogin = (profile: UserProfile) => {
    setIsAuthenticated(true);
    setUserProfile(profile);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      setIsAuthenticated(false);
      setUserProfile(null);
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(GLOSSARY_KEY);
      localStorage.removeItem(TUTORIAL_KEY);
      setMessages([{ ...INITIAL_MESSAGE, timestamp: new Date() }]);
      setGlossary([]);
    }
  };

  const handleClearHistory = () => {
    const freshMessage = { ...INITIAL_MESSAGE, timestamp: new Date() };
    setMessages([freshMessage]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([freshMessage]));
    setInput('');
    setSelectedFile(null);
    setError(null);
    setIsLoading(false);
    if (isRecording) {
      recognitionRef.current?.stop();
    }
  };

  const handleAddToGlossary = (term: string, definition: string) => {
    const newItem: GlossaryItem = {
      id: Date.now().toString(),
      term,
      definition,
      timestamp: new Date()
    };
    setGlossary(prev => [...prev, newItem]);
  };

  const handleRemoveFromGlossary = (id: string) => {
    setGlossary(prev => prev.filter(item => item.id !== id));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      setError(`The selected file is too large (${sizeInMB}MB). Please upload a file smaller than 5.0MB to ensure optimal processing speed and accuracy.`);
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError("Unsupported file format. Please upload an image (JPEG, PNG, WebP) or a PDF document for analysis.");
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      setError("We encountered an issue reading your file. Please try selecting it again.");
    };
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(',')[1];
      setSelectedFile({
        data: base64Data,
        mimeType: file.type
      });
      setError(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleCloseTutorial = () => {
    setIsTutorialOpen(false);
    localStorage.setItem(TUTORIAL_KEY, 'true');
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition is not supported in your browser. Please try a modern browser like Chrome.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setError(null);
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setIsRecording(false);
        setError("Microphone access was denied. Please check your browser's security settings.");
      }
    }
  };

  const sendMessage = async (text: string, file?: FileData | null) => {
    if ((!text.trim() && !file) || isLoading) return;

    if (isRecording) {
      recognitionRef.current.stop();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text || (file?.mimeType.startsWith('image/') ? "[Sent Image]" : "[Sent Document]"),
      timestamp: new Date(),
      attachment: file || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedFile(null);
    setIsLoading(true);
    setError(null);

    try {
      const history = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user' as 'model' | 'user',
        parts: [{ text: msg.content }]
      }));

      const responseText = await getGeminiResponse(
        text || "Please analyze this attached content.", 
        history, 
        file || undefined,
        selectedModel
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The Mastery Engine encountered a network issue. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    sendMessage(input, selectedFile);
  };

  const handleSelectTopic = (topic: string) => {
    sendMessage(`Tell me about the concept of: ${topic}`);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} isDarkMode={isDarkMode} />;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[300] bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold">
        Skip to main content
      </a>

      <header role="banner" className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between shadow-sm z-10 transition-colors duration-300">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="hidden xs:block">
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight transition-colors text-nowrap">Mastery Engine</h1>
              {showSavedIndicator && (
                <span role="status" aria-live="polite" className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full animate-in fade-in slide-in-from-top-1 duration-500">
                  SAVED
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center transition-colors uppercase tracking-wider">
              <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${showSavedIndicator ? 'bg-emerald-500' : 'bg-indigo-500 animate-pulse'}`} aria-hidden="true"></span>
              Active Analysis
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 md:space-x-5">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsInfoOpen(true)}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hidden xs:flex"
              title="Project Info & Deployment"
              aria-label="Project Information"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            <button 
              onClick={() => setIsTutorialOpen(true)}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hidden sm:flex"
              title="Help & Tutorial"
              aria-label="Help and Tutorial"
              aria-expanded={isTutorialOpen}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            <button 
              onClick={() => setIsGlossaryOpen(true)}
              className="relative p-2 rounded-full text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-all"
              title="Open Glossary"
              aria-label="Open Academic Glossary"
              aria-expanded={isGlossaryOpen}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {glossary.length > 0 && (
                <span className="absolute top-0 right-0 h-2 w-2 bg-indigo-500 rounded-full border border-white dark:border-slate-900" aria-hidden="true"></span>
              )}
            </button>

            <div className="relative group hidden xs:block">
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                aria-label="Select Intelligence Model"
                className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-1.5 pr-8 text-xs font-bold text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-all hover:bg-white dark:hover:bg-slate-750"
              >
                {MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all hidden sm:flex"
              aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 18v1m9-11h1m-18 0h1m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button 
              onClick={() => setIsConfirmClearOpen(true)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-xs font-bold"
              aria-label="Clear Chat History"
              title="Clear all chat history"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="hidden sm:inline">Clear History</span>
            </button>
          </div>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" aria-hidden="true"></div>

          {userProfile && (
            <div className="flex items-center space-x-3">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{userProfile.name}</p>
                <p className="text-[9px] text-slate-500 dark:text-slate-500 uppercase tracking-widest">{userProfile.email}</p>
              </div>
              <button 
                onClick={handleLogout} 
                className="relative group cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full"
                aria-label={`User profile for ${userProfile.name}. Click to log out.`}
                title="Log out"
              >
                <img 
                  src={userProfile.picture} 
                  alt="" 
                  className="h-9 w-9 rounded-full border-2 border-indigo-100 dark:border-slate-700 shadow-sm group-hover:opacity-75 transition-opacity"
                />
                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-0.5 shadow-sm border border-slate-100 dark:border-slate-800" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-slate-400 group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
              </button>
            </div>
          )}
        </div>
      </header>

      <main id="main-content" role="main" className="flex-1 overflow-y-auto px-4 py-8 md:px-12 custom-scrollbar transition-colors">
        <div className="max-w-4xl mx-auto" role="log" aria-live="polite" aria-relevant="additions">
          {messages.map((msg) => (
            <ChatMessage 
              key={msg.id} 
              message={msg} 
              onSelectTopic={handleSelectTopic}
              isDarkMode={isDarkMode}
            />
          ))}
          
          {isLoading && (
            <div className="flex justify-start mb-6 animate-pulse" aria-label="Engine is thinking">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 mr-3 flex items-center justify-center" aria-hidden="true">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">ME</span>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-tl-none px-6 py-4 shadow-sm">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                  <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                </div>
                <span className="sr-only">Mastery Engine is analyzing...</span>
              </div>
            </div>
          )}

          {error && (
            <div role="alert" className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-300 rounded-xl mb-6 text-sm flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold mb-1">Attention Required</p>
                <p className="text-xs leading-relaxed opacity-90">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="mt-3 text-[10px] font-bold uppercase tracking-widest text-red-700 dark:text-red-400 hover:underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer role="contentinfo" className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 md:p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors">
        <div className="max-w-4xl mx-auto">
          {/* Input Header with Undo/Redo */}
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleUndo}
                disabled={historyIndex === 0}
                title="Undo (Ctrl+Z)"
                className={`p-1 rounded-md transition-all ${historyIndex === 0 ? 'text-slate-200 dark:text-slate-800' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l5 5m-5-5l5-5" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={historyIndex >= inputHistory.length - 1}
                title="Redo (Ctrl+Shift+Z)"
                className={`p-1 rounded-md transition-all ${historyIndex >= inputHistory.length - 1 ? 'text-slate-200 dark:text-slate-800' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2M21 10l-5 5m5-5l-5-5" />
                </svg>
              </button>
            </div>
            {selectedFile && (
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest animate-pulse">File Ready</span>
            )}
          </div>

          {selectedFile && (
            <div className="mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="relative inline-block">
                {selectedFile.mimeType.startsWith('image/') ? (
                  <img 
                    src={`data:${selectedFile.mimeType};base64,${selectedFile.data}`} 
                    alt="Uploaded image preview" 
                    className="h-20 w-20 object-cover rounded-lg border-2 border-indigo-500 shadow-md"
                  />
                ) : (
                  <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg border-2 border-indigo-500 shadow-md flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-label="PDF Document attached">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
                <button 
                  onClick={removeFile}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  aria-label="Remove attached file"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSend} className="flex items-center space-x-3">
            <div className="relative flex-1 group">
              <label htmlFor="academic-input" className="sr-only">Type your academic question</label>
              <input
                id="academic-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isRecording ? "Listening to your question..." : "Ask or describe the image/document..."}
                className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-28 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${isRecording ? 'border-red-300 ring-2 ring-red-500/10 dark:border-red-900' : ''}`}
                disabled={isLoading}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                  title="Upload image or document (Max 5MB)"
                  aria-label="Upload academic source (image or PDF, max 5MB)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                />
                <button 
                  type="button"
                  onClick={toggleVoiceInput}
                  aria-label={isRecording ? "Stop voice input" : "Start voice input"}
                  className={`p-2 rounded-lg transition-all ${isRecording ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 animate-pulse' : 'text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                >
                  {isRecording ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={(!input.trim() && !selectedFile) || isLoading}
              aria-label="Send Inquiry"
              className={`flex items-center justify-center h-12 w-12 rounded-xl transition-all shadow-md
                ${(!input.trim() && !selectedFile) || isLoading 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-95'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
          <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-3 uppercase tracking-widest font-bold">
            Mastery Engine: {MODELS.find(m => m.id === selectedModel)?.name} • Concept &gt; Answer • Max 5MB
          </p>
        </div>
      </footer>

      <Glossary 
        items={glossary} 
        isOpen={isGlossaryOpen} 
        onClose={() => setIsGlossaryOpen(false)} 
        onRemove={handleRemoveFromGlossary}
        onAdd={handleAddToGlossary}
        isDarkMode={isDarkMode}
      />

      <TutorialOverlay 
        isOpen={isTutorialOpen}
        onClose={handleCloseTutorial}
        isDarkMode={isDarkMode}
      />

      <ProjectInfoModal 
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        isDarkMode={isDarkMode}
      />

      <ConfirmationModal
        isOpen={isConfirmClearOpen}
        onClose={() => setIsConfirmClearOpen(false)}
        onConfirm={handleClearHistory}
        title="Clear Analysis History?"
        message="This action will permanently delete your current session history and cannot be undone. Your Glossary items will remain safe."
        confirmLabel="Yes, Clear Everything"
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default App;