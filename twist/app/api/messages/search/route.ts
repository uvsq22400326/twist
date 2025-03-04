import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import { verifyToken } from "../../../../lib/auth";

export async function GET(req: Request) {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    const email = new URL(req.url).searchParams.get("email");

    if (!token) return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    if (!email) return NextResponse.json({ error: "Email manquant" }, { status: 400 });

    try {
        const decodedToken = verifyToken(token);
        const userId = decodedToken.id;

        // veerifie si email se trouve dans la bd (apres on changeras on mettera username)
        const [users] = await pool.query(
            "SELECT id, email FROM users WHERE email LIKE ? AND id != ? LIMIT 5",
            [`%${email}%`, userId]
        );

        return NextResponse.json({ users }, { status: 200 });
    } catch (error) {
        console.error("Erreur serveur :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
