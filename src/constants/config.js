/**
 * Configuration constants for the extension
 * These values can be overridden by environment variables
 */

const CONFIG = {
  // Extension metadata
  EXTENSION_NAME: 'Smart YouTube Playlist Planner',
  VERSION: '1.0.0',
  
  // Playback speed options
  PLAYBACK_SPEEDS: [1, 1.25, 1.5, 2],
  DEFAULT_PLAYBACK_SPEED: 1.25,
  
  // Daily time presets (in minutes)
  DAILY_TIME_PRESETS: [15, 30, 45, 60],
  DEFAULT_DAILY_MINUTES: 30,
  
  // Storage keys
  STORAGE_KEYS: {
    PLAYLISTS: 'ytpp_playlists',
    PROGRESS: 'ytpp_progress',
    SETTINGS: 'ytpp_settings',
    LAST_SYNC: 'ytpp_last_sync'
  },
  
  // UI settings
  UI: {
    ANIMATION_DURATION: 300,
    PANEL_WIDTH: '380px',
    PANEL_POSITION: 'right',
    INJECT_DELAY: 2500, // Wait for YouTube to load
  },
  
  // YouTube selectors (robust against DOM changes)
  SELECTORS: {
    PLAYLIST_TITLE: 'h1.ytd-playlist-header-renderer, yt-formatted-string.ytd-playlist-header-renderer',
    PLAYLIST_STATS: '#stats .ytd-playlist-header-renderer, #stats',
    VIDEO_ITEMS: 'ytd-playlist-video-renderer, ytd-playlist-video-list-renderer ytd-playlist-video-renderer',
    VIDEO_TITLE: '#video-title, a#video-title',
    VIDEO_DURATION: 'ytd-thumbnail-overlay-time-status-renderer, #overlays ytd-thumbnail-overlay-time-status-renderer',
    WATCHED_BADGE: '.ytd-thumbnail-overlay-resume-playback-renderer, ytd-thumbnail-overlay-resume-playback-renderer'
  },
  
  // Debug mode
  DEBUG: true,
  
  // Limits
  MAX_PLAYLIST_SIZE: 5000, // Max videos to process
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
