import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import { verifyToken } from "../../../../lib/auth";

export async function GET(req: Request) {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    const username = new URL(req.url).searchParams.get("username");

    if (!token) return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    if (!username) return NextResponse.json({ error: "username manquant" }, { status: 400 });

    try {
        const decodedToken = verifyToken(token);
        const userId = decodedToken.id;

        // veerifie si email se trouve dans la bd (apres on changeras on mettera username)
        const [users] = await pool.query(
            "SELECT id, username FROM users WHERE username LIKE ? AND id != ? LIMIT 5",
            [`%${username}%`, userId]
        );

        return NextResponse.json({ users }, { status: 200 });
    } catch (error) {
        console.error("Erreur serveur :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
