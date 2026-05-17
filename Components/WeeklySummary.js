import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { globalStyles, colors } from '../styles/theme';

const WeeklySummary = ({ meals, exercises, calorieGoal }) => {
  // ── Helpers ────────────────────────────────────────────────────────────────

  const getDateString = (offset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateLabel = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) return 'Today';
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // ── Derived data ───────────────────────────────────────────────────────────

  const lastSevenDays = Array.from({ length: 7 }, (_, i) => getDateString(i));

  const dailyStats = lastSevenDays.map((date) => {
    const dailyMeals = meals.filter((m) => m.date === date);
    const dailyExercises = exercises.filter((e) => e.date === date);

    const consumed = dailyMeals.reduce((sum, m) => sum + (Number(m.calories) || 0), 0);
    const burned = dailyExercises.reduce((sum, e) => sum + (Number(e.calories) || 0), 0);
    const protein = dailyMeals.reduce((sum, m) => sum + (Number(m.protein) || 0), 0);
    const carbs = dailyMeals.reduce((sum, m) => sum + (Number(m.carbs) || 0), 0);
    const fats = dailyMeals.reduce((sum, m) => sum + (Number(m.fats) || 0), 0);
    const net = consumed - burned;

    return {
      date,
      consumed,
      burned,
      net,
      protein,
      carbs,
      fats,
      remaining: calorieGoal - net,
      isGoalMet: net <= calorieGoal,
      hasData: consumed > 0,
    };
  });

  const daysWithData = dailyStats.filter((d) => d.hasData);
  const activeDayCount = daysWithData.length || 1;

  const weeklyAverages = {
    calories: Math.round(daysWithData.reduce((s, d) => s + d.consumed, 0) / activeDayCount),
    protein: Math.round(daysWithData.reduce((s, d) => s + d.protein, 0) / activeDayCount),
    carbs: Math.round(daysWithData.reduce((s, d) => s + d.carbs, 0) / activeDayCount),
    fats: Math.round(daysWithData.reduce((s, d) => s + d.fats, 0) / activeDayCount),
  };

  const weeklyTotals = {
    daysLogged: activeDayCount,
    daysOnGoal: dailyStats.filter((d) => d.hasData && d.isGoalMet).length,
  };

  // ── Sub-components ─────────────────────────────────────────────────────────

  const StatTile = ({ label, value, unit, accent }) => (
    <View style={[globalStyles.weeklyStatTile, { borderTopColor: accent || colors.primary }]}>
      <Text style={globalStyles.weeklyStatTileValue}>
        {value}
        <Text style={globalStyles.weeklyStatTileUnit}>{unit}</Text>
      </Text>
      <Text style={globalStyles.weeklyStatTileLabel}>{label}</Text>
    </View>
  );

  const MacroPill = ({ label, value, color }) => (
    <View style={[globalStyles.weeklyMacroPill, { backgroundColor: color + '20' }]}>
      <Text style={[globalStyles.weeklyMacroPillText, { color }]}>
        {label} {Math.round(value)}g
      </Text>
    </View>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={globalStyles.weeklySummaryContainer}>
      <Text style={globalStyles.weeklySummaryTitle}>Weekly Progress</Text>

      {/* ── Averages panel ── */}
      <View style={globalStyles.weeklyAveragesCard}>
        <View style={globalStyles.weeklyAveragesHeader}>
          <Text style={globalStyles.weeklyAveragesTitle}>7-Day Averages</Text>
          <Text style={globalStyles.weeklyAveragesBadge}>
            {weeklyTotals.daysLogged} day{weeklyTotals.daysLogged !== 1 ? 's' : ''} logged
          </Text>
        </View>

        <View style={globalStyles.weeklyStatGrid}>
          <StatTile label="Avg Calories" value={weeklyAverages.calories.toLocaleString()} unit=" kcal" accent={colors.primary} />
          <StatTile label="Avg Protein"  value={weeklyAverages.protein}  unit="g" accent="#4CAF50" />
          <StatTile label="Avg Carbs"    value={weeklyAverages.carbs}    unit="g" accent="#FF9800" />
          <StatTile label="Avg Fats"     value={weeklyAverages.fats}     unit="g" accent="#9C27B0" />
        </View>

        <View style={globalStyles.weeklyAdherenceRow}>
          <Text style={globalStyles.weeklyAdherenceLabel}>Days on goal</Text>
          <View style={globalStyles.weeklyAdherenceBarBg}>
            <View
              style={[
                globalStyles.weeklyAdherenceBarFill,
                {
                  width: `${(weeklyTotals.daysOnGoal / 7) * 100}%`,
                  backgroundColor: weeklyTotals.daysOnGoal >= 5 ? colors.primary : colors.danger,
                },
              ]}
            />
          </View>
          <Text style={globalStyles.weeklyAdherenceCount}>{weeklyTotals.daysOnGoal}/7</Text>
        </View>
      </View>

      {/* ── Per-day scroll ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={globalStyles.weeklySummaryScrollContent}
      >
        {dailyStats.map((day) => (
          <View key={day.date} style={globalStyles.weeklyDayCard}>
            <Text style={globalStyles.weeklyDayLabel}>{formatDateLabel(day.date)}</Text>

            {day.hasData ? (
              <>
                <View style={globalStyles.weeklyStatRow}>
                  <Text style={globalStyles.weeklyStatLabel}>Net:</Text>
                  <Text style={[globalStyles.weeklyStatValue, { color: day.isGoalMet ? colors.primary : colors.danger }]}>
                    {Math.round(day.net)}
                  </Text>
                </View>

                <View style={globalStyles.weeklyStatRow}>
                  <Text style={globalStyles.weeklyStatLabel}>Goal:</Text>
                  <Text style={globalStyles.weeklyStatValue}>{calorieGoal}</Text>
                </View>

                <View style={globalStyles.weeklyProgressBarBg}>
                  <View
                    style={[
                      globalStyles.weeklyProgressBarFill,
                      {
                        width: `${Math.min((day.net / calorieGoal) * 100, 100)}%`,
                        backgroundColor: day.isGoalMet ? colors.primary : colors.danger,
                      },
                    ]}
                  />
                </View>

                <View style={globalStyles.weeklyMacroPillRow}>
                  <MacroPill label="P" value={day.protein} color="#4CAF50" />
                  <MacroPill label="C" value={day.carbs}   color="#FF9800" />
                  <MacroPill label="F" value={day.fats}    color="#9C27B0" />
                </View>
              </>
            ) : (
              <Text style={globalStyles.weeklyNoDataText}>No data</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default WeeklySummary;