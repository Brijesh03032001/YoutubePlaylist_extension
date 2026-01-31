import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, CheckCircle, Clock, Calendar, 
  TrendingUp, Play, FastForward, Edit2, Save 
} from 'lucide-react';
import TimeUtils from '../utils/timeUtils';
import StorageUtils from '../utils/storageUtils';

const SPEEDS = [1, 1.25, 1.5, 1.75, 2];
const DAILY_MINUTES_PRESETS = [15, 30, 45, 60, 90, 120];

const PlannerCard = ({ data, loading, error, onClose }) => {
  const [speed, setSpeed] = useState(1.25);
  const [dailyMinutes, setDailyMinutes] = useState(30);
  const [customName, setCustomName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  
  // Load saved settings for this playlist
  useEffect(() => {
    if (data?.id) {
      StorageUtils.getPlaylist(data.id).then(saved => {
        if (saved) {
          if (saved.customName) setCustomName(saved.customName);
          // Could also load saved speed/daily target preferences if we stored them per playlist
        }
      });
      setCustomName(data.title || 'Untitled Playlist');
    }
  }, [data]);

  const handleSaveName = async () => {
    setIsEditingName(false);
    if (data?.id) {
       // We would need to update the storage, but since we just have the UI here,
       // we'll optimistic update. Ideally, we call a prop or context function.
       const saved = await StorageUtils.getPlaylist(data.id) || {};
       await StorageUtils.savePlaylist(data.id, { ...saved, customName });
    }
  };

  // Calculations
  const stats = useMemo(() => {
    if (!data?.statistics) return null;
    
    const { remainingDuration, totalDuration, watchedCount, totalVideos } = data.statistics;
    
    // Adjust for speed
    const adjustedRemaining = Math.ceil(remainingDuration / speed);
    const daysToFinish = Math.ceil((adjustedRemaining / 60) / dailyMinutes);
    const completionDate = TimeUtils.calculateCompletionDate(daysToFinish);
    
    const percentComplete = totalVideos > 0 
        ? Math.round((watchedCount / totalVideos) * 100) 
        : 0;

    return {
      adjustedRemaining,
      daysToFinish,
      completionDate,
      percentComplete,
      watchedCount,
      totalVideos
    };
  }, [data, speed, dailyMinutes]);

  if (loading) return (
    <div className="fixed top-24 right-6 w-[400px] z-[9999] bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center min-h-[300px] animate-fade-in border border-slate-100">
      <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-medium">Analyzing Playlist...</p>
    </div>
  );

  if (error) return (
    <div className="fixed top-24 right-6 w-[400px] z-[9999] bg-white rounded-2xl shadow-2xl p-6 border-l-4 border-red-500 animate-slide-in">
      <div className="flex justify-between items-start">
        <h3 className="text-red-500 font-bold text-lg mb-2">Error</h3>
        <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600" size={20}/></button>
      </div>
      <p className="text-slate-600">{error}</p>
    </div>
  );

  if (!data || !stats) return null;

  return (
    <div className="fixed top-[80px] right-6 w-[380px] z-[10000] font-sans animate-slide-in">
      {/* Main Card with Glassmorphism effect */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] overflow-hidden border border-white/40 ring-1 ring-slate-900/5">
        
        {/* Header - Vibrant Gradient */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-600 p-6 text-white relative overflow-hidden">
          {/* subtle pattern overlay */}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                <span className="text-xs font-bold tracking-wider uppercase">Playlist Planner</span>
              </div>
              <button 
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md"
              >
                <X size={16} className="text-white" />
              </button>
            </div>

            {/* Title Section */}
            <div className="group">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="flex-1 bg-white/20 border border-white/30 rounded px-2 py-1 text-white placeholder-white/50 focus:outline-none focus:bg-white/30"
                    autoFocus
                  />
                  <button onClick={handleSaveName} className="p-1 hover:bg-white/20 rounded"><Save size={16}/></button>
                </div>
              ) : (
                <h2 className="text-xl font-bold leading-tight flex items-start gap-2">
                  <span className="line-clamp-2">{customName}</span>
                  <button 
                    onClick={() => setIsEditingName(true)}
                    className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/20 rounded text-white/80"
                  >
                    <Edit2 size={14} />
                  </button>
                </h2>
              )}
            </div>
            
            {/* Progress Bar in Header */}
            <div className="mt-6">
              <div className="flex justify-between text-xs font-medium text-indigo-100 mb-2">
                <span>{stats.percentComplete}% Complete</span>
                <span>{stats.watchedCount} / {stats.totalVideos} videos</span>
              </div>
              <div className="h-2 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                <div 
                  className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${stats.percentComplete}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6">
          
          {/* Primary Result Card */}
          <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                 <Calendar size={20} strokeWidth={2.5} />
              </div>
              <span className="text-sm font-semibold text-indigo-900 uppercase tracking-wide">Estimated Finish</span>
            </div>
            <div className="flex items-baseline gap-2">
               <span className="text-4xl font-black text-indigo-900 tracking-tight">
                 {Math.abs(stats.daysToFinish) === Infinity ? '∞' : stats.daysToFinish}
               </span>
               <span className="text-lg font-medium text-indigo-700">days left</span>
            </div>
            <div className="mt-2 text-sm font-medium text-indigo-600/80">
              Target Date: {TimeUtils.formatDate(stats.completionDate)}
            </div>
          </div>

          {/* Controls Grid */}
          <div className="grid grid-cols-1 gap-5">
            
            {/* Speed Control */}
            <div>
              <div className="flex items-center gap-2 mb-3 text-sm font-bold text-slate-700">
                <FastForward size={16} className="text-purple-500" />
                <span>Playback Speed</span>
              </div>
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                 {SPEEDS.map(s => (
                   <button
                     key={s}
                     onClick={() => setSpeed(s)}
                     className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                       speed === s 
                         ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' 
                         : 'text-slate-500 hover:text-slate-700'
                     }`}
                   >
                     {s}x
                   </button>
                 ))}
              </div>
            </div>

            {/* Daily Target Control */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Clock size={16} className="text-pink-500" />
                  <span>Daily Goal</span>
                </div>
                <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                   {dailyMinutes} mins/day
                </div>
              </div>
              
              <div className="grid grid-cols-6 gap-2">
                {DAILY_MINUTES_PRESETS.map(m => (
                  <button
                    key={m}
                    onClick={() => setDailyMinutes(m)}
                    className={`h-9 rounded-lg text-xs font-bold transition-all border ${
                      dailyMinutes === m
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                    }`}
                  >
                    {m}
                  </button>
                ))}
            </div>
            
            {/* Custom Input */}
            <div className="mt-3 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">Custom</span>
                <input 
                  type="number" 
                  value={dailyMinutes}
                  onChange={(e) => setDailyMinutes(Number(e.target.value) || 0)}
                  className="w-full pl-16 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">min</span>
            </div>
          </div>
        </div>

        {/* Stats Footer */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
             <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Total Time</div>
                <div className="text-sm font-bold text-slate-800">
                  {TimeUtils.formatDuration(stats.adjustedRemaining, true)}
                </div>
             </div>
             <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Videos Left</div>
                <div className="text-sm font-bold text-slate-800">
                  {stats.totalVideos - stats.watchedCount}
                </div>
             </div>
        </div>

      </div>
      </div>
    </div>
  );
};

export default PlannerCard;
