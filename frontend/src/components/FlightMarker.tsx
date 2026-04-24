import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker, AnimatedRegion } from 'react-native-maps';
import { Plane } from 'lucide-react-native';
import { Flight } from '../types/flight';
import { ANIMATION_DURATION } from '../utils/constants';

interface FlightMarkerProps {
  flight: Flight;
  onPress: () => void;
  isSelected: boolean;
}

const FlightMarker = ({ flight, onPress, isSelected }: FlightMarkerProps) => {
  const animatedCoordinate = useRef(
    new AnimatedRegion({
      latitude: flight.latitude,
      longitude: flight.longitude,
      latitudeDelta: 0,
      longitudeDelta: 0,
    })
  ).current;

  useEffect(() => {
    // Animate to new coordinates
    animatedCoordinate.timing({
      latitude: flight.latitude,
      longitude: flight.longitude,
      duration: ANIMATION_DURATION,
      useNativeDriver: false,
    }).start();
  }, [flight.latitude, flight.longitude]);

  return (
    <Marker.Animated
      coordinate={animatedCoordinate}
      onPress={onPress}
      anchor={{ x: 0.5, y: 0.5 }}
      flat={true}
    >
      <View style={[
        styles.markerContainer,
        isSelected && styles.selectedMarker
      ]}>
        <View style={{ transform: [{ rotate: `${flight.heading || 0}deg` }] }}>
          <Plane 
            size={isSelected ? 30 : 24} 
            color={isSelected ? '#3B82F6' : '#F8FAFC'} 
            fill={isSelected ? '#3B82F6' : 'transparent'}
          />
        </View>
      </View>
    </Marker.Animated>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    padding: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedMarker: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3B82F6',
    transform: [{ scale: 1.2 }],
  }
});

export default FlightMarker;
