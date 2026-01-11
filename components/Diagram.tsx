
import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface DiagramProps {
  chart: string;
  isDarkMode?: boolean;
}

const Diagram: React.FC<DiagramProps> = ({ chart, isDarkMode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: isDarkMode ? 'dark' : 'base',
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
      },
      themeVariables: isDarkMode ? {
        primaryColor: '#818cf8',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#4f46e5',
        lineColor: '#94a3b8',
        secondaryColor: '#1e293b',
        tertiaryColor: '#0f172a',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
      } : {
        primaryColor: '#6366f1',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#4338ca',
        lineColor: '#64748b',
        secondaryColor: '#f1f5f9',
        tertiaryColor: '#f8fafc',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
      }
    });

    const renderDiagram = async () => {
      if (!containerRef.current || !chart.trim()) return;
      
      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const cleanChart = chart
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .trim();

        const { svg: renderedSvg } = await mermaid.render(id, cleanChart);
        setSvg(renderedSvg);
        setError(null);
      } catch (err) {
        console.error('Mermaid render error:', err);
        setError('Visual logic is too complex for diagramming.');
      }
    };

    renderDiagram();
  }, [chart, isDarkMode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsZoomed(!isZoomed);
    } else if (e.key === 'Escape' && isZoomed) {
      setIsZoomed(false);
    }
  };

  if (error) {
    return (
      <div role="status" className="text-[10px] text-slate-400 dark:text-slate-500 italic p-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950/50">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="my-6 relative group" role="region" aria-label="Conceptual Flowchart">
      <div 
        tabIndex={0}
        role="button"
        aria-label={isZoomed ? "Close expanded conceptual map" : "Click to expand conceptual map"}
        aria-expanded={isZoomed}
        onKeyDown={handleKeyDown}
        className={`bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-inner transition-all duration-500 cursor-zoom-in focus:outline-none focus:ring-4 focus:ring-indigo-500/50
          ${isZoomed ? 'fixed inset-4 z-[100] p-10 flex flex-col items-center justify-center bg-white/95 dark:bg-slate-950/95 backdrop-blur-md ring-4 ring-indigo-500/20' : 'p-4 md:p-6'}`}
        onClick={() => setIsZoomed(!isZoomed)}
      >
        <div 
          ref={containerRef} 
          aria-hidden="true"
          className={`mermaid flex justify-center w-full transition-transform duration-300 ${isZoomed ? 'scale-110 max-h-full' : 'max-h-[400px]'}`}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        
        <div className="mt-4 flex items-center justify-center space-x-3">
          <div className="h-px w-8 bg-slate-200 dark:bg-slate-800" aria-hidden="true"></div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest select-none">
            {isZoomed ? 'Esc to minimize' : 'Conceptual Analysis Map'}
          </span>
          <div className="h-px w-8 bg-slate-200 dark:bg-slate-800" aria-hidden="true"></div>
        </div>

        {!isZoomed && (
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
        )}
      </div>

      {isZoomed && (
        <div 
          className="fixed inset-0 z-[90] bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setIsZoomed(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default Diagram;
