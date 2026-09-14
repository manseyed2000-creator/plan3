// Service Worker ساده برای نسخه‌ی وب/PWA (GitHub Pages) اپ «روتین پلنر»
// وظایف: ۱) کش کردن فایل‌های اصلی برای کار آفلاین  ۲) نمایش نوتیفیکیشن سیستمی
// از طریق self.registration.showNotification (چیزی که showAppNotification در index.html صدا می‌زند)
// ۳) وقتی کاربر روی نوتیفیکیشن ضربه می‌زند، پنجره‌ی اپ را باز/فوکوس کند.

const CACHE_NAME = 'routine-planner-cache-v1';
const CORE_ASSETS = [
    './',
    './index.html',
    './manifest.json'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// استراتژی: اول شبکه، اگر نبود از کش (برای اینکه همیشه جدیدترین نسخه لود شود ولی آفلاین هم کار کند)
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        fetch(event.request)
            .then((res) => {
                const resClone = res.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone)).catch(() => {});
                return res;
            })
            .catch(() => caches.match(event.request))
    );
});

// وقتی کاربر روی نوتیفیکیشن ضربه می‌زند، اپ را باز یا فوکوس کن
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            for (const client of clients) {
                if ('focus' in client) return client.focus();
            }
            if (self.clients.openWindow) return self.clients.openWindow('./');
        })
    );
});
