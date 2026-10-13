// ============================================================
// الميزان Pro - sw.js (Service Worker)
// PWA — Offline Support
// ============================================================

const CACHE_NAME = 'mizan-pro-v1.0.0';
const RUNTIME_CACHE = 'mizan-runtime-v1.0.0';

// الملفات الأساسية اللي هتتخزن
const CORE_FILES = [
    './',
    './index.html',
    './app.html',
    './style.css',
    './landing.css',

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

    './manifest.json',

    // مكتبات خارجية
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap'
];

// ═══════════════════════════════════════════════════════════
// Install — تخزين الملفات الأساسية
// ═══════════════════════════════════════════════════════════

self.addEventListener('install', function(event) {
    console.log('📦 SW: تثبيت');

    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log('📦 SW: تخزين الملفات الأساسية');

            return Promise.all(
                CORE_FILES.map(function(url) {
                    return cache.add(url).catch(function(err) {
                        console.warn('⚠️ SW: فشل تخزين ' + url, err);
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
// Activate — تنظيف النسخ القديمة
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
// Fetch — اعتراض الطلبات
// ═══════════════════════════════════════════════════════════

self.addEventListener('fetch', function(event) {
    const url = event.request.url;

    // تجاهل Firebase
    if (url.includes('firebase') ||
        url.includes('googleapis.com') ||
        url.includes('gstatic.com/firebasejs')) {
        return;
    }

    // تجاهل الطلبات غير GET
    if (event.request.method !== 'GET') {
        return;
    }

    // استراتيجية: Cache First للـ CDN
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

    // استراتيجية: Network First للملفات المحلية
    event.respondWith(
        fetch(event.request)
            .then(function(response) {
                // لو نجح، خزنه
                if (response && response.status === 200) {
                    const clone = response.clone();
                    caches.open(RUNTIME_CACHE).then(function(cache) {
                        cache.put(event.request, clone);
                    });
                }
                return response;
            })
            .catch(function() {
                // لو فشل، جيب من الـ cache
                return caches.match(event.request).then(function(response) {
                    if (response) {
                        return response;
                    }

                    // لو الملف مش موجود في الـ cache
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
// رسائل من التطبيق
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
        });
    }
});

// ═══════════════════════════════════════════════════════════
// Sync in Background
// ═══════════════════════════════════════════════════════════

self.addEventListener('sync', function(event) {
    if (event.tag === 'mizan-sync') {
        console.log('🔄 SW: بدء المزامنة في الخلفية');
        event.waitUntil(syncData());
    }
});

async function syncData() {
    try {
        const clients = await self.clients.matchAll();
        clients.forEach(function(client) {
            client.postMessage({ type: 'SYNC_NOW' });
        });
    } catch (e) {
        console.error('❌ SW: فشل المزامنة', e);
    }
}

console.log('✅ SW: جاهز');
