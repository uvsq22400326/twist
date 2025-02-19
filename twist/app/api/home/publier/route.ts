import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import { verifyToken } from "../../../../lib/auth";

export async function POST(req: Request) {
  const { content } = await req.json();
  const token = req.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Token manquant" }, { status: 401 });
  }

  try {
    const decodedToken = verifyToken(token);

    if (!decodedToken) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    const userId = decodedToken.id;

    if (!content) {
      return NextResponse.json(
        { error: "Le contenu du post est requis" },
        { status: 400 }
      );
    }

    // Insertion dans la base de données
    await pool.query(
      "INSERT INTO posts (user_id, content, like_count) VALUES (?, ?, ?)",
      [userId, content, 0] // Commence avec  like_count  0
    );

    return NextResponse.json(
      { message: "Post publié avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur dans le serveur : ", error); // Log l'erreur
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
