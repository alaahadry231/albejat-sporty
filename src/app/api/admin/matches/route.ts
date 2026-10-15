import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/checkAdmin";

// GET: كل المباريات
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await sql`
      select
        m.*,
        (select count(*)::int from predictions where match_id = m.id) as predictions_count
      from matches m
      order by m.match_date desc
    `;
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// POST: إضافة مباراة
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { team1, team2, match_date } = body;

    if (!team1 || !team2 || !match_date) {
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة" },
        { status: 400 }
      );
    }

    const result = await sql`
      insert into matches (team1, team2, match_date)
      values (${team1.trim()}, ${team2.trim()}, ${match_date})
      returning *
    `;

    return NextResponse.json({ data: result[0] });
  } catch (error) {
    console.error("Insert error:", error);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }
}