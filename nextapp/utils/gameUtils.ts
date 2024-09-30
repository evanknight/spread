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

export const formatGameTime = (game: Game) => {
  const date = new Date(game.commence_time);
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  });
};

export const getTeamLogo = (teamName: string) => {
  return `/team-logos/${teamName.toLowerCase().replace(" ", "-")}.png`;
};

export const calculatePotentialPoints = (game: Game) => {
  // Implement your logic for calculating potential points
  return 10; // Placeholder value
};
