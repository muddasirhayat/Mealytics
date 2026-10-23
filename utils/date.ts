export const startOfDay = (input: Date | number = Date.now()): Date => {
  const day = new Date(input);
  day.setHours(0, 0, 0, 0);
  return day;
};

export const startOfDayMs = (input?: Date | number): number =>
  startOfDay(input ?? Date.now()).getTime();

export const noonOnDayMs = (input: Date | number): number => {
  const day = startOfDay(input);
  day.setHours(12, 0, 0, 0);
  return day.getTime();
};

export const isTodayMs = (input: Date | number): boolean => startOfDayMs(input) === startOfDayMs();

export const formatLogDate = (input: Date | number): string =>
  startOfDay(input).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

export const mealTimestampForDate = (dateMs: number): number =>
  isTodayMs(dateMs) ? Date.now() : noonOnDayMs(dateMs);
