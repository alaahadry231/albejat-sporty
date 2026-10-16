import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const result = await sql`
      select predict_enabled from app_settings where id = 1
    `;

    const enabled = result.length > 0 ? result[0].predict_enabled : true;

    return NextResponse.json({ enabled });
  } catch (error) {
    console.error("Status error:", error);
    return NextResponse.json({ enabled: true });
  }
}