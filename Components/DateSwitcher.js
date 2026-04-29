import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { globalStyles } from '../styles/theme';

export default function DateSwitcher({ selectedDate, onChangeDate }) {
  return (
    <View style={globalStyles.dateRow}>
      <TouchableOpacity onPress={() => onChangeDate(-1)}><Text style={globalStyles.arrow}>◀</Text></TouchableOpacity>
      <Text style={globalStyles.dateText}>{selectedDate}</Text>
      <TouchableOpacity onPress={() => onChangeDate(1)}><Text style={globalStyles.arrow}>▶</Text></TouchableOpacity>
    </View>
  );
}