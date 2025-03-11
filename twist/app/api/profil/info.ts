import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import { verifyToken } from "../../../lib/auth";

export async function GET(req: Request) {
    try {
        const token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const decoded = verifyToken(token);
        const userId = decoded.id;

        const [rows] = await pool.query("SELECT bio, profilePic FROM users WHERE id = ?", [userId]);

        if ((rows as any[]).length === 0) {
            return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
        }

        const user = (rows as any)[0];

        return NextResponse.json({
            bio: user.bio || "Aucune bio renseignée",
            profilePic: user.profilePic || "/default-profile.png",
        });
    } catch (error) {
        console.error("❌ Erreur API :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
