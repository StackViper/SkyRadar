import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

export const EmptyState = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>No active flights available</Text>
      <Text style={styles.subtitle}>Waiting for the next radar poll...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.m,
    marginHorizontal: theme.spacing.m,
  },
  title: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
});
