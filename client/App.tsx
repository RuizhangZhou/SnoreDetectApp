import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { setupStorage } from './src/utils/storage';
import HomeScreen from './src/screens/HomeScreen';
import RecordingScreen from './src/screens/RecordingScreen';
import StatisticsScreen from './src/screens/StatisticsScreen';
import SnoreDetailScreen from './src/screens/SnoreDetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    setupStorage();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Recording" component={RecordingScreen} />
        <Stack.Screen name="Statistics" component={StatisticsScreen} />
        <Stack.Screen name="SnoreDetail" component={SnoreDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}