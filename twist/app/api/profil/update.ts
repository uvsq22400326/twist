import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import { verifyToken } from "../../../lib/auth";

export async function POST(req: Request) {
    const token = req.headers.get("Authorization")?.split(" ")[1];

    if (!token) return NextResponse.json({ error: "Token manquant" }, { status: 401 });

    try {
        const decodedToken = verifyToken(token);
        const userId = decodedToken.id;

        const { bio } = await req.json();

        if (!bio) {
            return NextResponse.json({ error: "Bio invalide" }, { status: 400 });
        }

        const [result] = await pool.query(
            "UPDATE users SET bio = ? WHERE id = ?",
            [bio, userId]
        );

        return NextResponse.json({ message: "Bio mise à jour avec succès" }, { status: 200 });
    } catch (error) {
        console.error("Erreur serveur :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
