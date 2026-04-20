import { io, Socket } from 'socket.io-client';

class SocketService {
  public socket: Socket | null = null;
  private backendUrl: string = process.env.EXPO_PUBLIC_BACKEND_SOCKET_URL || 'http://localhost:3000';

  connect() {
    if (!this.socket) {
      this.socket = io(this.backendUrl, {
        reconnectionDelayMax: 10000,
        reconnectionAttempts: Infinity,
        transports: ['websocket'],
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
