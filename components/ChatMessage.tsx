
import React, { useState, useRef } from 'react';
import { Message } from '../types';
import Diagram from './Diagram';
import { generateSpeech } from '../services/geminiService';

interface ChatMessageProps {
  message: Message;
  onSelectTopic?: (topic: string) => void;
  isDarkMode?: boolean;
}

const decodeBase64 = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSelectTopic, isDarkMode }) => {
  const isAssistant = message.role === 'assistant';
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechLoading, setIsSpeechLoading] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const handleCopy = async () => {
    try {
      const cleanContent = message.content
        .replace(/```mermaid[\s\S]*?```/g, '[Diagram]')
        .replace(/\[RELATED_TOPICS:[\s\S]*?\]/g, '');
      await navigator.clipboard.writeText(cleanContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleToggleSpeech = async () => {
    if (isSpeaking) {
      sourceNodeRef.current?.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeechLoading(true);
    try {
      const base64Audio = await generateSpeech(message.content);
      if (!base64Audio) throw new Error("Failed to generate speech");

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const audioData = decodeBase64(base64Audio);
      const audioBuffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        setIsSpeaking(false);
      };

      sourceNodeRef.current = source;
      source.start();
      setIsSpeaking(true);
    } catch (err) {
      console.error("Speech playback error:", err);
    } finally {
      setIsSpeechLoading(false);
    }
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(feedback === type ? null : type);
  };

  const extractTopics = (content: string) => {
    const match = content.match(/\[RELATED_TOPICS:\s*(.*?)\]/);
    if (match && match[1]) {
      return match[1].split(',').map(t => t.trim());
    }
    return [];
  };

  const topics = isAssistant ? extractTopics(message.content) : [];
  const mainContent = message.content.replace(/\[RELATED_TOPICS:[\s\S]*?\]/g, '').trim();

  const renderBody = () => {
    const parts = mainContent.split(/(```mermaid[\s\S]*?```)/g);
    
    return (
      <div className="space-y-4">
        {message.attachment && (
          <div className="mb-4">
            {message.attachment.mimeType.startsWith('image/') ? (
              <img 
                src={`data:${message.attachment.mimeType};base64,${message.attachment.data}`} 
                alt="Image uploaded by user" 
                className="max-w-full rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 max-h-80 object-contain bg-slate-50 dark:bg-slate-800"
              />
            ) : (
              <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Document analysis complete</span>
              </div>
            )}
          </div>
        )}
        {parts.map((part, index) => {
          if (part.startsWith('```mermaid')) {
            const chart = part.replace(/```mermaid/g, '').replace(/```/g, '').trim();
            return <Diagram key={index} chart={chart} isDarkMode={isDarkMode} />;
          }
          return <div key={index} className="whitespace-pre-wrap">{part}</div>;
        })}
      </div>
    );
  };

  return (
    <div className={`flex w-full mb-6 ${isAssistant ? 'justify-start' : 'justify-end'}`} role="article">
      <div className={`flex max-w-[95%] md:max-w-[80%] ${isAssistant ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm transition-colors
          ${isAssistant ? 'bg-indigo-600 mr-3' : 'bg-emerald-600 ml-3'}`} aria-hidden="true">
          {isAssistant ? 'AE' : 'ME'}
        </div>
        <div className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}>
          <div className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm group transition-all duration-300
            ${isAssistant 
              ? 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 rounded-tl-none' 
              : 'bg-indigo-600 text-white rounded-tr-none'}`}>
            
            <div className={`prose prose-sm max-w-none ${isDarkMode ? 'prose-invert' : ''}`}>
              {renderBody()}
            </div>

            {isAssistant && topics.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
                  Follow-up Concepts
                </span>
                <nav className="flex flex-wrap gap-2" aria-label="Suggested concepts">
                  {topics.map((topic, i) => (
                    <button
                      key={i}
                      onClick={() => onSelectTopic?.(topic)}
                      className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-full border border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all active:scale-95 focus:ring-2 focus:ring-indigo-500"
                    >
                      {topic}
                    </button>
                  ))}
                </nav>
              </div>
            )}
            
            {isAssistant && (
              <div className="mt-2 pt-2 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleFeedback('up')}
                    aria-label="Mark explanation as helpful"
                    aria-pressed={feedback === 'up'}
                    className={`p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${feedback === 'up' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-indigo-500'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={feedback === 'up' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.708C19.743 10 20.5 10.842 20.5 11.854c0 .487-.194.948-.533 1.287l-6.039 6.039a2.103 2.103 0 01-1.487.616H8.5c-1.105 0-2-.895-2-2v-7c0-.53.21-1.04.586-1.414l4.828-4.828a2 2 0 012.828 0c.2.2.343.435.414.69l.844 3.376c.07.28.07.56.07.842V10z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleFeedback('down')}
                    aria-label="Mark explanation as not helpful"
                    aria-pressed={feedback === 'down'}
                    className={`p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 ${feedback === 'down' ? 'text-red-500' : 'text-slate-400 dark:text-slate-500 hover:text-red-400'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={feedback === 'down' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.292C4.257 14 3.5 13.158 3.5 12.146c0-.487.194-.948.533-1.287l6.039-6.039c.394-.394.93-.616 1.487-.616H15.5c1.105 0 2 .895 2 2v7c0 .53-.21 1.04-.586 1.414l-4.828 4.828a2 2 0 01-2.828 0 2.001 2.001 0 01-.414-.69l-.844-3.376c-.07-.28-.07-.56-.07-.842V14z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={handleToggleSpeech}
                    disabled={isSpeechLoading}
                    aria-label={isSpeaking ? "Stop text-to-speech explanation" : "Read explanation aloud"}
                    className={`p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 relative ${isSpeaking ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-indigo-500'}`}
                  >
                    {isSpeechLoading ? (
                      <div className="h-4 w-4 border-2 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                    ) : isSpeaking ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    )}
                  </button>

                  {feedback && (
                    <span role="status" className="text-[10px] font-bold text-slate-400 dark:text-slate-500 animate-in fade-in slide-in-from-left-1 duration-300">
                      Feedback saved
                    </span>
                  )}
                </div>

                <button
                  onClick={handleCopy}
                  aria-label="Copy explanation to clipboard"
                  className="flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded p-1"
                >
                  {copied ? (
                    <>
                      <span className="text-indigo-600 dark:text-indigo-400 animate-in fade-in duration-200">Copied!</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-indigo-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">Copy</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-3 8h3m-3 4h3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
          <time className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider font-semibold">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </time>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
