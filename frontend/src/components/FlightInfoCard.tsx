import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Flight } from '../types/flight';
import { msToKmh, getFlightStatus } from '../utils/helpers';
import { Plane, TrendingUp, TrendingDown, Minus, Navigation } from 'lucide-react-native';

interface FlightInfoCardProps {
  flight: Flight;
}

const { width } = Dimensions.get('window');

const FlightInfoCard = ({ flight }: FlightInfoCardProps) => {
  const status = getFlightStatus(flight.vertical_rate);

  const getStatusIcon = () => {
    if (status === 'Climbing') return <TrendingUp size={16} color="#4ADE80" />;
    if (status === 'Descending') return <TrendingDown size={16} color="#F87171" />;
    return <Minus size={16} color="#94A3B8" />;
  };

  return (
    <BlurView intensity={90} tint="dark" style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.callsign}>{flight.callsign || 'N/A'}</Text>
          <Text style={styles.icao}>ICAO: {flight.icao24}</Text>
        </View>
        <Plane size={24} color="#3B82F6" />
      </View>

      <View style={styles.divider} />

      <View style={styles.grid}>
        <View style={styles.item}>
          <Text style={styles.label}>Altitude</Text>
          <Text style={styles.value}>{Math.round(flight.altitude)} m</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Speed</Text>
          <Text style={styles.value}>{msToKmh(flight.velocity)} km/h</Text>
          <Text style={styles.subValue}>({flight.velocity} m/s)</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.statusBadge}>
          {getStatusIcon()}
          <Text style={styles.statusText}>{status}</Text>
        </View>
        <View style={styles.headingBox}>
           <Navigation size={14} color="#94A3B8" style={{ transform: [{ rotate: `${flight.heading || 0}deg` }] }} />
           <Text style={styles.headingText}>{flight.heading || 0}°</Text>
        </View>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    padding: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  callsign: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  icao: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 15,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  item: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  subValue: {
    fontSize: 10,
    color: '#64748B',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  headingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headingText: {
    fontSize: 12,
    color: '#94A3B8',
  }
});

export default FlightInfoCard;
