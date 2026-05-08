import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { globalStyles } from '../styles/theme';

export default function MealList({ meals, onDeleteMeal }) {
  if (!meals.length) {
    return <Text style={globalStyles.emptyText}>No entries for today.</Text>;
  }

  return (
    <View>
      {meals.map((item) => (
        <View key={item.id} style={globalStyles.listItem}>
          <View>
            <Text style={globalStyles.itemName}>{item.name}</Text>
            {!!item.portionSize && <Text style={globalStyles.itemSubtext}>Portion: {item.portionSize}</Text>}
            <Text style={globalStyles.itemSubtext}>{item.cals} kcal</Text>
            <Text style={globalStyles.itemSubtext}>
              P {Math.round(item.protein || 0)}g | C {Math.round(item.carbs || 0)}g | F {Math.round(item.fats || 0)}g
            </Text>
          </View>
          <TouchableOpacity onPress={() => onDeleteMeal(item.id)}>
            <Text style={globalStyles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}