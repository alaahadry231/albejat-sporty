import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, page, item_type, item_id, item_name, visitor_id } = body;

    const userAgent = req.headers.get("user-agent") || "";

    if (type === "view" && page) {
      await sql`
        insert into page_views (page, visitor_id, user_agent)
        values (${page}, ${visitor_id || null}, ${userAgent})
      `;
    } else if (type === "click" && item_type && item_id) {
      await sql`
        insert into clicks (item_type, item_id, item_name, visitor_id)
        values (${item_type}, ${item_id}, ${item_name || null}, ${visitor_id || null})
      `;
    } else {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Track error:", error);
    return NextResponse.json({ error: "Tracking failed" }, { status: 500 });
  }
}