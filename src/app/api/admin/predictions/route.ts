import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/checkAdmin";

// GET: توقعات مباراة معينة
export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const matchId = searchParams.get("match_id");

    if (!matchId) {
      return NextResponse.json(
        { error: "match_id مطلوب" },
        { status: 400 }
      );
    }

    const data = await sql`
      select *
      from predictions
      where match_id = ${matchId}
      order by created_at asc
    `;

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Fetch predictions error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}