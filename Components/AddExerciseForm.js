import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { globalStyles } from '../styles/theme';

export default function AddExerciseForm({ onAddExercise }) {
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');

  const handleSubmit = () => {
    if (!exerciseName.trim() || !sets || !reps) return;
    onAddExercise({
      exerciseName: exerciseName.trim(),
      sets,
      reps,
      weight,
    });
    setExerciseName('');
    setSets('');
    setReps('');
    setWeight('');
  };

  return (
    <View style={globalStyles.card}>
      <Text style={globalStyles.sectionTitle}>Add Exercise To Today</Text>
      <Text style={globalStyles.label}>Exercise Name</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="Exercise (e.g. Bench Press)"
        placeholderTextColor="#94A3B8"
        value={exerciseName}
        onChangeText={setExerciseName}
      />
      <View style={globalStyles.inputRow}>
        <View style={globalStyles.macroInput}>
          <Text style={globalStyles.label}>Sets</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Sets"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            value={sets}
            onChangeText={setSets}
          />
        </View>
        <View style={globalStyles.macroInput}>
          <Text style={globalStyles.label}>Reps</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Reps"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            value={reps}
            onChangeText={setReps}
          />
        </View>
      </View>
      <Text style={globalStyles.label}>Weight (lbs)</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="Weight"
        placeholderTextColor="#94A3B8"
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
      />
      <TouchableOpacity style={globalStyles.button} onPress={handleSubmit}>
        <Text style={globalStyles.buttonText}>Schedule Exercise</Text>
      </TouchableOpacity>
    </View>
  );
}
