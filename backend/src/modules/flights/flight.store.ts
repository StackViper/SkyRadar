import { FlightData } from './flight.types';

class FlightStore {
  private static instance: FlightStore;
  private flights: FlightData[] = [];
  private lastUpdatedAt: Date | null = null;
  private staleDataThresholdMs = 300000; // 5 minutes — keep cached data valid during rate-limit backoff

  private constructor() {}

  public static getInstance(): FlightStore {
    if (!FlightStore.instance) {
      FlightStore.instance = new FlightStore();
    }
    return FlightStore.instance;
  }

  public setLatestFlights(flights: FlightData[]): void {
    this.flights = flights;
    this.lastUpdatedAt = new Date();
  }

  public getLatestFlights(): FlightData[] {
    return this.flights;
  }

  public getLastUpdatedAt(): Date | null {
    return this.lastUpdatedAt;
  }

  public isStale(): boolean {
    if (!this.lastUpdatedAt) return true;
    const now = new Date().getTime();
    return (now - this.lastUpdatedAt.getTime()) > this.staleDataThresholdMs;
  }
}

export const flightStore = FlightStore.getInstance();
