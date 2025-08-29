/**
 * Bible RPG Template - Service Worker
 * Version: 1.0.0
 * Description: Progressive Web App service worker for offline functionality
 */

const CACHE_NAME = 'bible-rpg-v1.0.0';
const STATIC_CACHE = 'bible-rpg-static-v1.0.0';
const DYNAMIC_CACHE = 'bible-rpg-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
  './',
  './index.html',
  './manifest.json',
  './css/main.css',
  './css/components.css',
  './css/responsive.css',
  './js/utils.js',
  './js/game-engine.js',
  './js/ui-components.js',
  './js/accessibility.js',
  './js/main.js',
  './assets/icons/favicon-32x32.png',
  './assets/icons/favicon-16x16.png',
  './assets/icons/apple-touch-icon.png'
];

// URLs to cache dynamically (user-generated content)
const DYNAMIC_URLS = [
  '/api/',
  '/save/',
  '/assets/images/'
];

// Maximum number of dynamic cache entries
const MAX_DYNAMIC_CACHE_SIZE = 50;

/**
 * Install event - cache static files
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('[SW] Static files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static files:', error);
      })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

/**
 * Fetch event - serve cached files or fetch from network
 */
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // Handle different types of requests
  if (isStaticFile(request.url)) {
    event.respondWith(handleStaticFile(request));
  } else if (isDynamicFile(request.url)) {
    event.respondWith(handleDynamicFile(request));
  } else {
    event.respondWith(handleGenericRequest(request));
  }
});

/**
 * Check if URL is a static file
 * @param {string} url - Request URL
 * @returns {boolean} True if static file
 */
function isStaticFile(url) {
  return STATIC_FILES.some(file => url.endsWith(file)) ||
         url.includes('/css/') ||
         url.includes('/js/') ||
         url.includes('/assets/icons/');
}

/**
 * Check if URL is a dynamic file
 * @param {string} url - Request URL
 * @returns {boolean} True if dynamic file
 */
function isDynamicFile(url) {
  return DYNAMIC_URLS.some(pattern => url.includes(pattern));
}

/**
 * Handle static file requests (cache first strategy)
 * @param {Request} request - Fetch request
 * @returns {Promise<Response>} Response promise
 */
async function handleStaticFile(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Static file request failed:', error);
    
    // Return offline fallback for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      return getOfflineFallback();
    }
    
    throw error;
  }
}

/**
 * Handle dynamic file requests (network first strategy)
 * @param {Request} request - Fetch request
 * @returns {Promise<Response>} Response promise
 */
async function handleDynamicFile(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE);
      
      // Limit cache size
      await limitCacheSize(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_SIZE);
      
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

/**
 * Handle generic requests (stale while revalidate strategy)
 * @param {Request} request - Fetch request
 * @returns {Promise<Response>} Response promise
 */
async function handleGenericRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    // Fetch fresh version in background
    const fetchPromise = fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    }).catch(() => {
      // Network failed, ignore
    });
    
    // Return cached version immediately if available
    if (cachedResponse) {
      fetchPromise; // Fire and forget
      return cachedResponse;
    }
    
    // Wait for network if no cache
    return await fetchPromise;
  } catch (error) {
    console.error('[SW] Generic request failed:', error);
    throw error;
  }
}

/**
 * Get offline fallback page
 * @returns {Promise<Response>} Offline fallback response
 */
async function getOfflineFallback() {
  const cache = await caches.open(STATIC_CACHE);
  const fallback = await cache.match('./index.html');
  
  if (fallback) {
    return fallback;
  }
  
  // Create a basic offline response
  return new Response(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Bible RPG - Offline</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: system-ui, sans-serif;
            text-align: center;
            padding: 2rem;
            background: linear-gradient(135deg, #0f1222 0%, #2d3a4a 100%);
            color: #e9ebff;
            min-height: 100vh;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
          }
          .icon { font-size: 4rem; margin-bottom: 1rem; }
          h1 { margin: 0 0 1rem 0; }
          p { margin: 0 0 2rem 0; opacity: 0.8; }
          button {
            background: #4a7a3c;
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 0.5rem;
            font-size: 1rem;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <div class="icon">✝️</div>
        <h1>Bible RPG</h1>
        <p>You're currently offline. Please check your internet connection.</p>
        <button onclick="location.reload()">Try Again</button>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}

/**
 * Limit cache size by removing oldest entries
 * @param {string} cacheName - Name of cache to limit
 * @param {number} maxSize - Maximum number of entries
 */
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxSize) {
    const entriesToDelete = keys.length - maxSize;
    for (let i = 0; i < entriesToDelete; i++) {
      await cache.delete(keys[i]);
    }
  }
}

/**
 * Handle background sync for saving game data
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'save-game') {
    event.waitUntil(handleGameSave());
  }
});

/**
 * Handle game save synchronization
 */
async function handleGameSave() {
  try {
    console.log('[SW] Syncing game save data...');
    
    // Get pending save data from IndexedDB or other storage
    // This would integrate with the game's save system
    
    // For now, just log that sync was attempted
    console.log('[SW] Game save sync completed');
  } catch (error) {
    console.error('[SW] Game save sync failed:', error);
    throw error;
  }
}

/**
 * Handle push notifications (for future features)
 */
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'A message from Bible RPG',
      icon: './assets/icons/icon-192x192.png',
      badge: './assets/icons/badge-72x72.png',
      tag: data.tag || 'bible-rpg-notification',
      vibrate: [200, 100, 200],
      data: data.data || {},
      actions: data.actions || []
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'Bible RPG',
        options
      )
    );
  } catch (error) {
    console.error('[SW] Push notification error:', error);
  }
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;
  
  // Handle different notification actions
  let url = './';
  if (action === 'open-game') {
    url = './index.html';
  } else if (action === 'continue-quest' && data.questId) {
    url = `./index.html?quest=${data.questId}`;
  }
  
  event.waitUntil(
    clients.matchAll().then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window/tab
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

/**
 * Handle periodic background sync (for future features)
 */
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-verse') {
    event.waitUntil(handleDailyVerse());
  }
});

/**
 * Handle daily verse updates
 */
async function handleDailyVerse() {
  try {
    console.log('[SW] Updating daily verse...');
    
    // Fetch daily verse and cache it
    // This would integrate with a biblical verse API
    
    console.log('[SW] Daily verse updated');
  } catch (error) {
    console.error('[SW] Daily verse update failed:', error);
  }
}