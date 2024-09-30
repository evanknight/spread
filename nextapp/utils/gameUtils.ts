import { SupabaseClient } from "@supabase/supabase-js";
import { Game } from "@/types/types";

export const fetchGames = async (
  supabase: SupabaseClient,
  currentWeek: number,
  setGames: React.Dispatch<React.SetStateAction<Game[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  try {
    const { data, error } = await supabase
      .from("games")
      .select("*")
      .eq("week", currentWeek);
    if (error) throw error;
    setGames(data as Game[]);
  } catch (err) {
    console.error("Error fetching games:", err);
    setError("Failed to fetch games");
  }
};

export const formatGameTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZone: "America/New_York",
    hour12: true,
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
  if (isHomeTeam) {
    return game.total_points;
  } else {
    // For the away team, we need to calculate based on the home spread
    return 10 + -game.home_spread;
  }
};
