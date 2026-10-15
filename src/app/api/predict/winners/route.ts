import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const matchId = searchParams.get("match_id");

    if (!matchId) {
      return NextResponse.json(
        { error: "معرّف المباراة مطلوب" },
        { status: 400 }
      );
    }

    const winners = await sql`
      select name, telegram, score1, score2
      from predictions
      where match_id = ${matchId} and is_winner = true
      order by created_at asc
    `;

    return NextResponse.json({ winners });
  } catch (error) {
    console.error("Fetch winners error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}