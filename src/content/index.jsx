import React from 'react';
import ReactDOM from 'react-dom/client';
import ContentApp from './ContentApp';
import '../styles/index.css';

const MOUNT_POINT_ID = 'ytpp-root';

function mount() {
  const existingRoot = document.getElementById(MOUNT_POINT_ID);
  if (existingRoot) return;

  const root = document.createElement('div');
  root.id = MOUNT_POINT_ID;
  document.body.appendChild(root);

  // shadow DOM is often better for isolation, but for now standard DOM with scoped styles/Tailwind prefix is easier to debug
  // We'll use our css file which is scoped effectively by the build process or manual prefixing if needed.
  // Actually, our tailwind config is global. To avoid conflicts, Shadow DOM is best.
  // But injecting styles into Shadow DOM with Vite/Tailwind can be tricky. 
  // Let's stick to normal DOM for now, but use a high z-index wrapper.

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ContentApp />
    </React.StrictMode>
  );
}

// Initial mount
mount();

// Watch for re-injections if needed (though content scripts usually run once per page load)
// YouTube navigation is SPA, so we might need logic to unmount/remount or just let the App handle visibility.
