import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Marker } from 'react-native-maps';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Flight } from '../types/flight.types';
import { theme } from '../theme';

interface Props {
  flight: Flight;
}

export const FlightMarker: React.FC<Props> = React.memo(({ flight }) => {
  const latitude = useSharedValue(flight.latitude);
  const longitude = useSharedValue(flight.longitude);

  useEffect(() => {
    // Smooth transition to new coordinates
    latitude.value = withTiming(flight.latitude, {
      duration: 2000,
      easing: Easing.inOut(Easing.ease),
    });
    longitude.value = withTiming(flight.longitude, {
      duration: 2000,
      easing: Easing.inOut(Easing.ease),
    });
  }, [flight.latitude, flight.longitude]);

  return (
    <Marker
      coordinate={{ latitude: flight.latitude, longitude: flight.longitude }}
      anchor={{ x: 0.5, y: 0.5 }}
      flat={true}
    >
      <View style={styles.markerContainer}>
        <View style={styles.dot} />
        <Text style={styles.callsign}>{flight.callsign || 'N/A'}</Text>
      </View>
    </Marker>
  );
});

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    borderWidth: 3,
    borderColor: theme.colors.background,
  },
  callsign: {
    marginTop: 4,
    color: theme.colors.text,
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: theme.colors.card,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
});
