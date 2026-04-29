import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Header({ totalCals, dailyGoal, progress }) {
  return (
    <View style={styles.header}>
      <Text style={styles.counter}>{totalCals} / {dailyGoal} kcal</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: progress >= 100 ? '#ff4444' : '#44bb44' }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 25 },
  counter: { fontSize: 32, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  progressTrack: { height: 10, backgroundColor: '#e0e0e0', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%' },
});