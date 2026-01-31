import React, { useState, useEffect } from 'react';
import { BookOpen, Trash2, ExternalLink, Activity, PlayCircle, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StorageUtils from '../utils/storageUtils';
import TimeUtils from '../utils/timeUtils';

const PopupApp = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const handleChange = (changes, areaName) => {
        if (areaName === 'local') loadData();
    };
    chrome.storage.onChanged.addListener(handleChange);
    return () => chrome.storage.onChanged.removeListener(handleChange);
  }, []);

  const loadData = async () => {
    try {
      const allPlaylists = await StorageUtils.getAllPlaylists();
      const progress = await StorageUtils.get('ytpp_progress', {});
      
      const combined = Object.entries(allPlaylists).map(([id, data]) => {
         const p = progress[id] || {};
         return {
             ...data,
             watchedCount: p.watchedVideos?.length || 0,
             lastUpdated: data.lastUpdated || 0
         };
      });

      combined.sort((a, b) => b.lastUpdated - a.lastUpdated);
      setPlaylists(combined);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
      if (confirm('Clear all cached data?')) {
          await StorageUtils.clear();
          loadData();
      }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) return (
      <div className="flex items-center justify-center h-full bg-slate-900">
          <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-900 font-sans text-slate-200 overflow-hidden">
      {/* Header */}
      <div className="relative z-10 bg-slate-900/50 backdrop-blur-md border-b border-white/5 pb-4 pt-5 px-5">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 opacity-50 blur-xl"></div>
        <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20 text-white">
                    <BookOpen size={20} fill="currentColor" className="opacity-90" />
                </div>
                <div>
                    <h1 className="text-lg font-bold leading-none text-white tracking-wide">Playlist Planner</h1>
                    <p className="text-[10px] font-medium text-indigo-400 mt-1 uppercase tracking-wider">Your Learning Dashboard</p>
                </div>
            </div>
            <div className="text-[10px] font-bold px-2 py-1 bg-white/5 rounded-md border border-white/5 text-slate-500">
                v1.0.0
            </div>
        </div>
      </div>

      {/* Content */}
      <motion.div 
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {playlists.length === 0 ? (
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="flex flex-col items-center justify-center h-64 text-center p-6"
           >
               <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 ring-1 ring-white/10">
                  <Activity size={32} className="text-slate-600" />
               </div>
               <h3 className="text-slate-200 font-bold mb-2">No Playlists Tracked</h3>
               <p className="text-sm text-slate-500 leading-relaxed">
                 Visit a YouTube playlist and the extension will automatically analyze it for you.
               </p>
               <a 
                 href="https://youtube.com" 
                 target="_blank" 
                 rel="noreferrer"
                 className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors"
               >
                 Go to YouTube
               </a>
           </motion.div>
        ) : (
           <div className="space-y-4 pb-2">
               <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Activity</h2>
                  <span className="text-xs font-medium text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full">{playlists.length} Active</span>
               </div>
               
               {playlists.map(playlist => (
                   <motion.a 
                     key={playlist.id}
                     variants={item}
                     href={playlist.url}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="block bg-slate-800/40 hover:bg-slate-800/80 p-4 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all group relative overflow-hidden"
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                   >
                       {/* Hover Glow */}
                       <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                       <div className="relative z-10">
                           <div className="flex justify-between items-start mb-3">
                               <h3 className="font-bold text-sm line-clamp-1 text-slate-200 group-hover:text-white transition-colors flex-1 pr-4">
                                 {playlist.customName || playlist.title}
                               </h3>
                               <ExternalLink size={14} className="text-slate-500 group-hover:text-indigo-400 transition-colors shrink-0" />
                           </div>
                           
                           <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                               <div className="flex items-center gap-1">
                                  <PlayCircle size={12} />
                                  <span>{playlist.videoCount} videos</span>
                               </div>
                               <div className="flex items-center gap-1">
                                  <Clock size={12} />
                                  <span>{TimeUtils.formatDuration(playlist.statistics?.totalDuration, true)}</span>
                               </div>
                           </div>

                           {/* Progress Bar */}
                           <div className="space-y-1.5">
                              <div className="flex justify-between text-[10px] font-bold text-slate-500">
                                  <span className="text-indigo-400">{Math.round((playlist.watchedCount / (playlist.videoCount || 1)) * 100)}% Complete</span>
                                  <span>{playlist.watchedCount}/{playlist.videoCount}</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden ring-1 ring-white/5">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(playlist.watchedCount / (playlist.videoCount || 1)) * 100}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                                  ></motion.div>
                              </div>
                           </div>
                       </div>
                   </motion.a>
               ))}
           </div>
        )}
      </motion.div>

      {/* Footer */}
      <div className="bg-slate-900 border-t border-white/5 p-4 flex justify-between items-center z-10">
          <button 
            onClick={clearCache}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
              <Trash2 size={14} />
              <span>Reset Data</span>
          </button>
      </div>
    </div>
  );
};

export default PopupApp;
