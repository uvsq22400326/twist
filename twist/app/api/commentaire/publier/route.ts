import { NextResponse } from "next/server";
import { moderation } from "../../moderation/moderation";
import pool from "../../../../lib/db";
import { verifyToken } from "../../../../lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
    const data = await req.json();
    const content = data.content as string;
    const postid = data.postid;
    const file = data.file as File; // Always empty
    const token = req.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
        console.log("Token manquant !");
        return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    const decodedToken = verifyToken(token);
    const userId = decodedToken.id;

    const moderationStatus = await moderation(content, file);
    if (moderationStatus.status != 200) {
        return moderationStatus;
    }
    await pool.query("INSERT INTO commentaire (post_id, content, userid) VALUES (?, ?, ?)",
        [postid, content, userId]);
    
    return NextResponse.json(
        { message: "Commentaire publié avec succès" },
        { status: 200 }
    );
}