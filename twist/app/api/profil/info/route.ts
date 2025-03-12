import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import { verifyToken } from "../../../../lib/auth";

export async function GET(req: Request) {
    try {
        const token = req.headers.get("Authorization")?.split(" ")[1];

        if (!token) {
            console.error("Token manquant");
            return NextResponse.json({ error: "Token manquant" }, { status: 401 });
        }

        const decodedToken = verifyToken(token);
        const userId = decodedToken.id;

        const [rows]: any = await pool.query("SELECT bio FROM users WHERE id = ?", [userId]);

        if (!rows || rows.length === 0) {
            console.error("Utilisateur non trouvé");
            return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
        }

        console.log("📩 Bio récupérée :", rows[0].bio);

        return NextResponse.json({ bio: rows[0].bio || "Aucune bio renseignée." }, { status: 200 });

    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
 }
}