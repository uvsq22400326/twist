import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import { verifyToken } from "../../../lib/auth";

export async function GET(request: Request, { params }: { params: { token: string } }) {
    try {
        const token = params.token;

        if (!token) {
            return NextResponse.json({ error: "Token manquant" }, { status: 401 });
        }

        const decodedToken = verifyToken(token);
        const userId = decodedToken.id;

        const [rows]: any = await pool.query(
            "SELECT id, username, bio FROM users WHERE id = ?",
            [userId]
        );

        if (!rows || rows.length === 0) {
            console.error("Utilisateur non trouvé");
            return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
        }

        return NextResponse.json(
            { id: rows[0].id, username: rows[0].username, bio: rows[0].bio },
            { status: 200 }
        );

    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
