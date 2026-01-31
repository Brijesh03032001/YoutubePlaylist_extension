import React, { useState, useEffect } from 'react';
import { BookOpen, Trash2, Settings, ExternalLink, Activity } from 'lucide-react';
import StorageUtils from '../utils/storageUtils';
import TimeUtils from '../utils/timeUtils';

const PopupApp = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    
    // Listen for storage changes
    const handleChange = (changes, areaName) => {
        if (areaName === 'local') {
            loadData();
        }
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

      // Sort by last updated
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

  if (loading) return (
      <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans text-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white shadow-md z-10">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <BookOpen size={24} />
            </div>
            <div>
                <h1 className="text-lg font-bold leading-none">Playlist Planner</h1>
                <p className="text-xs text-indigo-100 opacity-80 mt-1">Focus on what matters</p>
            </div>
        </div>
      </div>

      {/* Stats/Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {playlists.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-64 text-center p-6 text-slate-400">
               <Activity size={48} className="mb-4 opacity-50" />
               <h3 className="text-slate-600 font-semibold mb-2">No Playlists Yet</h3>
               <p className="text-sm">Visit a YouTube playlist to start tracking your progress automatically.</p>
           </div>
        ) : (
           <div className="space-y-3">
               <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Recent Activity</h2>
               {playlists.map(playlist => (
                   <a 
                     key={playlist.id}
                     href={playlist.url}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="block bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group"
                   >
                       <div className="flex justify-between items-start mb-2">
                           <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-indigo-600 transition-colors">
                             {playlist.customName || playlist.title}
                           </h3>
                           <ExternalLink size={14} className="text-slate-300 group-hover:text-indigo-400" />
                       </div>
                       
                       <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                           <span>{playlist.videoCount} videos</span>
                           <span>•</span>
                           <span>{TimeUtils.formatDuration(playlist.statistics?.totalDuration, true)}</span>
                       </div>

                       {/* Progress Bar */}
                       <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                           <div 
                             className="h-full bg-indigo-500 rounded-full"
                             style={{ width: `${(playlist.watchedCount / (playlist.videoCount || 1)) * 100}%` }}
                           ></div>
                       </div>
                       <div className="flex justify-between mt-1.5">
                           <span className="text-[10px] font-bold text-slate-400">
                             {Math.round((playlist.watchedCount / (playlist.videoCount || 1)) * 100)}%
                           </span>
                           <span className="text-[10px] text-slate-400">
                             {playlist.watchedCount} watched
                           </span>
                       </div>
                   </a>
               ))}
           </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-slate-200 p-3 flex justify-between items-center text-xs">
          <button 
            onClick={clearCache}
            className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
              <Trash2 size={14} />
              <span>Reset Data</span>
          </button>
          
          <div className="text-slate-300 font-medium">v1.0.0</div>
      </div>
    </div>
  );
};

export default PopupApp;
