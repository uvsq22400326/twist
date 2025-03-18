import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import { verifyToken } from "../../../lib/auth";

export async function GET(req: Request) {
    try {
        const token = req.headers.get("Authorization")?.split(" ")[1];

        if (!token) {
            console.error("Token manquant");
            return NextResponse.json({ error: "Token manquant" }, { status: 401 });
        }

        const decodedToken = verifyToken(token);
        const userId = decodedToken.id;

        const [userRows]: any = await pool.query(
            "SELECT username, bio, profilePic FROM users WHERE id = ?",
            [userId]
        );

        if (!userRows || userRows.length === 0) {
            console.error("Utilisateur non trouvé");
            return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
        }

        const [followersCount]: any = await pool.query(
            "SELECT COUNT(*) AS count FROM follows WHERE user2 = ?",
            [userId]
        );

        const [followingCount]: any = await pool.query(
            "SELECT COUNT(*) AS count FROM follows WHERE user1 = ?",
            [userId]
        );
        console.log("📩 Bio récupérée :", userRows[0].bio); 


        console.log("📩 Infos récupérées :", {
            username: userRows[0].username,
            bio: userRows[0].bio,
            profilePic: userRows[0].profilePic,
            followers: followersCount[0].count,
            following: followingCount[0].count
        });

        return NextResponse.json({
            username: userRows[0].username || "Utilisateur",
            bio: userRows[0].bio || "",
            profilePic: userRows[0].profilePic || "/default-profile.png",
            followers: followersCount[0].count || 0,
            following: followingCount[0].count || 0
        }, { status: 200 });

    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
