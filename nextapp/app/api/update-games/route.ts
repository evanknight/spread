import { NextResponse } from "next/server";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const oddsApiKey = process.env.NEXT_PUBLIC_ODDS_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST() {
  console.log("Updating games...");
  const sportKey = "americanfootball_nfl";
  const regions = "us";
  const markets = "spreads";
  const oddsFormat = "american";
  const dateFormat = "iso";

  try {
    const response = await axios.get(
      `https://api.the-odds-api.com/v4/sports/${sportKey}/odds`,
      {
        params: {
          apiKey: oddsApiKey,
          regions,
          markets,
          oddsFormat,
          dateFormat,
        },
      }
    );

    console.log(`Fetched ${response.data.length} games from Odds API`);

    let updatedGames = [];

    for (const game of response.data) {
      const homeTeam = game.home_team;
      const awayTeam = game.away_team;
      const commenceTime = new Date(game.commence_time);

      // Find or create teams
      const { data: homeTeamData, error: homeTeamError } = await supabase
        .from("teams")
        .upsert({ name: homeTeam }, { onConflict: "name" })
        .select("id")
        .single();

      const { data: awayTeamData, error: awayTeamError } = await supabase
        .from("teams")
        .upsert({ name: awayTeam }, { onConflict: "name" })
        .select("id")
        .single();

      if (homeTeamError || awayTeamError) {
        console.error("Error upserting teams:", homeTeamError || awayTeamError);
        continue;
      }

      // Get the spread
      const bookmaker = game.bookmakers[0];
      const spreadsMarket = bookmaker.markets.find(
        (m: { key: string }) => m.key === "spreads"
      );
      if (!spreadsMarket) {
        console.error("No spreads market found for game:", game.id);
        continue;
      }
      const homeSpread = spreadsMarket.outcomes.find(
        (o: { name: string }) => o.name === homeTeam
      )?.point;
      const awaySpread = spreadsMarket.outcomes.find(
        (o: { name: string }) => o.name === awayTeam
      )?.point;

      if (homeSpread === undefined || awaySpread === undefined) {
        console.error("Spread not found for game:", game.id);
        continue;
      }

      // Add the processed game to the updatedGames array
      updatedGames.push({
        id: game.id,
        sport_key: sportKey,
        commence_time: commenceTime,
        home_team_id: homeTeamData.id,
        away_team_id: awayTeamData.id,
        home_spread: homeSpread,
        away_spread: awaySpread,
        week: calculateNFLWeek(commenceTime),
      });
    }

    // Update games in the database with the correct week
    const { error } = await supabase
      .from("games")
      .upsert(updatedGames, { onConflict: "id" });

    if (error) throw error;

    console.log(
      `Games updated successfully. ${updatedGames.length} games processed.`
    );
    return NextResponse.json(updatedGames);
  } catch (error) {
    console.error("Error updating games:", error);
    return NextResponse.json([], { status: 500 }); // Return an empty array on error
  }
}

// Helper function to calculate NFL week
function calculateNFLWeek(date: Date): number {
  const nflSeasonStart = new Date(2024, 8, 5); // September 5, 2024 (Thursday)
  const timeDiff = date.getTime() - nflSeasonStart.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
  return Math.floor(daysDiff / 7) + 1;
}
