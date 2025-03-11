import { NextResponse } from "next/server";
import pool from "../../../../../lib/db";
import { verifyToken } from "../../../../../lib/auth";

export async function GET(request: Request, { params }: { params: { token: string } }) {
    const token = params.token;
    if (!token) {
        return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    try {
        const decodedToken = verifyToken(token);
        const userId = decodedToken.id;

        // Connexion à la base de données
        const connection = await pool.getConnection();

        // Requête SQL pour récupérer les posts de l'utilisateur avec son username
        const [rows] = await connection.query(
            `SELECT p.id, p.user_id, p.content, p.like_count, p.created_at, p.media_url, u.username 
             FROM posts p
             JOIN users u ON p.user_id = u.id
             WHERE p.user_id = ?
             ORDER BY p.id DESC
             LIMIT 20`, 
            [userId]
        );

        connection.release();

        return NextResponse.json(
            {
                message: "Posts récupérés avec succès",
                posts: rows,
                userId: userId
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Erreur serveur :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
