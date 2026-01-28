/**
 * Handle service worker state changes
 */
function handleWorkerStateChange(newWorker: ServiceWorker) {
  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
    // New service worker available, reload to activate
    window.location.reload()
  }
}

/**
 * Handle service worker update found event
 */
function handleUpdateFound(registration: ServiceWorkerRegistration) {
  const newWorker = registration.installing
  if (newWorker) {
    newWorker.addEventListener('statechange', () => {
      handleWorkerStateChange(newWorker)
    })
  }
}

/**
 * Setup service worker registration with update checking
 */
function setupServiceWorkerRegistration(
  registration: ServiceWorkerRegistration,
) {
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
    handleUpdateFound(registration)
  })
}

/**
 * Register service worker for PWA functionality
 */
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { updateViaCache: 'none' })
        .then((registration) => {
          setupServiceWorkerRegistration(registration)
        })
        .catch(() => {
          // Service worker registration failed - silently fail
          // User can still use the app without service worker
        })
    })
  }
}
