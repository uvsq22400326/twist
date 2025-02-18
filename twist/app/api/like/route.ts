import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import { verifyToken } from "../../../lib/auth";

export async function POST(request: Request) {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const mid = request.headers.get("Msg_id");
    if (!token) {
        return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }
    const decodedToken = verifyToken(token);
    const userId = decodedToken.id;

    try {
        await pool.query("INSERT INTO likes (user_id, post_id) VALUES (?, ?)", [
            userId,
            mid,
            ]);
        await pool.query("UPDATE posts SET like_count = like_count + 1" 
            + " WHERE id = " + mid);
        //console.log(rows);
        return NextResponse.json(
            { message: "Twist liked"},          
            { status: 200 }
        );
    } catch (error) {
        console.error("Erreur dans le serveur : ", error); // Log l'erreur
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}