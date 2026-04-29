import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { globalStyles } from '../styles/theme';

export default function MealList({ meals, onDeleteMeal }) {
  return (
    <FlatList
      data={meals}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={globalStyles.listItem}>
          <View>
            <Text style={globalStyles.itemName}>{item.name}</Text>
            <Text style={globalStyles.itemSubtext}>{item.cals} kcal</Text>
          </View>
          <TouchableOpacity onPress={() => onDeleteMeal(item.id)}>
            <Text style={globalStyles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
      ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20, color: '#999'}}>No entries for today.</Text>}
    />
  );
}