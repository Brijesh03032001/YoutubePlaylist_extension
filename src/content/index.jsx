import React from 'react';
import ReactDOM from 'react-dom/client';
import ContentApp from './ContentApp';
import '../styles/index.css';

const MOUNT_POINT_ID = 'ytpp-root';

function mount() {
  console.log('[YTPP Content] Mounting React app...');
  
  const existingRoot = document.getElementById(MOUNT_POINT_ID);
  if (existingRoot) {
    console.log('[YTPP Content] Root already exists, skipping mount');
    return;
  }

  const root = document.createElement('div');
  root.id = MOUNT_POINT_ID;
  document.body.appendChild(root);
  
  console.log('[YTPP Content] Root element created and appended to body');

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ContentApp />
    </React.StrictMode>
  );
  
  console.log('[YTPP Content] React app rendered');
}

// Initial mount
mount();

// Watch for re-injections if needed (though content scripts usually run once per page load)
// YouTube navigation is SPA, so we might need logic to unmount/remount or just let the App handle visibility.
