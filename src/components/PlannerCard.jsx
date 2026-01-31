import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Calendar, Clock, FastForward, 
  Edit2, Save, PlayCircle, Hash
} from 'lucide-react';
import { motion } from 'framer-motion';
import TimeUtils from '../utils/timeUtils';
import StorageUtils from '../utils/storageUtils';

const SPEEDS = [1, 1.25, 1.5, 1.75, 2];
const DAILY_MINUTES_PRESETS = [15, 30, 45, 60, 90, 120];

const PlannerCard = ({ data, loading, error, onClose }) => {
  const [speed, setSpeed] = useState(1.25);
  const [dailyMinutes, setDailyMinutes] = useState(30);
  const [customName, setCustomName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  
  // Load saved settings
  useEffect(() => {
    if (data?.id) {
      StorageUtils.getPlaylist(data.id).then(saved => {
        if (saved && saved.customName) {
          setCustomName(saved.customName);
        } else {
          setCustomName(data.title || 'Untitled Playlist');
        }
      });
    }
  }, [data]);

  const handleSaveName = async () => {
    setIsEditingName(false);
    if (data?.id) {
       const saved = await StorageUtils.getPlaylist(data.id) || {};
       await StorageUtils.savePlaylist(data.id, { ...saved, customName });
    }
  };

  const stats = useMemo(() => {
    if (!data?.statistics) return null;
    const { remainingDuration, watchedCount, totalVideos } = data.statistics;
    
    const adjustedRemaining = Math.ceil(remainingDuration / speed);
    const daysToFinish = Math.ceil((adjustedRemaining / 60) / dailyMinutes);
    const completionDate = TimeUtils.calculateCompletionDate(daysToFinish);
    
    const percentComplete = totalVideos > 0 
        ? Math.round((watchedCount / totalVideos) * 100) 
        : 0;

    return { adjustedRemaining, daysToFinish, completionDate, percentComplete, watchedCount, totalVideos };
  }, [data, speed, dailyMinutes]);

  if (loading) return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="fixed top-24 right-6 w-[380px] z-[9999] bg-slate-900/95 backdrop-blur-xl rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px] border border-white/10 shadow-2xl"
    >
      <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 text-sm font-medium tracking-wide">ANALYZING PLAYLIST...</p>
    </motion.div>
  );

  if (error) return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-24 right-6 w-[380px] z-[9999] bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6 border-l-4 border-red-500 shadow-2xl border-y border-r border-white/10"
    >
      <div className="flex justify-between items-start">
        <h3 className="text-red-400 font-bold text-lg mb-2 flex items-center gap-2">
          <span>Error</span>
        </h3>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
          <X size={20}/>
        </button>
      </div>
      <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
    </motion.div>
  );

  if (!data || !stats) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", duration: 0.5 }}
      className="fixed top-[80px] right-6 w-[380px] z-[10000] font-sans"
    >
      <div className="bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10 ring-1 ring-black/40">
        
        {/* Header Section */}
        <div className="relative p-6 pb-8 bg-gradient-to-br from-indigo-900/50 via-purple-900/20 to-slate-900/50">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400">
                <PlayCircle size={14} fill="currentColor" className="opacity-80" />
              </span>
              <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">Playlist Planner</span>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Title */}
          <div className="relative z-10 mb-6">
             {isEditingName ? (
                <div className="flex items-center gap-2 bg-black/20 p-1 rounded-lg border border-white/10 focus-within:border-indigo-500/50 transition-colors">
                  <input 
                    type="text" 
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="flex-1 bg-transparent border-none text-white text-lg font-bold px-2 py-1 focus:ring-0 placeholder-white/20"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  />
                  <button onClick={handleSaveName} className="p-2 hover:bg-indigo-500 rounded-md text-slate-400 hover:text-white transition-colors">
                    <Save size={16}/>
                  </button>
                </div>
              ) : (
                <div className="group flex items-start gap-2">
                  <h2 className="text-xl font-bold text-white leading-tight line-clamp-2" title={customName}>
                    {customName}
                  </h2>
                  <button 
                    onClick={() => setIsEditingName(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white"
                  >
                    <Edit2 size={12} />
                  </button>
                </div>
              )}
          </div>

          {/* Progress Bar & Stats */}
          <div className="relative z-10">
             <div className="flex justify-between text-xs font-medium text-slate-400 mb-2">
                <span className="text-white">{stats.percentComplete}% <span className="text-slate-500">Completed</span></span>
                <span>{stats.watchedCount} <span className="text-slate-600">/</span> {stats.totalVideos}</span>
             </div>
             <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.percentComplete}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                />
             </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 -mt-4 bg-slate-900/50 relative z-20 rounded-t-3xl border-t border-white/5">
          
          {/* Main Stat Card */}
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 rounded-2xl p-5 border border-indigo-500/10">
             <div className="flex items-center gap-3 mb-2 text-indigo-400">
                <Calendar size={18} />
                <span className="text-xs font-bold uppercase tracking-wide opacity-80">Estimated Finish</span>
             </div>
             <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white tracking-tight">
                  {Math.abs(stats.daysToFinish) === Infinity ? '∞' : stats.daysToFinish}
                </span>
                <span className="text-sm font-medium text-slate-400">days left</span>
             </div>
             <div className="mt-2 text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                Target: <span className="text-slate-300">{TimeUtils.formatDate(stats.completionDate)}</span>
             </div>
          </div>

          {/* Controls */}
          <div className="space-y-5">
             {/* Playback Speed */}
             <div>
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wide">
                   <FastForward size={14} className="text-purple-400" />
                   <span>Playback Speed</span>
                </div>
                <div className="flex gap-2 p-1 bg-slate-800/50 rounded-xl border border-white/5">
                   {SPEEDS.map(s => (
                     <motion.button
                       key={s}
                       onClick={() => setSpeed(s)}
                       whileTap={{ scale: 0.95 }}
                       className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                         speed === s 
                           ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                           : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                       }`}
                     >
                       {s}x
                     </motion.button>
                   ))}
                </div>
             </div>

             {/* Daily Goal */}
             <div>
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-400 uppercase tracking-wide">
                   <div className="flex items-center gap-2">
                      <Clock size={14} className="text-pink-400" />
                      <span>Daily Goal ({dailyMinutes}m)</span>
                   </div>
                </div>
                <div className="grid grid-cols-6 gap-2 mb-3">
                   {DAILY_MINUTES_PRESETS.map(m => (
                     <motion.button
                       key={m}
                       onClick={() => setDailyMinutes(m)}
                       whileTap={{ scale: 0.9 }}
                       className={`h-8 rounded-lg text-xs font-bold transition-all border ${
                         dailyMinutes === m
                           ? 'bg-white text-indigo-900 border-white'
                           : 'bg-slate-800/50 text-slate-500 border-white/5 hover:border-white/20 hover:text-slate-300'
                       }`}
                     >
                       {m}
                     </motion.button>
                   ))}
                </div>
                {/* Custom Input */}
                <div className="relative group">
                    <input 
                      type="number" 
                      value={dailyMinutes}
                      onChange={(e) => setDailyMinutes(Number(e.target.value) || 0)}
                      className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-slate-600"
                      placeholder="Custom minutes..."
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">min/day</span>
                </div>
             </div>
          </div>

          <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
               <div className="bg-slate-800/30 p-3 rounded-xl border border-white/5">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Total Time</div>
                  <div className="text-sm font-bold text-slate-200">
                    {TimeUtils.formatDuration(stats.adjustedRemaining, true)}
                  </div>
               </div>
               <div className="bg-slate-800/30 p-3 rounded-xl border border-white/5">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Videos Left</div>
                  <div className="text-sm font-bold text-slate-200">
                    {stats.totalVideos - stats.watchedCount}
                  </div>
               </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default PlannerCard;
