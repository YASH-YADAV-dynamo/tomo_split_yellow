import { useEffect, useRef, useState } from 'react';

interface RealtimeEvent {
  type: 'expense_added' | 'expense_updated' | 'expense_deleted' | 'group_updated' | 'connected' | 'heartbeat';
  groupId: string;
  data?: any;
  timestamp: Date;
}

interface UseRealtimeOptions {
  groupId: string;
  onEvent?: (event: RealtimeEvent) => void;
  enabled?: boolean;
}

export function useRealtime({ groupId, onEvent, enabled = true }: UseRealtimeOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    if (!enabled || !groupId) return;

    try {
      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource(`/api/realtime/${groupId}`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('Real-time connection opened for group:', groupId);
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const data: RealtimeEvent = JSON.parse(event.data);
          setLastEvent(data);
          
          if (onEvent && data.type !== 'heartbeat') {
            onEvent(data);
          }
        } catch (error) {
          console.error('Error parsing real-time event:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('Real-time connection error:', error);
        setIsConnected(false);
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
            connect();
          }, delay);
        } else {
          console.error('Max reconnection attempts reached');
        }
      };

    } catch (error) {
      console.error('Error creating real-time connection:', error);
      setIsConnected(false);
    }
  };

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsConnected(false);
  };

  useEffect(() => {
    if (enabled && groupId) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, groupId]);

  return {
    isConnected,
    lastEvent,
    connect,
    disconnect,
  };
}
