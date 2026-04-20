import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MapScreen } from '../screens/MapScreen';
import { theme } from '../theme';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="Map" component={MapScreen} />
    </Stack.Navigator>
  );
}
