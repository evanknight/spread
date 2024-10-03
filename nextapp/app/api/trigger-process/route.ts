import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/process-completed-games`, {
    method: "POST",
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to process games" },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Processing triggered successfully" });
}
