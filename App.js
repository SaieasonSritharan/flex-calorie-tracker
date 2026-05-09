import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, FlatList, View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from './styles/theme';

import Header from './Components/Header';
import DateSwitcher from './Components/DateSwitcher';
import ProfileSettings from './Components/ProfileSettings';
import AddMealForm from './Components/AddMealForm';
import AddExerciseForm from './Components/AddExerciseForm';

const DEFAULT_PROFILE = {
  weight: '165',
  targetWeight: '165',
  height: '70',
  age: '22',
  gender: 'male',
  weeklyGoal: '1',
};

const KG_TO_LB = 2.20462;
const CM_TO_IN = 0.393701;
const LB_TO_KG = 0.453592;
const IN_TO_CM = 2.54;
const DAILY_CALORIES_PER_KG_PER_WEEK = 1000;
const DEFAULT_WEEKLY_GOAL_KG = 1;
const PROTEIN_G_PER_LB = 0.8;
const CARBS_G_PER_LB = 1.6;
const FATS_G_PER_LB = 0.4;

const normalizeProfile = (value) => {
  const merged = { ...DEFAULT_PROFILE, ...(value || {}) };
  const weightNum = parseFloat(merged.weight);
  const targetNum = parseFloat(merged.targetWeight);
  const heightNum = parseFloat(merged.height);

  // Migrate older saved metric profiles (kg/cm) to imperial (lb/in).
  if (!Number.isNaN(heightNum) && heightNum > 100) {
    const convertedWeight = Number.isNaN(weightNum) ? parseFloat(DEFAULT_PROFILE.weight) : weightNum * KG_TO_LB;
    const convertedTarget = Number.isNaN(targetNum) ? convertedWeight : targetNum * KG_TO_LB;

    return {
      ...merged,
      weight: Math.round(convertedWeight).toString(),
      targetWeight: Math.round(convertedTarget).toString(),
      height: Math.round(heightNum * CM_TO_IN).toString(),
    };
  }

  return merged;
};

