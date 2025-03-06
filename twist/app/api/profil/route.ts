import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import { verifyToken } from "../../../lib/auth";

export async function GET(request: Request) {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
        return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    let connection;
    try {
        const decodedToken = verifyToken(token);
        const userId = decodedToken.id;

        connection = await pool.getConnection();
        const [rows, _] = await connection.query(
            "SELECT firstName, lastName, email FROM users WHERE id = ?",
            [userId]
        );
        
        if (!rows) {
            return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
        }

        return NextResponse.json({
            //name: `${rows[0].firstName} ${rows[0].lastName}`,
            //email: rows[0].email,
            content: rows
            
        });

    } catch (error) {
        console.error("Erreur API profil :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
