/**
 * Background Service Worker (Manifest v3)
 */

console.log('[YTPP Background] Service worker loaded');

// Install event
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[YTPP Background] Extension installed/updated:', details.reason);
  
  if (details.reason === 'install') {
    // First time installation
    console.log('[YTPP Background] First time installation');
    
    // Set default settings
    chrome.storage.local.set({
      ytpp_settings: {
        playbackSpeed: 1.25,
        dailyMinutes: 30,
        theme: 'light'
      }
    });

    // Open welcome page (optional)
    // chrome.tabs.create({ url: 'https://yourdomain.com/welcome' });
  } else if (details.reason === 'update') {
    // Extension updated
    console.log('[YTPP Background] Extension updated to version:', chrome.runtime.getManifest().version);
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[YTPP Background] Message received:', request);

  switch (request.action) {
    case 'getPlaylistData':
      handleGetPlaylistData(request.playlistId)
        .then(sendResponse)
        .catch(error => {
          console.error('[YTPP Background] Error:', error);
          sendResponse({ error: error.message });
        });
      return true; // Keep channel open for async response

    case 'saveProgress':
      handleSaveProgress(request.playlistId, request.progress)
        .then(sendResponse)
        .catch(error => {
          console.error('[YTPP Background] Error:', error);
          sendResponse({ error: error.message });
        });
      return true;

    case 'clearCache':
      handleClearCache()
        .then(sendResponse)
        .catch(error => {
          console.error('[YTPP Background] Error:', error);
          sendResponse({ error: error.message });
        });
      return true;

    default:
      console.warn('[YTPP Background] Unknown action:', request.action);
      sendResponse({ error: 'Unknown action' });
  }
});

/**
 * Get playlist data from storage
 */
async function handleGetPlaylistData(playlistId) {
  try {
    const result = await chrome.storage.local.get('ytpp_playlists');
    const playlists = result.ytpp_playlists || {};
    return { success: true, data: playlists[playlistId] || null };
  } catch (error) {
    console.error('[YTPP Background] Error getting playlist:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Save progress data
 */
async function handleSaveProgress(playlistId, progress) {
  try {
    const result = await chrome.storage.local.get('ytpp_progress');
    const allProgress = result.ytpp_progress || {};
    
    allProgress[playlistId] = {
      ...progress,
      lastUpdated: Date.now()
    };

    await chrome.storage.local.set({ ytpp_progress: allProgress });
    
    return { success: true };
  } catch (error) {
    console.error('[YTPP Background] Error saving progress:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Clear cache
 */
async function handleClearCache() {
  try {
    await chrome.storage.local.remove(['ytpp_playlists']);
    return { success: true };
  } catch (error) {
    console.error('[YTPP Background] Error clearing cache:', error);
    return { success: false, error: error.message };
  }
}

// Monitor storage changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    console.log('[YTPP Background] Storage changed:', Object.keys(changes));
  }
});

// Keep service worker alive (if needed)
// This is optional and depends on your needs
chrome.runtime.onSuspend.addListener(() => {
  console.log('[YTPP Background] Service worker suspending...');
});

console.log('[YTPP Background] Service worker initialized');
