import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const data = await sql`
      select id, title, message, type, created_at
      from notifications
      where is_active = true
      order by created_at desc
      limit 10
    `;

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Notifications error:", error);
    return NextResponse.json({ data: [] });
  }
}