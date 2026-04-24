import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { useFlightStore } from '../store/flightStore';
import { useFlightSocket } from '../hooks/useFlightSocket';
import { INDIA_REGION } from '../utils/constants';
import { formatTimeAgo } from '../utils/helpers';
import FlightMarker from '../components/FlightMarker';
import StatusBanner from '../components/StatusBanner';
import FlightInfoCard from '../components/FlightInfoCard';
import Loader from '../components/Loader';
import { darkMapStyle } from '../utils/mapStyles'; // I'll create this

const HomeScreen = () => {
  const mapRef = useRef<MapView>(null);
  const { flights, status, lastUpdate, selectedFlightId, setSelectedFlightId } = useFlightStore();
  useFlightSocket();
  
  const [trails, setTrails] = useState<Record<string, { latitude: number, longitude: number }[]>>({});

  // Update trails and auto-fit
  useEffect(() => {
    if (flights.length > 0) {
      // Manage Trails (last 5 positions)
      setTrails(prev => {
        const newTrails = { ...prev };
        flights.forEach(f => {
          const currentTrail = newTrails[f.icao24] || [];
          const newPos = { latitude: f.latitude, longitude: f.longitude };
          
          // Only add if position changed significantly
          if (currentTrail.length === 0 || 
              currentTrail[currentTrail.length - 1].latitude !== f.latitude) {
            newTrails[f.icao24] = [...currentTrail, newPos].slice(-5);
          }
        });
        return newTrails;
      });

      // Auto-fit if it's the first update or flights changed
      if (mapRef.current && flights.length >= 2) {
        mapRef.current.fitToCoordinates(
          flights.map(f => ({ latitude: f.latitude, longitude: f.longitude })),
          {
            edgePadding: { top: 150, right: 50, bottom: 250, left: 50 },
            animated: true,
          }
        );
      }
    }
  }, [flights]);

  const selectedFlight = flights.find(f => f.icao24 === selectedFlightId);

  if (status === 'OFFLINE' && flights.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBanner />
        <View style={styles.emptyCenter}>
           <Text style={styles.emptyTitle}>No active flights found over India</Text>
           <Text style={styles.emptySub}>Connect to backend to see live updates</Text>
           <TouchableOpacity 
             style={styles.retryBtn}
             onPress={() => setSelectedFlightId(null)}
           >
             <Text style={styles.retryText}>Retry Connection</Text>
           </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBanner />
      
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={INDIA_REGION}
        customMapStyle={darkMapStyle}
        onPress={() => setSelectedFlightId(null)}
      >
        {flights.map((flight) => (
          <React.Fragment key={flight.icao24}>
            {/* Draw Trail */}
            {trails[flight.icao24] && (
              <Polyline
                coordinates={trails[flight.icao24]}
                strokeColor="rgba(59, 130, 246, 0.4)"
                strokeWidth={3}
                lineDashPattern={[5, 5]}
              />
            )}
            
            <FlightMarker
              flight={flight}
              isSelected={selectedFlightId === flight.icao24}
              onPress={() => setSelectedFlightId(flight.icao24)}
            />
          </React.Fragment>
        ))}
      </MapView>

      {/* Timer Overlay */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>
          Updated {formatTimeAgo(lastUpdate)}
        </Text>
      </View>

      {/* Info Card */}
      {selectedFlight && (
        <FlightInfoCard flight={selectedFlight} />
      )}

      {flights.length === 0 && <Loader />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  timerContainer: {
    position: 'absolute',
    top: 110,
    alignSelf: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  timerText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emptyCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySub: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
  },
  retryBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '600',
  }
});

export default HomeScreen;
