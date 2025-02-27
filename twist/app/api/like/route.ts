import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import { verifyToken } from "../../../lib/auth";

export async function POST(request: Request) {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const mid = request.headers.get("Msg_id");

    if (!token || !mid) {
        return NextResponse.json({ error: "Token ou Msg_id manquant" }, { status: 400 });
    }

    const decodedToken = verifyToken(token);
    const userId = decodedToken.id;

    try {
        // Vérifie si le like existe déjà
        const [[{ count }]] = await pool.query(
            "SELECT COUNT(*) AS count FROM likes WHERE user_id = ? AND post_id = ?",
            [userId, mid]
        );

        if (count > 0) {
            // L'utilisateur a déjà liké, donc unlike
            await pool.query("DELETE FROM likes WHERE user_id = ? AND post_id = ?", [userId, mid]);
            await pool.query("UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = ?", [mid]);
            return NextResponse.json({ message: "Unliked" }, { status: 200 });
        }

        // Ajoute le like (seulement si pas déjà liké)
        await pool.query("INSERT INTO likes (user_id, post_id) VALUES (?, ?)", [userId, mid]);
        await pool.query("UPDATE posts SET like_count = like_count + 1 WHERE id = ?", [mid]);

        return NextResponse.json({ message: "Liked" }, { status: 200 });

    } catch (error) {
        console.error("Erreur serveur : ", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
