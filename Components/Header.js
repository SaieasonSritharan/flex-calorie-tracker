import React from 'react';
import { View, Text } from 'react-native';
// Import the shared styles
import { globalStyles, colors } from '../styles/theme'; 

export default function Header({ totalCals, dailyGoal, progress, macroTargets, consumedMacros }) {
  return (
    <View style={globalStyles.headerContainer}>
      <Text style={globalStyles.counterText}>{totalCals} / {dailyGoal} kcal</Text>
      <View style={globalStyles.progressTrack}>
        <View style={[
          globalStyles.progressFill, 
          { width: `${progress}%`, backgroundColor: progress >= 100 ? colors.danger : colors.success }
        ]} />
      </View>
      <View style={globalStyles.macroTargetsRow}>
        <Text style={globalStyles.macroTargetText}>Protein {consumedMacros.protein}/{macroTargets.protein}g</Text>
        <Text style={globalStyles.macroTargetText}>Carbs {consumedMacros.carbs}/{macroTargets.carbs}g</Text>
        <Text style={globalStyles.macroTargetText}>Fats {consumedMacros.fats}/{macroTargets.fats}g</Text>
      </View>
    </View>
  );
}