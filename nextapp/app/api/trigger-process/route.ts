import { NextResponse } from "next/server";

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    console.log(
      `Attempting to fetch from: ${baseUrl}/api/process-completed-games`
    );

    const response = await fetch(`${baseUrl}/api/process-completed-games`, {
      method: "POST",
    });

    if (!response.ok) {
      console.error(`Failed to process games. Status: ${response.status}`);
      return NextResponse.json(
        { error: `Failed to process games. Status: ${response.status}` },
        { status: response.status }
      );
    }

    console.log("Processing triggered successfully");
    return NextResponse.json({ message: "Processing triggered successfully" });
  } catch (error) {
    console.error("Error in trigger-process route:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
