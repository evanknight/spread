import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const { user_id, game_id, team_picked } = await request.json();

  try {
    // Get the current spread for the game
    const { data: gameData, error: gameError } = await supabase
      .from("games")
      .select("home_spread, away_spread, home_team_id, away_team_id")
      .eq("id", game_id)
      .single();

    if (gameError) {
      throw gameError;
    }

    const spread =
      team_picked === gameData.home_team_id
        ? gameData.home_spread
        : gameData.away_spread;

    // Upsert the user's pick
    const { data, error } = await supabase.from("picks").upsert(
      {
        user_id,
        game_id,
        team_picked,
        spread_at_time: spread,
      },
      { onConflict: "user_id, game_id" }
    );

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: "Pick saved successfully", data });
  } catch (error) {
    console.error("Error saving pick:", error);
    return NextResponse.json({ message: "Error saving pick" }, { status: 500 });
  }
}
