export const fetchPicks = async (supabase, currentWeek, setPicks, setError) => {
  try {
    const { data, error } = await supabase
      .from("picks")
      .select("*")
      .eq("week", currentWeek);
    if (error) throw error;
    setPicks(data);
  } catch (err) {
    console.error("Error fetching picks:", err);
    setError("Failed to fetch picks");
  }
};

export const makePick = async (gameId, team) => {
  // Implement your logic for making a pick
  console.log(`Made pick for game ${gameId}: ${team}`);
};
