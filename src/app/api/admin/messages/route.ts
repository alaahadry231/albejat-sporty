import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/checkAdmin";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await sql`
      select * from messages
      order by is_read asc, created_at desc
    `;
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}