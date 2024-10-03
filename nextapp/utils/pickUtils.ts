import { SupabaseClient } from "@supabase/supabase-js";
import { Pick } from "@/types";

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
    setPicks(data as Pick[]);
  } catch (err) {
    console.error("Error fetching picks:", err);
    setError("Failed to fetch picks");
  }
};

export const makePick = async (gameId: number, team: string) => {
  // Implement your logic for making a pick
  console.log(`Made pick for game ${gameId}: ${team}`);
};
