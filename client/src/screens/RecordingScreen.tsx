import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, Platform } from 'react-native';
import { Audio } from 'expo-av';
import { saveSnoreEvent } from '../utils/storage';

export default function RecordingScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [status, setStatus] = useState('');
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync({
          android: {
              extension: '.m4a',
              outputFormat: Audio.AndroidOutputFormat.MPEG_4,
              audioEncoder: Audio.AndroidAudioEncoder.AAC,
              sampleRate: 44100,
              numberOfChannels: 2,
              bitRate: 128000,
          },
          ios: {
              extension: '.caf',
              audioQuality: 2,
              sampleRate: 44100,
              numberOfChannels: 2,
              bitRate: 128000,
              linearPCMBitDepth: 16,
              linearPCMIsBigEndian: false,
              linearPCMIsFloat: false,
          },
          isMeteringEnabled: true,
          web: {
              mimeType: undefined,
              bitsPerSecond: undefined
          }
      });
      await rec.startAsync();
      setRecording(rec);
      setRecordingUri(null);
      setStatus('Recording...');
    } catch (err) {
      console.log('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri || null);
      setRecording(null);

      if (uri) {
        // Save recording
        await saveSnoreEvent({
            timestamp: Date.now(),
            duration: 0,
            audioUri: uri,
            date: new Date().toISOString().split('T')[0],
            startTime: '',
            endTime: ''
        });

        if (Platform.OS === 'web') {
          setStatus('Click the URI below to download:');
        } else {
          setStatus('Recording saved');
        }
      }
    } catch (err) {
      console.log('Failed to stop recording', err);
    }
  }

  const handleUriPress = async () => {
    if (Platform.OS === 'web' && recordingUri) {
      try {
        const response = await fetch(recordingUri);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `recording_${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recording Screen</Text>
      <Button title="Start" onPress={startRecording} />
      <Button title="Stop" onPress={stopRecording} />
      <Text style={styles.info}>{status}</Text>
      {recordingUri && (
        <TouchableOpacity onPress={handleUriPress}>
          <Text style={styles.uri}>{recordingUri}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center' },
    title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
    info: { marginTop: 20, textAlign: 'center' },
    uri: { 
      marginTop: 10,
      color: Platform.OS === 'web' ? 'blue' : 'black',
      textDecorationLine: Platform.OS === 'web' ? 'underline' : 'none',
      textAlign: 'center'
    }
  });