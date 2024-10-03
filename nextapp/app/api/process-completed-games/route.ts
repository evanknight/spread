import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { calculatePotentialPoints } from "@/utils/dateUtils";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function processCompletedGames() {
  try {
    const { data: completedGames, error: gamesError } = await supabase
      .from("games")
      .select("*")
      .eq("completed", true)
      .eq("processed", false);

    if (gamesError) throw gamesError;
    console.log("Completed games to process:", completedGames);

    const updatedUsers: string[] = [];

    for (const game of completedGames) {
      const { data: picks, error: picksError } = await supabase
        .from("picks")
        .select("*")
        .eq("game_id", game.id);

      if (picksError) throw picksError;
      console.log(`Picks for game ${game.id}:`, picks);

      for (const pick of picks) {
        const didWin =
          (pick.team_picked === game.home_team_id &&
            game.home_score > game.away_score) ||
          (pick.team_picked === game.away_team_id &&
            game.away_score > game.home_score);

        const pointsEarned = didWin
          ? calculatePotentialPoints(
              game,
              pick.team_picked === game.home_team_id
            )
          : 0;

        console.log(`Processing pick ${pick.id}:`, { didWin, pointsEarned });

        // Update pick
        const { error: updatePickError } = await supabase
          .from("picks")
          .update({ points_earned: pointsEarned, did_win: didWin })
          .eq("id", pick.id);

        if (updatePickError) {
          console.error("Error updating pick:", updatePickError);
          throw updatePickError;
        }

        if (!updatedUsers.includes(pick.user_id)) {
          updatedUsers.push(pick.user_id);
        }
      }

      // Mark game as processed
      const { error: markProcessedError } = await supabase
        .from("games")
        .update({ processed: true })
        .eq("id", game.id);

      if (markProcessedError) {
        console.error("Error marking game as processed:", markProcessedError);
        throw markProcessedError;
      }

      console.log(`Marked game ${game.id} as processed`);
    }

    // Recalculate points for all updated users
    for (const userId of updatedUsers) {
      const { error: recalculateError } = await supabase.rpc(
        "recalculate_user_points",
        { input_user_id: userId }
      );

      if (recalculateError) {
        console.error("Error recalculating user points:", recalculateError);
        throw recalculateError;
      }

      console.log(`Recalculated points for user ${userId}`);
    }

    return { message: "Completed games processed successfully" };
  } catch (error) {
    console.error("Error processing completed games:", error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const result = await processCompletedGames();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing completed games:", error);
    return NextResponse.json(
      {
        error: "Failed to process completed games",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
