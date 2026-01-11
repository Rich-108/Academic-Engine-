
import React, { useState } from 'react';
import { GlossaryItem } from '../types';

interface GlossaryProps {
  items: GlossaryItem[];
  onRemove: (id: string) => void;
  onAdd: (term: string, definition: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

const Glossary: React.FC<GlossaryProps> = ({ items, onRemove, onAdd, isOpen, onClose, isDarkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newTerm, setNewTerm] = useState('');
  const [newDef, setNewDef] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const filteredItems = items.filter(item => 
    item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.definition.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.term.localeCompare(b.term));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTerm.trim() && newDef.trim()) {
      onAdd(newTerm.trim(), newDef.trim());
      setNewTerm('');
      setNewDef('');
      setIsAdding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden" role="none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Panel */}
      <div 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="glossary-title"
        className={`relative w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col transition-transform duration-300 transform translate-x-0 ${isDarkMode ? 'dark' : ''}`}
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 id="glossary-title" className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Academic Glossary
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Your personal collection of mastered concepts.</p>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close Glossary"
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors focus:ring-2 focus:ring-indigo-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-950/50 space-y-4">
          <div className="relative">
            <label htmlFor="glossary-search" className="sr-only">Search terms in glossary</label>
            <input 
              id="glossary-search"
              type="text"
              placeholder="Search terms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <button 
            onClick={() => setIsAdding(!isAdding)}
            aria-expanded={isAdding}
            className="w-full py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold border border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center focus:ring-2 focus:ring-indigo-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Term
          </button>

          {isAdding && (
            <form onSubmit={handleAdd} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/50 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2">
              <div>
                <label htmlFor="new-term" className="sr-only">New Term Name</label>
                <input 
                  id="new-term"
                  autoFocus
                  type="text"
                  placeholder="Term (e.g., Photosynthesis)"
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="new-definition" className="sr-only">Term Definition</label>
                <textarea 
                  id="new-definition"
                  placeholder="Definition or explanation..."
                  value={newDef}
                  onChange={(e) => setNewDef(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20 resize-none"
                />
              </div>
              <div className="flex space-x-2">
                <button 
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
                >
                  Save to Glossary
                </button>
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" role="list">
          {filteredItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-2" role="status">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9l-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium text-slate-400">No matching terms found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map(item => (
                <div 
                  key={item.id} 
                  role="listitem"
                  className="group bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-indigo-600 dark:text-indigo-400">{item.term}</h3>
                    <button 
                      onClick={() => onRemove(item.id)}
                      aria-label={`Remove ${item.term} from glossary`}
                      className="p-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all focus:opacity-100 focus:ring-2 focus:ring-red-500 rounded"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                    {item.definition}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Glossary;
