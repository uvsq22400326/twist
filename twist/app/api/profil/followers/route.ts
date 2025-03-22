import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import { verifyToken } from "../../../../lib/auth";

export async function GET(req: Request) {
    try {
        const token = req.headers.get("Authorization")?.split(" ")[1];

        if (!token) {
            return NextResponse.json({ error: "Token manquant" }, { status: 401 });
        }

        const decodedToken = verifyToken(token);
        const userId = decodedToken.id;

        const [followers]: any = await pool.query(
            `SELECT u.id, u.username, u.profilePic 
            FROM follows f
            JOIN users u ON f.user1 = u.id
            WHERE f.user2 = ?`,
            [userId]
        );

        return NextResponse.json({ followers });

    } catch (error) {
        console.error(" Erreur serveur :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}