/**
 * 注册 Service Worker
 */
export function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('Service Worker Registered'))
        .catch((err) => console.error(err));
    });
  }
}
