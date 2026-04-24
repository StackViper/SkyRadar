import { useFlightStore } from '../store/flightStore';
import { WebSocketPayload } from '../types/flight';
import { WS_URL, RECONNECT_INTERVAL } from '../utils/constants';

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    this.socket = new WebSocket(WS_URL);
    useFlightStore.getState().setStatus('CONNECTING');

    this.socket.onopen = () => {
      console.log('Connected to WebSocket');
      useFlightStore.getState().setStatus('LIVE');
      if (this.reconnectTimer) {
        clearInterval(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    };

    this.socket.onmessage = (event) => {
      try {
        const payload: WebSocketPayload = JSON.parse(event.data);
        if (payload.type === 'flight_update') {
          useFlightStore.getState().setFlights(payload.flights);
        }
      } catch (error) {
        console.error('Error parsing WS message:', error);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
      useFlightStore.getState().setStatus('RECONNECTING');
      this.attemptReconnect();
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      useFlightStore.getState().setStatus('OFFLINE');
    };
  }

  private attemptReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setInterval(() => {
      console.log('Attempting to reconnect...');
      this.connect();
    }, RECONNECT_INTERVAL);
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    if (this.reconnectTimer) {
      clearInterval(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  manualReconnect() {
    this.disconnect();
    this.connect();
  }
}

export const webSocketService = new WebSocketService();
