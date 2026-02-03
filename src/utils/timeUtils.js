/**
 * Time utility functions for duration parsing and calculations
 */

const TimeUtils = {
  /**
   * Parse YouTube duration format (MM:SS or HH:MM:SS or H:MM:SS) to seconds
   * @param {string} duration - Duration string from YouTube (e.g., "10:30" or "1:23:45")
   * @returns {number} Total seconds
   */
  parseYouTubeDuration(duration) {
    if (!duration || typeof duration !== 'string') {
      return 0;
    }

    // Remove any whitespace and commas
    duration = duration.trim().replace(/,/g, '');
    
    // Only process if it contains colons (timestamp format)
    if (!duration.includes(':')) {
      return 0;
    }

    // Handle YouTube Shorts (typically show as "0:XX" or just ":XX")
    if (duration.startsWith(':')) {
      duration = '0' + duration;
    }

    // Split by colon and parse each part
    const parts = duration.split(':').map(part => {
      const num = parseInt(part.trim(), 10);
      return isNaN(num) ? 0 : num;
    });

    let seconds = 0;
    
    if (parts.length === 3) {
      // HH:MM:SS or H:MM:SS
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // MM:SS or M:SS
      seconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 1) {
      // Just seconds (rare)
      seconds = parts[0];
    }
    
    // Sanity check: if result is unreasonably large (>24 hours), something went wrong
    if (seconds > 86400) {
      console.warn('[TimeUtils] Parsed unusually long duration:', duration, '=>', seconds, 'seconds');
    }

    return seconds;
  },

  /**
   * Convert seconds to human-readable format
   * @param {number} seconds - Total seconds
   * @param {boolean} short - Use short format (e.g., "2h 30m" vs "2 hours 30 minutes")
   * @returns {string} Formatted duration
   */
  formatDuration(seconds, short = false) {
    if (!seconds || seconds < 0) {
      return short ? '0m' : '0 minutes';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];

    if (hours > 0) {
      parts.push(short ? `${hours}h` : `${hours} hour${hours !== 1 ? 's' : ''}`);
    }
    if (minutes > 0) {
      parts.push(short ? `${minutes}m` : `${minutes} minute${minutes !== 1 ? 's' : ''}`);
    }
    if (secs > 0 && hours === 0) {
      parts.push(short ? `${secs}s` : `${secs} second${secs !== 1 ? 's' : ''}`);
    }

    return parts.join(' ') || (short ? '0m' : '0 minutes');
  },

  /**
   * Apply playback speed to duration
   * @param {number} seconds - Original duration in seconds
   * @param {number} speed - Playback speed (e.g., 1.5)
   * @returns {number} Adjusted duration in seconds
   */
  applyPlaybackSpeed(seconds, speed) {
    if (!speed || speed <= 0) {
      speed = 1;
    }
    return Math.ceil(seconds / speed);
  },

  /**
   * Calculate number of days to finish based on daily minutes
   * @param {number} totalSeconds - Total content duration
   * @param {number} dailyMinutes - Minutes available per day
   * @returns {number} Number of days (rounded up)
   */
  calculateDays(totalSeconds, dailyMinutes) {
    if (!dailyMinutes || dailyMinutes <= 0) {
      return Infinity;
    }
    
    const totalMinutes = totalSeconds / 60;
    return Math.ceil(totalMinutes / dailyMinutes);
  },

  /**
   * Calculate estimated completion date
   * @param {number} days - Number of days to complete
   * @param {Date} startDate - Starting date (default: today)
   * @returns {Date} Completion date
   */
  calculateCompletionDate(days, startDate = new Date()) {
    const completionDate = new Date(startDate);
    completionDate.setDate(completionDate.getDate() + days);
    return completionDate;
  },

  /**
   * Format date in a friendly way
   * @param {Date} date - Date to format
   * @returns {string} Formatted date
   */
  formatDate(date) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Reset time for comparison
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return 'Today';
    } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
      return 'Tomorrow';
    } else {
      const options = { month: 'short', day: 'numeric', year: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    }
  },

  /**
   * Calculate videos per day based on total videos and days
   * @param {number} totalVideos - Total number of videos
   * @param {number} days - Number of days
   * @returns {number} Videos per day (rounded intelligently)
   */
  calculateVideosPerDay(totalVideos, days) {
    if (!days || days <= 0) {
      return totalVideos;
    }
    
    const videosPerDay = totalVideos / days;
    
    // Round intelligently
    if (videosPerDay < 1) {
      return 1; // At least 1 video
    } else if (videosPerDay < 5) {
      return Math.ceil(videosPerDay); // Round up for small numbers
    } else {
      return Math.round(videosPerDay); // Round to nearest for larger numbers
    }
  },

  /**
   * Get time remaining text
   * @param {number} seconds - Seconds remaining
   * @returns {string} Human-readable time remaining
   */
  getTimeRemainingText(seconds) {
    if (seconds <= 0) {
      return 'Complete!';
    }

    const hours = seconds / 3600;
    
    if (hours < 1) {
      return `${Math.ceil(seconds / 60)} min left`;
    } else if (hours < 24) {
      return `${Math.ceil(hours)} hr${Math.ceil(hours) !== 1 ? 's' : ''} left`;
    } else {
      const days = Math.ceil(hours / 24);
      return `${days} day${days !== 1 ? 's' : ''} left`;
    }
  }
};

// Export for use in other modules
export default TimeUtils;
