'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import type { HistoricalStats } from '../shared/types';

interface EuviaChartsContextValue {
  data: HistoricalStats | null;
  loading: boolean;
  error: string | null;
  timeRange: '1h' | '24h';
  setTimeRange: (range: '1h' | '24h') => void;
}

const EuviaChartsContext = createContext<EuviaChartsContextValue | undefined>(undefined);

export interface EuviaChartsProviderProps {
  serverUrl: string;
  timeRange?: '1h' | '24h';
  autoRefresh?: boolean;
  refreshInterval?: number;
  children: ReactNode;
}

export function EuviaChartsProvider({
  serverUrl,
  timeRange: initialTimeRange = '1h',
  autoRefresh = true,
  refreshInterval = 15000,
  children,
}: EuviaChartsProviderProps) {
  const [data, setData] = useState<HistoricalStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '24h'>(initialTimeRange);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      setError(null);
      newSocket.emit('admin:history:request', timeRange);
    });

    newSocket.on('admin:history:response', (historicalData: HistoricalStats) => {
      setData(historicalData);
      setLoading(false);
      setError(null);
    });

    newSocket.on('admin:history:error', (err: { message: string }) => {
      setError(err.message);
      setLoading(false);
    });

    newSocket.on('disconnect', () => {
      // Socket disconnected
    });

    newSocket.on('connect_error', (err) => {
      setError(`Connection error: ${err.message}`);
      setLoading(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [serverUrl]);

  useEffect(() => {
    if (socket && socket.connected) {
      setLoading(true);
      socket.emit('admin:history:request', timeRange);
    }
  }, [timeRange, socket]);

  useEffect(() => {
    if (!autoRefresh || !socket) return;

    const interval = setInterval(() => {
      if (socket.connected) {
        socket.emit('admin:history:request', timeRange);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, timeRange, socket]);

  const value: EuviaChartsContextValue = {
    data,
    loading,
    error,
    timeRange,
    setTimeRange,
  };

  return <EuviaChartsContext.Provider value={value}>{children}</EuviaChartsContext.Provider>;
}

export function useEuviaCharts(): EuviaChartsContextValue {
  const context = useContext(EuviaChartsContext);
  if (!context) {
    throw new Error('useEuviaCharts must be used within EuviaChartsProvider');
  }
  return context;
}
