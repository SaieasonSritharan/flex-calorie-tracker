import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  FlatList,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles, colors } from './styles/theme';

import Header from './Components/Header';
import DateSwitcher from './Components/DateSwitcher';
import ProfileSettings from './Components/ProfileSettings';
import AddMealForm from './Components/AddMealForm';
import AddExerciseForm from './Components/AddExerciseForm';
import WeeklySummary from './Components/WeeklySummary';

// ─── Constants ───────────────────────────────────────────────────────────────

const KG_TO_LB = 2.20462;
const CM_TO_IN = 0.393701;
const LB_TO_KG = 0.453592;
const IN_TO_CM = 2.54;
const PROTEIN_G_PER_LB = 0.8;
const CARBS_G_PER_LB = 1.6;
const FATS_G_PER_LB = 0.4;

const DEFAULT_PROFILE = {
  name: 'User',
  weight: '165',
  targetWeight: '165',
  height: '70',
  age: '22',
  gender: 'male',
  weeklyGoal: '1',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Merges saved profile with defaults and migrates any legacy metric values
 * (cm/kg) to imperial (in/lb).
 */
const normalizeProfile = (value) => {
  const merged = { ...DEFAULT_PROFILE, ...(value || {}) };
  const weightNum = parseFloat(merged.weight);
  const targetNum = parseFloat(merged.targetWeight);
  const heightNum = parseFloat(merged.height);

  // Height > 100 reliably signals cm storage from an older build.
  if (!Number.isNaN(heightNum) && heightNum > 100) {
    const convertedWeight = Number.isNaN(weightNum)
      ? parseFloat(DEFAULT_PROFILE.weight)
      : weightNum * KG_TO_LB;
    const convertedTarget = Number.isNaN(targetNum)
      ? convertedWeight
      : targetNum * KG_TO_LB;

    return {
      ...merged,
      weight: Math.round(convertedWeight).toString(),
      targetWeight: Math.round(convertedTarget).toString(),
      height: Math.round(heightNum * CM_TO_IN).toString(),
    };
  }

  return merged;
};

/**
 * Calculates the user's personalised daily calorie goal using the
 * Mifflin-St Jeor BMR formula with a sedentary activity multiplier (1.2)
 * and a 500 kcal-per-lb-per-week pace offset.
 * Floors at 1 200 kcal for safety.
 */
const calculateDailyGoal = (profile) => {
  const currentWeightLb = parseFloat(profile.weight) || parseFloat(DEFAULT_PROFILE.weight);
  const goalWeightLb = parseFloat(profile.targetWeight) || currentWeightLb;
  const heightIn = parseFloat(profile.height) || parseFloat(DEFAULT_PROFILE.height);
  const ageYears = parseFloat(profile.age) || parseFloat(DEFAULT_PROFILE.age);
  const lbPerWeek = parseFloat(profile.weeklyGoal) || 1;

  const weightKg = currentWeightLb * LB_TO_KG;
  const heightCm = heightIn * IN_TO_CM;

  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  bmr = profile.gender === 'male' ? bmr + 5 : bmr - 161;

  const maintenance = bmr * 1.2;
  const direction = Math.sign(goalWeightLb - currentWeightLb);
  const dailyOffset = direction * lbPerWeek * 500;

  return Math.max(1200, Math.round(maintenance + dailyOffset));
};

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  // keyed by date string: { [dateStr]: meal[] }
  const [allData, setAllData] = useState({});
  // keyed by date string: { [dateStr]: exercise[] }
  const [allExerciseData, setAllExerciseData] = useState({});

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [activeTab, setActiveTab] = useState('nutrition');
  const [editingMeal, setEditingMeal] = useState(null);

  // ── Persistence ────────────────────────────────────────────────────────────

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [savedMeals, savedExercises, savedProfile] = await Promise.all([
        AsyncStorage.getItem('@calorie_data'),
        AsyncStorage.getItem('@exercise_schedule_data'),
        AsyncStorage.getItem('@user_profile'),
      ]);
      if (savedMeals) setAllData(JSON.parse(savedMeals));
      if (savedExercises) setAllExerciseData(JSON.parse(savedExercises));
      if (savedProfile) setProfile(normalizeProfile(JSON.parse(savedProfile)));
    } catch (e) {
      console.error('Failed to load data', e);
    }
  };

  const persist = async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to save ${key}`, e);
    }
  };

  // ── Profile ────────────────────────────────────────────────────────────────

  const handleUpdateProfile = (newProfile) => {
    const normalized = normalizeProfile(newProfile);
    setProfile(normalized);
    persist('@user_profile', normalized);
  };

  // ── Meals ──────────────────────────────────────────────────────────────────

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
    persist('@calorie_data', updatedAll);
  };

  const handleUpdateMeal = (updatedMealData) => {
    const updatedDay = (allData[selectedDate] || []).map((m) =>
      m.id === editingMeal.id
        ? {
            ...m,
            name: updatedMealData.food,
            portionSize: updatedMealData.portionSize || '',
            cals: parseInt(updatedMealData.calories, 10) || 0,
            protein: parseFloat(updatedMealData.protein) || 0,
            carbs: parseFloat(updatedMealData.carbs) || 0,
            fats: parseFloat(updatedMealData.fats) || 0,
          }
        : m
    );
    const updatedAll = { ...allData, [selectedDate]: updatedDay };
    setAllData(updatedAll);
    persist('@calorie_data', updatedAll);
    setEditingMeal(null);
  };

  const handleDeleteMeal = (id) => {
    const updatedDay = (allData[selectedDate] || []).filter((m) => m.id !== id);
    const updatedAll = { ...allData, [selectedDate]: updatedDay };
    setAllData(updatedAll);
    persist('@calorie_data', updatedAll);
  };

  // ── Exercises ──────────────────────────────────────────────────────────────

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
    persist('@exercise_schedule_data', updatedAll);
  };

  const handleDeleteExercise = (id) => {
    const updatedDay = (allExerciseData[selectedDate] || []).filter(
      (e) => e.id !== id
    );
    const updatedAll = { ...allExerciseData, [selectedDate]: updatedDay };
    setAllExerciseData(updatedAll);
    persist('@exercise_schedule_data', updatedAll);
  };

  const handleToggleExerciseComplete = (id) => {
    const updatedDay = (allExerciseData[selectedDate] || []).map((e) =>
      e.id === id ? { ...e, completed: !e.completed } : e
    );
    const updatedAll = { ...allExerciseData, [selectedDate]: updatedDay };
    setAllExerciseData(updatedAll);
    persist('@exercise_schedule_data', updatedAll);
  };

  // ── Derived state ──────────────────────────────────────────────────────────

  const currentMeals = allData[selectedDate] || [];
  const currentExercises = allExerciseData[selectedDate] || [];

  const totalCals = currentMeals.reduce((s, m) => s + m.cals, 0);
  const consumedMacros = currentMeals.reduce(
    (acc, m) => ({
      protein: acc.protein + (m.protein || 0),
      carbs: acc.carbs + (m.carbs || 0),
      fats: acc.fats + (m.fats || 0),
    }),
    { protein: 0, carbs: 0, fats: 0 }
  );

  const currentWeightLb =
    parseFloat(profile.weight) || parseFloat(DEFAULT_PROFILE.weight);
  const macroTargets = {
    protein: Math.round(currentWeightLb * PROTEIN_G_PER_LB),
    carbs: Math.round(currentWeightLb * CARBS_G_PER_LB),
    fats: Math.round(currentWeightLb * FATS_G_PER_LB),
  };

  const dailyGoal = calculateDailyGoal(profile);
  const completedExerciseCount = currentExercises.filter((e) => e.completed).length;

  // Build a flat meals array (with date key) for WeeklySummary, which expects
  // the App-1 shape: [{ date, calories, ... }]
  const allMealsFlat = Object.entries(allData).flatMap(([date, meals]) =>
    meals.map((m) => ({ ...m, date, calories: m.cals }))
  );
  // Build a flat exercises array for WeeklySummary (calories burned field).
  // Exercise scheduler entries don't have a calorie-burn field; pass 0 so the
  // component renders gracefully without crashing.
  const allExercisesFlat = Object.entries(allExerciseData).flatMap(
    ([date, exercises]) =>
      exercises.map((e) => ({ ...e, date, calories: e.caloriesBurned || 0 }))
  );

  const tabData = activeTab === 'nutrition' ? currentMeals : currentExercises;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaProvider>
      <SafeAreaView style={globalStyles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Tab bar */}
          <View style={globalStyles.tabRow}>
            <TouchableOpacity
              style={[
                globalStyles.tabButton,
                activeTab === 'nutrition' && globalStyles.activeTabButton,
              ]}
              onPress={() => setActiveTab('nutrition')}
            >
              <Text
                style={[
                  globalStyles.tabButtonText,
                  activeTab === 'nutrition' && globalStyles.activeTabButtonText,
                ]}
              >
                Nutrition
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                globalStyles.tabButton,
                activeTab === 'exercise' && globalStyles.activeTabButton,
              ]}
              onPress={() => setActiveTab('exercise')}
            >
              <Text
                style={[
                  globalStyles.tabButtonText,
                  activeTab === 'exercise' && globalStyles.activeTabButtonText,
                ]}
              >
                Exercise Scheduler
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={tabData}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            ListHeaderComponent={
              <>
                <ProfileSettings
                  profile={profile}
                  onSaveProfile={handleUpdateProfile}
                />

                <DateSwitcher
                  selectedDate={selectedDate}
                  onChangeDate={(days) => {
                    const d = new Date(selectedDate);
                    d.setDate(d.getDate() + days);
                    setSelectedDate(d.toISOString().split('T')[0]);
                  }}
                />

                <Header
                  // App-2 props (macros + progress ring)
                  totalCals={totalCals}
                  dailyGoal={dailyGoal}
                  progress={(totalCals / dailyGoal) * 100}
                  macroTargets={macroTargets}
                  consumedMacros={{
                    protein: Math.round(consumedMacros.protein),
                    carbs: Math.round(consumedMacros.carbs),
                    fats: Math.round(consumedMacros.fats),
                  }}
                  // App-1 props (burned calories summary)
                  profile={profile}
                  consumed={totalCals}
                  burned={allExercisesFlat
                    .filter((e) => e.date === selectedDate)
                    .reduce((s, e) => s + e.calories, 0)}
                  goal={dailyGoal}
                />

                {/* Weekly summary – from App 1 */}
                <WeeklySummary
                  meals={allMealsFlat}
                  exercises={allExercisesFlat}
                  calorieGoal={dailyGoal}
                />

                {activeTab === 'nutrition' ? (
                  <AddMealForm
                    onAddMeal={handleAddMeal}
                    editingMeal={editingMeal}
                    onUpdateMeal={handleUpdateMeal}
                    onCancelEdit={() => setEditingMeal(null)}
                  />
                ) : (
                  <>
                    <View style={globalStyles.card}>
                      <Text style={globalStyles.sectionTitle}>
                        Workout Plan For This Date
                      </Text>
                      <Text style={globalStyles.inlineEmptyText}>
                        {completedExerciseCount}/{currentExercises.length}{' '}
                        exercises completed
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
                    <View style={{ flex: 1 }}>
                      <Text style={globalStyles.itemName}>{item.name}</Text>
                      {!!item.portionSize && (
                        <Text style={globalStyles.itemSubtext}>
                          Portion: {item.portionSize}
                        </Text>
                      )}
                      <Text style={globalStyles.itemSubtext}>
                        {item.cals} kcal
                      </Text>
                      <Text style={globalStyles.itemSubtext}>
                        P {Math.round(item.protein || 0)}g | C{' '}
                        {Math.round(item.carbs || 0)}g | F{' '}
                        {Math.round(item.fats || 0)}g
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <TouchableOpacity onPress={() => setEditingMeal(item)}>
                        <Text style={{ color: colors.primary, fontWeight: '700' }}>
                          Edit
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteMeal(item.id)}>
                        <Text style={globalStyles.deleteText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }

              // Exercise tab row
              return (
                <View style={globalStyles.listItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={globalStyles.itemName}>{item.name}</Text>
                    <Text style={globalStyles.itemSubtext}>
                      {item.sets} sets × {item.reps} reps
                    </Text>
                    <Text style={globalStyles.itemSubtext}>
                      {item.weight || 0} lbs
                    </Text>
                    <Text
                      style={
                        item.completed
                          ? globalStyles.donePill
                          : globalStyles.todoPill
                      }
                    >
                      {item.completed ? 'Completed' : 'To Do'}
                    </Text>
                  </View>
                  <View style={globalStyles.exerciseActions}>
                    <TouchableOpacity
                      onPress={() => handleToggleExerciseComplete(item.id)}
                    >
                      <Text style={globalStyles.completeText}>
                        {item.completed ? 'Undo' : 'Done'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteExercise(item.id)}
                    >
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