import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import { verifyToken } from "../../../../lib/auth";

export async function POST(req: Request) {
  //const { userToFollowId } = await req.json();
  const token = req.headers.get("Authorization")?.split(" ")[1];
  const userToFollowId = req.headers.get("ToFollow");

  if (!token) {
    return NextResponse.json({ error: "Token manquant" }, { status: 401 });
  }

  try {
    const decodedToken = verifyToken(token);
    const userId = decodedToken.id;

    // Verifier si user le suit deja l'autre user
    const [followResult] = await pool.query(
      "SELECT * FROM follows WHERE user1 = ? AND user2 = ?",
      [userId, userToFollowId]
    );

    if ((followResult as any[]).length > 0) {
      return NextResponse.json(
        { error: "Vous suivez déjà cet utilisateur" },
        { status: 400 }
      );
    }

    // Ajoute du follow a la bd
    await pool.query("INSERT INTO follows (user1, user2) VALUES (?, ?)", [
      userId,
      userToFollowId,
    ]);

    return NextResponse.json(
      { message: "Vous suivez maintenant cet utilisateur" },
      { status: 200 }
    );
  } catch (error) {
    console.log('error /api/follow/route.ts : ' + error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
