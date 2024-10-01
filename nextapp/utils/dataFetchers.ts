import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Game, User, Pick } from "@/types/types";

export const fetchGames = async (
  supabase: SupabaseClient,
  week: number
): Promise<Game[]> => {
  try {
    const { data, error } = await supabase
      .from("games")
      .select(
        "*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)"
      )
      .eq("week", week);
    if (error) throw error;
    return data;
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
  supabase: SupabaseClient,
  currentWeek: number
): Promise<Game[]> => {
  try {
    const response = await fetch("/api/update-games", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ week: currentWeek }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("API error details:", errorData);
      throw new Error(
        `Failed to fetch games from API: ${errorData.error}\nDetails: ${errorData.details}`
      );
    }
    const result = await response.json();

    console.log("API response:", result);

    if (!Array.isArray(result)) {
      console.error("API response is not an array:", result);
      throw new Error("Invalid response format from API");
    }

    return result;
  } catch (err) {
    console.error("Error fetching games from API:", err);
    throw err;
  }
};

export function calculateNFLWeek(): number {
  // Hardcoded to return week 5 for now
  return 5;
}

export function mapAPIWeekToNFLWeek(apiWeek: number): number {
  // Assuming the API week starts at 14 for the first week of the NFL season
  return apiWeek - 13;
}

export function mapNFLWeekToAPIWeek(nflWeek: number): number {
  // Convert NFL week to API week
  return nflWeek + 13;
}
