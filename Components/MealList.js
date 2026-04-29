import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';

export default function MealList({ meals, onDeleteMeal }) {
  return (
    <FlatList
      data={meals}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingBottom: 20 }}
      renderItem={({ item }) => (
        <View style={styles.mealItem}>
          <View>
            <Text style={styles.mealName}>{item.name}</Text>
            <Text style={styles.mealCals}>{item.cals} kcal</Text>
          </View>
          <TouchableOpacity onPress={() => onDeleteMeal(item.id)}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.emptyText}>No meals logged for this day.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  mealItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 15, 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
  },
  mealName: { fontSize: 16, fontWeight: '500' },
  mealCals: { color: '#666', fontSize: 14 },
  deleteText: { color: '#FF3B30', fontWeight: '600' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40 },
});