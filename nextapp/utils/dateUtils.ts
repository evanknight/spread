export function getCurrentNFLWeek(): number {
  const now = new Date();
  const seasonStart = new Date(now.getFullYear(), 8, 5); // September 5th
  const daysSinceStart = Math.floor(
    (now.getTime() - seasonStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.floor(daysSinceStart / 7) + 1;
}

export function getWeekStartDate(week: number): Date {
  const now = new Date();
  const seasonStart = new Date(now.getFullYear(), 8, 5); // September 5th
  const weekStart = new Date(
    seasonStart.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000
  );
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 2); // Set to Tuesday
  return weekStart;
}

export function getWeekEndDate(week: number): Date {
  const weekStart = getWeekStartDate(week);
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  weekEnd.setDate(weekEnd.getDate() - 1); // Set to Monday
  return weekEnd;
}
