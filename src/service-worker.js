import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { clientsClaim } from 'workbox-core';

// Use the self.__WB_MANIFEST injection point to get the precache list
precacheAndRoute(self.__WB_MANIFEST);

// Take control of all clients as soon as the service worker activates
self.skipWaiting();
clientsClaim();

// Background sync for API requests that fail
const bgSyncPlugin = new BackgroundSyncPlugin('api-queue', {
  maxRetentionTime: 24 * 60, // Retry for up to 24 hours (specified in minutes)
});

// Network first for API requests
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24, // 24 hours
      }),
      bgSyncPlugin,
    ],
  })
);

// Cache first for images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// StaleWhileRevalidate for stylesheets and scripts
registerRoute(
  ({ request }) => 
    request.destination === 'style' || 
    request.destination === 'script',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
);

// Cache fonts with a Cache First strategy
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'fonts-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
    ],
  })
);

// Create a specific route for the offline fallback page
const FALLBACK_HTML_URL = '/offline.html';

// Cache the offline fallback page
self.addEventListener('install', (event) => {
  const cacheFallback = async () => {
    const cache = await caches.open('offline-fallback');
    await cache.add(FALLBACK_HTML_URL);
  };
  event.waitUntil(cacheFallback());
});

// Use the fallback page when we can't fetch a page while offline
const htmlHandler = async (params) => {
  try {
    // Try to get the response from network first
    return await fetch(params.request);
  } catch (error) {
    // If the network fetch fails, return the offline page from the cache
    const cache = await caches.open('offline-fallback');
    return await cache.match(FALLBACK_HTML_URL);
  }
};

// Register a route for all navigation requests (HTML pages)
registerRoute(
  ({ request }) => request.mode === 'navigate',
  htmlHandler
);

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Respond to push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icons/app-icon-96x96.png',
    badge: '/icons/app-icon-96x96.png',
    data: {
      url: data.openUrl
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;
  const url = notification.data.url;
  
  event.waitUntil(
    clients.matchAll().then(clis => {
      const client = clis.find(c => c.visibilityState === 'visible');
      if (client) {
        client.navigate(url);
        client.focus();
      } else {
        clients.openWindow(url);
      }
      notification.close();
    })
  );
}); 