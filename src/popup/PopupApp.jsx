import React, { useState, useEffect } from 'react';
import { BookOpen, Trash2, ExternalLink, Activity, PlayCircle, Clock, TrendingUp, Sparkles } from 'lucide-react';
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
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-black via-slate-950 to-slate-900">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-yellow-600/20 border-b-yellow-600 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
      </div>
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-black via-slate-950 to-slate-900 font-sans text-slate-200 overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-slow"></div>
        <div className="absolute bottom-0 -right-4 w-72 h-72 bg-yellow-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-slow" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 backdrop-blur-md border-b border-white/10 pb-5 pt-6 px-6">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="relative p-2.5 bg-gradient-to-br from-yellow-500 via-yellow-400 to-yellow-600 rounded-2xl shadow-lg shadow-yellow-500/30">
                    <Sparkles size={20} className="text-black" strokeWidth={2.5} />
                    <div className="absolute inset-0 bg-yellow-300 rounded-2xl animate-pulse opacity-20"></div>
                </div>
                <div>
                    <h1 className="text-xl font-black leading-none bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                      Playlist Planner
                    </h1>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1">Learning Made Simple</p>
                </div>
            </div>
            <div className="text-[10px] font-bold px-2.5 py-1 bg-white/5 rounded-lg border border-white/10 text-slate-400 backdrop-blur-sm">
                v1.0
            </div>
        </div>

        {/* Stats Row */}
        {playlists.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2"
          >
            <div className="flex-1 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 rounded-xl p-3 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={14} className="text-yellow-400" />
                <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wide">Active</span>
              </div>
              <div className="text-2xl font-black text-white">{playlists.length}</div>
            </div>
            <div className="flex-1 bg-gradient-to-br from-yellow-600/10 to-yellow-600/5 rounded-xl p-3 border border-yellow-600/20">
              <div className="flex items-center gap-2 mb-1">
                <PlayCircle size={14} className="text-yellow-400" />
                <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wide">Videos</span>
              </div>
              <div className="text-2xl font-black text-white">
                {playlists.reduce((sum, p) => sum + (p.videoCount || 0), 0)}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Content */}
      <motion.div 
        className="flex-1 overflow-y-auto p-5 space-y-3 relative z-10"
        variants={container}
        initial="hidden"
        animate="show"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(99, 102, 241, 0.3) transparent'
        }}
      >
        {playlists.length === 0 ? (
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="flex flex-col items-center justify-center h-full text-center px-6 py-12"
           >
               <div className="relative mb-6">
                 <div className="w-20 h-20 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-3xl flex items-center justify-center ring-1 ring-white/10 backdrop-blur-sm">
                    <Activity size={36} className="text-yellow-400" strokeWidth={1.5} />
                 </div>
                 <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center animate-bounce">
                   <Sparkles size={14} className="text-white" />
                 </div>
               </div>
               <h3 className="text-lg font-bold mb-2 bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">
                 No Playlists Yet
               </h3>
               <p className="text-sm text-slate-500 leading-relaxed mb-6 max-w-[280px]">
                 Visit any YouTube playlist and we'll automatically track your progress
               </p>
               <a 
                 href="https://youtube.com" 
                 target="_blank" 
                 rel="noreferrer"
                 className="group relative px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black text-sm font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 overflow-hidden"
               >
                 <span className="relative z-10 flex items-center gap-2">
                   Explore YouTube
                   <ExternalLink size={14} />
                 </span>
                 <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
               </a>
           </motion.div>
        ) : (
           <div className="space-y-3">
               {playlists.map((playlist, index) => {
                 const progress = Math.round((playlist.watchedCount / (playlist.videoCount || 1)) * 100);
                 const isComplete = progress === 100;
                 
                 return (
                   <motion.a 
                     key={playlist.id}
                     variants={item}
                     href={playlist.url}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="block group relative overflow-hidden"
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                   >
                       <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-yellow-400/10 to-yellow-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                       
                       <div className="relative bg-slate-900/40 backdrop-blur-sm hover:bg-slate-900/60 p-4 rounded-2xl border border-white/10 hover:border-yellow-500/30 transition-all">
                           {/* Badge for first item */}
                           {index === 0 && (
                             <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg">
                               RECENT
                             </div>
                           )}

                           <div className="flex justify-between items-start mb-3">
                               <h3 className="font-bold text-sm line-clamp-2 text-slate-200 group-hover:text-white transition-colors flex-1 pr-3 leading-snug">
                                 {playlist.customName || playlist.title}
                               </h3>
                               <ExternalLink size={16} className="text-slate-600 group-hover:text-yellow-400 transition-colors shrink-0 mt-0.5" />
                           </div>
                           
                           <div className="flex items-center gap-4 text-xs text-slate-500 mb-3.5">
                               <div className="flex items-center gap-1.5">
                                  <div className="p-1 bg-yellow-500/10 rounded-md">
                                    <PlayCircle size={12} className="text-yellow-400" />
                                  </div>
                                  <span className="font-medium">{playlist.videoCount} videos</span>
                               </div>
                               <div className="flex items-center gap-1.5">
                                  <div className="p-1 bg-yellow-600/10 rounded-md">
                                    <Clock size={12} className="text-yellow-400" />
                                  </div>
                                  <span className="font-medium">{TimeUtils.formatDuration(playlist.statistics?.totalDuration, true)}</span>
                               </div>
                           </div>

                           {/* Progress Bar */}
                           <div className="space-y-2">
                              <div className="flex justify-between text-[11px] font-bold">
                                  <span className={isComplete ? "text-green-400" : "text-yellow-400"}>
                                    {progress}% Complete
                                  </span>
                                  <span className="text-slate-600">{playlist.watchedCount}/{playlist.videoCount}</span>
                              </div>
                              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden ring-1 ring-white/5">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 }}
                                    className={`h-full rounded-full ${
                                      isComplete 
                                        ? "bg-gradient-to-r from-green-500 to-emerald-500 shadow-[0_0_12px_rgba(34,197,94,0.5)]"
                                        : "bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 shadow-[0_0_12px_rgba(234,179,8,0.5)]"
                                    }`}
                                  ></motion.div>
                              </div>
                           </div>
                       </div>
                   </motion.a>
                 );
               })}
           </div>
        )}
      </motion.div>

      {/* Footer */}
      <div className="relative z-10 bg-slate-950/50 backdrop-blur-md border-t border-white/10 p-4">
          <button 
            onClick={clearCache}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-white/5 hover:border-red-500/30"
          >
              <Trash2 size={14} />
              <span>Reset All Data</span>
          </button>
      </div>
    </div>
  );
};

export default PopupApp;
