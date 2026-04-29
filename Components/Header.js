import React from 'react';
import { View, Text } from 'react-native';
// Import the shared styles
import { globalStyles, colors } from '../styles/theme'; 

export default function Header({ totalCals, dailyGoal, progress }) {
  return (
    <View style={globalStyles.headerContainer}>
      <Text style={globalStyles.counterText}>{totalCals} / {dailyGoal} kcal</Text>
      <View style={globalStyles.progressTrack}>
        <View style={[
          globalStyles.progressFill, 
          { width: `${progress}%`, backgroundColor: progress >= 100 ? colors.danger : colors.success }
        ]} />
      </View>
    </View>
  );
}