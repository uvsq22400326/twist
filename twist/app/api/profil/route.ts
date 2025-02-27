import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import { verifyToken } from "../../../lib/auth";

export async function GET(request: Request) {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
        return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    try {
        const decodedToken = verifyToken(token);
        const userId = decodedToken.id;

        const [rows] = await pool.query(
            "SELECT firstName, lastName, email FROM users WHERE id = ?",
            [userId]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
        }

        return NextResponse.json({
            name: `${rows[0].firstName} ${rows[0].lastName}`,
            email: rows[0].email,
            
        });

    } catch (error) {
        console.error("Erreur API profil :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
