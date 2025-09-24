// Real-time event system for group updates
export interface RealtimeEvent {
  type: 'expense_added' | 'expense_updated' | 'expense_deleted' | 'group_updated';
  groupId: string;
  data: any;
  timestamp: Date;
}

class RealtimeManager {
  private clients: Map<string, Set<ReadableStreamDefaultController>> = new Map();
  private eventQueue: Map<string, RealtimeEvent[]> = new Map();

  // Add a client to receive updates for a specific group
  addClient(groupId: string, controller: ReadableStreamDefaultController) {
    if (!this.clients.has(groupId)) {
      this.clients.set(groupId, new Set());
    }
    this.clients.get(groupId)!.add(controller);
  }

  // Remove a client
  removeClient(groupId: string, controller: ReadableStreamDefaultController) {
    const groupClients = this.clients.get(groupId);
    if (groupClients) {
      groupClients.delete(controller);
      if (groupClients.size === 0) {
        this.clients.delete(groupId);
      }
    }
  }

  // Broadcast an event to all clients in a group
  broadcast(groupId: string, event: RealtimeEvent) {
    const groupClients = this.clients.get(groupId);
    if (!groupClients) return;

    const eventData = `data: ${JSON.stringify(event)}\n\n`;
    const encoder = new TextEncoder();
    
    // Send to all connected clients
    groupClients.forEach(controller => {
      try {
        controller.enqueue(encoder.encode(eventData));
      } catch (error) {
        // Remove broken connections
        this.removeClient(groupId, controller);
      }
    });
  }

  // Queue an event for clients that connect later
  queueEvent(groupId: string, event: RealtimeEvent) {
    if (!this.eventQueue.has(groupId)) {
      this.eventQueue.set(groupId, []);
    }
    
    const queue = this.eventQueue.get(groupId)!;
    queue.push(event);
    
    // Keep only last 50 events to prevent memory issues
    if (queue.length > 50) {
      queue.shift();
    }
  }

  // Get queued events for a group
  getQueuedEvents(groupId: string): RealtimeEvent[] {
    return this.eventQueue.get(groupId) || [];
  }

  // Clear queued events
  clearQueuedEvents(groupId: string) {
    this.eventQueue.delete(groupId);
  }
}

export const realtimeManager = new RealtimeManager();

// Helper function to create SSE response
export function createSSEResponse(groupId: string): Response {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const initMessage = `data: ${JSON.stringify({ type: 'connected', groupId })}\n\n`;
      controller.enqueue(encoder.encode(initMessage));
      
      // Send any queued events
      const queuedEvents = realtimeManager.getQueuedEvents(groupId);
      queuedEvents.forEach(event => {
        const eventData = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(eventData));
      });
      
      // Clear queued events after sending
      realtimeManager.clearQueuedEvents(groupId);
      
      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        try {
          const heartbeatData = `data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date() })}\n\n`;
          controller.enqueue(encoder.encode(heartbeatData));
        } catch (error) {
          clearInterval(heartbeat);
        }
      }, 30000); // Heartbeat every 30 seconds
      
      // Store controller for this connection
      realtimeManager.addClient(groupId, controller);
      
      // Cleanup on close
      const cleanup = () => {
        clearInterval(heartbeat);
        realtimeManager.removeClient(groupId, controller);
      };
      
      // Return cleanup function
      return cleanup;
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}
