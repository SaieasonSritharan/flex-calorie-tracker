import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function DateSwitcher({ selectedDate, onChangeDate }) {
  return (
    <View style={styles.dateRow}>
      <TouchableOpacity onPress={() => onChangeDate(-1)}><Text style={styles.arrow}>◀</Text></TouchableOpacity>
      <Text style={styles.dateText}>{selectedDate}</Text>
      <TouchableOpacity onPress={() => onChangeDate(1)}><Text style={styles.arrow}>▶</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  dateText: { fontSize: 16, fontWeight: 'bold' },
  arrow: { fontSize: 20, color: '#007AFF' },
});