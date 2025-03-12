import { NextResponse } from "next/server";
import pool from "../../../lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is missing" },
      { status: 400 }
    );
  }

  try {
    console.log("Executing user search query...");
    const [users] = await pool.query(
      `SELECT id, username FROM users WHERE username LIKE ?`,
      [`%${query}%`]
    );
    console.log("User search query executed successfully:", users);

    console.log("Executing post search query...");
    const [posts] = await pool.query(
      `SELECT p.id, p.content, p.media_url as imageUrl, p.like_count, u.username, u.id as user_id FROM posts p JOIN users u ON p.user_id = u.id WHERE p.content LIKE ?`,
      [`%${query}%`]
    );
    console.log("Post search query executed successfully:", posts);

    return NextResponse.json({ users, posts }, { status: 200 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
