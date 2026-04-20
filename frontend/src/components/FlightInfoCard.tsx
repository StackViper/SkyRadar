import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flight } from '../types/flight.types';
import { theme } from '../theme';
import { formatAltitude, formatSpeed } from '../utils/format';

interface Props {
  flight: Flight;
}

export const FlightInfoCard: React.FC<Props> = ({ flight }) => {
  const getTrendColor = () => {
    switch (flight.trend) {
      case 'CLIMBING': return theme.colors.success;
      case 'DESCENDING': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const trendIcon = flight.trend === 'CLIMBING' ? '▲' : flight.trend === 'DESCENDING' ? '▼' : '▬';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.callsign}>{flight.callsign || 'Unknown'}</Text>
        <View style={styles.trendContainer}>
          <Text style={[styles.trendIcon, { color: getTrendColor() }]}>{trendIcon}</Text>
          <Text style={styles.trendText}>{flight.trend}</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statColumn}>
          <Text style={styles.statLabel}>Altitude</Text>
          <Text style={styles.statValue}>{formatAltitude(flight.altitude)}</Text>
        </View>
        <View style={styles.statColumn}>
          <Text style={styles.statLabel}>Speed</Text>
          <Text style={styles.statValue}>{formatSpeed(flight.speed)}</Text>
        </View>
        <View style={styles.statColumn}>
          <Text style={styles.statLabel}>V.Rate</Text>
          <Text style={styles.statValue}>{flight.verticalRate.toFixed(1)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  callsign: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  trendText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statColumn: {
    alignItems: 'flex-start',
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
