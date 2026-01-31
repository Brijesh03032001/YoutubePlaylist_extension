import React, { useState, useEffect } from 'react';
import { BookOpen, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LiteCard = ({ title, url, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    // Wait for exit animation
    setTimeout(onClose, 400);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 50, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-[70px] right-6 z-[9999] pointer-events-auto"
        >
          <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-full hover:shadow-indigo-500/20 hover:border-indigo-500/30 transition-all group">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 text-white shrink-0">
              <BookOpen size={14} fill="currentColor" className="opacity-90" />
            </div>
            
            <a 
              href={url}
              className="max-w-[200px] text-sm font-semibold text-slate-200 truncate hover:text-white transition-colors no-underline pr-2"
              title={title}
            >
              {title}
            </a>

            <div className="w-px h-4 bg-white/10 mx-1"></div>

            <button 
              onClick={handleClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LiteCard;
