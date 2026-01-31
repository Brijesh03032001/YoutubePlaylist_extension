/**
 * Storage utility functions for Chrome storage API
 */

const StorageUtils = {
  /**
   * Save data to Chrome storage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @returns {Promise<void>}
   */
  async save(key, value) {
    try {
      await chrome.storage.local.set({ [key]: value });
      if (CONFIG.DEBUG) {
        console.log(`[Storage] Saved ${key}:`, value);
      }
    } catch (error) {
      console.error(`[Storage] Error saving ${key}:`, error);
      throw error;
    }
  },

  /**
   * Get data from Chrome storage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {Promise<any>}
   */
  async get(key, defaultValue = null) {
    try {
      const result = await chrome.storage.local.get(key);
      const value = result[key] !== undefined ? result[key] : defaultValue;
      
      if (CONFIG.DEBUG) {
        console.log(`[Storage] Retrieved ${key}:`, value);
      }
      
      return value;
    } catch (error) {
      console.error(`[Storage] Error getting ${key}:`, error);
      return defaultValue;
    }
  },

  /**
   * Remove data from Chrome storage
   * @param {string} key - Storage key
   * @returns {Promise<void>}
   */
  async remove(key) {
    try {
      await chrome.storage.local.remove(key);
      if (CONFIG.DEBUG) {
        console.log(`[Storage] Removed ${key}`);
      }
    } catch (error) {
      console.error(`[Storage] Error removing ${key}:`, error);
      throw error;
    }
  },

  /**
   * Clear all storage
   * @returns {Promise<void>}
   */
  async clear() {
    try {
      await chrome.storage.local.clear();
      if (CONFIG.DEBUG) {
        console.log('[Storage] Cleared all data');
      }
    } catch (error) {
      console.error('[Storage] Error clearing storage:', error);
      throw error;
    }
  },

  /**
   * Save playlist data
   * @param {string} playlistId - YouTube playlist ID
   * @param {object} playlistData - Playlist data object
   * @returns {Promise<void>}
   */
  async savePlaylist(playlistId, playlistData) {
    const playlists = await this.get(CONFIG.STORAGE_KEYS.PLAYLISTS, {});
    playlists[playlistId] = {
      ...playlistData,
      lastUpdated: Date.now()
    };
    await this.save(CONFIG.STORAGE_KEYS.PLAYLISTS, playlists);
  },

  /**
   * Get playlist data
   * @param {string} playlistId - YouTube playlist ID
   * @returns {Promise<object|null>}
   */
  async getPlaylist(playlistId) {
    const playlists = await this.get(CONFIG.STORAGE_KEYS.PLAYLISTS, {});
    return playlists[playlistId] || null;
  },

  /**
   * Get all playlists
   * @returns {Promise<object>}
   */
  async getAllPlaylists() {
    return await this.get(CONFIG.STORAGE_KEYS.PLAYLISTS, {});
  },

  /**
   * Save progress for a playlist
   * @param {string} playlistId - YouTube playlist ID
   * @param {object} progressData - Progress data
   * @returns {Promise<void>}
   */
  async saveProgress(playlistId, progressData) {
    const allProgress = await this.get(CONFIG.STORAGE_KEYS.PROGRESS, {});
    allProgress[playlistId] = {
      ...progressData,
      lastUpdated: Date.now()
    };
    await this.save(CONFIG.STORAGE_KEYS.PROGRESS, allProgress);
  },

  /**
   * Get progress for a playlist
   * @param {string} playlistId - YouTube playlist ID
   * @returns {Promise<object|null>}
   */
  async getProgress(playlistId) {
    const allProgress = await this.get(CONFIG.STORAGE_KEYS.PROGRESS, {});
    return allProgress[playlistId] || null;
  },

  /**
   * Mark video as watched
   * @param {string} playlistId - YouTube playlist ID
   * @param {string} videoId - YouTube video ID
   * @returns {Promise<void>}
   */
  async markVideoWatched(playlistId, videoId) {
    const progress = await this.getProgress(playlistId) || { watchedVideos: [] };
    
    if (!progress.watchedVideos.includes(videoId)) {
      progress.watchedVideos.push(videoId);
      await this.saveProgress(playlistId, progress);
    }
  },

  /**
   * Check if video is watched
   * @param {string} playlistId - YouTube playlist ID
   * @param {string} videoId - YouTube video ID
   * @returns {Promise<boolean>}
   */
  async isVideoWatched(playlistId, videoId) {
    const progress = await this.getProgress(playlistId);
    return progress && progress.watchedVideos 
      ? progress.watchedVideos.includes(videoId) 
      : false;
  },

  /**
   * Save user settings
   * @param {object} settings - Settings object
   * @returns {Promise<void>}
   */
  async saveSettings(settings) {
    const currentSettings = await this.getSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    await this.save(CONFIG.STORAGE_KEYS.SETTINGS, updatedSettings);
  },

  /**
   * Get user settings
   * @returns {Promise<object>}
   */
  async getSettings() {
    return await this.get(CONFIG.STORAGE_KEYS.SETTINGS, {
      playbackSpeed: CONFIG.DEFAULT_PLAYBACK_SPEED,
      dailyMinutes: CONFIG.DEFAULT_DAILY_MINUTES,
      theme: 'light'
    });
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageUtils;
}
