import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { mealStorage } from '@/storage/mealStorage';
import { Meal } from '@/types/meal';
import { MealHistoryCard } from '@/components/MealHistoryCard';
import { EmptyState } from '@/components/StateIndicators';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';

// ─── Helpers ──────────────────────────────────────────────────────────────
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Returns the 7 dates of the week containing `anchor` (Sun → Sat) */
const getWeek = (anchor: Date): Date[] => {
  const start = new Date(anchor);
  start.setDate(anchor.getDate() - anchor.getDay()); // go to Sunday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};

// ─── Week Strip Component ─────────────────────────────────────────────────
const WeekStrip = ({
  week,
  selectedDate,
  today,
  daysWithMeals,
  onSelectDay,
}: {
  week: Date[];
  selectedDate: Date;
  today: Date;
  daysWithMeals: Set<string>;
  onSelectDay: (d: Date) => void;
}) => (
  <View style={stripStyles.row}>
    {week.map((day) => {
      const key = day.toDateString();
      const isSelected = isSameDay(day, selectedDate);
      const isToday = isSameDay(day, today);
      const hasMeals = daysWithMeals.has(key);

      return (
        <TouchableOpacity
          key={key}
          style={[
            stripStyles.dayCell,
            isSelected && stripStyles.dayCellSelected,
            isToday && !isSelected && stripStyles.dayCellToday,
          ]}
          onPress={() => onSelectDay(day)}
          activeOpacity={0.7}
        >
          <Text style={[stripStyles.dayLabel, isSelected && stripStyles.dayLabelSelected]}>
            {DAY_LABELS[day.getDay()]}
          </Text>
          <Text style={[stripStyles.dayNum, isSelected && stripStyles.dayNumSelected]}>
            {day.getDate()}
          </Text>
          {hasMeals ? (
            <View style={[stripStyles.dot, isSelected && stripStyles.dotSelected]} />
          ) : (
            <View style={stripStyles.dotPlaceholder} />
          )}
        </TouchableOpacity>
      );
    })}
  </View>
);

const stripStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.md,
  },
  dayCell: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.lg,
    minWidth: 40,
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
  },
  dayCellToday: {
    backgroundColor: colors.primaryLight,
  },
  dayLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  dayLabelSelected: { color: colors.surface },
  dayNum: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  dayNumSelected: { color: colors.surface },
  dot: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  dotSelected: { backgroundColor: colors.surface },
  dotPlaceholder: { width: 6, height: 6, marginTop: 4 },
});

// ─── Main Screen ─────────────────────────────────────────────────────────
export default function LogsScreen() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [weekAnchor, setWeekAnchor] = useState(today); // controls which week is shown
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [daysWithMeals, setDaysWithMeals] = useState<Set<string>>(new Set());

  const week = getWeek(weekAnchor);

  // Load meals for the selected day
  const loadMeals = useCallback(async () => {
    setIsLoading(true);
    try {
      const dayMeals = await mealStorage.getMealsByDate(selectedDate);
      setMeals(dayMeals);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useFocusEffect(useCallback(() => { loadMeals(); }, [loadMeals]));

  // Pre-load which days in the current week have meals (for dot indicators)
  useEffect(() => {
    let cancelled = false;
    const currentWeek = getWeek(weekAnchor);
    Promise.all(
      currentWeek.map(async (d) => {
        const m = await mealStorage.getMealsByDate(d);
        return m.length > 0 ? d.toDateString() : null;
      })
    ).then((results) => {
      if (!cancelled) {
        setDaysWithMeals(new Set(results.filter(Boolean) as string[]));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [weekAnchor]);

  const handleSelectDay = (day: Date) => {
    setSelectedDate(day);
    setWeekAnchor(day);
  };

  const handleDeleteMeal = async (id: string) => {
    const success = await mealStorage.deleteMeal(id);
    if (!success) return;
    setMeals((current) => current.filter((meal) => meal.id !== id));
    const currentWeek = getWeek(weekAnchor);
    const results = await Promise.all(
      currentWeek.map(async (d) => {
        const m = await mealStorage.getMealsByDate(d);
        return m.length > 0 ? d.toDateString() : null;
      })
    );
    setDaysWithMeals(new Set(results.filter(Boolean) as string[]));
  };

  const shiftWeek = (direction: -1 | 1) => {
    const newAnchor = new Date(weekAnchor);
    newAnchor.setDate(weekAnchor.getDate() + direction * 7);
    setWeekAnchor(newAnchor);
    // Also move selected date to same weekday in the new week
    const newSelected = new Date(selectedDate);
    newSelected.setDate(selectedDate.getDate() + direction * 7);
    setSelectedDate(newSelected);
  };

  const isThisWeek = isSameDay(getWeek(weekAnchor)[0], getWeek(today)[0]);

  const dateLabel = isSameDay(selectedDate, today)
    ? 'Today'
    : isSameDay(selectedDate, new Date(today.getTime() - 86400000))
    ? 'Yesterday'
    : selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <View style={styles.container}>

      {/* ── Calendar Header ─────────────────────────────────────────── */}
      <View style={styles.calHeader}>
        {/* Month + Year + Week navigation */}
        <View style={styles.monthRow}>
          <TouchableOpacity onPress={() => shiftWeek(-1)} style={styles.arrowBtn}>
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>

          <Text style={styles.monthTitle}>
            {MONTH_NAMES[weekAnchor.getMonth()]} {weekAnchor.getFullYear()}
          </Text>

          <TouchableOpacity
            onPress={() => shiftWeek(1)}
            style={styles.arrowBtn}
            disabled={isThisWeek}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isThisWeek ? colors.border : colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Week Strip */}
        <WeekStrip
          week={week}
          selectedDate={selectedDate}
          today={today}
          daysWithMeals={daysWithMeals}
          onSelectDay={handleSelectDay}
        />
      </View>

      {/* ── Selected Day Label ─────────────────────────────────────── */}
      <View style={styles.dayLabelRow}>
        <Text style={styles.dayLabelText}>{dateLabel}</Text>
        {meals.length > 0 && (
          <View style={styles.mealCountBadge}>
            <Text style={styles.mealCountText}>
              {meals.length} meal{meals.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

      {/* ── Meal List ─────────────────────────────────────────────── */}
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              icon="restaurant-outline"
              message="No meals logged for this day."
            />
          }
          renderItem={({ item }) => (
            <MealHistoryCard meal={item} onDelete={handleDeleteMeal} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  calHeader: {
    backgroundColor: colors.surface,
    paddingTop: spacing.md,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  arrowBtn: {
    padding: spacing.xs,
    borderRadius: radius.sm,
  },

  dayLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  dayLabelText: {
    ...typography.title,
    color: colors.text,
  },
  mealCountBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  mealCountText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },

  listContent: {
    padding: spacing.md,
    paddingBottom: 120,
    flexGrow: 1,
  },
});


