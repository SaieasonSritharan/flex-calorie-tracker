import { StyleSheet, Platform } from 'react-native';

export const colors = {
  primary: '#007AFF',
  danger: '#FF3B30',
  success: '#44bb44',
  background: '#f4f7f6',
  surface: '#ffffff',
  textMain: '#333333',
  textSecondary: '#888888',
  border: '#eeeeee',
};

export const globalStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  
  // Header & Progress
  headerContainer: { marginBottom: 25 },
  counterText: { fontSize: 32, fontWeight: '800', textAlign: 'center', marginBottom: 8, color: colors.textMain },
  progressTrack: { height: 10, backgroundColor: '#e0e0e0', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%' },

  // Date Switcher
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  dateText: { fontSize: 16, fontWeight: 'bold', color: colors.textMain },
  arrow: { fontSize: 20, color: colors.primary, padding: 10 },

  // Forms & Inputs
  card: { backgroundColor: colors.surface, padding: 15, borderRadius: 12, marginBottom: 20, elevation: 2, shadowOpacity: 0.1, shadowRadius: 5 },
  input: { borderBottomWidth: 1, borderColor: colors.border, paddingVertical: 8, marginBottom: 10, fontSize: 16 },
  button: { backgroundColor: colors.primary, padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: colors.surface, fontWeight: 'bold' },

  // List Items
  listItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 15, 
    backgroundColor: colors.surface, 
    borderRadius: 12, 
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  itemName: { fontSize: 16, fontWeight: '600' },
  itemSubtext: { color: colors.textSecondary },
  deleteText: { color: colors.danger, fontWeight: '600' },

  // Settings Panel
  settingsPanel: { backgroundColor: colors.surface, padding: 15, borderRadius: 12, marginTop: 10, borderWidth: 1, borderColor: colors.border },
  label: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  genderRow: { flexDirection: 'row', gap: 10, marginTop: 5 },
  genderBtn: { flex: 1, padding: 10, alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 8 },
  activeGenderBtn: { backgroundColor: colors.primary + '22', borderColor: colors.primary, borderWidth: 1 },
});