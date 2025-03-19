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

        `SELECT posts.id, users.username, posts.content, posts.media_url, posts.created_at
         FROM likes
         INNER JOIN posts ON likes.post_id = posts.id
         INNER JOIN users ON posts.user_id = users.id
         WHERE likes.user_id = ?
         ORDER BY posts.created_at DESC`,
        [userId]
    );
    
    

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Erreur serveur :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

}

