const CACHE_NAME = 'personal-space-v2';
const ASSETS = [
  '.',
  'index.html',
  'css/style.css',
  'js/app.js',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
];

// 安装：预缓存所有资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 拦截请求：缓存优先，网络回退
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      // 缓存命中 → 立即返回
      if (cached) {
        // 后台更新缓存
        fetch(event.request)
          .then(res => {
            if (res.ok) {
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, res));
            }
          })
          .catch(() => {});
        return cached;
      }
      // 缓存未命中 → 请求网络
      return fetch(event.request)
        .then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return res;
        })
        .catch(() => {
          // 离线且无缓存 → 返回离线页面
          if (event.request.destination === 'document') {
            return caches.match('index.html');
          }
          return new Response('Offline', { status: 503 });
        });
    })
  );
});
