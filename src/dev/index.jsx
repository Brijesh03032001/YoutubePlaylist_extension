import React from 'react';
import ReactDOM from 'react-dom/client';
import DevApp from './DevApp';
import '../styles/index.css'; // Ensure Tailwind is loaded

// Mock Chrome API for Dev
if (!window.chrome) {
  window.chrome = {};
}
if (!window.chrome.storage) {
  const mockStorage = {
    ytpp_playlists: {
      'PL123': { 
        id: 'PL123', 
        title: 'Mock Playlist 1', 
        videoCount: 10, 
        lastUpdated: Date.now(),
        statistics: { totalDuration: 3600 }
      },
      'PL456': { 
        id: 'PL456', 
        title: 'Mock Playlist 2', 
        videoCount: 25, 
        lastUpdated: Date.now() - 100000,
        statistics: { totalDuration: 7200 }
      }
    },
    ytpp_progress: {
      'PL123': { watchedVideos: ['v1', 'v2', 'v3'] }
    }
  };

  window.chrome.storage = {
    local: {
      get: (keys) => {
        if (typeof keys === 'string') return Promise.resolve({ [keys]: mockStorage[keys] });
        return Promise.resolve(mockStorage); // Simply return all for now or handle array
      },
      set: (obj) => {
        Object.assign(mockStorage, obj);
        if (window.chrome.storage.onChanged.listeners) {
           window.chrome.storage.onChanged.listeners.forEach(l => l(obj, 'local'));
        }
        return Promise.resolve();
      },
      remove: (keys) => Promise.resolve(),
      clear: () => Promise.resolve()
    },
    onChanged: {
      listeners: [],
      addListener: (cb) => window.chrome.storage.onChanged.listeners.push(cb),
      removeListener: (cb) => {}
    }
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DevApp />
  </React.StrictMode>
);
