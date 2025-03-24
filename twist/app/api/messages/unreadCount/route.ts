import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import { verifyToken } from "../../../../lib/auth";

export async function GET(request: Request) {
  const token = request.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Token manquant" }, { status: 401 });
  }

  const decodedToken = verifyToken(token);
  const userId = decodedToken.id;

  try {
    const [rows] = await pool.query<any[]>(
      `SELECT COUNT(DISTINCT sender_id) AS count 
       FROM messages 
       WHERE receiver_id = ? AND seen = FALSE`,
      [userId]
    );
    const count = rows[0].count || 0;

    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error("Server error: ", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
