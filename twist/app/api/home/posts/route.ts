import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import { verifyToken } from "../../../../lib/auth";

export async function GET(req: Request) {
  let connection;
  try {
    // Obtenir une connexion depuis le pool
    connection = await pool.getConnection();

    // Exécuter la requête (récupère username au lieu de email)
    const [rows] = await connection.query(
      "SELECT p.id, p.user_id, p.content, p.like_count, p.created_at, p.media_url, u.username, u.profilePic " +
        "FROM posts p JOIN users u ON p.user_id = u.id " +
        "ORDER BY p.id DESC LIMIT 100"
    );

    // Retourner les posts avec le champ username dans content
    return NextResponse.json(
      { message: "Twists retrouvés avec succès", content: rows },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur serveur : ", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    // Toujours libérer la connexion, même en cas d'erreur
    if (connection) connection.release();
  }
}
