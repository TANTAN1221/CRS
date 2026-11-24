// =====================================================================
// CIVIL REGISTRY PORTAL - PWA & FCM SERVICE WORKER (Web + Mobile)
// Handles Offline Shell Caching & Firebase Cloud Messaging Push Alerts
// =====================================================================

const CACHE_NAME = 'crs-portal-v2';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/login.html',
  '/register.html',
  '/manifest.json',
  '/logo.png',
  '/assets/css/style.css',
  '/assets/js/firebase-config.js',
  '/assets/js/auth.js',
  '/assets/js/rbac.js',
  '/assets/js/applications.js',
  '/assets/js/documents.js',
  '/assets/js/appointments.js',
  '/assets/js/notifications.js',
  '/assets/js/ai-checker.js',
  '/assets/js/ui.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

// Handle incoming Web Push / FCM notifications
self.addEventListener('push', (event) => {
  let payload = {
    title: 'Civil Registry Portal Alert',
    body: 'You have a new update on your application or counter appointment.',
    url: '/applicant/notifications.html',
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = {
        title: parsed.notification?.title || parsed.title || payload.title,
        body: parsed.notification?.body || parsed.body || payload.body,
        url: parsed.data?.link || parsed.url || payload.url,
      };
    } catch (e) {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/logo.png',
      badge: '/logo.png',
      data: { url: payload.url },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/applicant/dashboard.html';
  event.waitUntil(clients.openWindow(targetUrl));
});
