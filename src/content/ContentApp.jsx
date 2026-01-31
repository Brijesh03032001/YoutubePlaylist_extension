import React, { useState, useEffect, useRef } from 'react';
import { Play, ClipboardList, BookOpen, X, Clock, Settings, FastForward } from 'lucide-react';
import PlaylistParser from './playlistParser';
import PlannerCard from '../components/PlannerCard';
import LiteCard from '../components/LiteCard';

const ContentApp = () => {
  const [mode, setMode] = useState('hidden'); // 'full', 'lite', 'hidden'
  const [playlistData, setPlaylistData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkPage = async () => {
      const isPlaylist = window.location.href.includes('/playlist?');
      const isWatch = window.location.href.includes('/watch?') && window.location.href.includes('list=');

      if (!isPlaylist && !isWatch) {
        setMode('hidden');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        if (isWatch) {
          // Lite mode for watch pages
          const meta = await PlaylistParser.extractWatchPlaylistMetadata();
          if (meta) {
            setPlaylistData(meta);
            setMode('lite');
          } else {
             // Fallback or retry logic could go here
             setMode('hidden');
          }
        } else {
          // Full mode for playlist pages
          setMode('full'); // Show UI immediately with loading state potentially
          const data = await PlaylistParser.parsePlaylist();
          if (data) {
            setPlaylistData(data);
          } else {
            setError('Could not parse playlist');
          }
        }
      } catch (err) {
        console.error('Error in ContentApp:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Initial check
    checkPage();

    // Listen for URL changes (YouTube SPA)
    const observer = new MutationObserver(() => {
        checkPage();
    });
    
    // Observer title change which usually indicates page navigation
    const title = document.querySelector('title');
    if (title) {
        observer.observe(title, { childList: true });
    }

    return () => observer.disconnect();
  }, []);

  if (mode === 'hidden') return null;

  console.log('[ContentApp] Rendering with mode:', mode, 'data:', playlistData, 'loading:', loading, 'error:', error);

  return (
    <div className="ytpp-root-container">
      {mode === 'lite' && playlistData && (
        <LiteCard 
          title={playlistData.title} 
          url={playlistData.url} 
          onClose={() => setMode('hidden')} 
        />
      )}
      
      {mode === 'full' && (
        <PlannerCard 
          data={playlistData} 
          loading={loading} 
          error={error}
          onClose={() => setMode('hidden')}
        />
      )}
    </div>
  );
};

export default ContentApp;
