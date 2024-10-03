import fetch from "node-fetch";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Game, User, Pick } from "@/types";
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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/update-games`, {
      method: "POST",
    });
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

    // Process completed games after fetching new data
    const processResponse = await fetch(
      `${baseUrl}/api/process-completed-games`,
      { method: "POST" }
    );
    if (!processResponse.ok) {
      console.error("Failed to process completed games");
    }

    // Fetch updated games after processing
    const { data: updatedGames, error } = await supabase
      .from("games")
      .select(
        "*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)"
      )
      .order("commence_time", { ascending: true });

    if (error) throw error;

    return updatedGames;
  } catch (err) {
    console.error("Error fetching games from API:", err);
    throw err;
  }
};
