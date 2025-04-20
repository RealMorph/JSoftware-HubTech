module.exports = {
  globDirectory: 'dist/',
  globPatterns: [
    '**/*.{html,js,css,png,jpg,jpeg,gif,svg,woff,woff2,ttf,eot,ico}',
  ],
  swDest: 'dist/service-worker.js',
  clientsClaim: true,
  skipWaiting: true,
  // Don't include the service worker itself or source maps
  globIgnores: ['service-worker.js', '**/*.map'],
  // Custom injection point for the service worker
  swSrc: 'src/service-worker.js',
  // Use injection point for precache manifest
  injectManifest: {
    injectionPoint: 'self.__WB_MANIFEST',
  },
  // Set up runtime caching for API requests and other dynamic content
  runtimeCaching: [
    {
      // Cache API requests
      urlPattern: /^https:\/\/firestore\.googleapis\.com\/v1/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24, // 24 hours
        },
        backgroundSync: {
          name: 'api-queue',
        },
      },
    },
    {
      // Cache images
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      // Cache web fonts
      urlPattern: /\.(?:woff|woff2|ttf|eot)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'fonts-cache',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
  ],
}; 