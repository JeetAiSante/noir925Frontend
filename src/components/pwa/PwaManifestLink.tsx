import { useEffect } from 'react';

/**
 * Injects the PWA manifest link only in production.
 * This avoids preview/iframe CORS noise during development.
 */
export default function PwaManifestLink() {
  useEffect(() => {
    if (!import.meta.env.PROD) return;

    const existing = document.querySelector('link[rel="manifest"]');
    if (existing) return;

    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/manifest.json';
    document.head.appendChild(link);

    return () => {
      try {
        link.remove();
      } catch {
        // ignore
      }
    };
  }, []);

  return null;
}
