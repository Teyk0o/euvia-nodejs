/**
 * EuviaTracker - Invisible visitor tracking component
 * RGPD-compliant: anonymous, ephemeral, no consent required
 */

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { VisitorData } from '../shared/types';
import { hashPath, getDeviceCategory, getScreenBucket } from '../shared/utils';

export interface EuviaTrackerProps {
  serverUrl: string;
  heartbeatInterval?: number; // Default: 60000ms (60s)
  enabled?: boolean; // Default: true
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export function EuviaTracker({
  serverUrl,
  heartbeatInterval = 60000,
  enabled = true,
  onConnect,
  onDisconnect,
  onError,
}: EuviaTrackerProps) {
  const socketRef = useRef<Socket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Initialize Socket.io client
    const socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    socketRef.current = socket;

    // Get device info once (static during session)
    const deviceCategory = getDeviceCategory(navigator.userAgent);
    const screenBucket = getScreenBucket();

    // Send heartbeat function
    const sendHeartbeat = () => {
      if (!socket.connected) return;

      const data: VisitorData = {
        pageHash: hashPath(window.location.pathname),
        deviceCategory,
        screenBucket,
        timestamp: Date.now(),
      };

      socket.emit('visitor:heartbeat', data);
    };

    // Socket event handlers
    socket.on('connect', () => {
      console.info('[Euvia] Connected to tracking server');
      sendHeartbeat(); // Send immediately on connect
      onConnect?.();
    });

    socket.on('disconnect', () => {
      console.info('[Euvia] Disconnected from tracking server');
      onDisconnect?.();
    });

    socket.on('connect_error', (error) => {
      console.error('[Euvia] Connection error:', error.message);
      onError?.(error);
    });

    socket.on('connection:ack', () => {
      // Server acknowledged connection
    });

    // Set up heartbeat interval
    intervalRef.current = setInterval(sendHeartbeat, heartbeatInterval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (socketRef.current) {
        socketRef.current.emit('visitor:disconnect');
        socketRef.current.disconnect();
      }
    };
  }, [serverUrl, heartbeatInterval, enabled, onConnect, onDisconnect, onError]);

  // Invisible component - renders nothing
  return null;
}
