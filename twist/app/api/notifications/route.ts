import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import { verifyToken } from "../../../lib/auth";

export async function GET(request: Request) {
  const token = request.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Token manquant" }, { status: 401 });
  }

  const decodedToken = verifyToken(token);
  const userId = decodedToken.id;

  try {
    const [notifications] = await pool.query<any[]>(
      "SELECT n.*, u.username AS sourceUsername FROM notifications n JOIN users u ON n.source_id = u.id WHERE n.user_id = ? ORDER BY n.created_at DESC",
      [userId]
    );

    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    console.error("Server error: ", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const token = request.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Token manquant" }, { status: 401 });
  }

  const decodedToken = verifyToken(token);
  const userId = decodedToken.id;

  try {
    await pool.query("UPDATE notifications SET seen = TRUE WHERE user_id = ?", [
      userId,
    ]);

    return NextResponse.json(
      { message: "Notifications marked as seen" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Server error: ", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
