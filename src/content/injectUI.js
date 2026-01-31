/**
 * UI Injection - Injects planner card into YouTube page
 */

const UIInjector = {
  /**
   * Inject the planner card
   * @param {object} playlistData - Playlist data
   */
  async inject(playlistData) {
    try {
      // Remove existing if present
      this.remove();

      // Load saved settings
      const settings = await StorageUtils.getSettings();
      
      // Update planner card state with saved settings
      PlannerCard.state.playbackSpeed = settings.playbackSpeed || CONFIG.DEFAULT_PLAYBACK_SPEED;
      PlannerCard.state.dailyMinutes = settings.dailyMinutes || CONFIG.DEFAULT_DAILY_MINUTES;

      // Build and inject card
      const card = PlannerCard.build(playlistData);
      document.body.appendChild(card);

      // Add fade-in animation
      requestAnimationFrame(() => {
        card.classList.add('ytpp-fade-in');
      });

      console.log('[UI] Planner card injected successfully');
    } catch (error) {
      console.error('[UI] Error injecting card:', error);
    }
  },

  /**
   * Inject lite planner card (just name)
   * @param {object} metadata - Playlist metadata
   */
  async injectLite(metadata) {
    try {
      this.remove();
      
      const card = PlannerCard.buildLite(metadata);
      document.body.appendChild(card);
      
      requestAnimationFrame(() => {
        const innerCard = card.querySelector('.ytpp-card');
        if (innerCard) innerCard.classList.add('ytpp-fade-in');
      });

      console.log('[UI] Lite planner card injected');
    } catch (error) {
      console.error('[UI] Error injecting lite card:', error);
    }
  },

  /**
   * Show loading state
   */
  showLoading() {
    // Only show loading if we're actually on a playlist page
    if (!PlaylistParser.isPlaylistPage()) {
      return;
    }
    this.remove();
    const loading = PlannerCard.showLoading();
    document.body.appendChild(loading);
  },

  /**
   * Show error state
   */
  showError(message) {
    this.remove();
    const error = PlannerCard.showError(message);
    document.body.appendChild(error);
  },

  /**
   * Remove the planner card
   */
  remove() {
    const existing = document.getElementById('ytpp-planner-container');
    if (existing) {
      existing.remove();
    }
  },

  /**
   * Update the card with new data
   * @param {object} playlistData - Updated playlist data
   */
  async update(playlistData) {
    const existing = document.getElementById('ytpp-planner-container');
    if (existing) {
      await this.inject(playlistData);
    }
  },

  /**
   * Check if card is currently visible
   */
  isVisible() {
    return !!document.getElementById('ytpp-planner-container');
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIInjector;
}
