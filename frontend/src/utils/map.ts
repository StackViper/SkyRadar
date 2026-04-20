import { Flight } from '../types/flight.types';
import { Region } from 'react-native-maps';

export const calculateMapRegion = (flights: Flight[]): Region | undefined => {
  if (flights.length === 0) return undefined;

  let minLat = flights[0].latitude;
  let maxLat = flights[0].latitude;
  let minLng = flights[0].longitude;
  let maxLng = flights[0].longitude;

  flights.forEach(f => {
    if (f.latitude < minLat) minLat = f.latitude;
    if (f.latitude > maxLat) maxLat = f.latitude;
    if (f.longitude < minLng) minLng = f.longitude;
    if (f.longitude > maxLng) maxLng = f.longitude;
  });

  const latDelta = (maxLat - minLat) * 1.5 || 2.0;
  const lngDelta = (maxLng - minLng) * 1.5 || 2.0;

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(latDelta, 2.0),
    longitudeDelta: Math.max(lngDelta, 2.0),
  };
};
