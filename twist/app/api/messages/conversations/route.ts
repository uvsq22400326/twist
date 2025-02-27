import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import { verifyToken } from "../../../../lib/auth";


export async function GET(req: Request) {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Token manquant" }, { status: 401 });
  
    try {
        const decodedToken = verifyToken(token);
        const userId = decodedToken.id;
  
        const [rows] = await pool.query(
            `SELECT DISTINCT 
                CASE 
                    WHEN sender_id = ? THEN receiver_id 
                    ELSE sender_id 
                END AS id,  
                u.email AS participantEmail
            FROM messages 
            JOIN users u ON u.id = (CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END)
            WHERE sender_id = ? OR receiver_id = ?`,
            [userId, userId, userId, userId]
        );
  
        console.log("📨 Conversations récupérées :", rows); // 🔹 LOG ICI
  
        return NextResponse.json({ conversations: rows }, { status: 200 });
    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
  }
  


  export async function POST(req: Request) {
    try {
        const token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ error: "Token manquant" }, { status: 401 });

        const decodedToken = verifyToken(token);
        const userId = decodedToken.id;

        const { email } = await req.json();
        if (!email) return NextResponse.json({ error: "Email manquant" }, { status: 400 });

        // 🔍 Vérifie si l'utilisateur avec cet email existe
        const [userRows]: any = await pool.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (userRows.length === 0) {
            return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
        }

        const receiverId = userRows[0].id;

        // 🔍 Vérifie si une conversation existe déjà
        const [convRows]: any = await pool.query(
            `SELECT id FROM messages 
             WHERE (sender_id = ? AND receiver_id = ?) 
             OR (sender_id = ? AND receiver_id = ?) 
             LIMIT 1`,
            [userId, receiverId, receiverId, userId]
        );

        if (convRows.length > 0) {
            return NextResponse.json({ conversationId: receiverId }, { status: 200 });
        }

        // ✅ Si aucune conversation existante, on retourne l'ID de l'utilisateur
        return NextResponse.json({ conversationId: receiverId }, { status: 201 });

    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
