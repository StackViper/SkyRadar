import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, Text } from 'react-native';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';
import { useFlightStore } from '../store/flight.store';
import { useSocket } from '../hooks/useSocket';
import { FlightMarker } from '../components/FlightMarker';
import { FlightInfoCard } from '../components/FlightInfoCard';
import { ErrorBanner } from '../components/ErrorBanner';
import { EmptyState } from '../components/EmptyState';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { calculateMapRegion } from '../utils/map';
import { theme } from '../theme';

export const MapScreen = () => {
  // Initialize WebSocket connection
  useSocket();

  const { flights, loading, lastUpdatedAt, connected } = useFlightStore();
  const mapRef = useRef<MapView>(null);

  // Auto-fit bounds when new data arrives
  useEffect(() => {
    if (flights.length > 0 && mapRef.current) {
      const region = calculateMapRegion(flights);
      if (region) {
        mapRef.current.animateToRegion(region, 1000);
      }
    }
  }, [flights]);

  return (
    <SafeAreaView style={styles.container}>
      <ErrorBanner />
      
      {loading && <LoadingOverlay />}

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={{
            latitude: 20.5937,
            longitude: 78.9629,
            latitudeDelta: 30.0,
            longitudeDelta: 30.0,
          }}
          userInterfaceStyle="dark"
        >
          {flights.map((flight) => (
            <FlightMarker key={flight.id} flight={flight} />
          ))}
        </MapView>

        {/* Overlay UI */}
        <View style={styles.overlay}>
          {connected && lastUpdatedAt && (
            <View style={styles.statusBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.statusText}>Live • Updated {new Date(lastUpdatedAt).toLocaleTimeString()}</Text>
            </View>
          )}

          <View style={styles.cardsContainer}>
            {flights.length === 0 && !loading && connected ? (
              <EmptyState />
            ) : (
              flights.map((flight) => (
                <FlightInfoCard key={flight.id} flight={flight} />
              ))
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: theme.spacing.m,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.round,
    marginTop: theme.spacing.s,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
    marginRight: 8,
  },
  statusText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  cardsContainer: {
    width: '100%',
    paddingBottom: theme.spacing.l,
  },
});
