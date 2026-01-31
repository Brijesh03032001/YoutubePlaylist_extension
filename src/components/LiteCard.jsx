import React, { useState, useEffect } from 'react';
import { BookOpen, X, ExternalLink } from 'lucide-react';

const LiteCard = ({ title, url, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay for entrance animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <div 
      className={`fixed top-[70px] right-6 z-[9999] transition-all duration-500 ease-out transform pointer-events-auto
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}
    >
      <div className="flex items-center gap-3 px-4 py-2 bg-white/90 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-full hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-md text-white">
          <BookOpen size={14} />
        </div>
        
        <a 
          href={url}
          className="max-w-[200px] text-sm font-semibold text-slate-700 truncate hover:text-indigo-600 transition-colors no-underline"
          title={title}
        >
          {title}
        </a>

        <div className="w-px h-4 bg-slate-200 mx-1"></div>

        <button 
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default LiteCard;
