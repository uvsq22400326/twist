import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import { verifyToken } from "../../../../lib/auth";

export async function POST(req: Request) {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Token manquant" }, { status: 401 });

    try {
        const decodedToken = verifyToken(token);
        const userId = decodedToken.id;
        const { conversationId } = await req.json();

        if (!conversationId) {
            return NextResponse.json({ error: "conversationId manquant" }, { status: 400 });
        }

        await pool.query(
            `UPDATE messages SET seen = TRUE 
            WHERE receiver_id = ? AND sender_id = ? AND seen = FALSE`,
            [userId, conversationId]
        );

        return NextResponse.json({ message: "Messages marqués comme lus" }, { status: 200 });
    } catch (error) {
        console.error("Erreur serveur :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
