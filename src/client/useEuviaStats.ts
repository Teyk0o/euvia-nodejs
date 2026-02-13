/**
 * useEuviaStats - React hook for live statistics
 */

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { LiveStats } from '../shared/types';

export interface UseEuviaStatsOptions {
  serverUrl: string;
  autoConnect?: boolean; // Default: true
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export interface UseEuviaStatsReturn {
  stats: LiveStats | null;
  isConnected: boolean;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
  connect: () => void;
  disconnect: () => void;
}

const INITIAL_STATS: LiveStats = {
  totalVisitors: 0,
  topPages: [],
  deviceBreakdown: {
    mobile: 0,
    desktop: 0,
    tablet: 0,
  },
  lastUpdate: Date.now(),
};

export function useEuviaStats({
  serverUrl,
  autoConnect = true,
  onConnect,
  onDisconnect,
  onError,
}: UseEuviaStatsOptions): UseEuviaStatsReturn {
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  const connect = useCallback(() => {
    if (socket?.connected) return;

    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    newSocket.on('connect', () => {
      console.info('[Euvia] Admin connected to stats server');
      setIsConnected(true);
      setIsLoading(false);
      setError(null);

      // Subscribe to admin stats
      newSocket.emit('admin:subscribe');
      onConnect?.();
    });

    newSocket.on('disconnect', () => {
      console.info('[Euvia] Admin disconnected from stats server');
      setIsConnected(false);
      onDisconnect?.();
    });

    newSocket.on('connect_error', (err) => {
      console.error('[Euvia] Admin connection error:', err.message);
      setIsLoading(false);
      setError(err);
      onError?.(err);
    });

    newSocket.on('stats:update', (newStats: LiveStats) => {
      setStats(newStats);
      setIsLoading(false);
    });

    setSocket(newSocket);
  }, [serverUrl, onConnect, onDisconnect, onError, socket?.connected]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.emit('admin:unsubscribe');
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setStats(INITIAL_STATS);
    }
  }, [socket]);

  const refresh = useCallback(() => {
    // Request fresh stats update
    if (socket?.connected) {
      socket.emit('admin:subscribe');
    }
  }, [socket]);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    stats,
    isConnected,
    isLoading,
    error,
    refresh,
    connect,
    disconnect,
  };
}
