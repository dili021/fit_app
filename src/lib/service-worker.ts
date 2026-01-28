/**
 * Register service worker for PWA functionality
 */
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { updateViaCache: 'none' })
        .then((registration) => {
          // Check for updates immediately and periodically
          void registration.update()

          // Check for updates every 5 minutes
          setInterval(
            () => {
              void registration.update()
            },
            5 * 60 * 1000,
          )

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  // New service worker available, reload to activate
                  window.location.reload()
                }
              })
            }
          })
        })
        .catch(() => {
          // Service worker registration failed - silently fail
          // User can still use the app without service worker
        })
    })
  }
}
