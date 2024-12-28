import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { SnoreEvent } from '../types';

const AUDIO_DIRECTORY = Platform.OS !== 'web' 
  ? `${FileSystem.documentDirectory}snore_recordings/`
  : '';

export const setupStorage = async () => {
  if (Platform.OS === 'web') return;
  
  const dirInfo = await FileSystem.getInfoAsync(AUDIO_DIRECTORY);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(AUDIO_DIRECTORY, { intermediates: true });
  }
};

export const saveSnoreEvent = async (event: SnoreEvent) => {
  try {
    // Save metadata to AsyncStorage
    const key = `snore_${event.date}_${event.timestamp}`;
    await AsyncStorage.setItem(key, JSON.stringify(event));

    // Move audio file to permanent storage
    if (event.audioUri) {
      const fileName = `snore_${event.timestamp}.caf`;
      const newUri = `${AUDIO_DIRECTORY}${fileName}`;
      await FileSystem.moveAsync({
        from: event.audioUri,
        to: newUri
      });
      // Update URI in storage
      event.audioUri = newUri;
      await AsyncStorage.setItem(key, JSON.stringify(event));
    }
  } catch (error) {
    console.error('Error saving snore event:', error);
  }
};