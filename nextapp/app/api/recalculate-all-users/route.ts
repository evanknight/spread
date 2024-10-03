import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function GET(request: NextRequest) {
  try {
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id");

    if (usersError) throw usersError;

    for (const user of users) {
      const { data, error: recalculateError } = await supabase.rpc(
        "recalculate_user_points",
        { input_user_id: user.id }
      );

      if (recalculateError) {
        console.error("Error recalculating user points:", recalculateError);
        console.error("User ID:", user.id);
        console.error("RPC response:", data);
        throw recalculateError;
      }

      console.log(`Recalculated points for user ${user.id}`);
    }

    return NextResponse.json({
      message: "All user points recalculated successfully",
    });
  } catch (error) {
    console.error("Error recalculating all user points:", error);
    return NextResponse.json(
      {
        error: "Failed to recalculate all user points",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
