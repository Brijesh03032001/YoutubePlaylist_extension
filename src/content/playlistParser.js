import DOMUtils from '../utils/domUtils';
import TimeUtils from '../utils/timeUtils';
import CONFIG from '../constants/config';

/**
 * Playlist Parser - Extracts playlist data from YouTube DOM
 */
const PlaylistParser = {
  /**
   * Extract playlist ID from URL
   * @param {string} url - Current page URL
   * @returns {string|null} Playlist ID
   */
  getPlaylistId(url = window.location.href) {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('list');
    } catch (error) {
      console.error('[Parser] Error extracting playlist ID:', error);
      return null;
    }
  },

  /**
   * Check if current page is a playlist
   * @returns {boolean}
   */
  isPlaylistPage() {
    const url = window.location.href;
    // Only activate on dedicated playlist pages
    return url.includes('/playlist?');
  },

  /**
   * Check if current page is a video watch page with a playlist
   * @returns {boolean}
   */
  isWatchPlaylistPage() {
    const url = window.location.href;
    return url.includes('/watch?') && url.includes('list=');
  },

  /**
   * Extract playlist metadata
   * @returns {Promise<object|null>}
   */
  async extractPlaylistMetadata() {
    try {
      // Double-check we're on a playlist page
      if (!this.isPlaylistPage()) {
        console.log('[Parser] Not on playlist page, skipping metadata extraction');
        return null;
      }

      console.log('[Parser] Waiting for playlist title...');
      
      // Wait for playlist elements to load with longer timeout
      let titleElement = await DOMUtils.waitForElement(
        CONFIG.SELECTORS.PLAYLIST_TITLE, 
        15000
      );

      // If not found, try searching in the entire page
      if (!titleElement) {
        console.log('[Parser] Title not found with primary selectors, trying alternatives...');
        
        // Try to find any h1 that looks like a playlist title
        const allH1s = document.querySelectorAll('h1');
        for (const h1 of allH1s) {
          const text = h1.textContent?.trim();
          if (text && text.length > 0 && text.length < 200) {
            titleElement = h1;
            console.log('[Parser] Found title using fallback h1:', text);
            break;
          }
        }
      }

      // Last resort - try to find any visible text that might be the title
      if (!titleElement) {
        console.error('[Parser] Could not find playlist title element');
        // Use URL as fallback title
        const playlistId = this.getPlaylistId();
        return {
          id: playlistId,
          title: `Playlist ${playlistId}`,
          videoCount: 0,
          url: window.location.href.split('&')[0],
          extractedAt: Date.now()
        };
      }

      const playlistId = this.getPlaylistId();
      const title = DOMUtils.getTextContent(titleElement);
      
      console.log('[Parser] Found title:', title);
      
      // Extract video count from stats
      const statsElement = DOMUtils.safeQuery(CONFIG.SELECTORS.PLAYLIST_STATS);
      let videoCount = 0;
      
      if (statsElement) {
        const statsText = DOMUtils.getTextContent(statsElement);
        console.log('[Parser] Stats text:', statsText);
        const match = statsText.match(/(\d+)\s*video/i);
        if (match) {
          videoCount = parseInt(match[1], 10);
        }
      } else {
        console.warn('[Parser] Stats element not found');
      }

      const metadata = {
        id: playlistId,
        title,
        videoCount,
        url: window.location.href.split('&')[0], // Clean URL
        extractedAt: Date.now()
      };
      
      console.log('[Parser] Metadata extracted:', metadata);
      
      return metadata;
    } catch (error) {
      console.error('[Parser] Error extracting metadata:', error);
      return null;
    }
  },

  /**
   * Extract playlist metadata from watch page
   * @returns {Promise<object|null>}
   */
  async extractWatchPlaylistMetadata() {
    try {
      if (!this.isWatchPlaylistPage()) return null;

      console.log('[Parser] Waiting for watch page playlist title...');
      
      // Selector for playlist title in side panel
      // Using the selector found by agent: ytd-playlist-panel-renderer #title a
      // Also adding fallback selectors just in case
      const selectors = [
        'ytd-playlist-panel-renderer #header-description h3 a',
        'ytd-playlist-panel-renderer #title a',
        'ytd-playlist-panel-renderer h3.title a'
      ];

      let titleElement = null;
      for (const selector of selectors) {
        titleElement = document.querySelector(selector);
        if (titleElement) break;
      }

      // If not found immediately, wait a bit
      if (!titleElement) {
        titleElement = await DOMUtils.waitForElement(
          'ytd-playlist-panel-renderer #header-description h3 a, ytd-playlist-panel-renderer #title a', 
          5000
        );
      }

      if (!titleElement) {
        console.warn('[Parser] Playlist title not found on watch page');
        return null;
      }

      const playlistId = this.getPlaylistId();
      const title = DOMUtils.getTextContent(titleElement);
      
      console.log('[Parser] Found watch playlist title:', title);

      return {
        id: playlistId,
        title,
        videoCount: 0, // Not easily available on watch page header without parsing list
        url: `https://www.youtube.com/playlist?list=${playlistId}`,
        extractedAt: Date.now()
      };
    } catch (error) {
      console.error('[Parser] Error extracting watch metadata:', error);
      return null;
    }
  },

  /**
   * Extract video data from playlist
   * @returns {Promise<Array>}
   */
  async extractVideos() {
    try {
      // Wait for videos to load
      await DOMUtils.waitForElement(CONFIG.SELECTORS.VIDEO_ITEMS, 5000);
      
      // Scroll to load all videos (with limit)
      await this.scrollToLoadVideos();

      // Get all video elements
      const videoElements = DOMUtils.safeQueryAll(CONFIG.SELECTORS.VIDEO_ITEMS);
      
      if (videoElements.length === 0) {
        console.warn('[Parser] No videos found');
        return [];
      }

      const videos = [];
      
      for (let i = 0; i < videoElements.length; i++) {
        const videoElement = videoElements[i];
        const videoData = this.extractVideoData(videoElement, i);
        
        if (videoData) {
          videos.push(videoData);
        }

        // Stop if we hit the limit
        if (videos.length >= CONFIG.MAX_PLAYLIST_SIZE) {
          console.warn(`[Parser] Hit max playlist size limit: ${CONFIG.MAX_PLAYLIST_SIZE}`);
          break;
        }
      }

      console.log(`[Parser] Extracted ${videos.length} videos`);
      return videos;
    } catch (error) {
      console.error('[Parser] Error extracting videos:', error);
      return [];
    }
  },

  /**
   * Extract data from a single video element
   * @param {Element} element - Video element
   * @param {number} index - Video index
   * @returns {object|null}
   */
  extractVideoData(element, index) {
    try {
      // Get video ID from link
      const linkElement = DOMUtils.safeQuery('a#video-title', element);
      const href = linkElement?.getAttribute('href');
      const videoId = href ? this.extractVideoId(href) : null;

      // Get title
      const titleElement = DOMUtils.safeQuery(CONFIG.SELECTORS.VIDEO_TITLE, element);
      const title = DOMUtils.getTextContent(titleElement);

      // Get duration
      const durationElement = DOMUtils.safeQuery(
        CONFIG.SELECTORS.VIDEO_DURATION + ' span[aria-label]',
        element
      );
      const durationText = durationElement?.getAttribute('aria-label') || 
                          DOMUtils.getTextContent(durationElement);
      
      let durationSeconds = 0;
      if (TimeUtils && typeof TimeUtils.parseYouTubeDuration === 'function') {
        durationSeconds = TimeUtils.parseYouTubeDuration(durationText);
      } else if (TimeUtils && TimeUtils.default && typeof TimeUtils.default.parseYouTubeDuration === 'function') {
        // Handle weird CJS/ESM interop if typical default import issue
        durationSeconds = TimeUtils.default.parseYouTubeDuration(durationText);
      } else {
        console.error('[Parser] TimeUtils.parseYouTubeDuration is not a function', TimeUtils);
      }

      // Check if watched (YouTube marks watched videos)
      const watchedElement = DOMUtils.safeQuery(
        CONFIG.SELECTORS.WATCHED_BADGE,
        element
      );
      const isWatched = !!watchedElement;

      // Check if video is unavailable (private, deleted, etc.)
      const isUnavailable = element.hasAttribute('is-dismissed') ||
                           title.toLowerCase().includes('[deleted video]') ||
                           title.toLowerCase().includes('[private video]');

      return {
        id: videoId,
        title: title || `Video ${index + 1}`,
        duration: durationSeconds,
        index,
        isWatched,
        isUnavailable
      };
    } catch (error) {
      console.error('[Parser] Error extracting video data:', error);
      return null;
    }
  },

  /**
   * Extract video ID from YouTube URL
   * @param {string} url - Video URL
   * @returns {string|null}
   */
  extractVideoId(url) {
    try {
      const match = url.match(/[?&]v=([^&]+)/);
      return match ? match[1] : null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Scroll playlist to load all videos
   * @returns {Promise<void>}
   */
  async scrollToLoadVideos() {
    return new Promise((resolve) => {
      let lastVideoCount = 0;
      let unchangedCount = 0;
      const maxAttempts = 30;

      const scrollInterval = setInterval(() => {
        // Get current video count
        const videos = DOMUtils.safeQueryAll(CONFIG.SELECTORS.VIDEO_ITEMS);
        const currentCount = videos.length;

        // Check if new videos loaded
        if (currentCount === lastVideoCount) {
          unchangedCount++;
        } else {
          unchangedCount = 0;
          lastVideoCount = currentCount;
        }

        // Stop if no new videos after multiple attempts
        if (unchangedCount >= 5 || unchangedCount >= maxAttempts) {
          clearInterval(scrollInterval);
          resolve();
          return;
        }

        // Scroll to bottom
        const lastVideo = videos[videos.length - 1];
        if (lastVideo) {
          lastVideo.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }, 500);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(scrollInterval);
        resolve();
      }, 30000);
    });
  },

  /**
   * Calculate playlist statistics
   * @param {Array} videos - Array of video objects
   * @returns {object}
   */
  calculateStatistics(videos) {
    let totalDuration = 0;
    let watchedCount = 0;
    let unavailableCount = 0;
    let availableVideos = [];

    videos.forEach(video => {
      if (video.isUnavailable) {
        unavailableCount++;
      } else {
        availableVideos.push(video);
        totalDuration += video.duration || 0;
        
        if (video.isWatched) {
          watchedCount++;
        }
      }
    });

    const remainingVideos = availableVideos.length - watchedCount;
    const remainingDuration = availableVideos
      .filter(v => !v.isWatched)
      .reduce((sum, v) => sum + (v.duration || 0), 0);

    return {
      totalVideos: videos.length,
      availableVideos: availableVideos.length,
      unavailableCount,
      totalDuration,
      watchedCount,
      remainingVideos,
      remainingDuration,
      percentComplete: availableVideos.length > 0 
        ? Math.round((watchedCount / availableVideos.length) * 100)
        : 0
    };
  },

  /**
   * Parse complete playlist
   * @returns {Promise<object|null>}
   */
  async parsePlaylist() {
    try {
      console.log('[Parser] Starting playlist parse...');

      const metadata = await this.extractPlaylistMetadata();
      if (!metadata) {
        console.error('[Parser] Failed to extract metadata');
        return null;
      }

      const videos = await this.extractVideos();
      const statistics = this.calculateStatistics(videos);

      const playlistData = {
        ...metadata,
        videos,
        statistics,
        parsedAt: Date.now()
      };

      console.log('[Parser] Playlist parsed successfully:', playlistData);
      return playlistData;
    } catch (error) {
      console.error('[Parser] Error parsing playlist:', error);
      return null;
    }
  }
};

export default PlaylistParser;
