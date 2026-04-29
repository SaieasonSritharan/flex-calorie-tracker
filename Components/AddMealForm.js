import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text } from 'react-native';

export default function AddMealForm({ onAddMeal }) {
  const [food, setFood] = useState('');
  const [calories, setCalories] = useState('');

  const handleSubmit = () => {
    if (!food || !calories) return;
    onAddMeal(food, calories);
    setFood('');
    setCalories('');
  };

  return (
    <View style={styles.inputContainer}>
      <TextInput style={styles.input} placeholder="What did you eat?" value={food} onChangeText={setFood} />
      <TextInput style={styles.input} placeholder="Calories" keyboardType="numeric" value={calories} onChangeText={setCalories} />
      <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Log Meal</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 20, elevation: 2 },
  input: { borderBottomWidth: 1, borderColor: '#eee', paddingVertical: 8, marginBottom: 10 },
  addButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});