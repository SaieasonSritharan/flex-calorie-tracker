import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { globalStyles } from '../styles/theme';

export default function DateSwitcher({ selectedDate, onChangeDate }) {
  return (
    <View style={globalStyles.dateRow}>
      <TouchableOpacity style={globalStyles.arrowButton} onPress={() => onChangeDate(-1)}>
        <Text style={globalStyles.arrow}>◀</Text>
      </TouchableOpacity>
      <Text style={globalStyles.dateText}>{selectedDate}</Text>
      <TouchableOpacity style={globalStyles.arrowButton} onPress={() => onChangeDate(1)}>
        <Text style={globalStyles.arrow}>▶</Text>
      </TouchableOpacity>
    </View>
  );
}