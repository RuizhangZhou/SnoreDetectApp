import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { SnoreEvent } from '../types';

export default function SnoreDetailScreen({ route }: any) {
  const { record } = route.params;
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);

  async function playRecording(audioUri: string, eventId: number) {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioUri });
      setSound(newSound);
      setPlayingId(eventId);
      await newSound.playAsync();
      newSound.setOnPlaybackStatusUpdate(status => {
        if (status && 'didJustFinish' in status && status.didJustFinish) {
          setPlayingId(null);
        }
      });
    } catch (error) {
      console.error('Failed to play recording:', error);
    }
  }

  function renderEvent({ item, index }: { item: SnoreEvent; index: number }) {
    const startTime = new Date(item.timestamp).toLocaleTimeString();
    const endTime = new Date(item.timestamp + item.duration).toLocaleTimeString();
    
    return (
      <View style={styles.eventItem}>
        <Text style={styles.timeText}>
          {startTime} - {endTime}
        </Text>
        <TouchableOpacity 
          style={styles.playButton}
          onPress={() => playRecording(item.audioUri, index)}
        >
          <Text style={styles.playButtonText}>
            {playingId === index ? '⏸️' : '▶️'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{record.date} Details</Text>
      <Text style={styles.subtitle}>Total Snores: {record.snoreCount}</Text>
      <FlatList
        data={record.events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.timestamp.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 16,
  },
  playButton: {
    padding: 10,
  },
  playButtonText: {
    fontSize: 24,
  },
});