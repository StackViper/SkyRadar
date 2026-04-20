import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { useFlightStore } from '../store/flight.store';

export const ErrorBanner = () => {
  const { error, connected } = useFlightStore();

  if (!error && connected) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {!connected && !error ? 'Reconnecting to live feed...' : error}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.error,
    padding: theme.spacing.s,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
