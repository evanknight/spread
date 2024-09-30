export const fetchGames = async (supabase, currentWeek, setGames, setError) => {
  try {
    const { data, error } = await supabase
      .from("games")
      .select("*")
      .eq("week", currentWeek);
    if (error) throw error;
    setGames(data);
  } catch (err) {
    console.error("Error fetching games:", err);
    setError("Failed to fetch games");
  }
};

export const formatGameTime = (game) => {
  const date = new Date(game.date);
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  });
};

export const getTeamLogo = (teamName) => {
  return `/team-logos/${teamName.toLowerCase().replace(" ", "-")}.png`;
};

export const calculatePotentialPoints = (game) => {
  // Implement your logic for calculating potential points
  return 10; // Placeholder value
};
