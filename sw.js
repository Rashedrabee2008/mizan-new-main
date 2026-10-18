// ============================================================
// الميزان Pro - sw.js v2.0 (إصلاح شامل)
// 🔧 Service Worker محسّن + Cache ديناميكي
// ============================================================

const CACHE_NAME = 'mizan-pro-v99.0.0';
const RUNTIME_CACHE = 'mizan-runtime-v99.0.0';

const CORE_FILES = [
    './',
    './index.html',
    './app.html',
    './style.css',
    './landing.css',
    './manifest.json',

    './core.js',
    './data.js',
    './ui.js',
    './app.js',
    './pos.js',
    './search.js',
    './tenant.js',
    './activation.js',
    './inventory.js',
    './accounting.js',
    './dashboard.js',
    './extras.js',
    './warehouses.js',
    './sharabar.js',

    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap'
];

// ═══════════════════════════════════════════════════════════
// Install
// ═══════════════════════════════════════════════════════════

self.addEventListener('install', function(event) {
    console.log('📦 SW: تثبيت');

    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log('📦 SW: تخزين ' + CORE_FILES.length + ' ملف');

            return Promise.all(
                CORE_FILES.map(function(url) {
                    return cache.add(url).catch(function(err) {
                        console.warn('⚠️ SW: فشل ' + url);
                    });
                })
            );
        }).then(function() {
            console.log('✅ SW: تم التثبيت');
            return self.skipWaiting();
        })
    );
});

// ═══════════════════════════════════════════════════════════
// Activate
// ═══════════════════════════════════════════════════════════

self.addEventListener('activate', function(event) {
    console.log('🔄 SW: تنشيط');

    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                        console.log('🗑️ SW: حذف ' + cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(function() {
            console.log('✅ SW: تم التنشيط');
            return self.clients.claim();
        })
    );
});

// ═══════════════════════════════════════════════════════════
// Fetch
// ═══════════════════════════════════════════════════════════

self.addEventListener('fetch', function(event) {
    const url = event.request.url;
    const method = event.request.method;

    if (url.includes('firebase') ||
        url.includes('googleapis.com/identitytoolkit') ||
        url.includes('gstatic.com/firebasejs')) {
        return;
    }

    if (method !== 'GET') {
        return;
    }

    if (url.includes('cdnjs.cloudflare.com') ||
        url.includes('fonts.googleapis.com') ||
        url.includes('fonts.gstatic.com')) {

        event.respondWith(
            caches.match(event.request).then(function(response) {
                if (response) return response;

                return fetch(event.request).then(function(res) {
                    return caches.open(RUNTIME_CACHE).then(function(cache) {
                        cache.put(event.request, res.clone());
                        return res;
                    });
                });
            })
        );
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(function(response) {
                if (response && response.status === 200 && response.type === 'basic') {
                    const clone = response.clone();
                    caches.open(RUNTIME_CACHE).then(function(cache) {
                        cache.put(event.request, clone).catch(function() {});
                    });
                }
                return response;
            })
            .catch(function() {
                return caches.match(event.request).then(function(response) {
                    if (response) return response;

                    if (event.request.mode === 'navigate') {
                        return caches.match('./index.html');
                    }

                    return new Response('⚠️ أنت غير متصل بالإنترنت', {
                        status: 503,
                        statusText: 'Offline',
                        headers: new Headers({
                            'Content-Type': 'text/html; charset=utf-8'
                        })
                    });
                });
            })
    );
});

// ═══════════════════════════════════════════════════════════
// Messages
// ═══════════════════════════════════════════════════════════

self.addEventListener('message', function(event) {
    const data = event.data;

    if (data === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (data && data.type === 'CLEAR_CACHE') {
        caches.keys().then(function(names) {
            return Promise.all(names.map(function(name) {
                return caches.delete(name);
            }));
        }).then(function() {
            console.log('🗑️ SW: تم مسح الـ Cache');
        });
    }

    if (data && data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

// ═══════════════════════════════════════════════════════════
// Background Sync
// ═══════════════════════════════════════════════════════════

self.addEventListener('sync', function(event) {
    if (event.tag === 'mizan-sync') {
        console.log('🔄 SW: مزامنة في الخلفية');
        event.waitUntil(notifyClientsToSync());
    }
});

async function notifyClientsToSync() {
    try {
        const clients = await self.clients.matchAll();
        clients.forEach(function(client) {
            client.postMessage({ type: 'SYNC_NOW' });
        });
    } catch (e) {
        console.error('❌ SW: فشل المزامنة', e);
    }
}

// ═══════════════════════════════════════════════════════════
// Push Notifications
// ═══════════════════════════════════════════════════════════

self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'الميزان Pro';
    const options = {
        body: data.body || 'إشعار جديد',
        icon: data.icon || './icon.png',
        badge: './icon.png',
        vibrate: [200, 100, 200]
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('./app.html')
    );
});

console.log('✅ SW v2.0: جاهز');
