import { NextResponse } from "next/server";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import { calculateNFLWeek } from "@/utils/dataFetchers";

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
    console.log("Fetching data from Odds API...");
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
      try {
        const homeTeam = game.home_team;
        const awayTeam = game.away_team;
        const commenceTime = new Date(game.commence_time);

        console.log(`Processing game: ${homeTeam} vs ${awayTeam}`);

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
          console.error(
            "Error upserting teams:",
            homeTeamError || awayTeamError
          );
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
          sport_key: sportKey,
          commence_time: commenceTime.toISOString(),
          home_team_id: homeTeamData.id,
          away_team_id: awayTeamData.id,
          home_spread: homeSpread,
          away_spread: awaySpread,
          week: calculateNFLWeek(),
          odds_api_id: game.id,
        });

        console.log(`Successfully processed game: ${homeTeam} vs ${awayTeam}`);
      } catch (gameError) {
        console.error("Error processing game:", gameError);
      }
    }

    console.log(
      `Processed ${updatedGames.length} games. Upserting to database...`
    );

    console.log("Upserting games:", JSON.stringify(updatedGames, null, 2));

    // Update games in the database
    const { error } = await supabase.from("games").upsert(updatedGames, {
      onConflict: "odds_api_id",
    });

    if (error) {
      console.error("Error upserting games to database:", error);
      throw error;
    }

    console.log(
      `Games updated successfully. ${updatedGames.length} games processed.`
    );
    return NextResponse.json(updatedGames);
  } catch (error) {
    console.error("Error updating games:", error);
    return NextResponse.json(
      {
        error: "Failed to update games",
        details: error instanceof Error ? error.message : JSON.stringify(error),
      },
      { status: 500 }
    );
  }
}
