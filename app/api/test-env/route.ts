import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    GROQ_API_KEY: process.env.GROQ_API_KEY || "NOT FOUND",
  });
}
