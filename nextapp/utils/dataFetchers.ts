import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Game, User, Pick } from "@/types/types";

export const fetchGames = async (
  supabase: SupabaseClient,
  currentWeek: number,
  setGames: React.Dispatch<React.SetStateAction<Game[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
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
      .eq("week", currentWeek)
      .order("commence_time", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    console.log("Fetched games for week", currentWeek, ":", data);

    if (!data || data.length === 0) {
      console.log(
        "No games found for week",
        currentWeek,
        ". Fetching all games..."
      );
      const allGamesResult = await supabase
        .from("games")
        .select(
          `
          *,
          home_team:teams!home_team_id(*),
          away_team:teams!away_team_id(*)
        `
        )
        .order("commence_time", { ascending: true });

      if (allGamesResult.error) {
        console.error(
          "Supabase error when fetching all games:",
          allGamesResult.error
        );
        throw allGamesResult.error;
      }

      const allGames = allGamesResult.data;
      console.log("Fetched all games:", allGames);

      const currentDate = new Date();
      const startOfWeek = new Date(
        currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1)
      );
      const endOfWeek = new Date(
        currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 7)
      );

      const filteredGames = allGames.filter((game) => {
        const gameDate = new Date(game.commence_time);
        return gameDate >= startOfWeek && gameDate <= endOfWeek;
      });

      console.log("Filtered games for current week:", filteredGames);
      setGames(filteredGames);
    } else {
      setGames(data);
    }
  } catch (err) {
    console.error("Error fetching games:", err);
    setError("Failed to fetch games");
  }
};

export const fetchUsers = async (
  supabase: SupabaseClient,
  setUsers: React.Dispatch<React.SetStateAction<User[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  try {
    const { data, error } = await supabase.from("users").select("*");
    if (error) throw error;
    setUsers(data || []);
  } catch (err) {
    console.error("Error fetching users:", err);
    setError("Failed to fetch users");
  }
};

export const fetchPicks = async (
  supabase: SupabaseClient,
  currentWeek: number,
  setPicks: React.Dispatch<React.SetStateAction<Pick[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  try {
    const { data, error } = await supabase
      .from("picks")
      .select("*")
      .eq("week", currentWeek);
    if (error) throw error;
    setPicks(data || []);
  } catch (err) {
    console.error("Error fetching picks:", err);
    setError("Failed to fetch picks");
  }
};

export const makePick = async (
  supabase: SupabaseClient,
  gameId: number,
  teamId: number,
  currentUser: User | null,
  currentWeek: number,
  setPicks: React.Dispatch<React.SetStateAction<Pick[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  if (!currentUser) {
    setError("You must be logged in to make a pick");
    return;
  }

  try {
    const { data: existingPicks, error: fetchError } = await supabase
      .from("picks")
      .select("*")
      .eq("user_id", currentUser.id)
      .eq("week", currentWeek);

    if (fetchError) throw fetchError;

    if (existingPicks && existingPicks.length > 0) {
      const { error } = await supabase
        .from("picks")
        .update({ game_id: gameId, team_picked: teamId })
        .eq("id", existingPicks[0].id);

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

    setPicks(updatedPicks || []);
  } catch (err) {
    console.error("Error making pick:", err);
    setError("Failed to make pick");
  }
};

export const fetchGamesFromAPI = async (
  supabase: SupabaseClient,
  currentWeek: number,
  setGames: React.Dispatch<React.SetStateAction<Game[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  try {
    setIsLoading(true);
    const response = await fetch("/api/update-games", { method: "POST" });
    if (!response.ok) {
      throw new Error("Failed to fetch games from API");
    }
    const games = await response.json();

    // Calculate and set the week for each game
    const updatedGames = games.map((game: Game) => {
      const gameDate = new Date(game.commence_time);
      const week = calculateNFLWeek(gameDate);
      return { ...game, week };
    });

    // Update games in the database with the correct week
    const { error } = await supabase
      .from("games")
      .upsert(updatedGames, { onConflict: "id" });

    if (error) throw error;

    await fetchGames(supabase, currentWeek, setGames, setError);
    setIsLoading(false);
  } catch (err) {
    console.error("Error fetching games from API:", err);
    setError("Failed to fetch games from API");
    setIsLoading(false);
  }
};

// Helper function to calculate NFL week
function calculateNFLWeek(date: Date): number {
  const nflSeasonStart = new Date(2024, 8, 5); // September 5, 2024 (Thursday)
  const timeDiff = date.getTime() - nflSeasonStart.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
  return Math.floor(daysDiff / 7) + 1;
}
