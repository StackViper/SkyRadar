import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface LoaderProps {
  message?: string;
}

const Loader = ({ message = 'Waiting for next refresh...' }: LoaderProps) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  text: {
    marginTop: 16,
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Loader;
