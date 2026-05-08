// components/ProfileSettings.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { globalStyles } from '../styles/theme';

export default function ProfileSettings({ profile, onSaveProfile }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={{ marginBottom: 10 }}>
      <TouchableOpacity onPress={() => setIsOpen(!isOpen)} style={globalStyles.settingsToggle}>
        <Text style={globalStyles.settingsToggleText}>
          {isOpen ? "✕ Close Profile" : "⚙️ Profile & Goal Settings"}
        </Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={globalStyles.card}>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={globalStyles.label}>Current Weight (lb)</Text>
              <TextInput 
                style={globalStyles.input} 
                keyboardType="numeric" 
                value={profile.weight} 
                onChangeText={(v) => onSaveProfile({...profile, weight: v})} 
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={globalStyles.label}>Target Weight (lb)</Text>
              <TextInput 
                style={globalStyles.input} 
                keyboardType="numeric" 
                value={profile.targetWeight || ''} 
                onChangeText={(v) => onSaveProfile({...profile, targetWeight: v})} 
              />
            </View>
          </View>

          {/* New Weekly Goal Section */}
          <View style={{ marginTop: 5, marginBottom: 10 }}>
            <Text style={globalStyles.label}>Weekly Pace (lbs per week)</Text>
            <TextInput 
              style={globalStyles.input} 
              keyboardType="numeric" 
              placeholder="e.g. 1.0"
              value={profile.weeklyGoal} 
              onChangeText={(v) => onSaveProfile({...profile, weeklyGoal: v})} 
            />
            <Text style={styles.helperText}>
              Recommended: 0.5 to 2.0 lbs/week
            </Text>
          </View>
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
               <Text style={globalStyles.label}>Height (in)</Text>
               <TextInput style={globalStyles.input} keyboardType="numeric" value={profile.height} onChangeText={(v) => onSaveProfile({...profile, height: v})} />
            </View>
            <View style={styles.inputGroup}>
               <Text style={globalStyles.label}>Age</Text>
               <TextInput style={globalStyles.input} keyboardType="numeric" value={profile.age} onChangeText={(v) => onSaveProfile({...profile, age: v})} />
            </View>
          </View>
          
          <View style={[globalStyles.genderRow, { marginTop: 10 }]}>
            {['male', 'female'].map((g) => (
              <TouchableOpacity 
                key={g} 
                style={[globalStyles.genderBtn, profile.gender === g && globalStyles.activeGenderBtn]}
                onPress={() => onSaveProfile({...profile, gender: g})}
              >
                <Text style={{textTransform: 'capitalize', color: profile.gender === g ? '#fff' : '#000'}}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = {
  inputRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
  inputGroup: { flex: 1 },
  helperText: { fontSize: 11, color: '#666', marginTop: -8, marginBottom: 10, fontStyle: 'italic' }
};