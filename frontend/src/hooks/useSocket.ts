import { useEffect } from 'react';
import { socketService } from '../services/socket.service';
import { useFlightStore } from '../store/flight.store';
import { FlightsUpdatePayload } from '../types/flight.types';

export const useSocket = () => {
  const { setFlights, setConnected, setError } = useFlightStore();

  useEffect(() => {
    socketService.connect();
    const { socket } = socketService;

    if (!socket) return;

    const onConnect = () => {
      setConnected(true);
      setError(null);
    };

    const onDisconnect = () => {
      setConnected(false);
      setError('Connection to backend lost.');
    };

    const onConnectError = (err: Error) => {
      setConnected(false);
      setError(`Connection Error: ${err.message}`);
    };

    const onFlightsUpdate = (payload: FlightsUpdatePayload) => {
      setFlights(payload.data, payload.timestamp);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('flightsUpdate', onFlightsUpdate);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('flightsUpdate', onFlightsUpdate);
      socketService.disconnect();
    };
  }, [setFlights, setConnected, setError]);
};
