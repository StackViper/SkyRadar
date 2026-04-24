import { create } from 'zustand';
import { Flight, ConnectionStatus } from '../types/flight';

interface FlightState {
  flights: Flight[];
  lastUpdate: number | null;
  status: ConnectionStatus;
  selectedFlightId: string | null;
  
  // Actions
  setFlights: (flights: Flight[]) => void;
  setStatus: (status: ConnectionStatus) => void;
  setSelectedFlightId: (id: string | null) => void;
  resetStore: () => void;
}

export const useFlightStore = create<FlightState>((set) => ({
  flights: [],
  lastUpdate: null,
  status: 'OFFLINE',
  selectedFlightId: null,

  setFlights: (flights) => set({ 
    flights, 
    lastUpdate: Date.now() 
  }),
  
  setStatus: (status) => set({ status }),
  
  setSelectedFlightId: (id) => set({ selectedFlightId: id }),
  
  resetStore: () => set({ 
    flights: [], 
    lastUpdate: null, 
    status: 'OFFLINE', 
    selectedFlightId: null 
  }),
}));
