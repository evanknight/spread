import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Game, User, Pick } from "@/types/types";
import { getCurrentNFLWeek } from "./dateUtils";

export const fetchGames = async (
  supabase: SupabaseClient
): Promise<{ games: Game[]; currentWeek: number }> => {
  try {
    const currentWeek = getCurrentNFLWeek();
    const { data, error } = await supabase
      .from("games")
      .select(
        "*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)"
      )
      .order("commence_time", { ascending: true });
    if (error) throw error;

    const games = data.filter((game) => game.week === currentWeek);

    console.log("Fetched games:", games);
    console.log("Current week:", currentWeek);
    return { games, currentWeek };
  } catch (err) {
    console.error("Error fetching games:", err);
    throw err;
  }
};

export const fetchUsers = async (supabase: SupabaseClient): Promise<User[]> => {
  try {
    const { data, error } = await supabase.from("users").select("*");
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error fetching users:", err);
    throw err;
  }
};

export const fetchPicks = async (
  supabase: SupabaseClient,
  week: number
): Promise<Pick[]> => {
  try {
    const { data, error } = await supabase
      .from("picks")
      .select("*")
      .eq("week", week);
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error fetching picks:", err);
    throw err;
  }
};

export const fetchGamesFromAPI = async (
  supabase: SupabaseClient
): Promise<Game[]> => {
  try {
    const response = await fetch("/api/update-games", { method: "POST" });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to fetch games from API: ${errorData.error}\nDetails: ${errorData.details}`
      );
    }
    const result = await response.json();

    console.log("API response:", result);

    if (!result.games || !Array.isArray(result.games)) {
      console.error("API response does not contain an array of games:", result);
      throw new Error("Invalid response format from API");
    }

    return result.games;
  } catch (err) {
    console.error("Error fetching games from API:", err);
    throw err;
  }
};
