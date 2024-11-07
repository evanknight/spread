import { Game } from "@/types";

export function calculateNFLWeek(date: Date): number {
  // For now, always return Week 6
  return 10;
}

export function getCurrentNFLWeek(): number {
  // Manually set to Week 6
  return 10;
}

export function getWeekStartDate(week: number): Date {
  const seasonStart = new Date("2024-09-05T00:20:00Z");
  const weekStart = new Date(
    seasonStart.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000
  );
  weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay() + 2); // Set to Tuesday
  return weekStart;
}

export function getWeekEndDate(week: number): Date {
  const weekStart = getWeekStartDate(week);
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  weekEnd.setUTCDate(weekEnd.getUTCDate() - 1); // Set to Monday
  return weekEnd;
}

export const formatGameTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
};

export const getTeamLogo = (teamName: string): string => {
  const teamNameMap: { [key: string]: string } = {
    "Los Angeles Rams": "rams",
    "Los Angeles Chargers": "chargers",
    // Add other team name mappings here
  };

  const simplifiedName =
    teamNameMap[teamName] || teamName.split(" ").pop()?.toLowerCase();
  return `/images/team-logos/${simplifiedName}.png`;
};

export const calculatePotentialPoints = (
  game: Game,
  isHomeTeam: boolean
): number => {
  const basePoints = 10;
  const spread = isHomeTeam ? game.home_spread : -game.home_spread;
  return +(basePoints + spread).toFixed(1); // Keep one decimal place
};

// For testing purposes
export function getCurrentNFLWeekForDate(testDate: Date): number {
  const currentWeek = calculateNFLWeek(testDate);

  const dayOfWeek = testDate.getUTCDay();
  const hours = testDate.getUTCHours();

  if (dayOfWeek === 2 && hours >= 0) {
    return Math.min(currentWeek + 1, 18);
  }

  return currentWeek;
}
