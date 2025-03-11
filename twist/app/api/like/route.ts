import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import { verifyToken } from "../../../lib/auth";

export async function POST(request: Request) {
  const token = request.headers.get("Authorization")?.split(" ")[1];
  const { postId } = await request.json();

  if (!token || !postId) {
    return NextResponse.json(
      { error: "Token or postId missing" },
      { status: 400 }
    );
  }

  const decodedToken = verifyToken(token);
  const userId = decodedToken.id;

  try {
    // Check if the like already exists
    const [rows] = await pool.query<any[]>(
      "SELECT COUNT(*) AS count FROM likes WHERE user_id = ? AND post_id = ?",
      [userId, postId]
    );
    const count = (rows as any[])[0].count;

    if (count > 0) {
      // User already liked, so unlike
      await pool.query("DELETE FROM likes WHERE user_id = ? AND post_id = ?", [
        userId,
        postId,
      ]);
      await pool.query(
        "UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = ?",
        [postId]
      );
      return NextResponse.json({ message: "Unliked" }, { status: 200 });
    }

    // Add the like (only if not already liked)
    await pool.query("INSERT INTO likes (user_id, post_id) VALUES (?, ?)", [
      userId,
      postId,
    ]);
    await pool.query(
      "UPDATE posts SET like_count = like_count + 1 WHERE id = ?",
      [postId]
    );

    return NextResponse.json({ message: "Liked" }, { status: 200 });
  } catch (error) {
    console.error("Server error: ", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
