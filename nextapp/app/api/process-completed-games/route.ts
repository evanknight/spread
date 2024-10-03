import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { calculatePotentialPoints } from "@/utils/dateUtils";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST() {
  try {
    const { data: completedGames, error: gamesError } = await supabase
      .from("games")
      .select("*")
      .eq("completed", true)
      .eq("processed", false);

    if (gamesError) throw gamesError;
    console.log("Completed games to process:", completedGames);

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

        console.log(`Processing pick ${pick.id}:`, {
          didWin,
          pointsEarned,
        });

        // Update pick
        const { error: updatePickError } = await supabase
          .from("picks")
          .update({ did_win: didWin, points_earned: pointsEarned })
          .eq("id", pick.id);

        if (updatePickError) {
          console.error("Error updating pick:", updatePickError);
          throw updatePickError;
        }

        // Update user's total points
        const { error: updateUserError } = await supabase.rpc(
          "increment_user_points",
          {
            user_id: pick.user_id,
            points: pointsEarned,
          }
        );

        if (updateUserError) {
          console.error("Error updating user points:", updateUserError);
          throw updateUserError;
        }

        console.log(
          `Updated points for user ${pick.user_id}: +${pointsEarned}`
        );
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

    return NextResponse.json({
      message: "Completed games processed successfully",
    });
  } catch (error) {
    console.error("Error processing completed games:", error);
    return NextResponse.json(
      { error: "Failed to process completed games" },
      { status: 500 }
    );
  }
}