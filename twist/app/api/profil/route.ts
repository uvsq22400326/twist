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

        const [rows]: any = await connection.query(
            "SELECT firstName, lastName, email FROM users WHERE id = ?",
            [userId]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
        }

        return NextResponse.json({
            content: rows
        });

    } catch (error) {
        console.error("Erreur SQL :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    } finally {
        if (connection) {
            connection.release(); 
        }
    }
}
