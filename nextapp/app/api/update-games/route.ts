import { NextResponse } from "next/server";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import { calculateNFLWeek } from "@/utils/dateUtils";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const oddsApiKey = process.env.NEXT_PUBLIC_ODDS_API_KEY!;
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

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

    let updatedGames = [];

    for (const game of response.data) {
      const homeTeam = game.home_team;
      const awayTeam = game.away_team;
      const commenceTime = new Date(game.commence_time);
      const nflWeek = calculateNFLWeek(commenceTime);

      const { data: homeTeamData } = await supabase
        .from("teams")
        .upsert({ name: homeTeam }, { onConflict: "name" })
        .select("id")
        .single();

      const { data: awayTeamData } = await supabase
        .from("teams")
        .upsert({ name: awayTeam }, { onConflict: "name" })
        .select("id")
        .single();

      const spreadsMarket = game.bookmakers[0]?.markets.find(
        (m: any) => m.key === "spreads"
      );

      if (!spreadsMarket || !homeTeamData || !awayTeamData) continue;

      const homeSpread = spreadsMarket.outcomes.find(
        (o: { name: string }) => o.name === homeTeam
      )?.point;
      const awaySpread = spreadsMarket.outcomes.find(
        (o: { name: string }) => o.name === awayTeam
      )?.point;

      if (homeSpread === undefined || awaySpread === undefined) continue;

      const gameData = {
        sport_key: sportKey,
        commence_time: commenceTime.toISOString(),
        home_team_id: homeTeamData.id,
        away_team_id: awayTeamData.id,
        home_spread: homeSpread,
        away_spread: awaySpread,
        week: nflWeek,
        odds_api_id: game.id,
        completed: game.completed || false,
        home_score: game.scores?.[0]?.score || null,
        away_score: game.scores?.[1]?.score || null,
        processed: false,
      };

      updatedGames.push(gameData);
    }

    const { error } = await supabase.from("games").upsert(updatedGames, {
      onConflict: "odds_api_id",
    });

    if (error) throw error;

    // Process completed games
    await fetch(`${baseUrl}/api/process-completed-games`, { method: "POST" });

    return NextResponse.json({
      message: "Games updated successfully",
      count: updatedGames.length,
      games: updatedGames,
    });
  } catch (error) {
    console.error("Error updating games:", error);
    return NextResponse.json(
      { error: "Failed to update games" },
      { status: 500 }
    );
  }
}
