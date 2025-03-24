import { NextResponse } from "next/server";
import pool from "../../../../../lib/db";
import { verifyToken } from "../../../../../lib/auth";
import cloudinary from "../../../../../lib/cloudinary";



export async function GET(req: Request, { params }: 
    { params: Promise<{ conversationId: string, token : string }> }) {
    const p = await params;
    const token = p.token;
    const conversationId = p.conversationId;
    console.log("api messages / token = " + token)

    if (!token) return NextResponse.json({ error: "Token manquant" }, { status: 401 });

    try {
        const decodedToken = verifyToken(token);
        const userId = decodedToken.id;

        const [messages] = await pool.query(
            `SELECT m.id, m.sender_id, m.receiver_id, m.content, m.media_url, m.created_at 
             FROM messages m
             WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
             ORDER BY m.created_at ASC`,
            [userId, conversationId, conversationId, userId]
          );
          
          const [userInfo]: any[] = await pool.query("SELECT username, profilePic FROM users WHERE id = ?",
            [conversationId]
        );
        
        const profilePic = userInfo[0].profilePic || "/default-profile.png";
        console.log(messages);
        return NextResponse.json({ content: messages, pic: profilePic, username: userInfo[0].username }, { status: 200 });
    } catch (error) {
        console.error("Erreur serveur :", error);
        return NextResponse.json({ error: "Erreur serveur" + error }, { status: 500 });
    }    
}


/**
 * send un msg ET PICCCSSSSS
 */

export async function POST(req: Request, { params }: 
    { params: Promise<{ conversationId: string, token : string }> }) {
  try {
    const p = await params;
    const token = p.token;
    if (!token) return NextResponse.json({ error: "Token manquant" }, { status: 401 });

    const decodedToken = verifyToken(token);
    const userId = decodedToken.id;
    const conversationId = p.conversationId;

    let content: string | null = null;
    let file: File | null = null;
    let fileUrl = null;

    const contentType = req.headers.get("content-type");

    if (contentType?.includes("multipart/form-data")) {
      const data = await req.formData();
      content = data.get("content") as string | null;
      file = data.get("file") as File | null;
    } else {
      const data = await req.json();
      content = data.content;
    }

    console.log("Fichier reçu par l'API :", file?.name || "Aucun fichier");

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const isVideo = file.type.startsWith("video/");

      try {
        console.log("Upload sur Cloudinary en cours...");
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: isVideo ? "video" : "image",
              folder: "messages",
              access_mode: "public",
            },
            (error, result) => {
              if (error) {
                console.error("Erreur Cloudinary :", error);
                reject(error);
              } else {
                console.log("Upload réussi :", result?.secure_url);
                resolve(result);
              }
            }
          );

          stream.end(buffer);
        });

        fileUrl = (result as any).secure_url;
      } catch (uploadError) {
        console.error("Erreur Cloudinary :", uploadError);
        return NextResponse.json({ error: "Échec de l'upload Cloudinary" }, { status: 500 });
      }
    }

    await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, content, media_url) VALUES (?, ?, ?, ?)`,
      [userId, conversationId, content || "", fileUrl]
    );

    return NextResponse.json({ message: "Message envoyé avec succès", mediaUrl: fileUrl }, { status: 201 });

  } catch (error) {
    console.error("Erreur serveur :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
