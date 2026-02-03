import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Calendar, Clock, FastForward, 
  Edit2, Save, PlayCircle, Target, Zap, Trophy, TrendingUp, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TimeUtils from '../utils/timeUtils';
import StorageUtils from '../utils/storageUtils';

const SPEEDS = [1, 1.25, 1.5, 1.75, 2];
const DAILY_MINUTES_PRESETS = [60, 120, 150, 180, 210, 240];

const PlannerCard = ({ data, loading, error, onClose }) => {
  const [speed, setSpeed] = useState(1.25);
  const [dailyMinutes, setDailyMinutes] = useState(120);
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
    if (!data?.statistics) {
      console.log('[PlannerCard] No statistics data available');
      return null;
    }
    
    const { remainingDuration, watchedCount, totalVideos } = data.statistics;
    
    // Validate input values
    if (typeof remainingDuration !== 'number' || remainingDuration < 0) {
      console.error('[PlannerCard] Invalid remainingDuration:', remainingDuration);
      return null;
    }
    
    if (!dailyMinutes || dailyMinutes <= 0) {
      console.error('[PlannerCard] Invalid dailyMinutes:', dailyMinutes);
      return null;
    }
    
    if (!speed || speed <= 0) {
      console.error('[PlannerCard] Invalid speed:', speed);
      return null;
    }
    
    // Calculate adjusted remaining time (in seconds)
    const adjustedRemaining = Math.ceil(remainingDuration / speed);
    
    // Convert to minutes, then calculate days
    const adjustedMinutes = adjustedRemaining / 60;
    const daysToFinish = Math.ceil(adjustedMinutes / dailyMinutes);
    
    // Validate calculation results
    if (!isFinite(daysToFinish) || isNaN(daysToFinish)) {
      console.error('[PlannerCard] Invalid daysToFinish calculation:', {
        remainingDuration,
        speed,
        adjustedRemaining,
        adjustedMinutes,
        dailyMinutes,
        daysToFinish
      });
      return null;
    }
    
    const completionDate = TimeUtils.calculateCompletionDate(daysToFinish);
    
    const percentComplete = totalVideos > 0 
        ? Math.round((watchedCount / totalVideos) * 100) 
        : 0;

    console.log('[PlannerCard] Calculated stats:', {
      remainingDuration: `${remainingDuration}s (${(remainingDuration / 3600).toFixed(1)}h)`,
      speed: `${speed}x`,
      adjustedRemaining: `${adjustedRemaining}s (${(adjustedRemaining / 3600).toFixed(1)}h)`,
      dailyMinutes: `${dailyMinutes}min`,
      daysToFinish,
      percentComplete: `${percentComplete}%`,
      watchedCount,
      totalVideos
    });

    return { adjustedRemaining, daysToFinish, completionDate, percentComplete, watchedCount, totalVideos };
  }, [data, speed, dailyMinutes]);

  if (loading) return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="fixed top-20 right-6 w-[480px] z-[10000] bg-gradient-to-br from-black via-slate-950 to-slate-900 backdrop-blur-2xl rounded-3xl p-10 flex flex-col items-center justify-center min-h-[340px] border border-white/10 shadow-2xl shadow-yellow-900/20"
    >
      <div className="relative mb-4">
        <div className="w-14 h-14 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-14 h-14 border-4 border-yellow-600/20 border-b-yellow-600 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
      </div>
      <p className="text-slate-400 text-sm font-bold tracking-wide flex items-center gap-2">
        <Sparkles size={16} className="text-yellow-400" />
        ANALYZING PLAYLIST
      </p>
    </motion.div>
  );

  if (error) return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-20 right-6 w-[480px] z-[10000] bg-gradient-to-br from-black to-red-950/20 backdrop-blur-2xl rounded-3xl p-6 border border-red-500/30 shadow-2xl"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-500/10 rounded-xl">
            <X size={20} className="text-red-400" />
          </div>
          <h3 className="text-red-400 font-bold text-lg">Error</h3>
        </div>
        <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
          <X size={18}/>
        </button>
      </div>
      <p className="text-slate-400 text-sm leading-relaxed pl-12">{error}</p>
    </motion.div>
  );

  if (!data || !stats) {
    console.log('[PlannerCard] Not rendering - data:', data, 'stats:', stats);
    return null;
  }

  console.log('[PlannerCard] Rendering card with stats:', stats);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", duration: 0.5 }}
      className="fixed top-[80px] right-6 w-[480px] z-[10000] font-sans"
    >
      <div className="bg-gradient-to-br from-black via-slate-950 to-slate-900 backdrop-blur-3xl rounded-3xl shadow-[0_20px_70px_-15px_rgba(0,0,0,0.8)] overflow-hidden border border-white/10 ring-1 ring-black/40">
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500 rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-600 rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Header Section */}
        <div className="relative p-6 pb-6">
          <div className="flex justify-between items-start mb-5 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg shadow-yellow-500/30">
                <Target size={18} className="text-black" strokeWidth={2.5} />
              </div>
              <span className="text-xs font-black text-yellow-400 tracking-wider uppercase">Planner</span>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all hover:rotate-90 duration-300"
            >
              <X size={18} />
            </button>
          </div>

          {/* Title */}
          <div className="relative z-10 mb-6">
             {isEditingName ? (
                <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-xl border border-yellow-500/30 focus-within:border-yellow-500/60 transition-colors">
                  <input 
                    type="text" 
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="flex-1 bg-transparent border-none text-white text-lg font-bold px-2 py-1 focus:ring-0 placeholder-white/20"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  />
                  <button onClick={handleSaveName} className="p-2 hover:bg-yellow-500 rounded-lg text-slate-400 hover:text-white transition-colors">
                    <Save size={16}/>
                  </button>
                </div>
              ) : (
                <div className="group flex items-start gap-2">
                  <h2 className="text-2xl font-black text-white leading-tight line-clamp-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent" title={customName}>
                    {customName}
                  </h2>
                  <button 
                    onClick={() => setIsEditingName(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              )}
          </div>

          {/* Progress Section */}
          <div className="relative z-10 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl p-4 border border-indigo-500/20">
             <div className="flex justify-between items-center text-xs font-bold mb-3">
                <div className="flex items-center gap-2">
                  <Trophy size={14} className="text-yellow-400" />
                  <span className="text-white">{stats.percentComplete}% Complete</span>
                </div>
                <span className="text-slate-400">{stats.watchedCount} / {stats.totalVideos}</span>
             </div>
             <div className="relative h-2.5 bg-slate-900 rounded-full overflow-hidden ring-1 ring-black/20">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.percentComplete}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                </motion.div>
             </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="relative p-6 pt-0 space-y-5">
          
          {/* Main Stat Card */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative bg-gradient-to-br from-yellow-500/20 via-yellow-400/20 to-yellow-600/10 rounded-2xl p-6 border border-yellow-500/20 overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500 rounded-full filter blur-3xl opacity-20"></div>
             
             <div className="relative z-10">
               <div className="flex items-center gap-2.5 mb-3">
                  <div className="p-2 bg-yellow-500/20 rounded-xl">
                    <Calendar size={18} className="text-yellow-400" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-yellow-400">Finish Date</span>
               </div>
               <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-5xl font-black bg-gradient-to-r from-white via-yellow-200 to-yellow-300 bg-clip-text text-transparent tracking-tight">
                    {!isFinite(stats.daysToFinish) || isNaN(stats.daysToFinish) ? '∞' : stats.daysToFinish}
                  </span>
                  <span className="text-lg font-bold text-slate-400">days</span>
               </div>
               <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                  <span>{stats.completionDate ? TimeUtils.formatDate(stats.completionDate) : 'Set a daily goal'}</span>
               </div>
             </div>
          </motion.div>

          {/* Controls */}
          <div className="space-y-5">
             {/* Playback Speed */}
             <div>
                <div className="flex items-center gap-2.5 mb-3">
                   <div className="p-1.5 bg-yellow-500/10 rounded-lg">
                     <FastForward size={14} className="text-yellow-400" />
                   </div>
                   <span className="text-xs font-black text-slate-300 uppercase tracking-wider">Playback Speed</span>
                </div>
                <div className="flex gap-2 p-2 bg-slate-900/50 rounded-xl border border-white/5">
                   {SPEEDS.map(s => (
                     <motion.button
                       key={s}
                       onClick={() => setSpeed(s)}
                       whileTap={{ scale: 0.92 }}
                       whileHover={{ scale: 1.05 }}
                       className={`flex-1 py-2.5 rounded-lg text-sm font-black transition-all ${
                         speed === s 
                           ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg shadow-yellow-500/30 scale-105' 
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
                <div className="flex items-center gap-2.5 mb-3">
                   <div className="p-1.5 bg-yellow-500/10 rounded-lg">
                     <Clock size={14} className="text-yellow-400" />
                   </div>
                   <span className="text-xs font-black text-slate-300 uppercase tracking-wider">Daily Goal</span>
                   <span className="ml-auto text-xs font-bold text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-full">{dailyMinutes}m</span>
                </div>
                <div className="grid grid-cols-6 gap-2 mb-3">
                   {DAILY_MINUTES_PRESETS.map(m => (
                     <motion.button
                       key={m}
                       onClick={() => setDailyMinutes(m)}
                       whileTap={{ scale: 0.9 }}
                       whileHover={{ scale: 1.05 }}
                       className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                         dailyMinutes === m
                           ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black border-transparent shadow-lg shadow-yellow-500/30'
                           : 'bg-slate-900/50 text-slate-500 border-white/5 hover:border-yellow-500/30 hover:text-slate-300'
                       }`}
                     >
                       {m}
                     </motion.button>
                   ))}
                </div>
                {/* Custom Input */}
                <div className="relative">
                    <input 
                      type="number" 
                      value={dailyMinutes}
                      onChange={(e) => setDailyMinutes(Number(e.target.value) || 0)}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all placeholder-slate-600"
                      placeholder="Custom minutes..."
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold">min/day</span>
                </div>
             </div>
          </div>

          {/* Stats Grid */}
          <div className="pt-5 border-t border-white/5 grid grid-cols-2 gap-3">
               <div className="bg-slate-900/40 backdrop-blur-sm p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={12} className="text-yellow-400" />
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Time Left</div>
                  </div>
                  <div className="text-lg font-black text-white">
                    {TimeUtils.formatDuration(stats.adjustedRemaining, true)}
                  </div>
               </div>
               <div className="bg-slate-900/40 backdrop-blur-sm p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={12} className="text-green-400" />
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Videos Left</div>
                  </div>
                  <div className="text-lg font-black text-white">
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
