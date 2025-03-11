import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import { verifyToken } from "../../../lib/auth";

export async function POST(req: Request) {
    try {
        const token = req.headers.get("Authorization")?.split(" ")[1];

        if (!token) {
            console.error("Token manquant");
            return NextResponse.json({ error: "Token manquant" }, { status: 401 });
        }

        const decodedToken = verifyToken(token);
        const userId = decodedToken.id;

        const data = await req.json();
        const { bio } = data;

        if (!bio) {
            return NextResponse.json({ error: "Aucune bio fournie" }, { status: 400 });
        }

        await pool.query("UPDATE users SET bio = ? WHERE id = ?", [bio, userId]);

        console.log("✅ Bio mise à jour :", bio);

        return NextResponse.json({ message: "Bio mise à jour avec succès", bio }, { status: 200 });

    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