export default function App() {
  const [allData, setAllData] = useState({});
  const [allExerciseData, setAllExerciseData] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [activeTab, setActiveTab] = useState('nutrition');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const savedMeals = await AsyncStorage.getItem('@calorie_data');
    const savedExercises = await AsyncStorage.getItem('@exercise_schedule_data');
    const savedProfile = await AsyncStorage.getItem('@user_profile');
    if (savedMeals) setAllData(JSON.parse(savedMeals));
    if (savedExercises) setAllExerciseData(JSON.parse(savedExercises));
    if (savedProfile) setProfile(normalizeProfile(JSON.parse(savedProfile)));
  };

  const handleUpdateProfile = (newProfile) => {
    const normalized = normalizeProfile(newProfile);
    setProfile(normalized);
    AsyncStorage.setItem('@user_profile', JSON.stringify(normalized));
  };

  const handleAddMeal = (mealData) => {
    const newMeal = {
      id: Date.now().toString(),
      name: mealData.food,
      portionSize: mealData.portionSize || '',
      cals: parseInt(mealData.calories, 10) || 0,
      protein: parseFloat(mealData.protein) || 0,
      carbs: parseFloat(mealData.carbs) || 0,
      fats: parseFloat(mealData.fats) || 0,
    };
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

  const handleAddExercise = (exerciseData) => {
    const newExercise = {
      id: Date.now().toString(),
      name: exerciseData.exerciseName,
      sets: parseInt(exerciseData.sets, 10) || 0,
      reps: parseInt(exerciseData.reps, 10) || 0,
      weight: parseFloat(exerciseData.weight) || 0,
      completed: false,
    };
    const updatedDay = [newExercise, ...(allExerciseData[selectedDate] || [])];
    const updatedAll = { ...allExerciseData, [selectedDate]: updatedDay };
    setAllExerciseData(updatedAll);
    AsyncStorage.setItem('@exercise_schedule_data', JSON.stringify(updatedAll));
  };

  const handleDeleteExercise = (id) => {
    const updatedDay = (allExerciseData[selectedDate] || []).filter((exercise) => exercise.id !== id);
    const updatedAll = { ...allExerciseData, [selectedDate]: updatedDay };
    setAllExerciseData(updatedAll);
    AsyncStorage.setItem('@exercise_schedule_data', JSON.stringify(updatedAll));
  };

  const handleToggleExerciseComplete = (id) => {
    const updatedDay = (allExerciseData[selectedDate] || []).map((exercise) =>
      exercise.id === id ? { ...exercise, completed: !exercise.completed } : exercise
    );
    const updatedAll = { ...allExerciseData, [selectedDate]: updatedDay };
    setAllExerciseData(updatedAll);
    AsyncStorage.setItem('@exercise_schedule_data', JSON.stringify(updatedAll));
  };

  const calculateGoal = () => {
  const { weight, targetWeight, height, age, gender, weeklyGoal } = profile;
  
  const currentWeightLb = parseFloat(weight) || parseFloat(DEFAULT_PROFILE.weight);
  const goalWeightLb = parseFloat(targetWeight) || currentWeightLb;
  const heightIn = parseFloat(height) || parseFloat(DEFAULT_PROFILE.height);
  const ageYears = parseFloat(age) || parseFloat(DEFAULT_PROFILE.age);
  
  // Weekly pace in lbs (default to 1 if empty)
  const lbPerWeek = parseFloat(weeklyGoal) || 1; 

  const currentWeightKg = currentWeightLb * LB_TO_KG;
  const heightCm = heightIn * IN_TO_CM;

  // BMR calculation (Mifflin-St Jeor)
  let bmr = (10 * currentWeightKg) + (6.25 * heightCm) - (5 * ageYears);
  bmr = gender === 'male' ? bmr + 5 : bmr - 161;

  // TDEE (Sedentary multiplier 1.2)
  const maintenanceCalories = bmr * 1.2;

  // Determine direction (Gain vs Loss)
  const targetDiffLb = goalWeightLb - currentWeightLb;
  const direction = Math.sign(targetDiffLb);

  // 1lb per week = 500 calorie daily offset
  const dailyOffset = direction * (lbPerWeek * 500);

  // Return goal, ensuring a floor of 1200 calories for safety
  return Math.max(1200, Math.round(maintenanceCalories + dailyOffset));
};

  const currentMeals = allData[selectedDate] || [];
  const currentExercises = allExerciseData[selectedDate] || [];
  const dailyGoal = calculateGoal();
  const totalCals = currentMeals.reduce((s, m) => s + m.cals, 0);
  const consumedMacros = currentMeals.reduce(
    (acc, meal) => ({
      protein: acc.protein + (meal.protein || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      fats: acc.fats + (meal.fats || 0),
    }),
    { protein: 0, carbs: 0, fats: 0 }
  );
  const currentWeightLb = parseFloat(profile.weight) || parseFloat(DEFAULT_PROFILE.weight);
  const macroTargets = {
    protein: Math.round(currentWeightLb * PROTEIN_G_PER_LB),
    carbs: Math.round(currentWeightLb * CARBS_G_PER_LB),
    fats: Math.round(currentWeightLb * FATS_G_PER_LB),
  };
  const completedExerciseCount = currentExercises.filter((exercise) => exercise.completed).length;
  const tabData = activeTab === 'nutrition' ? currentMeals : currentExercises;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={globalStyles.container} edges={['top']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={globalStyles.tabRow}>
            <TouchableOpacity
              style={[globalStyles.tabButton, activeTab === 'nutrition' && globalStyles.activeTabButton]}
              onPress={() => setActiveTab('nutrition')}
            >
              <Text style={[globalStyles.tabButtonText, activeTab === 'nutrition' && globalStyles.activeTabButtonText]}>
                Nutrition
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[globalStyles.tabButton, activeTab === 'exercise' && globalStyles.activeTabButton]}
              onPress={() => setActiveTab('exercise')}
            >
              <Text style={[globalStyles.tabButtonText, activeTab === 'exercise' && globalStyles.activeTabButtonText]}>
                Exercise Scheduler
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={tabData}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListHeaderComponent={
              <>
                <ProfileSettings profile={profile} onSaveProfile={handleUpdateProfile} />
                
                <DateSwitcher 
                  selectedDate={selectedDate} 
                  onChangeDate={(days) => {
                    const d = new Date(selectedDate);
                    d.setDate(d.getDate() + days);
                    setSelectedDate(d.toISOString().split('T')[0]);
                  }} 
                />

                <Header
                  totalCals={totalCals}
                  dailyGoal={dailyGoal}
                  progress={(totalCals / dailyGoal) * 100}
                  macroTargets={macroTargets}
                  consumedMacros={{
                    protein: Math.round(consumedMacros.protein),
                    carbs: Math.round(consumedMacros.carbs),
                    fats: Math.round(consumedMacros.fats),
                  }}
                />

                {activeTab === 'nutrition' ? (
                  <AddMealForm onAddMeal={handleAddMeal} />
                ) : (
                  <>
                    <View style={globalStyles.card}>
                      <Text style={globalStyles.sectionTitle}>Workout Plan For This Date</Text>
                      <Text style={globalStyles.inlineEmptyText}>
                        {completedExerciseCount}/{currentExercises.length} exercises completed
                      </Text>
                    </View>
                    <AddExerciseForm onAddExercise={handleAddExercise} />
                  </>
                )}
              </>
            }
            renderItem={({ item }) => {
              if (activeTab === 'nutrition') {
                return (
                  <View style={globalStyles.listItem}>
                    <View>
                      <Text style={globalStyles.itemName}>{item.name}</Text>
                      {!!item.portionSize && <Text style={globalStyles.itemSubtext}>Portion: {item.portionSize}</Text>}
                      <Text style={globalStyles.itemSubtext}>{item.cals} kcal</Text>
                      <Text style={globalStyles.itemSubtext}>
                        P {Math.round(item.protein || 0)}g | C {Math.round(item.carbs || 0)}g | F {Math.round(item.fats || 0)}g
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteMeal(item.id)}>
                      <Text style={globalStyles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                );
              }

              return (
                <View style={globalStyles.listItem}>
                  <View>
                    <Text style={globalStyles.itemName}>{item.name}</Text>
                    <Text style={globalStyles.itemSubtext}>
                      {item.sets} sets x {item.reps} reps
                    </Text>
                    <Text style={globalStyles.itemSubtext}>{item.weight || 0} lbs</Text>
                    <Text style={item.completed ? globalStyles.donePill : globalStyles.todoPill}>
                      {item.completed ? 'Completed' : 'To Do'}
                    </Text>
                  </View>
                  <View style={globalStyles.exerciseActions}>
                    <TouchableOpacity onPress={() => handleToggleExerciseComplete(item.id)}>
                      <Text style={globalStyles.completeText}>{item.completed ? 'Undo' : 'Done'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteExercise(item.id)}>
                      <Text style={globalStyles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <Text style={globalStyles.emptyText}>
                {activeTab === 'nutrition'
                  ? 'No meals logged for this date.'
                  : 'No exercises scheduled for this date.'}
              </Text>
            }
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}