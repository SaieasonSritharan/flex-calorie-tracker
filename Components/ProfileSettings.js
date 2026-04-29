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
              <Text style={globalStyles.label}>Current Weight (kg)</Text>
              <TextInput 
                style={globalStyles.input} 
                keyboardType="numeric" 
                value={profile.weight} 
                onChangeText={(v) => onSaveProfile({...profile, weight: v})} 
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={globalStyles.label}>Target Weight (kg)</Text>
              <TextInput 
                style={globalStyles.input} 
                keyboardType="numeric" 
                value={profile.targetWeight || ''} 
                onChangeText={(v) => onSaveProfile({...profile, targetWeight: v})} 
              />
            </View>
          </View>
          
          <Text style={globalStyles.label}>Height (cm)</Text>
          <TextInput style={globalStyles.input} keyboardType="numeric" value={profile.height} onChangeText={(v) => onSaveProfile({...profile, height: v})} />
          
          <Text style={globalStyles.label}>Age</Text>
          <TextInput style={globalStyles.input} keyboardType="numeric" value={profile.age} onChangeText={(v) => onSaveProfile({...profile, age: v})} />
          
          <View style={globalStyles.genderRow}>
            {['male', 'female'].map((g) => (
              <TouchableOpacity 
                key={g} 
                style={[globalStyles.genderBtn, profile.gender === g && globalStyles.activeGenderBtn]}
                onPress={() => onSaveProfile({...profile, gender: g})}
              >
                <Text style={{textTransform: 'capitalize'}}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// Add these to a local stylesheet or move to theme.js
const styles = {
  inputRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
  inputGroup: { flex: 1 }
};