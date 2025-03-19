import { NextResponse } from "next/server";
import pool from "../../../lib/db";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId"); 

    if (!userId) {
        return NextResponse.json({ error: "ID utilisateur manquant" }, { status: 400 });
    }

    try {
        console.log(`🔍 Recherche des suggestions pour userId=${userId}`);

        const [users] = await pool.query(`
            SELECT users.id, users.username, users.profilePic, 
                   COUNT(follows.user1) AS followers
            FROM users
            LEFT JOIN follows ON users.id = follows.user2
            WHERE users.id != ? 
            AND users.id NOT IN (
                SELECT user2 FROM follows WHERE user1 = ?
            )
            GROUP BY users.id
ORDER BY followers DESC, users.createdAt ASC
            LIMIT 3
        `, [userId, userId]);

        console.log("🔹 Suggestions trouvées :", users);

        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        console.error("Erreur API Suggestions :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
