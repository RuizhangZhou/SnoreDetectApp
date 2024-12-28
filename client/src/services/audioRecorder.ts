import { Audio } from 'expo-av';
import { SnoreDetector } from '../utils/snoreDetector';
import { saveSnoreEvent } from '../utils/storage';
import { Platform } from 'react-native';

export class AudioRecorder {
  private recording: Audio.Recording | null = null;
  private isMonitoring: boolean = false;
  private recordingStartTime: number = 0;
  private lastSnoreEventTime: number = 0;
  private readonly MIN_TIME_BETWEEN_EVENTS = 1000; // 1 second

  async startMonitoring() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        throw new Error('Microphone permission not granted');
      }

      this.isMonitoring = true;
      await this.startNewRecording();
      await this.monitorAudio();
    } catch (error) {
      console.error('Failed to start monitoring:', error);
      this.isMonitoring = false;
      throw error;
    }
  }

  async stopMonitoring() {
    this.isMonitoring = false;
    if (this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
      } catch (error) {
        console.error('Error stopping recording:', error);
      } finally {
        this.recording = null;
        this.recordingStartTime = 0;
      }
    }
  }

  private async startNewRecording() {
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
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.caf',
          audioQuality: 2,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
        isMeteringEnabled: true,
      });

      await rec.startAsync();
      this.recording = rec;
      this.recordingStartTime = Date.now();
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  private async monitorAudio() {
    while (this.isMonitoring && this.recording) {
      try {
        const status = await this.recording.getStatusAsync();
        if (status.isRecording && 'metering' in status) {
          const metering = status.metering || -160;
          if (SnoreDetector.isSnoring(new Float32Array([metering]))) {
            await this.handleSnoreDetected();
          }
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Error monitoring audio:', error);
        this.isMonitoring = false;
        break;
      }
    }
  }

  private async handleSnoreDetected() {
    if (!this.recording) return;
    
    const now = Date.now();
    if (now - this.lastSnoreEventTime < this.MIN_TIME_BETWEEN_EVENTS) {
      return;
    }
    try{
        const uri = this.recording.getURI();
        if (!uri) return;

        this.lastSnoreEventTime = now;
        await saveSnoreEvent({
            timestamp: now,
            duration: now - this.recordingStartTime,
            audioUri: uri,
            date: new Date().toISOString().split('T')[0],
            startTime: '',
            endTime: ''
        });

        // Start new recording for next potential snore
        await this.stopMonitoring();
        await this.startMonitoring();
    }catch (error) {
    console.error('Error handling snore event:', error);
    }
  }
}