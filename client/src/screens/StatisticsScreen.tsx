import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { DailySnoreRecord } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type StatisticsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Statistics'
>;

export default function StatisticsScreen() {
  const [dailyRecords, setDailyRecords] = useState<DailySnoreRecord[]>([]);
  const navigation = useNavigation<StatisticsScreenNavigationProp>();

  useEffect(() => {
    loadDailyStats();
  }, []);

  async function loadDailyStats() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const snoreKeys = keys.filter((key) => key.startsWith('snore_'));
      const dayMap: Record<string, DailySnoreRecord> = {};

      for (const key of snoreKeys) {
        const data = await AsyncStorage.getItem(key);
        if (!data) continue;
        const event = JSON.parse(data);
        const dateString = event.date || 'unknown';

        if (!dayMap[dateString]) {
          dayMap[dateString] = {
            date: dateString,
            snoreCount: 0,
            events: []
          };
        }
        dayMap[dateString].events.push(event);
        dayMap[dateString].snoreCount++;
      }

      const records = Object.values(dayMap).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setDailyRecords(records);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  function renderRecord({ item }: { item: DailySnoreRecord }) {
    return (
      <TouchableOpacity 
        style={styles.recordItem}
        onPress={() => navigation.navigate('SnoreDetail', { record: item })}
      >
        <Text style={styles.dateText}>{item.date}</Text>
        <Text style={styles.countText}>Snore Count: {item.snoreCount}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Snore Statistics</Text>
      <FlatList
        data={dailyRecords}
        keyExtractor={(item) => item.date}
        renderItem={renderRecord}
        ListEmptyComponent={
          <Text style={styles.info}>No records yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  recordItem: {
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
    padding: 15,
    borderRadius: 8,
  },
  dateText: { fontWeight: 'bold', marginBottom: 5 },
  countText: { fontSize: 16 },
  info: { textAlign: 'center', marginTop: 20 },
});