import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    // المباريات القادمة (upcoming)
    const upcoming = await sql`
      select
        id, team1, team2, match_date, predictions_open
      from matches
      where status = 'upcoming'
      order by match_date asc
    `;

    // المباريات المنتهية (finished) - النتائج السابقة
    const finished = await sql`
      select
        id, team1, team2, match_date, final_score1, final_score2
      from matches
      where status = 'finished'
      order by match_date desc
      limit 20
    `;

    return NextResponse.json({ upcoming, finished });
  } catch (error) {
    console.error("Fetch matches error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}