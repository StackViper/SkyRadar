import { useEffect } from 'react';
import { webSocketService } from '../services/websocket';

export const useFlightSocket = () => {
  useEffect(() => {
    webSocketService.connect();
    
    return () => {
      webSocketService.disconnect();
    };
  }, []);

  return {
    reconnect: () => webSocketService.manualReconnect(),
  };
};
