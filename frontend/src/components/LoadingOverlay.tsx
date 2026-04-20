import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { theme } from '../theme';

export const LoadingOverlay = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.text}>Connecting to Live Radar...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  text: {
    marginTop: theme.spacing.m,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
});
