/**
 * Shared utility functions for RGPD-compliant anonymization
 */

/**
 * Hash pathname to base64 for anonymity (RGPD requirement)
 */
export function hashPath(pathname: string): string {
  if (typeof window === 'undefined') return '';
  try {
    return btoa(pathname);
  } catch {
    return btoa(encodeURIComponent(pathname));
  }
}

/**
 * Reverse hash to get original pathname (server-side only)
 */
export function unhashPath(hash: string): string {
  try {
    return atob(hash);
  } catch {
    try {
      return decodeURIComponent(atob(hash));
    } catch {
      return hash;
    }
  }
}

/**
 * Categorize user agent into mobile/desktop/tablet
 */
export function getDeviceCategory(userAgent: string): 'mobile' | 'desktop' | 'tablet' {
  const ua = userAgent.toLowerCase();

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }

  if (/mobile|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    return 'mobile';
  }

  return 'desktop';
}

/**
 * Bucket screen resolution for anonymity (RGPD requirement)
 */
export function getScreenBucket(): string {
  if (typeof window === 'undefined') return 'unknown';

  const width = window.screen.width;
  const height = window.screen.height;

  // Common buckets
  const buckets = [
    { w: 1920, h: 1080 },
    { w: 1366, h: 768 },
    { w: 1440, h: 900 },
    { w: 1536, h: 864 },
    { w: 2560, h: 1440 },
    { w: 375, h: 667 }, // iPhone 8
    { w: 414, h: 896 }, // iPhone 11
    { w: 390, h: 844 }, // iPhone 12/13
    { w: 360, h: 640 }, // Android
  ];

  // Find closest bucket
  let closest = buckets[0];
  let minDist = Infinity;

  for (const bucket of buckets) {
    const dist = Math.abs(bucket.w - width) + Math.abs(bucket.h - height);
    if (dist < minDist) {
      minDist = dist;
      closest = bucket;
    }
  }

  return `${closest.w}x${closest.h}`;
}
