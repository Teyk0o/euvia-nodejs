/**
 * Shared types between client and server
 */

export interface VisitorData {
  pageHash: string; // Base64 encoded pathname for anonymity
  deviceCategory: 'mobile' | 'desktop' | 'tablet';
  screenBucket: string; // e.g., "1920x1080", "375x667"
  timestamp: number;
}

export interface LiveStats {
  totalVisitors: number;
  topPages: PageStats[];
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  lastUpdate: number;
}

export interface PageStats {
  pageHash: string;
  originalPath?: string; // Only available on server-side for reverse lookup
  visitors: number;
}

export interface SocketEvents {
  // Client → Server
  'visitor:heartbeat': (data: VisitorData) => void;
  'visitor:disconnect': () => void;

  // Server → Client
  'stats:update': (stats: LiveStats) => void;
  'connection:ack': () => void;

  // Admin subscription
  'admin:subscribe': () => void;
  'admin:unsubscribe': () => void;
}
