// public/sw.js（放在站点可访问的路径，如 public/sw.js）

const CACHE_NAME = 'my-app-v1';

// 安装：预缓存关键资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['/']);
    }),
  );
  self.skipWaiting(); // 可选：安装完立即激活，不等旧 SW 退出
});

// 激活：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)),
      );
    }),
  );
  self.clients.claim(); // 可选：立即控制所有同 scope 的页面
});

// 请求：缓存优先，没有则走网络
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    }),
  );
});
