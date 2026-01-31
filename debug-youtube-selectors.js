/**
 * Debug Script - Paste this in the browser console on a YouTube playlist page
 * This will help us find the correct selectors
 */

console.log('=== YouTube Playlist Debug ===');
console.log('URL:', window.location.href);

// Try different selectors for playlist title
console.log('\n--- Playlist Title Selectors ---');
const titleSelectors = [
  'h1.ytd-playlist-header-renderer',
  'yt-formatted-string.ytd-playlist-header-renderer',
  '#title h1',
  'ytd-playlist-header-renderer h1',
  '.ytd-playlist-header-renderer h1'
];

titleSelectors.forEach(selector => {
  const el = document.querySelector(selector);
  console.log(selector, '→', el ? el.textContent.trim() : 'NOT FOUND');
});

// Try different selectors for video items
console.log('\n--- Video Item Selectors ---');
const videoSelectors = [
  'ytd-playlist-video-renderer',
  'ytd-playlist-video-list-renderer ytd-playlist-video-renderer',
  '#contents ytd-playlist-video-renderer',
  '.ytd-playlist-video-renderer'
];

videoSelectors.forEach(selector => {
  const els = document.querySelectorAll(selector);
  console.log(selector, '→', els.length, 'videos found');
});

// Check actual video elements
const videos = document.querySelectorAll('ytd-playlist-video-renderer');
console.log('\n--- First Video Details ---');
if (videos.length > 0) {
  const first = videos[0];
  console.log('Video element:', first);
  
  // Title
  const title = first.querySelector('#video-title, a#video-title');
  console.log('Title:', title ? title.textContent.trim() : 'NOT FOUND');
  
  // Duration
  const duration = first.querySelector('ytd-thumbnail-overlay-time-status-renderer span');
  console.log('Duration element:', duration);
  console.log('Duration text:', duration ? duration.textContent.trim() : 'NOT FOUND');
  console.log('Duration aria-label:', duration ? duration.getAttribute('aria-label') : 'N/A');
} else {
  console.log('No video elements found!');
  console.log('Page might still be loading or selectors are wrong.');
}

// Check stats
console.log('\n--- Playlist Stats ---');
const statsSelectors = [
  '#stats',
  '.ytd-playlist-header-renderer #stats',
  'ytd-playlist-header-renderer #stats'
];

statsSelectors.forEach(selector => {
  const el = document.querySelector(selector);
  console.log(selector, '→', el ? el.textContent.trim() : 'NOT FOUND');
});

console.log('\n=== Debug Complete ===');
console.log('Copy these results and share them!');
