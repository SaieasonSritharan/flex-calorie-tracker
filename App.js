import React, { useState, useEffect } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Header from './Components/Header';
import DateSwitcher from './Components/DateSwitcher';
import ProfileSettings from './Components/ProfileSettings';
import AddMealForm from './Components/AddMealForm';
import MealList from './Components/MealList';

const DEFAULT_PROFILE = {
  weight: '75',
  targetWeight: '75',
  height: '180',
  age: '22',
  gender: 'male',
};

const normalizeProfile = (value) => ({ ...DEFAULT_PROFILE, ...(value || {}) });

export default function App() {
  const [allData, setAllData] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const savedMeals = await AsyncStorage.getItem('@calorie_data');
    const savedProfile = await AsyncStorage.getItem('@user_profile');
    if (savedMeals) setAllData(JSON.parse(savedMeals));
    if (savedProfile) setProfile(normalizeProfile(JSON.parse(savedProfile)));
  };

  const handleUpdateProfile = (newProfile) => {
    const normalized = normalizeProfile(newProfile);
    setProfile(normalized);
    AsyncStorage.setItem('@user_profile', JSON.stringify(normalized));
  };

  const handleAddMeal = (food, calories) => {
    const newMeal = { id: Date.now().toString(), name: food, cals: parseInt(calories) };
    const updatedDay = [newMeal, ...(allData[selectedDate] || [])];
    const updatedAll = { ...allData, [selectedDate]: updatedDay };
    setAllData(updatedAll);
    AsyncStorage.setItem('@calorie_data', JSON.stringify(updatedAll));
  };

  const handleDeleteMeal = (id) => {
    const updatedDay = allData[selectedDate].filter(m => m.id !== id);
    const updatedAll = { ...allData, [selectedDate]: updatedDay };
    setAllData(updatedAll);
    AsyncStorage.setItem('@calorie_data', JSON.stringify(updatedAll));
  };

  const calculateGoal = () => {
    const { weight, targetWeight, height, age, gender } = profile;
    const currentWeight = parseFloat(weight) || parseFloat(DEFAULT_PROFILE.weight);
    const goalWeight = parseFloat(targetWeight) || currentWeight;
    const heightCm = parseFloat(height) || parseFloat(DEFAULT_PROFILE.height);
    const ageYears = parseFloat(age) || parseFloat(DEFAULT_PROFILE.age);
    let bmr = (10 * currentWeight) + (6.25 * heightCm) - (5 * ageYears);
    bmr = gender === 'male' ? bmr + 5 : bmr - 161;
    const maintenanceCalories = bmr * 1.2;
    const targetDiffKg = goalWeight - currentWeight;
    const goalAdjustment = targetDiffKg * 250;
    return Math.max(1200, Math.round(maintenanceCalories + goalAdjustment));
  };

  const currentMeals = allData[selectedDate] || [];
  const dailyGoal = calculateGoal();
  const totalCals = currentMeals.reduce((s, m) => s + m.cals, 0);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ProfileSettings profile={profile} onSaveProfile={handleUpdateProfile} />
      
      <DateSwitcher 
        selectedDate={selectedDate} 
        onChangeDate={(days) => {
          const d = new Date(selectedDate);
          d.setDate(d.getDate() + days);
          setSelectedDate(d.toISOString().split('T')[0]);
        }} 
      />

      <Header totalCals={totalCals} dailyGoal={dailyGoal} progress={(totalCals / dailyGoal) * 100} />
      
      <AddMealForm onAddMeal={handleAddMeal} />
      
      <MealList meals={currentMeals} onDeleteMeal={handleDeleteMeal} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7f6', paddingTop: 50, paddingHorizontal: 20 },
});