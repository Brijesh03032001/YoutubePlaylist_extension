import React, { useState } from 'react';
import PlannerCard from '../components/PlannerCard';
import LiteCard from '../components/LiteCard';
import PopupApp from '../popup/PopupApp';

// Mock Data
const MOCK_PLAYLIST = {
  id: 'PL12345',
  title: 'Advanced React Patterns & Performance',
  videoCount: 42,
  statistics: {
    remainingDuration: 12500, // seconds
    watchedCount: 12,
    totalVideos: 42,
    percentComplete: 28,
    daysToFinish: 5,
    completionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
  }
};

const DevApp = () => {
  const [view, setView] = useState('planner');
  const [showLite, setShowLite] = useState(true);

  return (
    <div className="min-h-screen p-8 space-y-8">
      {/* Dev Controls */}
      <div className="fixed top-4 left-4 z-[10001] bg-white p-4 rounded-lg shadow-lg border border-slate-200">
        <h2 className="font-bold mb-2">Dev Controls</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setView('planner')}
            className={`px-3 py-1 rounded text-sm ${view === 'planner' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}
          >
            Planner Card
          </button>
          <button 
            onClick={() => setView('popup')}
            className={`px-3 py-1 rounded text-sm ${view === 'popup' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}
          >
            Popup
          </button>
          <button 
             onClick={() => setShowLite(!showLite)}
             className={`px-3 py-1 rounded text-sm ${showLite ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}
          >
            Toggle Lite Card
          </button>
        </div>
      </div>

      {/* Render Views */}
      <div className="flex justify-center items-start pt-20">
        
        {view === 'planner' && (
          <div className="relative w-full h-[600px] border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex items-center justify-center">
             <p className="absolute top-4 text-slate-400">Mock YouTube Page Context</p>
             
             {/* The Component under test */}
             <PlannerCard 
               data={MOCK_PLAYLIST} 
               loading={false}
               error={null}
               onClose={() => console.log('Close clicked')}
             />
          </div>
        )}

        {view === 'popup' && (
           <div className="w-[400px] h-[600px] border border-slate-200 shadow-2xl overflow-hidden rounded-xl">
              <PopupApp />
           </div>
        )}

        {showLite && (
          <LiteCard 
            title="Currently Watching: React Hooks" 
            url="#" 
            onClose={() => setShowLite(false)} 
          />
        )}

      </div>
    </div>
  );
};

export default DevApp;
