// Service Worker for Caching and Offline Support

const CACHE_NAME = 'beitshemeshtech-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/talent.html',
    '/news.html',
    '/contact.html',
    '/admin/login.html',
    '/css/style.css',
    '/css/admin.css',
    '/css/talent.css',
    '/css/news.css',
    '/css/contact.css',
    '/js/main.js',
    '/js/admin-login.js',
    '/js/admin-dashboard.js',
    '/js/news.js',
    '/js/contact.js',
    '/js/talent.js',
    '/js/performance.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install Service Worker
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch requests
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                
                // Clone the request
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest).then(
                    function(response) {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    }
                );
            })
    );
});

// Activate Service Worker
self.addEventListener('activate', function(event) {
    const cacheWhitelist = [CACHE_NAME];
    
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Background sync for form submissions
self.addEventListener('sync', function(event) {
    if (event.tag === 'contact-form') {
        event.waitUntil(syncContactForm());
    }
});

function syncContactForm() {
    return self.registration.showNotification('הטופס נשלח בהצלחה!', {
        body: 'הפרטים שלך נשמרו ויעובדו כשהחיבור יתחדש.',
        icon: '/images/icon-192x192.png',
        badge: '/images/badge-72x72.png'
    });
}

// Push notifications
self.addEventListener('push', function(event) {
    const options = {
        body: event.data.text(),
        icon: '/images/icon-192x192.png',
        badge: '/images/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'צפה בפרטים',
                icon: '/images/checkmark.png'
            },
            {
                action: 'close',
                title: 'סגור',
                icon: '/images/xmark.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('הייטק בית שמש', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});