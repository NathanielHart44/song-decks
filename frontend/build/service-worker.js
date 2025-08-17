/* eslint-disable no-restricted-globals */
// service-worker.js

self.addEventListener('install', event => {
    // Perform install steps
    console.log('Service Worker: Installed');
});

self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker: Activated');
    // Clean up old caches
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    console.log('Service Worker: Clearing Cache');
                    return caches.delete(cache);
                })
            );
        })
    );
});