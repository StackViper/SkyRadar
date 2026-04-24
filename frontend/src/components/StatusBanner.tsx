import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { useFlightStore } from '../store/flightStore';
import { Wifi, WifiOff, RefreshCcw } from 'lucide-react-native';
import { webSocketService } from '../services/websocket';

const StatusBanner = () => {
  const status = useFlightStore((state) => state.status);

  const getStatusConfig = () => {
    switch (status) {
      case 'LIVE':
        return { color: '#4ADE80', text: 'Live Connected', icon: <Wifi size={14} color="#4ADE80" /> };
      case 'CONNECTING':
        return { color: '#FBBF24', text: 'Connecting...', icon: <RefreshCcw size={14} color="#FBBF24" /> };
      case 'RECONNECTING':
        return { color: '#F87171', text: 'Reconnecting...', icon: <WifiOff size={14} color="#F87171" /> };
      default:
        return { color: '#9CA3AF', text: 'Offline', icon: <WifiOff size={14} color="#9CA3AF" /> };
    }
  };

  const config = getStatusConfig();

  return (
    <BlurView intensity={80} tint="dark" style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.dot, { backgroundColor: config.color }]} />
        {config.icon}
        <Text style={[styles.text, { color: config.color }]}>{config.text}</Text>
      </View>
      <TouchableOpacity 
        onPress={() => webSocketService.manualReconnect()}
        style={styles.reconnectBtn}
      >
        <RefreshCcw size={16} color="#FFF" />
      </TouchableOpacity>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  reconnectBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  }
});

export default StatusBanner;
