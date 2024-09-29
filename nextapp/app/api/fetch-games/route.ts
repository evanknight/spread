import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  console.log("Fetch games API called");
  try {
    const { data, error } = await supabase
      .from("games")
      .select(
        `
        *,
        home_team:teams!home_team_id(*),
        away_team:teams!away_team_id(*)
      `
      )
      .order("commence_time", { ascending: true });

    if (error) throw error;

    console.log(`Fetched ${data.length} games`);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { message: "Error fetching games" },
      { status: 500 }
    );
  }
}