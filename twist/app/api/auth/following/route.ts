import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import { verifyToken } from "../../../../lib/auth";

export async function GET(req: Request) {
  const token = req.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Token manquant" }, { status: 401 });
  }

  try {
    const decodedToken = verifyToken(token);
    const userId = decodedToken.id;

    const [rows] = await pool.query(
      "SELECT user2 AS id FROM follows WHERE user1 = ?",
      [userId]
    );

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Erreur serveur :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
