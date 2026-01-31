import React, { useState } from 'react';
import { PlayCircle, X, ExternalLink, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LiteCard = ({ title, url, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const handleClose = () => {
    setIsVisible(false);
    // Wait for exit animation
    setTimeout(onClose, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ x: 100, opacity: 0, scale: 0.9 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 100, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className="fixed top-[80px] right-6 z-[10000] pointer-events-auto"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 rounded-2xl opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-500"></div>
            
            {/* Main Card */}
            <div className="relative flex items-center gap-3 px-5 py-3.5 bg-gradient-to-br from-black via-slate-950 to-slate-900 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/40 rounded-2xl hover:border-yellow-500/40 transition-all duration-300 overflow-hidden">
              
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-yellow-400/5 to-yellow-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Icon */}
              <div className="relative shrink-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/40 text-black">
                  <PlayCircle size={18} fill="currentColor" className="opacity-90" strokeWidth={0} />
                </div>
                <motion.div 
                  className="absolute -top-1 -right-1 w-3 h-3"
                  animate={{ scale: isHovered ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.5, repeat: isHovered ? Infinity : 0 }}
                >
                  <Sparkles size={12} className="text-yellow-400" fill="currentColor" />
                </motion.div>
              </div>
              
              {/* Content */}
              <div className="relative flex-1 min-w-0">
                <div className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider mb-0.5">
                  Playlist Found
                </div>
                <a 
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 group/link max-w-[240px]"
                  title={title}
                >
                  <span className="text-sm font-bold text-white truncate group-hover/link:text-yellow-300 transition-colors">
                    {title}
                  </span>
                  <ExternalLink size={12} className="text-slate-500 group-hover/link:text-yellow-400 transition-colors shrink-0" />
                </a>
              </div>

              {/* Close Button */}
              <button 
                onClick={handleClose}
                className="relative shrink-0 p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all hover:rotate-90 duration-300"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LiteCard;
