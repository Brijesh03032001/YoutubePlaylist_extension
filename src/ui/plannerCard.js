/**
 * Planner Card - UI Component Builder
 */

const PlannerCard = {
  /**
   * Current state
   */
  state: {
    playlistData: null,
    playbackSpeed: CONFIG.DEFAULT_PLAYBACK_SPEED,
    dailyMinutes: CONFIG.DEFAULT_DAILY_MINUTES,
    customMinutes: null
  },

  /**
   * Build the main planner card
   * @param {object} playlistData - Playlist data
   * @returns {Element}
   */
  build(playlistData) {
    this.state.playlistData = playlistData;
    
    const container = DOMUtils.createElement('div', { 
      id: 'ytpp-planner-container' 
    });

    const card = DOMUtils.createElement('div', { 
      class: 'ytpp-card' 
    });

    // Build sections
    card.appendChild(this.buildHeader());
    card.appendChild(this.buildBody());

    container.appendChild(card);
    
    return container;
  },

  /**
   * Build the lite planner card (for watch pages)
   * @param {object} metadata - Playlist metadata
   * @returns {Element}
   */
  buildLite(metadata) {
    const container = DOMUtils.createElement('div', { 
      id: 'ytpp-planner-container',
      class: 'ytpp-lite-container' // Add class for specific styling
    });

    const card = DOMUtils.createElement('div', { 
      class: 'ytpp-card ytpp-lite-card' 
    });

    const header = DOMUtils.createElement('div', { class: 'ytpp-header-lite' });
    
    // Icon
    const icon = DOMUtils.createElement('span', { class: 'ytpp-icon' }, '📚');
    
    // Title with link to full playlist
    const titleLink = DOMUtils.createElement('a', { 
      class: 'ytpp-lite-title',
      href: metadata.url,
      title: 'Open full planner'
    }, metadata.title);

    // Close button
    const closeBtn = DOMUtils.createElement('button', { 
      class: 'ytpp-close-btn ytpp-lite-close',
      'aria-label': 'Close'
    }, '✕');
    
    closeBtn.addEventListener('click', () => {
      document.getElementById('ytpp-planner-container')?.remove();
    });

    header.appendChild(icon);
    header.appendChild(titleLink);
    header.appendChild(closeBtn);

    card.appendChild(header);
    container.appendChild(card);
    
    // Add specific styles for lite mode if needed inline, or rely on CSS
    // For now we'll reuse card styles but make it compact
    card.style.padding = '12px 16px';
    card.style.minWidth = 'auto';
    card.style.width = 'auto';
    card.style.display = 'inline-block';
    
    return container;
  },

  /**
   * Build header section
   */
  buildHeader() {
    const { playlistData } = this.state;
    const { statistics } = playlistData;

    const header = DOMUtils.createElement('div', { class: 'ytpp-header' });

    // Top row with title and close button
    const headerTop = DOMUtils.createElement('div', { class: 'ytpp-header-top' });
    
    const title = DOMUtils.createElement('h2', { class: 'ytpp-title' }, '📚 Smart Planner');

    const closeBtn = DOMUtils.createElement('button', { 
      class: 'ytpp-close-btn',
      'aria-label': 'Close planner'
    }, '✕');
    
    closeBtn.addEventListener('click', () => {
      document.getElementById('ytpp-planner-container')?.remove();
    });

    headerTop.appendChild(title);
    headerTop.appendChild(closeBtn);

    // Subtitle with playlist info
    const subtitle = DOMUtils.createElement('p', { class: 'ytpp-subtitle' }, 
      `${statistics.availableVideos} videos • ${TimeUtils.formatDuration(statistics.totalDuration, true)}`
    );

    // Progress bar
    const progressContainer = DOMUtils.createElement('div', { 
      class: 'ytpp-progress-container' 
    });
    
    const progressBar = DOMUtils.createElement('div', { 
      class: 'ytpp-progress-bar',
      style: { width: `${statistics.percentComplete}%` }
    });

    progressContainer.appendChild(progressBar);

    const progressText = DOMUtils.createElement('div', { 
      class: 'ytpp-progress-text' 
    }, `${statistics.percentComplete}% complete • ${statistics.watchedCount}/${statistics.availableVideos} watched`);

    header.appendChild(headerTop);
    header.appendChild(subtitle);
    header.appendChild(progressContainer);
    header.appendChild(progressText);

    return header;
  },

  /**
   * Build body section
   */
  buildBody() {
    const body = DOMUtils.createElement('div', { class: 'ytpp-body' });

    // Stats grid
    body.appendChild(this.buildStatsGrid());

    // Playlist name input
    body.appendChild(this.buildNameInput());

    // Playback speed control
    body.appendChild(this.buildSpeedControl());

    // Daily time control
    body.appendChild(this.buildTimeControl());

    // Results
    body.appendChild(this.buildResults());

    return body;
  },

  /**
   * Build stats grid
   */
  buildStatsGrid() {
    const { playlistData } = this.state;
    const { statistics } = playlistData;

    const grid = DOMUtils.createElement('div', { class: 'ytpp-stats-grid' });

    // Remaining videos
    const videosCard = this.buildStatCard(
      'Videos Left',
      statistics.remainingVideos.toString(),
      `of ${statistics.availableVideos} total`
    );

    // Time remaining
    const timeCard = this.buildStatCard(
      'Time Left',
      TimeUtils.formatDuration(statistics.remainingDuration, true),
      'at 1× speed'
    );

    grid.appendChild(videosCard);
    grid.appendChild(timeCard);

    return grid;
  },

  /**
   * Build a single stat card
   */
  buildStatCard(label, value, sublabel) {
    const card = DOMUtils.createElement('div', { class: 'ytpp-stat-card' });
    
    const labelEl = DOMUtils.createElement('div', { 
      class: 'ytpp-stat-label' 
    }, label);
    
    const valueEl = DOMUtils.createElement('div', { 
      class: 'ytpp-stat-value' 
    }, value);
    
    const sublabelEl = DOMUtils.createElement('div', { 
      class: 'ytpp-stat-sublabel' 
    }, sublabel);

    card.appendChild(labelEl);
    card.appendChild(valueEl);
    card.appendChild(sublabelEl);

    return card;
  },

  /**
   * Build playlist name input
   */
  buildNameInput() {
    const { playlistData } = this.state;
    const group = DOMUtils.createElement('div', { class: 'ytpp-control-group' });
    
    const label = DOMUtils.createElement('label', { 
      class: 'ytpp-control-label' 
    }, '✏️ Playlist Name (Optional)');

    const inputWrapper = DOMUtils.createElement('div', { 
      class: 'ytpp-name-input-wrapper' 
    });

    const input = DOMUtils.createElement('input', {
      class: 'ytpp-input ytpp-name-input',
      type: 'text',
      placeholder: playlistData.title || 'Enter a custom name...',
      value: playlistData.customName || '',
      maxlength: '100'
    });

    const saveBtn = DOMUtils.createElement('button', {
      class: 'ytpp-btn ytpp-btn-secondary ytpp-save-name-btn'
    }, '💾 Save');

    saveBtn.addEventListener('click', async () => {
      const customName = input.value.trim();
      if (customName) {
        // Save custom name
        playlistData.customName = customName;
        await StorageUtils.savePlaylist(playlistData.id, playlistData);
        
        // Show feedback
        saveBtn.textContent = '✓ Saved!';
        saveBtn.style.background = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
        saveBtn.style.color = 'white';
        saveBtn.style.borderColor = 'transparent';
        
        setTimeout(() => {
          saveBtn.textContent = '💾 Save';
          saveBtn.style.background = '';
          saveBtn.style.color = '';
          saveBtn.style.borderColor = '';
        }, 2000);
      }
    });

    inputWrapper.appendChild(input);
    inputWrapper.appendChild(saveBtn);

    group.appendChild(label);
    group.appendChild(inputWrapper);

    return group;
  },

  /**
   * Build playback speed control
   */
  buildSpeedControl() {
    const group = DOMUtils.createElement('div', { class: 'ytpp-control-group' });
    
    const label = DOMUtils.createElement('label', { 
      class: 'ytpp-control-label' 
    }, '⚡ Playback Speed');

    const buttons = DOMUtils.createElement('div', { 
      class: 'ytpp-speed-buttons' 
    });

    CONFIG.PLAYBACK_SPEEDS.forEach(speed => {
      const btn = DOMUtils.createElement('button', {
        class: `ytpp-speed-btn ${speed === this.state.playbackSpeed ? 'active' : ''}`,
        'data-speed': speed
      }, `${speed}×`);

      btn.addEventListener('click', () => {
        this.updateSpeed(speed);
      });

      buttons.appendChild(btn);
    });

    group.appendChild(label);
    group.appendChild(buttons);

    return group;
  },

  /**
   * Build daily time control
   */
  buildTimeControl() {
    const group = DOMUtils.createElement('div', { class: 'ytpp-control-group' });
    
    const label = DOMUtils.createElement('label', { 
      class: 'ytpp-control-label' 
    }, '🎯 Daily Time Available');

    // Presets
    const presets = DOMUtils.createElement('div', { 
      class: 'ytpp-time-presets' 
    });

    CONFIG.DAILY_TIME_PRESETS.forEach(minutes => {
      const btn = DOMUtils.createElement('button', {
        class: `ytpp-time-btn ${minutes === this.state.dailyMinutes && !this.state.customMinutes ? 'active' : ''}`,
        'data-minutes': minutes
      }, `${minutes}m`);

      btn.addEventListener('click', () => {
        this.updateDailyTime(minutes, false);
      });

      presets.appendChild(btn);
    });

    // Custom input
    const customInput = DOMUtils.createElement('div', { 
      class: 'ytpp-custom-input' 
    });

    const input = DOMUtils.createElement('input', {
      class: 'ytpp-input',
      type: 'number',
      placeholder: 'Custom',
      min: '1',
      max: '1440'
    });

    input.addEventListener('input', DOMUtils.debounce((e) => {
      const value = parseInt(e.target.value, 10);
      if (value > 0) {
        this.updateDailyTime(value, true);
      }
    }, 500));

    const inputLabel = DOMUtils.createElement('span', { 
      class: 'ytpp-input-label' 
    }, 'min/day');

    customInput.appendChild(input);
    customInput.appendChild(inputLabel);

    group.appendChild(label);
    group.appendChild(presets);
    group.appendChild(customInput);

    return group;
  },

  /**
   * Build results section
   */
  buildResults() {
    const { playlistData, playbackSpeed, dailyMinutes } = this.state;
    const { statistics } = playlistData;

    // Calculate with playback speed
    const adjustedDuration = TimeUtils.applyPlaybackSpeed(
      statistics.remainingDuration, 
      playbackSpeed
    );

    const days = TimeUtils.calculateDays(adjustedDuration, dailyMinutes);
    const completionDate = TimeUtils.calculateCompletionDate(days);
    const videosPerDay = TimeUtils.calculateVideosPerDay(
      statistics.remainingVideos, 
      days
    );

    // Results card
    const results = DOMUtils.createElement('div', { class: 'ytpp-results' });
    
    const resultsTitle = DOMUtils.createElement('h3', { 
      class: 'ytpp-results-title' 
    }, '📊 Your Plan');

    results.appendChild(resultsTitle);

    // Result items
    const items = [
      {
        label: 'Adjusted time',
        value: TimeUtils.formatDuration(adjustedDuration, true)
      },
      {
        label: 'Days to finish',
        value: days === Infinity ? '∞' : `${days} days`
      },
      {
        label: 'Finish by',
        value: days === Infinity ? 'Set daily time' : TimeUtils.formatDate(completionDate)
      }
    ];

    items.forEach(item => {
      const itemEl = DOMUtils.createElement('div', { class: 'ytpp-result-item' });
      
      const labelEl = DOMUtils.createElement('span', { 
        class: 'ytpp-result-label' 
      }, item.label);
      
      const valueEl = DOMUtils.createElement('span', { 
        class: 'ytpp-result-value' 
      }, item.value);

      itemEl.appendChild(labelEl);
      itemEl.appendChild(valueEl);
      results.appendChild(itemEl);
    });

    // Today's target
    if (days !== Infinity) {
      const target = DOMUtils.createElement('div', { class: 'ytpp-target' });
      
      const targetTitle = DOMUtils.createElement('div', { 
        class: 'ytpp-target-title' 
      }, "Today's Target");
      
      const targetValue = DOMUtils.createElement('div', { 
        class: 'ytpp-target-value' 
      }, `${videosPerDay} videos`);
      
      const targetSublabel = DOMUtils.createElement('div', { 
        class: 'ytpp-target-sublabel' 
      }, `≈ ${dailyMinutes} minutes per day`);

      target.appendChild(targetTitle);
      target.appendChild(targetValue);
      target.appendChild(targetSublabel);

      results.appendChild(target);
    }

    return results;
  },

  /**
   * Update playback speed
   */
  updateSpeed(speed) {
    this.state.playbackSpeed = speed;
    
    // Update active button
    document.querySelectorAll('.ytpp-speed-btn').forEach(btn => {
      btn.classList.toggle('active', parseFloat(btn.dataset.speed) === speed);
    });

    // Recalculate and update results
    this.updateResults();
    
    // Save to storage
    StorageUtils.saveSettings({ playbackSpeed: speed });
  },

  /**
   * Update daily time
   */
  updateDailyTime(minutes, isCustom) {
    this.state.dailyMinutes = minutes;
    this.state.customMinutes = isCustom ? minutes : null;

    // Update active button (only if not custom)
    if (!isCustom) {
      document.querySelectorAll('.ytpp-time-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.minutes) === minutes);
      });
    } else {
      // Deactivate all preset buttons
      document.querySelectorAll('.ytpp-time-btn').forEach(btn => {
        btn.classList.remove('active');
      });
    }

    // Recalculate and update results
    this.updateResults();
    
    // Save to storage
    StorageUtils.saveSettings({ dailyMinutes: minutes });
  },

  /**
   * Update results section
   */
  updateResults() {
    const resultsSection = document.querySelector('.ytpp-results');
    if (resultsSection) {
      const newResults = this.buildResults();
      resultsSection.replaceWith(newResults);
    }
  },

  /**
   * Show loading state
   */
  showLoading() {
    const container = DOMUtils.createElement('div', { 
      id: 'ytpp-planner-container' 
    });

    const card = DOMUtils.createElement('div', { class: 'ytpp-card' });
    
    const loading = DOMUtils.createElement('div', { class: 'ytpp-loading' });
    loading.innerHTML = `
      <div class="ytpp-spinner"></div>
      <div>Analyzing playlist...</div>
    `;

    card.appendChild(loading);
    container.appendChild(card);

    return container;
  },

  /**
   * Show error state
   */
  showError(message) {
    const container = DOMUtils.createElement('div', { 
      id: 'ytpp-planner-container' 
    });

    const card = DOMUtils.createElement('div', { class: 'ytpp-card' });
    
    const error = DOMUtils.createElement('div', { class: 'ytpp-error' });
    error.textContent = message || 'Failed to load playlist. Please refresh the page.';

    card.appendChild(error);
    container.appendChild(card);

    return container;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlannerCard;
}
