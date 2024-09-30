import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Game, User, Pick } from "@/types/types";

export const fetchGames = async (
  supabase: SupabaseClient,
  week: number
): Promise<Game[]> => {
  try {
    console.log("Fetching games...");
    const { data, error } = await supabase
      .from("games")
      .select(
        `
        *,
        home_team:teams!home_team_id(*),
        away_team:teams!away_team_id(*)
      `
      )
      .eq("week", week)
      .order("commence_time", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    console.log(`Fetched games for week ${week}:`, data);

    return data || [];
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

export const makePick = async (
  supabase: SupabaseClient,
  gameId: number,
  teamId: number,
  currentUser: User | null,
  currentWeek: number
): Promise<Pick[]> => {
  try {
    if (!currentUser) throw new Error("No user logged in");

    const { data: existingPick, error: fetchError } = await supabase
      .from("picks")
      .select("*")
      .eq("user_id", currentUser.id)
      .eq("game_id", gameId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

    if (existingPick) {
      const { error } = await supabase
        .from("picks")
        .update({ team_picked: teamId })
        .eq("id", existingPick.id);

      if (error) throw error;
    } else {
      const { error } = await supabase.from("picks").insert({
        user_id: currentUser.id,
        game_id: gameId,
        team_picked: teamId,
        week: currentWeek,
      });

      if (error) throw error;
    }

    const { data: updatedPicks, error: refetchError } = await supabase
      .from("picks")
      .select("*")
      .eq("week", currentWeek);

    if (refetchError) throw refetchError;

    return updatedPicks || [];
  } catch (err) {
    console.error("Error making pick:", err);
    throw err;
  }
};

export const fetchGamesFromAPI = async (
  supabase: SupabaseClient,
  currentWeek: number
): Promise<Game[]> => {
  try {
    const response = await fetch("/api/update-games", { method: "POST" });
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

    // Fetch games again to get the updated data
    return await fetchGames(supabase, currentWeek);
  } catch (err) {
    console.error("Error fetching games from API:", err);
    throw err;
  }
};

// Helper function to calculate NFL week
export function calculateNFLWeek(date: Date): number {
  const nflSeasonStart = new Date(2024, 8, 5); // September 5, 2024 (Thursday)
  const timeDiff = date.getTime() - nflSeasonStart.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
  return Math.floor(daysDiff / 7) + 1;
}
