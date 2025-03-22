import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

export async function GET(req: Request, context: { params: { id: string } }) {
    try {
        const { id: userId } = await context.params;

        // Vérifier que l'ID est valide
        if (!userId) {
            return NextResponse.json({ error: "ID utilisateur manquant" }, { status: 400 });
        }

        // Récupérer les infos du profil
        const [rows]: any = await pool.query(
            "SELECT id, username, profilePic, bio FROM users WHERE id = ?",
            [userId]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
        }

        return NextResponse.json(rows[0], { status: 200 });

    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
