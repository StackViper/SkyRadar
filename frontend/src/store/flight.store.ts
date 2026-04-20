import { create } from 'zustand';
import { Flight } from '../types/flight.types';

interface FlightState {
  flights: Flight[];
  connected: boolean;
  loading: boolean;
  lastUpdatedAt: string | null;
  error: string | null;
  setFlights: (flights: Flight[], timestamp: string | null) => void;
  setConnected: (status: boolean) => void;
  setLoading: (status: boolean) => void;
  setError: (error: string | null) => void;
}

export const useFlightStore = create<FlightState>((set) => ({
  flights: [],
  connected: false,
  loading: true,
  lastUpdatedAt: null,
  error: null,
  setFlights: (flights, timestamp) =>
    set({ flights, lastUpdatedAt: timestamp, loading: false, error: null }),
  setConnected: (connected) => set({ connected }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
}));
