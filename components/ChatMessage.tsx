
import React, { useState, useRef, useMemo } from 'react';
import { Message } from '../types';
import { prepareSpeechText, getGeminiTTS } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audio';
import Diagram from './Diagram';

interface ChatMessageProps {
  message: Message;
  onSelectTopic?: (topic: string) => void;
  onRefineConcept?: (lens: string) => void;
  onHarvestConcept?: (content: string) => void;
  isDarkMode?: boolean;
}

const sanitizeText = (text: string) => {
  return text.replace(/DEEP_LEARNING_TOPICS[\s\S]*?$/g, '').trim();
};

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  onSelectTopic, 
  onRefineConcept, 
  onHarvestConcept,
  isDarkMode 
}) => {
  const isAssistant = message.role === 'assistant';
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleCopy = async () => {
    try {
      const cleanContent = message.content
        .replace(/DEEP_LEARNING_TOPICS[\s\S]*?$/g, '');
      await navigator.clipboard.writeText(cleanContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) { console.error('Copy failed: ', err); }
  };

  const handleToggleSpeech = async () => {
    if (isSpeaking) {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
      }
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = prepareSpeechText(message.content);
    if (!textToSpeak) return;

    setIsSpeaking(true);
    try {
      const base64Audio = await getGeminiTTS(textToSpeak);
      if (!base64Audio) {
        setIsSpeaking(false);
        return;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => { setIsSpeaking(false); audioSourceRef.current = null; };
      audioSourceRef.current = source;
      source.start(0);
    } catch (err) {
      console.error('Gemini TTS failed:', err);
      setIsSpeaking(false);
    }
  };

  const extractTopics = (content: string) => {
    const match = content.match(/DEEP_LEARNING_TOPICS\s*(.*)/i);
    return match && match[1] ? match[1].split(',').map(t => t.trim()) : [];
  };

  const topics = isAssistant ? extractTopics(message.content) : [];
  const mainContent = sanitizeText(message.content);

  const renderContent = (text: string) => {
    // Detect Mermaid blocks or the "CONCEPT MAP" section content
    const sections = text.split(/(1\.\sTHE\sCORE\sPRINCIPLE|2\.\sMENTAL\sMODEL\s\(ANALOGY\)|3\.\sTHE\sDIRECT\sANSWER|4\.\sCONCEPT\sMAP)/g);
    
    let isMapSection = false;
    let isCorePrinciple = false;

    return sections.map((part, i) => {
      const trimmed = part.trim();
      if (!trimmed) return null;

      // Handle Headers
      if (trimmed.match(/^[1-4]\.\s[A-Z\s()]+/)) {
        isMapSection = trimmed.includes('CONCEPT MAP');
        isCorePrinciple = trimmed.includes('CORE PRINCIPLE');
        return (
          <div key={i} className="mt-8 mb-4 flex items-center space-x-2 group/header">
            <span className={`flex-shrink-0 h-6 w-6 rounded-lg text-[10px] font-black flex items-center justify-center border shadow-sm ${
              isCorePrinciple 
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-500/20' 
                : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
            }`}>
              {trimmed.charAt(0)}
            </span>
            <h4 className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${
              isCorePrinciple 
                ? 'text-indigo-600 dark:text-indigo-400' 
                : 'text-slate-400 dark:text-slate-500 group-hover/header:text-indigo-500'
            }`}>
              {trimmed.substring(3)}
            </h4>
            <div className={`flex-1 h-px ${isCorePrinciple ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-slate-100 dark:bg-slate-800/50'}`}></div>
          </div>
        );
      }

      // Special rendering for Concept Map content (Mermaid)
      if (isMapSection) {
        const mermaidMatch = trimmed.match(/(graph|flowchart)\s+[\s\S]+/i);
        if (mermaidMatch) {
           return <Diagram key={i} chart={mermaidMatch[0]} isDarkMode={isDarkMode} />;
        }
        return (
          <div key={i} className="my-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logic Map Unavailable</p>
          </div>
        );
      }

      // Regular Text
      return (
        <div 
          key={i} 
          className={`whitespace-pre-wrap leading-relaxed mb-6 last:mb-0 text-[13px] md:text-[14.5px] font-medium transition-all duration-500 ${
            isCorePrinciple 
              ? 'text-slate-900 dark:text-slate-100 bg-indigo-50/20 dark:bg-indigo-950/20 p-6 rounded-[2rem] border border-indigo-100/50 dark:border-indigo-900/10 shadow-inner' 
              : 'text-slate-700 dark:text-slate-300'
          }`}
        >
          {trimmed}
        </div>
      );
    });
  };

  return (
    <div className={`flex w-full mb-10 md:mb-16 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[95%] md:max-w-[90%] ${isAssistant ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`flex-shrink-0 h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl transform transition-transform hover:rotate-6 mt-1 ${isAssistant ? 'bg-indigo-600 mr-4 md:mr-6 shadow-indigo-500/30' : 'bg-slate-800 ml-4 md:ml-6 shadow-slate-500/10'}`}>
          {isAssistant ? (
            <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          ) : <span className="text-white text-[10px] md:text-[12px] font-black uppercase tracking-tighter">Student</span>}
        </div>
        
        <div className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}>
          <div className={`relative px-6 py-8 md:px-12 md:py-12 rounded-[2rem] md:rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border transition-all duration-300 ${isAssistant ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-tl-none' : 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none'}`}>
            <div className="max-w-none">
              {message.attachment && <div className="mb-8"><img src={`data:${message.attachment.mimeType};base64,${message.attachment.data}`} className="max-w-full rounded-[2.5rem] shadow-2xl border-4 border-white dark:border-slate-800" alt="Context" /></div>}
              {renderContent(mainContent)}
            </div>

            {isAssistant && (
              <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800/50 space-y-8">
                {topics.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-6">
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] font-display">Expansion Nodes</span>
                    </div>
                    <nav className="flex flex-wrap gap-3 md:gap-5">
                      {topics.map((topic, i) => (
                        <button 
                          key={i} 
                          onClick={() => onSelectTopic?.(topic)}
                          className="relative group/node px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all active:scale-95 hover:shadow-lg hover:shadow-indigo-500/5"
                        >
                          <div className="flex items-center space-x-3">
                            <svg className="w-4 h-4 text-indigo-500/60 transition-transform group-hover/node:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            <span className="text-[10px] md:text-[12px] font-black text-slate-600 dark:text-slate-200 group-hover/node:text-indigo-600 dark:group-hover/node:text-indigo-400 uppercase transition-colors">{topic}</span>
                          </div>
                        </button>
                      ))}
                    </nav>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex space-x-3">
                    <button onClick={() => onRefineConcept?.('First Principles')} className="px-5 py-2.5 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all rounded-xl font-display uppercase tracking-widest active:scale-95 shadow-sm">
                      Deconstruct Logic
                    </button>
                    <button onClick={() => onRefineConcept?.('Practical Application')} className="px-5 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all rounded-xl font-display uppercase tracking-widest active:scale-95 shadow-sm">
                      Application
                    </button>
                  </div>

                  <div className="flex items-center space-x-5 ml-auto sm:ml-0">
                    <button onClick={() => onHarvestConcept?.(mainContent)} className="p-2 text-slate-300 hover:text-amber-500 transition-all transform hover:scale-110" title="Add to Library">
                      <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                    </button>
                    <button onClick={handleToggleSpeech} className={`p-2 rounded-xl transition-all transform hover:scale-110 ${isSpeaking ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-300 hover:text-indigo-500'}`} title="Speak Concept">
                      <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                    </button>
                    <button onClick={handleCopy} className="text-[10px] font-black text-slate-300 hover:text-indigo-600 transition-colors uppercase tracking-[0.2em] px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                      {copied ? 'Captured' : 'Capture'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <time className="text-[9px] font-black text-slate-300 dark:text-slate-600 mt-4 font-display uppercase tracking-widest opacity-60 flex items-center">
            <svg className="w-2.5 h-2.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </time>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
