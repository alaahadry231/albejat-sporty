import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/checkAdmin";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await sql`
      select predict_enabled from app_settings where id = 1
    `;
    const enabled = result.length > 0 ? result[0].predict_enabled : true;
    return NextResponse.json({ enabled });
  } catch (error) {
    console.error("Get status error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { enabled } = body;

    if (typeof enabled !== "boolean") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await sql`
      update app_settings
      set predict_enabled = ${enabled},
          updated_at = now()
      where id = 1
    `;

    return NextResponse.json({ success: true, enabled });
  } catch (error) {
    console.error("Update status error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}