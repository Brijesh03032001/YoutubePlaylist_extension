/**
 * Popup Script
 */

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Popup] Loaded');

  // Get elements
  const notPlaylistState = document.getElementById('not-playlist-state');
  const playlistState = document.getElementById('playlist-state');
  const loadingState = document.getElementById('loading-state');
  const clearCacheBtn = document.getElementById('clear-cache-btn');
  const settingsBtn = document.getElementById('settings-btn');

  /**
   * Show specific state
   */
  function showState(state) {
    notPlaylistState.classList.add('hidden');
    playlistState.classList.add('hidden');
    loadingState.classList.add('hidden');

    switch (state) {
      case 'not-playlist':
        notPlaylistState.classList.remove('hidden');
        break;
      case 'playlist':
        playlistState.classList.remove('hidden');
        break;
      case 'loading':
        loadingState.classList.remove('hidden');
        break;
    }
  }

  /**
   * Load and display data
   */
  async function loadData() {
    try {
      showState('loading');

      // Get all playlists
      const result = await chrome.storage.local.get(['ytpp_playlists', 'ytpp_progress']);
      const playlists = result.ytpp_playlists || {};
      const progress = result.ytpp_progress || {};

      const playlistEntries = Object.entries(playlists);

      if (playlistEntries.length === 0) {
        showState('not-playlist');
        return;
      }

      // Calculate totals
      let totalWatched = 0;
      playlistEntries.forEach(([id, playlist]) => {
        const playlistProgress = progress[id];
        if (playlistProgress && playlistProgress.watchedVideos) {
          totalWatched += playlistProgress.watchedVideos.length;
        }
      });

      // Update stats
      document.getElementById('total-playlists').textContent = playlistEntries.length;
      document.getElementById('total-watched').textContent = totalWatched;

      // Sort by last updated
      const sortedPlaylists = playlistEntries.sort((a, b) => {
        return (b[1].lastUpdated || 0) - (a[1].lastUpdated || 0);
      });

      // Display recent playlists
      const recentPlaylistsContainer = document.getElementById('recent-playlists');
      recentPlaylistsContainer.innerHTML = '';

      // Show top 5
      const recentPlaylists = sortedPlaylists.slice(0, 5);

      if (recentPlaylists.length === 0) {
        recentPlaylistsContainer.innerHTML = '<p class="empty-text">No playlists tracked yet.</p>';
      } else {
        recentPlaylists.forEach(([id, playlist]) => {
          const item = createPlaylistItem(id, playlist, progress[id]);
          recentPlaylistsContainer.appendChild(item);
        });
      }

      showState('playlist');

    } catch (error) {
      console.error('[Popup] Error loading data:', error);
      showState('not-playlist');
    }
  }

  /**
   * Create playlist item element
   */
  function createPlaylistItem(id, playlist, progressData) {
    const item = document.createElement('a');
    item.className = 'playlist-item';
    item.href = playlist.url || `https://www.youtube.com/playlist?list=${id}`;
    item.target = '_blank';

    // Title
    const title = document.createElement('div');
    title.className = 'playlist-item-title';
    title.textContent = playlist.customName || playlist.title || 'Untitled Playlist';
    item.appendChild(title);

    // Meta
    const meta = document.createElement('div');
    meta.className = 'playlist-item-meta';

    const videoCount = playlist.statistics?.availableVideos || playlist.videoCount || 0;
    const duration = playlist.statistics?.totalDuration || 0;

    meta.innerHTML = `
      <span>📊 ${videoCount} videos</span>
      <span>⏱️ ${formatDuration(duration)}</span>
    `;
    item.appendChild(meta);

    // Progress
    if (progressData && progressData.watchedVideos) {
      const watchedCount = progressData.watchedVideos.length;
      const percentComplete = videoCount > 0 
        ? Math.round((watchedCount / videoCount) * 100) 
        : 0;

      const progressContainer = document.createElement('div');
      progressContainer.className = 'playlist-item-progress';

      const progressBarBg = document.createElement('div');
      progressBarBg.className = 'progress-bar-bg';

      const progressBarFill = document.createElement('div');
      progressBarFill.className = 'progress-bar-fill';
      progressBarFill.style.width = `${percentComplete}%`;

      progressBarBg.appendChild(progressBarFill);

      const progressText = document.createElement('div');
      progressText.className = 'progress-text';
      progressText.textContent = `${percentComplete}% complete • ${watchedCount}/${videoCount} watched`;

      progressContainer.appendChild(progressBarBg);
      progressContainer.appendChild(progressText);

      item.appendChild(progressContainer);
    }

    return item;
  }

  /**
   * Format duration
   */
  function formatDuration(seconds) {
    if (!seconds) return '0m';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Clear cache
   */
  clearCacheBtn.addEventListener('click', async () => {
    if (confirm('Clear all cached playlist data? (Progress tracking will be preserved)')) {
      try {
        await chrome.storage.local.remove(['ytpp_playlists']);
        alert('Cache cleared successfully!');
        loadData();
      } catch (error) {
        console.error('[Popup] Error clearing cache:', error);
        alert('Failed to clear cache.');
      }
    }
  });

  /**
   * Settings (placeholder)
   */
  settingsBtn.addEventListener('click', () => {
    alert('Settings panel coming soon!\n\nFor now, adjust settings directly on playlist pages.');
  });

  // Initial load
  loadData();

  // Refresh when storage changes
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
      loadData();
    }
  });
});
