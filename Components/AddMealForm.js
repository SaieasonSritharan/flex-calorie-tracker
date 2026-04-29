import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { globalStyles } from '../styles/theme';

export default function AddMealForm({ onAddMeal }) {
  const [food, setFood] = useState('');
  const [calories, setCalories] = useState('');

  const handleSubmit = () => {
    if (!food || !calories) return;
    onAddMeal(food, calories);
    setFood(''); setCalories('');
  };

  return (
    <View style={globalStyles.card}>
      <TextInput style={globalStyles.input} placeholder="Food Name" value={food} onChangeText={setFood} />
      <TextInput style={globalStyles.input} placeholder="Calories" keyboardType="numeric" value={calories} onChangeText={setCalories} />
      <TouchableOpacity style={globalStyles.button} onPress={handleSubmit}>
        <Text style={globalStyles.buttonText}>Log Meal</Text>
      </TouchableOpacity>
    </View>
  );
}