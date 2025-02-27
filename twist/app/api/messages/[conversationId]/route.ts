import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import { verifyToken } from "../../../../lib/auth";
import cloudinary from "../../../../lib/cloudinary";



export async function GET(req: Request) {
    const token = req.headers.get("Authorization")?.split(" ")[1];

    if (!token) return NextResponse.json({ error: "Token manquant" }, { status: 401 });

    try {
        const decodedToken = verifyToken(token);
        const userId = decodedToken.id;

        const urlParts = req.nextUrl.pathname.split("/");
        const conversationId = parseInt(urlParts[urlParts.length - 1]);

        if (isNaN(conversationId)) {
            return NextResponse.json({ error: "Conversation ID invalide" }, { status: 400 });
        }

        const [messages] = await pool.query(
            `SELECT m.id, m.sender_id, m.receiver_id, m.content, m.media_url, m.created_at 
             FROM messages m
             WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
             ORDER BY m.created_at ASC`,
            [userId, conversationId, conversationId, userId]
          );
          

        console.log("Messages récupérés :", messages); // 🔹 DEBUG ICI

        return NextResponse.json({ messages }, { status: 200 });
    } catch (error) {
        console.error("Erreur serveur :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}


/**
 * send un msg ET PICCCSSSSS
 */

export async function POST(req: Request) {
    try {
      const token = req.headers.get("Authorization")?.split(" ")[1];
      if (!token) return NextResponse.json({ error: "Token manquant" }, { status: 401 });
  
      const decodedToken = verifyToken(token);
      const userId = decodedToken.id;
  
      const urlParts = req.nextUrl.pathname.split("/");
      const conversationId = parseInt(urlParts[urlParts.length - 1]);
  
      if (isNaN(conversationId)) {
        return NextResponse.json({ error: "Conversation ID invalide" }, { status: 400 });
      }
  
      const data = await req.formData();
      const content = data.get("content") as string | null;
      const file = data.get("file") as File | null;
  
      console.log("📸 Fichier reçu par l'API :", file?.name || "Aucun fichier");
  
      let fileUrl = null;
  
      if (file) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const isVideo = file.type.startsWith("video/");
  
        try {
          console.log("🚀 Upload sur Cloudinary en cours...");
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                resource_type: isVideo ? "video" : "image",
                folder: "messages",
                access_mode: "public",
              },
              (error, result) => {
                if (error) {
                  console.error("❌ Erreur Cloudinary :", error);
                  reject(error);
                } else {
                  console.log("✅ Upload réussi :", result?.secure_url);
                  resolve(result);
                }
              }
            );
  
            stream.end(buffer);
          });
  
          fileUrl = (result as any).secure_url;
        } catch (uploadError) {
          console.error("❌ Erreur Cloudinary :", uploadError);
          return NextResponse.json({ error: "Échec de l'upload Cloudinary" }, { status: 500 });
        }
      }
  
      // ✅ Insérer dans la base de données
      await pool.query(
        `INSERT INTO messages (sender_id, receiver_id, content, media_url) VALUES (?, ?, ?, ?)`,
        [userId, conversationId, content || "", fileUrl]
      );
  
      return NextResponse.json({ message: "Message envoyé avec succès", mediaUrl: fileUrl }, { status: 201 });
  
    } catch (error) {
      console.error("❌ Erreur serveur :", error);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
  }
   