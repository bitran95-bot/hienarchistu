type PageEvent = { url: string; [key: string]: unknown };
type AnalyticsWindow = Window & { va?: (...args: unknown[]) => void; vaq?: unknown[][] };

/** Standard Vercel script integration. No form fields or URL queries are collected. */
export function startAnalytics() {
  if (!import.meta.env.PROD || import.meta.env.VITE_ENABLE_ANALYTICS !== 'true') return;
  if (navigator.doNotTrack === '1' || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return;
  const target = window as AnalyticsWindow;
  target.va = target.va || ((...args: unknown[]) => { (target.vaq ||= []).push(args); });
  target.va('beforeSend', (event: PageEvent) => {
    const url = new URL(event.url);
    if (url.pathname === '/download') return null;
    url.search = '';
    url.hash = '';
    return { ...event, url: url.toString() };
  });
  const script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/insights/script.js';
  document.head.appendChild(script);
}
