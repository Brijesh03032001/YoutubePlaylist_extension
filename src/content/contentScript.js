/**
 * Content Script - Main entry point for extension on YouTube pages
 */

(async function() {
  'use strict';

  console.log('[YTPP] Content script loaded');

  let currentPlaylistId = null;
  let isProcessing = false;

  /**
   * Initialize the extension on playlist page
   */
  async function initialize() {
    try {
      const isDedicated = PlaylistParser.isPlaylistPage();
      const isWatch = PlaylistParser.isWatchPlaylistPage();

      if (!isDedicated && !isWatch) {
        console.log('[YTPP] Not a playlist page, skipping');
        UIInjector.remove();
        return;
      }

      if (isWatch) {
        console.log('[YTPP] Watch playlist detected');
        // Wait briefly for DOM
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const metadata = await PlaylistParser.extractWatchPlaylistMetadata();
        if (metadata) {
          await UIInjector.injectLite(metadata);
        }
        return;
      }

      const playlistId = PlaylistParser.getPlaylistId();
      
      if (!playlistId) {
        console.warn('[YTPP] No playlist ID found');
        UIInjector.remove();
        return;
      }

      // Skip if already processing this playlist
      if (isProcessing || playlistId === currentPlaylistId) {
        return;
      }

      isProcessing = true;
      currentPlaylistId = playlistId;

      console.log('[YTPP] Initializing for playlist:', playlistId);

      // Wait for page to load
      await new Promise(resolve => setTimeout(resolve, CONFIG.UI.INJECT_DELAY));

      // Always parse fresh data (caching disabled)
      let playlistData = null;
      const isCacheValid = false; // Force fresh parsing every time

      if (!isCacheValid) {
        console.log('[YTPP] Cache miss or expired, parsing playlist...');
        
        // Parse playlist from DOM
        playlistData = await PlaylistParser.parsePlaylist();
        
        console.log('[YTPP] Parse result:', playlistData);
        
        if (!playlistData) {
          UIInjector.showError('Failed to parse playlist. Please refresh the page.');
          isProcessing = false;
          return;
        }

        // Check if custom name exists in storage
        const existingData = await StorageUtils.getPlaylist(playlistId);
        if (existingData && existingData.customName) {
          playlistData.customName = existingData.customName;
        }

        // Load progress data
        const progress = await StorageUtils.getProgress(playlistId);
        if (progress && progress.watchedVideos) {
          // Update watched status from saved progress
          playlistData.videos.forEach(video => {
            if (progress.watchedVideos.includes(video.id)) {
              video.isWatched = true;
            }
          });
          
          // Recalculate statistics
          playlistData.statistics = PlaylistParser.calculateStatistics(playlistData.videos);
        }

        // Save to cache
        await StorageUtils.savePlaylist(playlistId, playlistData);
      } else {
        console.log('[YTPP] Using cached playlist data');
      }

      // Inject UI
      await UIInjector.inject(playlistData);

      // Set up video watch detection
      setupWatchDetection(playlistId);

      isProcessing = false;

    } catch (error) {
      console.error('[YTPP] Initialization error:', error);
      UIInjector.showError('An error occurred. Please refresh the page.');
      isProcessing = false;
    }
  }

  /**
   * Set up detection for when videos are watched
   */
  function setupWatchDetection(playlistId) {
    // Monitor for watched badges appearing
    const observer = new MutationObserver(
      DOMUtils.throttle(async () => {
        // Get current video if playing
        const urlParams = new URLSearchParams(window.location.search);
        const currentVideoId = urlParams.get('v');
        
        if (currentVideoId) {
          // Check if video is marked as watched in DOM
          const videoElements = DOMUtils.safeQueryAll(CONFIG.SELECTORS.VIDEO_ITEMS);
          
          for (const videoEl of videoElements) {
            const link = DOMUtils.safeQuery('a#video-title', videoEl);
            const href = link?.getAttribute('href');
            
            if (href && href.includes(currentVideoId)) {
              const watchedBadge = DOMUtils.safeQuery(
                CONFIG.SELECTORS.WATCHED_BADGE,
                videoEl
              );
              
              if (watchedBadge) {
                // Mark as watched
                await StorageUtils.markVideoWatched(playlistId, currentVideoId);
                console.log('[YTPP] Video marked as watched:', currentVideoId);
                
                // Refresh playlist data
                const playlistData = await StorageUtils.getPlaylist(playlistId);
                if (playlistData) {
                  // Update video watched status
                  const video = playlistData.videos.find(v => v.id === currentVideoId);
                  if (video) {
                    video.isWatched = true;
                  }
                  
                  // Recalculate statistics
                  playlistData.statistics = PlaylistParser.calculateStatistics(playlistData.videos);
                  
                  // Update cache
                  await StorageUtils.savePlaylist(playlistId, playlistData);
                  
                  // Update UI
                  if (UIInjector.isVisible()) {
                    await UIInjector.update(playlistData);
                  }
                }
              }
              break;
            }
          }
        }
      }, 2000)
    );

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });
  }

  /**
   * Handle URL changes (YouTube is a SPA)
   */
  function setupURLListener() {
    let lastUrl = window.location.href;
    
    // Listen for URL changes
    const urlObserver = new MutationObserver(() => {
      const currentUrl = window.location.href;
      
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        console.log('[YTPP] URL changed:', currentUrl);
        
        // Check if navigating away from playlist page
        if (!PlaylistParser.isPlaylistPage() && !PlaylistParser.isWatchPlaylistPage()) {
          console.log('[YTPP] Not on playlist page, removing UI');
          UIInjector.remove();
          currentPlaylistId = null;
          isProcessing = false;
          return;
        }
        
        // Reset state
        currentPlaylistId = null;
        isProcessing = false;
        
        // Reinitialize
        setTimeout(initialize, 500);
      }
    });

    urlObserver.observe(document.querySelector('title'), {
      childList: true,
      subtree: true
    });

    // Also listen for history changes
    window.addEventListener('popstate', () => {
      if (!PlaylistParser.isPlaylistPage() && !PlaylistParser.isWatchPlaylistPage()) {
        UIInjector.remove();
        currentPlaylistId = null;
        isProcessing = false;
        return;
      }
      currentPlaylistId = null;
      isProcessing = false;
      setTimeout(initialize, 500);
    });

    // Override pushState and replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      if (!PlaylistParser.isPlaylistPage() && !PlaylistParser.isWatchPlaylistPage()) {
        UIInjector.remove();
        currentPlaylistId = null;
        isProcessing = false;
        return;
      }
      currentPlaylistId = null;
      isProcessing = false;
      setTimeout(initialize, 500);
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      if (!PlaylistParser.isPlaylistPage() && !PlaylistParser.isWatchPlaylistPage()) {
        UIInjector.remove();
        currentPlaylistId = null;
        isProcessing = false;
        return;
      }
      currentPlaylistId = null;
      isProcessing = false;
      setTimeout(initialize, 500);
    };
  }

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    setTimeout(initialize, 500);
  }

  // Set up URL change detection
  setupURLListener();

  console.log('[YTPP] Content script initialized');

})();
