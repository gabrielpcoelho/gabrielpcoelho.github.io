export type OfflineState = 'preparing' | 'ready' | 'error';

// Each attempt returns a cleanup function so late callbacks cannot change a newer attempt.
export function prepareQrOffline(onState: (state: OfflineState) => void) {
  let cancelled = false;
  let watched: ServiceWorker | null = null;
  let registration: ServiceWorkerRegistration | null = null;
  const setState = (state: OfflineState) => { if (!cancelled) onState(state); };
  const inspect = () => {
    if (registration?.active?.state === 'activated') setState('ready');
    else if (watched?.state === 'redundant') setState('error');
  };
  const watch = () => {
    watched?.removeEventListener('statechange', inspect);
    watched = registration?.installing ?? registration?.waiting ?? registration?.active ?? null;
    watched?.addEventListener('statechange', inspect);
    inspect();
  };
  setState('preparing');
  if (!('serviceWorker' in navigator) || !window.isSecureContext) setState('error');
  else {
    navigator.serviceWorker.register('/qr/sw.js', { scope: '/qr/', updateViaCache: 'none' })
      .then(reg => {
        if (cancelled) return;
        registration = reg;
        reg.addEventListener('updatefound', watch);
        watch();
        // Activated means the atomic precache succeeded. claim() then controls this first page.
        navigator.serviceWorker.ready.then(() => inspect()).catch(() => setState('error'));
      })
      .catch(() => setState('error'));
  }
  return () => {
    cancelled = true;
    watched?.removeEventListener('statechange', inspect);
    registration?.removeEventListener('updatefound', watch);
  };
}
